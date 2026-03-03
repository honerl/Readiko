from __future__ import annotations

import json
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
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
    process_focus: str = "access_retrieve"
    subskill: str = "key_detail"
    difficulty: str = "easy"
    current_turn: int = 0
    max_turns: int = 6
    mastery_threshold: float = 75.0
    score_history: list[int] = field(default_factory=lambda: [])
    correct_history: list[bool] = field(default_factory=lambda: [])
    last_error_type: str = "none"
    last_hint: str = ""
    last_score: int = 0
    process_mastery: dict[str, int] = field(
        default_factory=lambda: {
            "access_retrieve": 0,
            "integrate_interpret": 0,
            "reflect_evaluate": 0,
        }
    )
    subskill_mastery: dict[str, int] = field(default_factory=lambda: {})
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    status: SessionStatus = SessionStatus.in_progress


class ChatService:
    MIN_TURNS_BEFORE_COMPLETION = 4
    PROCESS_ORDER = ["access_retrieve", "integrate_interpret", "reflect_evaluate"]
    SUBSKILLS_BY_PROCESS: dict[str, list[str]] = {
        "access_retrieve": ["key_detail", "locate_sentence", "vocab_in_context"],
        "integrate_interpret": [
            "main_idea",
            "inference",
            "cause_effect",
            "compare_contrast",
            "summary",
        ],
        "reflect_evaluate": [
            "author_purpose",
            "tone",
            "argument_strength",
            "credibility",
        ],
    }
    ERROR_TYPES = {
        "none",
        "misread_detail",
        "unsupported",
        "vague",
        "wrong_inference",
        "wrong_main_idea",
        "vocab_confusion",
    }
    DIFFICULTY_LEVELS = {"easy", "medium", "hard"}
    NON_PASSAGE_BOUND_PATTERNS = (
        "dataset",
        "source",
        "real-world",
        "real world",
        "search online",
        "google",
        "wikipedia",
        "outside the passage",
        "external",
    )

    def __init__(self, client: BaseGenAIClient | None = None):
        self.client = client or get_genai_client()
        self.explore_sessions: dict[str, ExploreSessionState] = {}

    def start_explore_session(
        self,
        user_id: str,
        topic: str | None = None,
    ) -> ExploreSessionStartResponse:
        passage_title, passage_content, question, process_focus, subskill, difficulty = (
            self._generate_passage_and_question(topic=topic)
        )
        session_id = str(uuid.uuid4())

        state = ExploreSessionState(
            session_id=session_id,
            user_id=user_id,
            passage_title=passage_title,
            passage_content=passage_content,
            current_question=question,
            topic=topic,
            process_focus=process_focus,
            subskill=subskill,
            difficulty=difficulty,
        )
        self.explore_sessions[session_id] = state

        return ExploreSessionStartResponse(
            session_id=session_id,
            passage_title=state.passage_title,
            passage_content=state.passage_content,
            ai_message=state.current_question,
            process_focus=state.process_focus,
            subskill=state.subskill,
            difficulty=state.difficulty,
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

        score, is_correct, feedback, hint, process_focus, subskill, error_type, follow_up_question = (
            self._evaluate_and_follow_up(
                passage_title=state.passage_title,
                passage_content=state.passage_content,
                question=state.current_question,
                answer=answer,
                current_process_focus=state.process_focus,
                current_subskill=state.subskill,
                difficulty=state.difficulty,
                previous_error_type=state.last_error_type,
                previous_hint=state.last_hint,
                previous_score=state.last_score,
            )
        )

        score = self._normalize_score(score)

        process_focus, subskill = self._adapt_process_and_subskill(
            current_process=state.process_focus,
            current_subskill=state.subskill,
            predicted_process=process_focus,
            predicted_subskill=subskill,
            score=score,
            is_correct=is_correct,
            answer=answer,
        )

        follow_up_question = self._sanitize_follow_up_question(
            follow_up_question=follow_up_question,
            previous_question=state.current_question,
            answer=answer,
            process_focus=process_focus,
        )

        if self._is_uncertain_answer(answer):
            feedback = "Thanks for being honest. Let’s use one clear sentence from the passage to rebuild your answer."
            hint = "Quote one sentence from the passage that best helps answer the question."
            process_focus = "access_retrieve"
            subskill = "locate_sentence"
            error_type = "vague"
            follow_up_question = (
                "Which one sentence from the passage best helps answer the question?"
            )

        # Adaptation summary:
        # - incorrect or score < 70 -> remain in same process and scaffold inside it
        # - 70-89 -> ask for passage evidence (locate_sentence)
        # - >=90 -> advance one process tier when possible
        state.current_turn += 1
        state.score_history.append(score)
        state.correct_history.append(is_correct)
        state.process_focus = process_focus
        state.subskill = subskill
        state.process_mastery[process_focus] = state.process_mastery.get(process_focus, 0) + (
            1 if is_correct and score >= 70 else 0
        )
        state.subskill_mastery[subskill] = state.subskill_mastery.get(subskill, 0) + (
            1 if is_correct and score >= 70 else 0
        )
        state.last_error_type = error_type
        state.last_hint = hint
        state.last_score = score

        average_score = sum(state.score_history) / len(state.score_history)
        recent_correct = state.correct_history[-3:]
        consistent_recent = bool(recent_correct) and all(recent_correct)
        mastered = average_score >= state.mastery_threshold and consistent_recent
        exhausted = state.current_turn >= state.max_turns

        can_complete_by_mastery = state.current_turn >= self.MIN_TURNS_BEFORE_COMPLETION
        if (mastered and can_complete_by_mastery) or exhausted:
            state.status = SessionStatus.completed
            summary = self._build_summary(
                average_score=average_score,
                mastery_threshold=state.mastery_threshold,
                current_turn=state.current_turn,
                max_turns=state.max_turns,
                process_mastery=state.process_mastery,
            )
            self._persist_explore_summary(state=state, summary=summary)
            completion_message = (
                "You completed this Explore session. "
                f"Estimated skill level: {summary.skill_level}. "
                f"{summary.skill_reason}"
            )
            return ExploreSessionAnswerResponse(
                session_id=session_id,
                status=state.status,
                ai_message=completion_message,
                score=score,
                is_correct=is_correct,
                feedback=feedback,
                follow_up_question="",
                hint=hint,
                process_focus=process_focus,
                subskill=subskill,
                error_type=error_type,
                difficulty=state.difficulty,
                current_turn=state.current_turn,
                should_continue=False,
                summary=summary,
            )

        state.current_question = follow_up_question

        return ExploreSessionAnswerResponse(
            session_id=session_id,
            status=state.status,
            ai_message=follow_up_question,
            score=score,
            is_correct=is_correct,
            feedback=feedback,
            follow_up_question=follow_up_question,
            hint=hint,
            process_focus=process_focus,
            subskill=subskill,
            error_type=error_type,
            difficulty=state.difficulty,
            current_turn=state.current_turn,
            should_continue=True,
            summary=None,
        )

    def start_teacher_session(self) -> None:
        raise NotImplementedError(
            "Teacher chat flow is scaffolded but not implemented yet."
        )

    def answer_teacher_session(self) -> None:
        raise NotImplementedError(
            "Teacher chat flow is scaffolded but not implemented yet."
        )

    def _build_summary(
        self,
        average_score: float,
        mastery_threshold: float,
        current_turn: int,
        max_turns: int,
        process_mastery: dict[str, int],
    ) -> ExploreEvaluationSummary:
        return ExploreEvaluationSummary(
            average_score=round(average_score, 2),
            mastery_threshold=mastery_threshold,
            skill_level=self._skill_level_from_mastery(
                average_score=average_score,
                process_mastery=process_mastery,
            ),
            skill_reason=self._build_skill_reason(average_score),
            turns_used=current_turn,
            max_turns=max_turns,
        )

    def _skill_level_from_mastery(
        self,
        average_score: float,
        process_mastery: dict[str, int],
    ) -> str:
        if process_mastery.get("reflect_evaluate", 0) >= 1 and average_score >= 85:
            return "reflect_evaluate"
        if process_mastery.get("integrate_interpret", 0) >= 1 and average_score >= 70:
            return "integrate_interpret"
        return "access_retrieve"

    def _build_skill_reason(self, average_score: float) -> str:
        return f"Average score {average_score:.1f} across session responses."

    def _normalize_process_focus(self, process_focus: str, fallback: str) -> str:
        candidate = str(process_focus).strip().lower()
        if candidate in self.PROCESS_ORDER:
            return candidate
        return fallback

    def _normalize_subskill(self, process_focus: str, subskill: str, fallback: str) -> str:
        allowed = self.SUBSKILLS_BY_PROCESS.get(process_focus, [])
        candidate = str(subskill).strip().lower()
        if candidate in allowed:
            return candidate
        if fallback in allowed:
            return fallback
        return allowed[0] if allowed else fallback

    def _normalize_error_type(self, error_type: str) -> str:
        candidate = str(error_type).strip().lower()
        if candidate in self.ERROR_TYPES:
            return candidate
        return "none"

    def _normalize_difficulty(self, difficulty: str) -> str:
        candidate = str(difficulty).strip().lower()
        if candidate in self.DIFFICULTY_LEVELS:
            return candidate
        return "medium"

    def _normalize_score(self, score: int | float) -> int:
        return max(0, min(100, int(round(float(score)))))

    def _answer_has_passage_evidence(self, answer: str) -> bool:
        lowered = answer.lower()
        evidence_markers = (
            "the passage",
            "the text",
            "this sentence",
            "according to",
            "the author",
            '"',
            "'",
        )
        return any(marker in lowered for marker in evidence_markers)

    def _calibrate_evaluation(
        self,
        answer: str,
        score: int,
        is_correct: bool,
        error_type: str,
    ) -> tuple[int, bool, str]:
        calibrated_score = self._normalize_score(score)
        calibrated_correct = is_correct
        calibrated_error = error_type

        uncertain = self._is_uncertain_answer(answer)
        has_evidence = self._answer_has_passage_evidence(answer)
        answer_len = len(answer.split())

        if uncertain:
            return min(calibrated_score, 30), False, "vague"

        if calibrated_correct and answer_len >= 10 and calibrated_score < 70:
            calibrated_score = 70

        if has_evidence and answer_len >= 14 and calibrated_score >= 60 and calibrated_error in {
            "vague",
            "unsupported",
        }:
            calibrated_correct = True
            calibrated_error = "none"
            calibrated_score = max(calibrated_score, 75)

        if not calibrated_correct and calibrated_score >= 80:
            calibrated_correct = True
            calibrated_error = "none"

        return calibrated_score, calibrated_correct, calibrated_error

    def _is_uncertain_answer(self, answer: str) -> bool:
        lowered = answer.lower()
        return any(
            token in lowered
            for token in ("don't know", "do not know", "not sure", "can't", "cannot", "no idea")
        )

    def _next_process_tier(self, process_focus: str) -> str:
        current = self._normalize_process_focus(process_focus, "access_retrieve")
        idx = self.PROCESS_ORDER.index(current)
        return self.PROCESS_ORDER[min(idx + 1, len(self.PROCESS_ORDER) - 1)]

    def _default_subskill_for_process(self, process_focus: str) -> str:
        if process_focus == "access_retrieve":
            return "key_detail"
        if process_focus == "integrate_interpret":
            return "main_idea"
        return "author_purpose"

    def _adapt_process_and_subskill(
        self,
        current_process: str,
        current_subskill: str,
        predicted_process: str,
        predicted_subskill: str,
        score: int,
        is_correct: bool,
        answer: str,
    ) -> tuple[str, str]:
        current_process_norm = self._normalize_process_focus(current_process, "access_retrieve")
        normalized_current_subskill = self._normalize_subskill(
            current_process_norm,
            current_subskill,
            self._default_subskill_for_process(current_process_norm),
        )

        if self._is_uncertain_answer(answer):
            return "access_retrieve", "locate_sentence"

        if not is_correct or score < 70:
            if current_process_norm == "access_retrieve":
                scaffold_subskill = "locate_sentence"
            elif current_process_norm == "integrate_interpret":
                scaffold_subskill = (
                    normalized_current_subskill
                    if normalized_current_subskill in {"main_idea", "inference", "summary"}
                    else "main_idea"
                )
            else:
                scaffold_subskill = (
                    normalized_current_subskill
                    if normalized_current_subskill in {"author_purpose", "argument_strength"}
                    else "author_purpose"
                )
            return current_process_norm, scaffold_subskill

        if score < 90:
            if current_process_norm == "access_retrieve":
                if score >= 80:
                    return "integrate_interpret", "main_idea"
                return "access_retrieve", "locate_sentence"
            if current_process_norm == "integrate_interpret":
                return "integrate_interpret", "summary"
            return "reflect_evaluate", "argument_strength"

        target_process = self._next_process_tier(current_process_norm)
        normalized_process = self._normalize_process_focus(predicted_process, target_process)
        if normalized_process != target_process:
            normalized_process = target_process

        normalized_subskill = self._normalize_subskill(
            normalized_process,
            predicted_subskill,
            self._default_subskill_for_process(normalized_process),
        )
        return normalized_process, normalized_subskill

    def _truncate_feedback(self, feedback: str) -> str:
        compact = " ".join(str(feedback).split()).strip()
        if not compact:
            compact = "Good effort. Use one sentence from the passage as evidence."

        words = compact.split()
        if len(words) > 35:
            compact = " ".join(words[:35]).strip()

        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", compact) if s.strip()]
        if len(sentences) > 2:
            compact = " ".join(sentences[:2]).strip()

        if compact and compact[-1] not in {".", "!", "?"}:
            compact += "."

        return compact

    def _sanitize_follow_up_question(
        self,
        follow_up_question: str,
        previous_question: str,
        answer: str,
        process_focus: str,
    ) -> str:
        cleaned = " ".join(follow_up_question.split()).strip()
        lowered = cleaned.lower()
        previous_lowered = " ".join(previous_question.lower().split()).strip()

        should_replace = not cleaned
        if any(pattern in lowered for pattern in self.NON_PASSAGE_BOUND_PATTERNS):
            should_replace = True
        if lowered == previous_lowered:
            should_replace = True
        if "?" not in cleaned:
            should_replace = True

        if self._is_uncertain_answer(answer):
            should_replace = True

        if should_replace:
            if process_focus == "access_retrieve":
                cleaned = "Which one sentence from the passage best supports your answer?"
            elif process_focus == "integrate_interpret":
                cleaned = "Which detail in the passage best supports your interpretation?"
            else:
                cleaned = "Which sentence in the passage best supports your evaluation?"

        question_part = re.split(r"[?]", cleaned)[0].strip()
        if not question_part:
            question_part = "Which sentence from the passage best supports your answer"
        return f"{question_part}?"

    def _generate_passage_and_question(
        self, topic: str | None
    ) -> tuple[str, str, str, str, str, str]:
        safe_topic = topic.strip() if topic and topic.strip() else "reading comprehension"
        prompt = (
            "You are a reading tutor for high school students using the PISA Reading Literacy framework. "
            "Create a passage and one question for reading comprehension only. "
            "Return STRICT JSON only with keys: title, passage, question, process_focus, subskill, difficulty. "
            "Passage must be 120-180 words. "
            "Generate exactly one question that can be answered using only the passage. "
            "process_focus must be one of: access_retrieve, integrate_interpret, reflect_evaluate. "
            "subskill must match process_focus: "
            "access_retrieve -> key_detail, locate_sentence, vocab_in_context; "
            "integrate_interpret -> main_idea, inference, cause_effect, compare_contrast, summary; "
            "reflect_evaluate -> author_purpose, tone, argument_strength, credibility. "
            "difficulty must be one of: easy, medium, hard. "
            "Do not require external sources, datasets, searching, or outside knowledge. "
            f"Topic: {safe_topic}"
        )

        schema: dict[str, Any] = {
            "name": "explore_seed_pisa",
            "schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "passage": {"type": "string"},
                    "question": {"type": "string"},
                    "process_focus": {"type": "string"},
                    "subskill": {"type": "string"},
                    "difficulty": {"type": "string"},
                },
                "required": [
                    "title",
                    "passage",
                    "question",
                    "process_focus",
                    "subskill",
                    "difficulty",
                ],
                "additionalProperties": False,
            },
        }

        try:
            raw = self.client.generate(prompt, json_schema=schema)
            parsed: dict[str, Any] = self._extract_json(raw)

            title = str(parsed.get("title", "Explore Passage")).strip() or "Explore Passage"
            passage = str(parsed.get("passage", "")).strip()
            question = str(parsed.get("question", "")).strip()
            process_focus = self._normalize_process_focus(
                str(parsed.get("process_focus", "access_retrieve")),
                "access_retrieve",
            )
            subskill = self._normalize_subskill(
                process_focus,
                str(parsed.get("subskill", self._default_subskill_for_process(process_focus))),
                self._default_subskill_for_process(process_focus),
            )
            difficulty = self._normalize_difficulty(str(parsed.get("difficulty", "easy")))

            passage_words = len(passage.split())
            if not passage or not question:
                raise ValueError("Missing passage/question fields")
            if passage_words < 120 or passage_words > 180:
                raise ValueError("Passage length is out of bounds")

            question = self._sanitize_follow_up_question(
                follow_up_question=question,
                previous_question="",
                answer="",
                process_focus=process_focus,
            )
            return title, passage, question, process_focus, subskill, difficulty
        except Exception:
            fallback_passage = (
                "Mina joined the school paper because she liked writing short stories. During her first week, "
                "she noticed that readers skipped long introductions and focused on clear facts and examples. "
                "Her editor suggested that each article should open with one key idea, then support it with "
                "specific details from interviews. Mina revised her article about recycling by moving the main "
                "point to the first paragraph and adding two quotes from students. After publication, more "
                "students said they understood the article and wanted to join the recycling project at school."
            )
            fallback_question = "Which detail from the passage best explains why students understood Mina’s revised article better?"
            return (
                "Mina and the School Paper",
                fallback_passage,
                fallback_question,
                "access_retrieve",
                "key_detail",
                "easy",
            )

    def _evaluate_and_follow_up(
        self,
        passage_title: str,
        passage_content: str,
        question: str,
        answer: str,
        current_process_focus: str,
        current_subskill: str,
        difficulty: str,
        previous_error_type: str,
        previous_hint: str,
        previous_score: int,
    ) -> tuple[int, bool, str, str, str, str, str, str]:
        current_process = self._normalize_process_focus(current_process_focus, "access_retrieve")
        current_subskill_norm = self._normalize_subskill(
            current_process,
            current_subskill,
            self._default_subskill_for_process(current_process),
        )

        prompt = (
            "You are a reading comprehension tutor using the PISA Reading Literacy framework. "
            "Evaluate the student answer using ONLY the given passage. "
            "Return STRICT JSON only with keys: score, is_correct, process_focus, subskill, error_type, follow_up_question. "
            "score must be an integer 0-100. "
            "process_focus must be one of: access_retrieve, integrate_interpret, reflect_evaluate. "
            "subskill must match process_focus. "
            "error_type must be one of: none, misread_detail, unsupported, vague, wrong_inference, wrong_main_idea, vocab_confusion. "
            "follow_up_question must be EXACTLY ONE concise question and passage-bound. "
            "Never ask for external examples, datasets, sources, search, or outside knowledge. "
            "Adaptation rules: "
            "If incorrect or score < 70, stay in the same process_focus and scaffold within that process. "
            "If correct but vague (70-89), ask for evidence from passage with locate_sentence. "
            "If strong (>=90), advance process tier when reasonable: access_retrieve -> integrate_interpret -> reflect_evaluate. "
            "If student says they do not know or not sure, force process_focus=access_retrieve, subskill=locate_sentence, "
            "and ask them to quote one sentence from the passage.\n"
            f"Passage title: {passage_title}\n"
            f"Passage: {passage_content}\n"
            f"Current question: {question}\n"
            f"Student answer: {answer}\n"
            f"Current process_focus: {current_process}\n"
            f"Current subskill: {current_subskill_norm}\n"
            f"Current difficulty: {difficulty}\n"
            f"Previous error_type: {self._normalize_error_type(previous_error_type)}\n"
            f"Previous score: {self._normalize_score(previous_score)}\n"
            f"Previous hint: {previous_hint or 'none'}"
        )

        schema: dict[str, Any] = {
            "name": "explore_turn_pisa",
            "schema": {
                "type": "object",
                "properties": {
                    "score": {"type": "integer"},
                    "is_correct": {"type": "boolean"},
                    "process_focus": {"type": "string"},
                    "subskill": {"type": "string"},
                    "error_type": {"type": "string"},
                    "follow_up_question": {"type": "string"},
                },
                "required": [
                    "score",
                    "is_correct",
                    "process_focus",
                    "subskill",
                    "error_type",
                    "follow_up_question",
                ],
                "additionalProperties": False,
            },
        }

        try:
            raw = self.client.generate(prompt, json_schema=schema)
            parsed: dict[str, Any] = self._extract_json(raw)

            score = self._normalize_score(parsed.get("score", 50))
            is_correct = bool(parsed.get("is_correct", score >= 70))
            process_focus = self._normalize_process_focus(
                str(parsed.get("process_focus", current_process)),
                current_process,
            )
            subskill = self._normalize_subskill(
                process_focus,
                str(parsed.get("subskill", current_subskill_norm)),
                current_subskill_norm,
            )
            error_type = self._normalize_error_type(str(parsed.get("error_type", "none")))
            follow_up_question = str(
                parsed.get(
                    "follow_up_question",
                    "Which sentence from the passage best supports your answer?",
                )
            ).strip()

            score, is_correct, error_type = self._calibrate_evaluation(
                answer=answer,
                score=score,
                is_correct=is_correct,
                error_type=error_type,
            )

            feedback = self._build_feedback(
                is_correct=is_correct,
                score=score,
                error_type=error_type,
            )
            hint = self._build_hint(process_focus=process_focus, subskill=subskill)

            if self._is_uncertain_answer(answer):
                return (
                    max(0, min(score, 40)),
                    False,
                    self._truncate_feedback(
                        "Thanks for trying. Let’s anchor your answer in one clear sentence from the passage."
                    ),
                    "Quote one sentence that directly helps answer the question.",
                    "access_retrieve",
                    "locate_sentence",
                    "vague",
                    "Which one sentence from the passage best helps answer the question?",
                )

            return (
                score,
                is_correct,
                self._truncate_feedback(feedback),
                hint,
                process_focus,
                subskill,
                error_type,
                follow_up_question,
            )
        except Exception:
            return (
                55,
                False,
                "You identified part of the idea. Add one clear detail from the passage to improve it.",
                "Use one sentence from the passage as evidence.",
                current_process,
                current_subskill_norm,
                "vague",
                "Which sentence from the passage best supports your answer?",
            )

    def _build_feedback(self, is_correct: bool, score: int, error_type: str) -> str:
        if is_correct and score >= 90:
            return "Strong answer. You used the passage accurately and clearly."
        if is_correct:
            return "Good answer. Add one clear sentence from the passage as evidence to strengthen it."

        if error_type == "misread_detail":
            return "You missed a key detail from the passage. Re-check the exact wording before answering."
        if error_type == "wrong_main_idea":
            return "Your answer does not match the passage’s main idea. Focus on the author’s central point."
        if error_type == "wrong_inference":
            return "Your inference is not supported by the passage. Choose a claim that is directly backed by details."
        if error_type == "unsupported":
            return "Your claim needs textual support. Use a sentence from the passage to justify it."
        if error_type == "vocab_confusion":
            return "A key word may be misunderstood. Re-read the sentence where the term appears."
        return "Your answer is partly correct. Add a specific detail from the passage to make it accurate."

    def _build_hint(self, process_focus: str, subskill: str) -> str:
        if process_focus == "access_retrieve" and subskill == "locate_sentence":
            return "Find the sentence that directly answers the question and quote it."
        if process_focus == "access_retrieve":
            return "Look for one concrete detail in the passage that matches the question."
        if process_focus == "integrate_interpret":
            return "Connect two details from different parts of the passage before answering."
        return "Use one quoted sentence plus your judgment in one short statement."

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
