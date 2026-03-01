# apps/api/tests/api/test_chat_routes.py
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pytest import MonkeyPatch

import app.api.routes.chat.router as chat_router_module
from app.models.chat import (
    ExploreEvaluationSummary,
    ExploreSessionAnswerResponse,
    ExploreSessionStartResponse,
    SessionStatus,
)


class FakeChatService:
    def start_explore_session(self, user_id: str, topic: str | None = None):
        return ExploreSessionStartResponse(
            session_id="session-1",
            passage_title="T1",
            passage_content="Passage content",
            ai_message="Q1",
            current_turn=0,
            max_turns=5,
        )

    def submit_explore_answer(self, session_id: str, user_id: str, answer: str):
        if session_id == "missing":
            raise ValueError("Explore session not found.")

        if answer == "done":
            return ExploreSessionAnswerResponse(
                session_id=session_id,
                status=SessionStatus.completed,
                ai_message="Completed",
                score=88.0,
                current_turn=1,
                should_continue=False,
                summary=ExploreEvaluationSummary(
                    average_score=88.0,
                    mastery_threshold=75.0,
                    skill_level="Advanced",
                    turns_used=1,
                    max_turns=5,
                ),
            )

        return ExploreSessionAnswerResponse(
            session_id=session_id,
            status=SessionStatus.in_progress,
            ai_message="Feedback\n\nFollow-up: Q2",
            score=62.0,
            current_turn=1,
            should_continue=True,
            summary=None,
        )


def _build_client(monkeypatch: MonkeyPatch) -> TestClient:
    monkeypatch.setattr(chat_router_module, "chat_service", FakeChatService())
    app = FastAPI()
    app.include_router(chat_router_module.router)
    return TestClient(app)


def test_start_explore_route(monkeypatch: MonkeyPatch) -> None:
    client = _build_client(monkeypatch)
    response = client.post("/chat/explore/start", json={"user_id": "u1", "topic": "science"})

    assert response.status_code == 200
    body = response.json()
    assert body["session_id"] == "session-1"
    assert body["ai_message"] == "Q1"


def test_answer_explore_route_in_progress(monkeypatch: MonkeyPatch) -> None:
    client = _build_client(monkeypatch)
    response = client.post(
        "/chat/explore/session-1/answer",
        json={"user_id": "u1", "answer": "some answer"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["should_continue"] is True
    assert body["summary"] is None


def test_answer_explore_route_not_found(monkeypatch: MonkeyPatch) -> None:
    client = _build_client(monkeypatch)
    response = client.post(
        "/chat/explore/missing/answer",
        json={"user_id": "u1", "answer": "some answer"},
    )

    assert response.status_code == 404
    assert "Explore session not found." in response.json()["detail"]


def test_teacher_stub_route(monkeypatch: MonkeyPatch) -> None:
    client = _build_client(monkeypatch)
    response = client.post(
        "/chat/teacher/start",
        json={"user_id": "u1", "classroom_id": 1, "lesson_id": 1},
    )

    assert response.status_code == 200
    assert "not implemented" in response.json()["detail"].lower()