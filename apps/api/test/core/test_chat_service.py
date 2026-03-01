# apps/api/tests/core/test_chat_service.py
import json

from pytest import MonkeyPatch

from app.core.chat_service import ChatService
from app.core.genai_client import BaseGenAIClient


class FakeClient(BaseGenAIClient):
    def __init__(self, scores: list[float]):
        self.scores = scores
        self.index = 0

    def generate(self, prompt: str) -> str:
        if "Create a short reading passage" in prompt:
            return json.dumps(
                {
                    "title": "Practice Passage",
                    "passage": "A short passage for testing comprehension.",
                    "question": "What is the main idea of the passage?",
                }
            )

        score = self.scores[min(self.index, len(self.scores) - 1)]
        self.index += 1
        return json.dumps(
            {
                "score": score,
                "feedback": "Good attempt. Add textual evidence.",
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
    assert result.max_turns == 5


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
    assert "Follow-up:" in result.ai_message
    assert persisted_payloads == []


def test_submit_answer_completes_and_persists(monkeypatch: MonkeyPatch):
    persisted_payloads: list[dict[str, object]] = []
    monkeypatch.setattr(
        "app.core.chat_service.upsert_explore_session_summary",
        lambda payload: persisted_payloads.append(payload),  # type: ignore[arg-type]
    )

    service = ChatService(client=FakeClient(scores=[90]))
    start = service.start_explore_session(user_id="u1", topic="science")
    result = service.submit_explore_answer(
        session_id=start.session_id,
        user_id="u1",
        answer="Strong answer",
    )

    assert result.should_continue is False
    assert result.summary is not None
    assert result.summary.skill_level in {"Advanced", "Proficient", "Developing", "Beginner"}
    assert len(persisted_payloads) == 1
    assert persisted_payloads[0]["session_id"] == start.session_id
    assert persisted_payloads[0]["uid"] == "u1"