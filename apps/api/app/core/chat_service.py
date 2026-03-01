from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, field
from typing import Any, cast

from app.core.genai_client import BaseGenAIClient, get_genai_client
from app.core.supabase import upsert_explore_session_summary
from app.models.chat import (
    ExploreEvaluationSummary,
    ExploreSessionAnswerResponse,
    ExploreSessionStartResponse,
    SessionStatus,
)


@dataclass
class ExploreSessionState:
    session_id: str
    user_id: str
    passage_title: str
    passage_content: str
    current_question: str
    topic: str | None = None
    current_turn: int = 0
    max_turns: int = 5
    mastery_threshold: float = 75.0
    score_history: list[float] = field(default_factory=lambda: [])
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    status: SessionStatus = SessionStatus.in_progress


class ChatService:
    def __init__(self, client: BaseGenAIClient | None = None):
        self.client = client or get_genai_client()
        self.explore_sessions: dict[str, ExploreSessionState] = {}

    def start_explore_session(
        self,
        user_id: str,
        topic: str | None = None,
    ) -> ExploreSessionStartResponse:
        passage_title, passage_content, first_question = self._generate_passage_and_question(
            topic=topic
        )
        session_id = str(uuid.uuid4())

        state = ExploreSessionState(
            session_id=session_id,
            user_id=user_id,
            passage_title=passage_title,
            passage_content=passage_content,
            current_question=first_question,
            topic=topic,
        )
        self.explore_sessions[session_id] = state

        return ExploreSessionStartResponse(
            session_id=session_id,
            passage_title=state.passage_title,
            passage_content=state.passage_content,
            ai_message=state.current_question,
            current_turn=state.current_turn,
            max_turns=state.max_turns,
        )

    def submit_explore_answer(
        self,
        session_id: str,
        user_id: str,
        answer: str,
    ) -> ExploreSessionAnswerResponse:
        state = self.explore_sessions.get(session_id)
        if not state:
            raise ValueError("Explore session not found.")
        if state.user_id != user_id:
            raise ValueError("User is not authorized for this explore session.")
        if state.status == SessionStatus.completed:
            raise ValueError("Explore session is already completed.")

        score, feedback, follow_up_question = self._evaluate_and_follow_up(
            passage_title=state.passage_title,
            passage_content=state.passage_content,
            question=state.current_question,
            answer=answer,
        )

        state.current_turn += 1
        state.score_history.append(score)

        average_score = sum(state.score_history) / len(state.score_history)
        mastered = average_score >= state.mastery_threshold
        exhausted = state.current_turn >= state.max_turns

        if mastered or exhausted:
            state.status = SessionStatus.completed
            summary = self._build_summary(
                average_score=average_score,
                mastery_threshold=state.mastery_threshold,
                current_turn=state.current_turn,
                max_turns=state.max_turns,
            )
            self._persist_explore_summary(state=state, summary=summary)
            ai_message = (
                "You completed this Explore session. "
                f"Average score: {average_score:.1f}. "
                f"Estimated skill level: {summary.skill_level}."
            )
            return ExploreSessionAnswerResponse(
                session_id=session_id,
                status=state.status,
                ai_message=ai_message,
                score=score,
                current_turn=state.current_turn,
                should_continue=False,
                summary=summary,
            )

        state.current_question = follow_up_question
        ai_message = f"{feedback}\n\nFollow-up: {follow_up_question}"

        return ExploreSessionAnswerResponse(
            session_id=session_id,
            status=state.status,
            ai_message=ai_message,
            score=score,
            current_turn=state.current_turn,
            should_continue=True,
            summary=None,
        )

    def start_teacher_session(self) -> None:
        raise NotImplementedError("Teacher chat flow is scaffolded but not implemented yet.")

    def answer_teacher_session(self) -> None:
        raise NotImplementedError("Teacher chat flow is scaffolded but not implemented yet.")

    def _build_summary(
        self,
        average_score: float,
        mastery_threshold: float,
        current_turn: int,
        max_turns: int,
    ) -> ExploreEvaluationSummary:
        return ExploreEvaluationSummary(
            average_score=round(average_score, 2),
            mastery_threshold=mastery_threshold,
            skill_level=self._skill_level_from_score(average_score),
            turns_used=current_turn,
            max_turns=max_turns,
        )

    def _skill_level_from_score(self, score: float) -> str:
        if score >= 85:
            return "Advanced"
        if score >= 70:
            return "Proficient"
        if score >= 50:
            return "Developing"
        return "Beginner"

    def _generate_passage_and_question(self, topic: str | None) -> tuple[str, str, str]:
        safe_topic = topic.strip() if topic and topic.strip() else "reading comprehension"
        prompt = (
            "Create a short reading passage for a student practice session. "
            "Return JSON with keys: title, passage, question. "
            "The question should test understanding of the main idea. "
            f"Topic: {safe_topic}"
        )

        try:
            raw = self.client.generate(prompt)
            parsed: dict[str, Any] = self._extract_json(raw)
            title = str(parsed.get("title", "Explore Passage")).strip() or "Explore Passage"
            passage = str(parsed.get("passage", "")).strip()
            question = str(parsed.get("question", "")).strip()
            if not passage or not question:
                raise ValueError("Missing passage/question fields")
            return title, passage, question
        except Exception:
            fallback_passage = (
                "Mina joins her school garden team. At first, she waters every plant the same amount, "
                "but some leaves turn yellow. Her teacher explains that each plant needs different care "
                "based on sunlight and soil moisture. Mina starts checking the soil before watering and "
                "records changes in a notebook. After two weeks, most plants look healthier and grow faster."
            )
            fallback_question = (
                "What is the main reason Mina's plants improved after two weeks?"
            )
            return "The School Garden", fallback_passage, fallback_question

    def _evaluate_and_follow_up(
        self,
        passage_title: str,
        passage_content: str,
        question: str,
        answer: str,
    ) -> tuple[float, str, str]:
        prompt = (
            "You are a reading comprehension coach. Evaluate the student's answer. "
            "Return JSON with keys: score (0-100 number), feedback (short), follow_up_question (short). "
            "Keep feedback encouraging and specific.\n"
            f"Passage title: {passage_title}\n"
            f"Passage: {passage_content}\n"
            f"Question: {question}\n"
            f"Student answer: {answer}"
        )

        try:
            raw = self.client.generate(prompt)
            parsed: dict[str, Any] = self._extract_json(raw)
            raw_score = parsed.get("score", 50)
            score = float(raw_score)
            score = max(0.0, min(100.0, score))

            feedback = str(
                parsed.get(
                    "feedback",
                    "Good effort. Try adding evidence from the passage to strengthen your answer.",
                )
            ).strip()
            follow_up_question = str(
                parsed.get(
                    "follow_up_question",
                    "Can you point to a sentence in the passage that supports your answer?",
                )
            ).strip()

            if not follow_up_question:
                follow_up_question = (
                    "Can you point to a sentence in the passage that supports your answer?"
                )

            return score, feedback, follow_up_question
        except Exception:
            return (
                55.0,
                "You identified part of the idea. Add one clear detail from the passage to improve it.",
                "Which detail in the passage best supports your answer?",
            )

    def _extract_json(self, text: str) -> dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()

        try:
            parsed_obj: Any = json.loads(cleaned)
            if isinstance(parsed_obj, dict):
                return cast(dict[str, Any], parsed_obj)
        except Exception:
            pass

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise ValueError("No JSON object found in model output")

        parsed_obj: Any = json.loads(cleaned[start : end + 1])
        if not isinstance(parsed_obj, dict):
            raise ValueError("Parsed JSON is not an object")
        return cast(dict[str, Any], parsed_obj)

    def _persist_explore_summary(
        self,
        state: ExploreSessionState,
        summary: ExploreEvaluationSummary,
    ) -> None:
        completed_at = datetime.now(timezone.utc)
        payload: dict[str, Any] = {
            "session_id": state.session_id,
            "uid": state.user_id,
            "flow_type": "explore",
            "topic": state.topic,
            "passage_title": state.passage_title,
            "average_score": summary.average_score,
            "mastery_threshold": summary.mastery_threshold,
            "skill_level": summary.skill_level,
            "turns_used": summary.turns_used,
            "max_turns": summary.max_turns,
            "started_at": state.started_at.isoformat(),
            "completed_at": completed_at.isoformat(),
        }
        upsert_explore_session_summary(payload)
