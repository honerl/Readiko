import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LESSON_SESSION } from "./mockData";
import './Test.css';

// ── Taptap Avatar ──────────────────────────────────────────
const TaptapAvatar = ({ src }) =>
  src
    ? <img src={src} alt="Taptap" className="taptap-avatar" />
    : <div className="taptap-avatar-fallback">🐝</div>;

// ── Chat Panel ─────────────────────────────────────────────
const ChatPanel = ({ messages, input, onInput, onSend, avatarSrc }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) onSend();
    }
  };

  return (
    <div className="chat-panel">
      {messages.map((msg, i) =>
        msg.role === "ai" ? (
          <div key={i}>
            <div className="chat-label">Taptap</div>
            <div className="chat-row-ai">
              <TaptapAvatar src={avatarSrc} />
              <div className="chat-bubble-ai">{msg.text}</div>
            </div>
          </div>
        ) : (
          <div key={i} className="chat-bubble-user">{msg.text}</div>
        )
      )}
      <div ref={bottomRef} />

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Enter your thoughts..."
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={onSend}
          disabled={!input.trim()}
          aria-label="Send"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

// ── Progress Bar ───────────────────────────────────────────
const ProgressBar = ({ current, total }) => {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percent}%` }} />
    </div>
  );
};

// ── Passage Block ──────────────────────────────────────────
const PassageBlock = ({ title, content, difficulty }) => (
  <div className="passage-panel">
    {difficulty && (
      <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
        {difficulty}
      </span>
    )}
    <h2>{title}</h2>
    {Array.isArray(content)
      ? content.map((para, i) => <p key={i}>{para}</p>)
      : <p>{content}</p>}
  </div>
);

// ── LessonMode ─────────────────────────────────────────────
const LessonMode = () => {
  const { testId } = useParams();
  const navigate   = useNavigate();

  const [test, setTest]                       = useState(null);
  const [currentPassage, setCurrentPassage]   = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [messages, setMessages]               = useState([]);
  const [input, setInput]                     = useState("");
  const [isLoading, setIsLoading]             = useState(false);

  // ── Load data ──
  useEffect(() => {
    if (!testId) {
      console.log("No testId — using mock lesson session");
      setTest(LESSON_SESSION);
      return;
    }

    fetch(`/api/tests/${testId}`)
      .then(r => r.json())
      .then(setTest)
      .catch(() => {
        console.warn("Fetch failed — falling back to mock lesson session");
        setTest(LESSON_SESSION);
      });
  }, [testId]);

  // ── Seed first question whenever passage/question index changes ──
  useEffect(() => {
    if (!test) return;
    const q = test.passages[currentPassage]?.questions[currentQuestion];
    if (q) setMessages([{ role: "ai", text: q.text }]);
    setInput("");
  }, [test, currentPassage, currentQuestion]);

  if (!test) return <div className="test-page" style={{ padding: 40 }}>Loading…</div>;

  const passage  = test.passages[currentPassage];
  const question = passage.questions[currentQuestion];

  // Progress across all questions in all passages
  const totalQuestions = test.passages.reduce((a, p) => a + p.questions.length, 0);
  const currentNumber  = test.passages
    .slice(0, currentPassage)
    .reduce((a, p) => a + p.questions.length, 0) + currentQuestion + 1;

  // ── Navigate to next question / passage ──
  const goNext = () => {
    const hasMoreQuestions = currentQuestion < passage.questions.length - 1;
    const hasMorePassages  = currentPassage  < test.passages.length - 1;

    if (hasMoreQuestions) {
      setCurrentQuestion(q => q + 1);
    } else if (hasMorePassages) {
      setCurrentPassage(p => p + 1);
      setCurrentQuestion(0);
    } else {
      navigate("/dashboard"); // end of lesson
    }
  };

  // ── Send student reply to scaffold API ──
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.text,
          answer: userMsg,
          history: messages,
        }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: "ai", text: data.sufficient ? "✅ Great answer!" : data.feedback },
      ]);
    } catch {
      // Mock follow-up responses so the UI feels alive without a backend
      const followUps = [
        "Great! What makes you think that?",
        "Interesting — can you give an example from the passage?",
        "Good thinking! How does that connect to the main idea?",
        "Nice! Why do you think the author wrote it that way?",
      ];
      const reply = followUps[messages.filter(m => m.role === "ai").length % followUps.length];
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="test-page">

      {/* ── Top bar ── */}
      <div className="explore-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <ProgressBar current={currentNumber} total={totalQuestions} />
      </div>

      {/* ── Split card ── */}
      <div className="explore-card">
        <PassageBlock
          title={passage.title}
          content={passage.content}
          difficulty={passage.difficulty}
        />
        <ChatPanel
          messages={messages}
          input={input}
          onInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>

      {/* ── Actions ── */}
      <div className="explore-actions">
        <button className="action-btn-skip" onClick={() => navigate(-1)}>Skip</button>
        <button className="action-btn-next" onClick={goNext}>Next</button>
      </div>

    </div>
  );
};

export default LessonMode;
