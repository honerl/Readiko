import React, { useState } from "react";

const defaultQuestion = () => ({ q_text: "", score: 5 });

const AddPassage = ({ onBack, onAdd }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState([defaultQuestion()]);

  const onQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, defaultQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in the title and passage.");
      return;
    }
    onAdd({ title: title.trim(), content: content.trim(), questions });
  };

  return (
    <aside className="ta-drawer" onClick={(e) => e.stopPropagation()}>
      <div className="ta-drawerHeader">
        <button className="ta-back" onClick={onBack}>←</button>
        <div className="ta-drawerTitle">Add Passage</div>
      </div>

      <div className="ta-form">
        {/* Title */}
        <input
          className="ta-inputLine"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Passage */}
        <label className="ta-label">
          Passage
          <textarea
            className="ta-textarea"
            placeholder="Enter your passage"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </label>

        {/* Questions */}
        <label className="ta-label">Questions</label>
        <div className="ta-passages">
          {questions.map((q, index) => (
            <div key={index} className="ta-questionRow">
              <input
                className="ta-questionInput"
                placeholder="Enter your question"
                value={q.q_text}
                onChange={(e) => onQuestionChange(index, "q_text", e.target.value)}
              />
              <input
                className="ta-scoreInput"
                type="number"
                min={1}
                value={q.score}
                onChange={(e) => onQuestionChange(index, "score", e.target.value)}
              />
              {questions.length > 1 && (
                <button
                  className="ta-removeQ"
                  onClick={() => removeQuestion(index)}
                  title="Remove question"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button className="ta-addQuestionBtn" onClick={addQuestion}>
            + Add Question
          </button>
        </div>

        {/* Add button */}
        <div className="ta-actions">
          <button className="ta-createBtn" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AddPassage;