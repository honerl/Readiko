import React from "react";

const QuestionBlock = ({ question, answer, onChange }) => {
  return (
    <div style={{ flex: 1 }} className="question-card">
      <h3>{question.text}</h3>
      <textarea
        className="answer-input"
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", height: "120px" }}
      />
    </div>
  );
};

export default QuestionBlock;