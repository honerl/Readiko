import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './Test.css';
import { supabase } from "./services/supabaseClient";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TaptapAvatar = ({ src }) =>
  src
    ? <img src={src} alt="Taptap" className="taptap-avatar" />
    : <div className="taptap-avatar-fallback">🐝</div>;

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: 5, padding: "6px 2px", alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: "50%", background: "#EE6A60", display: "inline-block",
        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
  </div>
);

const ChatPanel = ({ messages, input, onInput, onSend, avatarSrc, isLoading }) => {
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !isLoading) onSend(); }
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
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
        {isLoading && (
          <div>
            <div className="chat-label">Taptap</div>
            <div className="chat-row-ai">
              <TaptapAvatar src={avatarSrc} />
              <div className="chat-bubble-ai"><TypingIndicator /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Enter your thoughts..."
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="1"
          disabled={isLoading}
        />
        <button className="chat-send-btn" onClick={onSend} disabled={!input.trim() || isLoading} aria-label="Send">▶</button>
      </div>
    </div>
  );
};

const ProgressBar = ({ current, total }) => {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percent}%` }} />
    </div>
  );
};

const PassageBlock = ({ title, content, difficulty }) => (
  <div className="passage-panel">
    <div className="passage-content">
      {difficulty && <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>{difficulty}</span>}
      <h2>{title}</h2>
      {Array.isArray(content) ? content.map((para, i) => <p key={i}>{para}</p>) : <p>{content}</p>}
    </div>
  </div>
);

const SummaryScreen = ({ summary, onClose }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 16, padding: "60px 40px",
    background: "#FFFDF5", borderRadius: 20, textAlign: "center",
  }}>
    <div style={{ fontSize: 48 }}>🎉</div>
    <h2 style={{ color: "#6C530E", margin: 0 }}>Session Complete!</h2>
    <button onClick={onClose} style={{
      marginTop: 12, padding: "12px 40px", backgroundColor: "#EE6A60",
      color: "#fff", border: "none", borderRadius: 12, fontSize: 16, cursor: "pointer", fontWeight: "bold",
    }}>
      Back to Dashboard
    </button>
  </div>
);

const LessonMode = () => {
  const { topic } = useParams();
  const navigate  = useNavigate();
  const [userId, setUserId] = useState(null);


  const [sessionId,   setSessionId]   = useState(null);
  const [passage,     setPassage]     = useState(null);
  const [turnInfo,    setTurnInfo]    = useState({ current: 0, max: 6 });
  const [summary,     setSummary]     = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
  if (!userId) return; // wait until Supabase gives us the user ID

  const startSession = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/chat/explore/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            topic: topic ?? "Self-Paced Learning",
          }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setSessionId(data.session_id);
        setPassage({ title: data.passage_title, content: data.passage_content, difficulty: data.difficulty });
        setTurnInfo({ current: data.current_turn, max: data.max_turns });
        setMessages([{ role: "ai", text: data.ai_message }]);
      } catch (err) {
        setError("Failed to load the session. Please try again.");
        console.error("[LessonMode] start:", err);
      } finally {
        setIsLoading(false);
      }
    };

    startSession();
  }, [userId]); // ← depends on userId, not []

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);
    setHasAnswered(true);
    try {
      const res = await fetch(`${API_BASE}/chat/explore/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, answer: userMsg }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      // data: { feedback, follow_up_question, should_continue, current_turn, summary }
      setTurnInfo(prev => ({ ...prev, current: data.current_turn }));
      if (data.feedback) {
        setMessages(prev => [...prev, { role: "ai", text: data.feedback }]);
      }
      if (!data.should_continue) {
        setSummary(data.summary);
        setSessionDone(true);
      } else if (data.follow_up_question) {
        setMessages(prev => [...prev, { role: "ai", text: data.follow_up_question }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again." }]);
      console.error("[LessonMode] answer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) return (
    <div className="test-page" style={{ padding: 40, textAlign: "center" }}>
      <p style={{ color: "#EE6A60", fontSize: 18 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 16, cursor: "pointer" }}>Go Back</button>
    </div>
  );

  if (!passage && isLoading) return (
    <div className="test-page" style={{ padding: 40, textAlign: "center", color: "#8d7b5f" }}>
      Loading your passage…
    </div>
  );

  if (!userId) return (
    <div className="test-page" style={{ padding: 40, textAlign: "center", color: "#8d7b5f" }}>
      Loading user…
    </div>
  );

  return (
    <div className="test-page explore-page">
      <div className="explore-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <img src="/assets/backbtn.png" alt="Back" />
        </button>
        <ProgressBar current={turnInfo.current} total={turnInfo.max} />
      </div>

      {sessionDone ? (
        <div className="explore-card" style={{ alignItems: "center", justifyContent: "center" }}>
          <SummaryScreen summary={summary} onClose={() => navigate("/dashboard")} />
        </div>
      ) : (
        <>
          <div className="explore-card">
            {passage && <PassageBlock title={passage.title} content={passage.content} difficulty={passage.difficulty} />}
            <ChatPanel messages={messages} input={input} onInput={setInput} onSend={handleSend} avatarSrc="/assets/taptap.png" isLoading={isLoading} />
          </div>
          <div className="lesson-actions">
            <button className="action-btn-next" onClick={() => navigate("/dashboard")} disabled={!hasAnswered}>
              Finish
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LessonMode;