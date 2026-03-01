import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PassageBlock from "./PassageBlock";
import ChatPanel from "./ChatPanel";
import StreakHeader from "./StreakHeader";
import { answerExploreSession, startExploreSession } from "./services/api";

const ExploreScreen = ({ user }) => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [exploreSessionId, setExploreSessionId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [summary, setSummary]         = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [streak, setStreak]           = useState(0);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");

  const fallbackSession = {
    passage_title: "The School Garden",
    passage_content:
      "Mina joins her school garden team. At first, she waters every plant the same amount, but some leaves turn yellow. Her teacher explains that each plant needs different care based on sunlight and soil moisture. Mina starts checking the soil before watering and records changes in a notebook. After two weeks, most plants look healthier and grow faster.",
    ai_message: "What is the main reason Mina's plants improved after two weeks?",
  };

  useEffect(() => {
    const fetchStreak = user?.id
      ? fetch(`/api/users/${user.id}/streak`).then(r => r.json()).then(d => d.streak).catch(() => 0)
      : Promise.resolve(0);

    const createSession = async () => {
      try {
        const session = await startExploreSession({
          userId: user?.id || "anonymous",
          topic: testId || undefined,
        });
        setExploreSessionId(session.session_id);
        setSessionData(session);
        setMessages([{ role: "ai", text: session.ai_message }]);
      } catch {
        setExploreSessionId("fallback");
        setSessionData(fallbackSession);
        setMessages([{ role: "ai", text: fallbackSession.ai_message }]);
      }
    };

    Promise.all([createSession(), fetchStreak]).then(([, streakVal]) => {
      setStreak(streakVal);
    });
  }, [testId, user]);

  if (!sessionData) return <div className="test-page" style={{ padding: 40 }}>Loading…</div>;

  const passage = {
    title: sessionData.passage_title,
    content: sessionData.passage_content,
    difficulty: "Adaptive",
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isCompleted || !exploreSessionId) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      if (exploreSessionId === "fallback") {
        setMessages(prev => [
          ...prev,
          { role: "ai", text: "Great effort. Add one detail from the passage to strengthen your answer." },
        ]);
        return;
      }

      const result = await answerExploreSession({
        sessionId: exploreSessionId,
        userId: user?.id || "anonymous",
        answer: userMsg,
      });

      setMessages(prev => [...prev, { role: "ai", text: result.ai_message }]);

      if (!result.should_continue) {
        setIsCompleted(true);
        setSummary(result.summary || null);
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "I couldn't process that answer right now. Please try again." }]);
    } finally {
      setIsLoading(false);
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

      {summary && (
        <div className="explore-summary" style={{ marginTop: 12 }}>
          Skill level: {summary.skill_level} · Avg score: {summary.average_score}
        </div>
      )}

      {/* Actions */}
      <div className="explore-actions">
        <button className="action-btn-skip" onClick={() => navigate(-1)}>Skip</button>
        <button className="action-btn-next" disabled={!isCompleted}>Next</button>
      </div>
    </div>
  );
};

export default ExploreScreen;
