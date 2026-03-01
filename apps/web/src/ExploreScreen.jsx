import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PassageBlock from "./PassageBlock";
import ChatPanel from "./ChatPanel";
import StreakHeader from "./StreakHeader";
import { EXPLORE_SESSION } from "./mockData";

const ExploreScreen = ({ user }) => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [streak, setStreak]           = useState(0);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");

  // Load session + streak in parallel
  useEffect(() => {
    const fetchSession = testId
      ? fetch(`/api/explore/${testId}`).then(r => r.json()).catch(() => EXPLORE_SESSION)
      : Promise.resolve(EXPLORE_SESSION);

    const fetchStreak = user?.id
      ? fetch(`/api/users/${user.id}/streak`).then(r => r.json()).then(d => d.streak).catch(() => EXPLORE_SESSION.streak)
      : Promise.resolve(EXPLORE_SESSION.streak);

    Promise.all([fetchSession, fetchStreak]).then(([session, streakVal]) => {
      setSessionData(session);
      setStreak(streakVal);
      // Seed the first AI question
      const firstQ = session.passages[0]?.questions[0];
      if (firstQ) {
        setMessages([{ role: "ai", text: firstQ.text }]);
      }
    });
  }, [testId, user]);

  if (!sessionData) return <div className="test-page" style={{ padding: 40 }}>Loading…</div>;

  const passage = sessionData.passages[0];

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);

    // Call scaffold / follow-up API
    try {
      const res = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userMsg, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Great! Tell me more." }]);
    }
  };

  return (
    <div className="test-page">
      {/* Top bar */}
      <div className="explore-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <StreakHeader streak={streak} />
      </div>

      {/* Split card */}
      <div className="explore-card">
        <PassageBlock
          title={passage.title}
          content={passage.content}
          difficulty={passage.difficulty || "Easy"}
        />
        <ChatPanel
          messages={messages}
          input={input}
          onInput={setInput}
          onSend={handleSend}
        />
      </div>

      {/* Actions */}
      <div className="explore-actions">
        <button className="action-btn-skip" onClick={() => navigate(-1)}>Skip</button>
        <button className="action-btn-next">Next</button>
      </div>
    </div>
  );
};

export default ExploreScreen;
