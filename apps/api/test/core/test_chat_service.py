# apps/api/tests/core/test_chat_service.py
import json
from typing import Any

from pytest import MonkeyPatch

from app.core.chat_service import ChatService
from app.core.genai_client import BaseGenAIClient


class FakeClient(BaseGenAIClient):
    def __init__(self, scores: list[float]):
        self.scores = scores
        self.index = 0

    def generate(self, prompt: str, json_schema: dict[str, Any] | None = None) -> str:
        _ = json_schema
        if "Create a passage and one question" in prompt:
            return json.dumps(
                {
                    "title": "Practice Passage",
                    "passage": " ".join(["This is a practice sentence for reading comprehension."] * 20),
                    "question": "What is the main idea of the passage?",
                    "process_focus": "access_retrieve",
                    "subskill": "key_detail",
                    "difficulty": "easy",
                }
            )

        score = self.scores[min(self.index, len(self.scores) - 1)]
        self.index += 1
        return json.dumps(
            {
                "score": score,
                "is_correct": score >= 70,
                "process_focus": "integrate_interpret",
                "subskill": "main_idea",
                "error_type": "none" if score >= 70 else "vague",
                "follow_up_question": "Which sentence supports your answer?",
            }
        )


def test_start_explore_session_returns_seed_question():
    service = ChatService(client=FakeClient(scores=[60]))
    result = service.start_explore_session(user_id="u1", topic="science")

    assert result.session_id
    assert result.passage_title == "Practice Passage"
    assert result.passage_content
    assert result.ai_message == "What is the main idea of the passage?"
    assert result.current_turn == 0
    assert result.max_turns == 6
    assert result.process_focus == "access_retrieve"
    assert result.subskill == "key_detail"
    assert result.difficulty == "easy"


def test_submit_answer_continues_when_not_mastered(monkeypatch: MonkeyPatch):
    persisted_payloads: list[dict[str, object]] = []
    monkeypatch.setattr(
        "app.core.chat_service.upsert_explore_session_summary",
        lambda payload: persisted_payloads.append(payload),  # type: ignore[arg-type]
    )

    service = ChatService(client=FakeClient(scores=[60]))
    start = service.start_explore_session(user_id="u1", topic="science")
    result = service.submit_explore_answer(
        session_id=start.session_id,
        user_id="u1",
        answer="My answer",
    )

    assert result.should_continue is True
    assert result.summary is None
    assert result.current_turn == 1
    assert result.feedback is not None
    assert result.follow_up_question == "Which sentence supports your answer?"
    assert result.ai_message == "Which sentence supports your answer?"
    assert result.process_focus in {"access_retrieve", "integrate_interpret", "reflect_evaluate"}
    assert result.subskill in {
        "key_detail",
        "locate_sentence",
        "vocab_in_context",
        "main_idea",
        "inference",
        "cause_effect",
        "compare_contrast",
        "summary",
        "author_purpose",
        "tone",
        "argument_strength",
        "credibility",
    }
    assert persisted_payloads == []


def test_submit_answer_completes_and_persists(monkeypatch: MonkeyPatch):
    persisted_payloads: list[dict[str, object]] = []
    monkeypatch.setattr(
        "app.core.chat_service.upsert_explore_session_summary",
        lambda payload: persisted_payloads.append(payload),  # type: ignore[arg-type]
    )

    service = ChatService(client=FakeClient(scores=[90, 90, 90, 90]))
    start = service.start_explore_session(user_id="u1", topic="science")
    first = service.submit_explore_answer(
        session_id=start.session_id,
        user_id="u1",
        answer="Strong answer",
    )
    second = service.submit_explore_answer(
        session_id=start.session_id,
        user_id="u1",
        answer="Strong answer",
    )
    third = service.submit_explore_answer(
        session_id=start.session_id,
        user_id="u1",
        answer="Strong answer",
    )
    result = service.submit_explore_answer(
        session_id=start.session_id,
        user_id="u1",
        answer="Strong answer",
    )

    assert first.should_continue is True
    assert second.should_continue is True
    assert third.should_continue is True
    assert result.should_continue is False
    assert result.summary is not None
    assert result.summary.skill_level in {
        "access_retrieve",
        "integrate_interpret",
        "reflect_evaluate",
    }
    assert result.summary.skill_reason
    assert len(persisted_payloads) == 1
    assert persisted_payloads[0]["session_id"] == start.session_id
    assert persisted_payloads[0]["uid"] == "u1"
