import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EXAM_SESSION } from "./mockData";
import './Test.css';

const formatTime = (secs) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const ExamMode = () => {
  const { testId } = useParams();
  const navigate   = useNavigate();

  const [test, setTest]               = useState(null);
  const [currentItem, setCurrentItem] = useState(0);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(3600);

  useEffect(() => {
    if (!testId) {
      setTest(EXAM_SESSION);
      setTimeLeft(EXAM_SESSION.totalTime);
      return;
    }
    fetch(`/api/tests/${testId}`)
      .then(r => r.json())
      .then(data => { setTest(data); setTimeLeft(data.totalTime ?? 3600); })
      .catch(() => { setTest(EXAM_SESSION); setTimeLeft(EXAM_SESSION.totalTime); });
  }, [testId]);

  useEffect(() => {
    if (!test) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [test]);

  if (!test) return <div className="test-page" style={{ padding: 40 }}>Loading...</div>;

  const items = test.passages;
  const item  = items[currentItem];
  const total = items.length;

  const handleAnswer = (questionId, value) =>
    setAnswers(prev => ({ ...prev, [questionId]: value }));

  const isAnswered = (idx) =>
    items[idx].questions.some(q => answers[q.id]?.trim());

  return (
    <div className="test-page">

      {/* Outer row: left column + sidebar */}
      <div className="exam-layout">

        {/* LEFT COLUMN: topbar + card stacked so they share the same left edge */}
        <div className="exam-main-col">

          {/* Topbar inside the left column */}
          <div className="exam-topbar">
            <button className="back-btn" onClick={() => navigate(-1)}>&#8592;</button>
            <div className="exam-item-header">
              <span className="exam-item-title">Item {currentItem + 1}</span>
              <span className="exam-item-points">{item.points ?? 10} points</span>
            </div>
          </div>

          {/* Content card directly below the topbar */}
          <div className="exam-content-card">
            <div className="exam-passage-col">
              <h2>{item.title}</h2>
              {Array.isArray(item.content)
                ? item.content.map((para, i) => <p key={i}>{para}</p>)
                : <p>{item.content}</p>}
            </div>
            <div className="exam-questions-col">
              {item.questions.map((q) => (
                <div key={q.id} className="exam-question-block">
                  <h3>{q.text}</h3>
                  <textarea
                    className="exam-answer-input"
                    placeholder="Enter your answer..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="exam-sidebar">
          <div className="exam-sidebar-card">
            <h4>Item Navigation</h4>
            <div className="nav-grid">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  className={[
                    "nav-num-btn",
                    idx === currentItem ? "active"   : "",
                    isAnswered(idx)     ? "answered" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setCurrentItem(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="exam-sidebar-card">
            <div className="exam-timer-label">Time left:</div>
            <div className="exam-timer-value">{formatTime(timeLeft)}</div>
          </div>
        </div>

      </div>

      {/* Pagination */}
      <div className="exam-pagination">
        <button
          className="exam-page-btn"
          onClick={() => setCurrentItem(i => Math.max(i - 1, 0))}
          disabled={currentItem === 0}
        >
          Prev
        </button>
        <span className="exam-page-indicator">{currentItem + 1}/{total}</span>
        <button
          className="exam-page-btn"
          onClick={() => setCurrentItem(i => Math.min(i + 1, total - 1))}
          disabled={currentItem === total - 1}
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default ExamMode;
