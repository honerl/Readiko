import React, { useState } from "react";

const defaultQuestion = () => ({ q_text: "", score: 5 });

const AddPassage = ({ onBack, onAdd }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState(defaultQuestion());
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const onDraftQuestionChange = (field, value) => {
    setQuestionDraft((prev) => ({ ...prev, [field]: value }));
  };

  const openNewQuestionEditor = () => {
    setQuestionDraft(defaultQuestion());
    setEditingIndex(null);
    setIsEditingQuestion(true);
    setOpenMenuIndex(null);
  };

  const cancelQuestionEditor = () => {
    setQuestionDraft(defaultQuestion());
    setEditingIndex(null);
    setIsEditingQuestion(false);
  };

  const saveQuestion = () => {
    if (!questionDraft.q_text.trim()) return;

    if (editingIndex !== null) {
      setQuestions((prev) =>
        prev.map((q, i) => (i === editingIndex ? { ...questionDraft, q_text: questionDraft.q_text.trim() } : q))
      );
    } else {
      setQuestions((prev) => [...prev, { ...questionDraft, q_text: questionDraft.q_text.trim() }]);
    }

    cancelQuestionEditor();
  };

  const editQuestion = (index) => {
    setQuestionDraft(questions[index]);
    setEditingIndex(index);
    setIsEditingQuestion(true);
    setOpenMenuIndex(null);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      cancelQuestionEditor();
    }
    setOpenMenuIndex(null);
  };

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in the title and passage.");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    onAdd({ title: title.trim(), content: content.trim(), questions });
  };

  return (
    <aside className="ta-drawer" onClick={(e) => e.stopPropagation()}>
      <div className="ta-drawerHeader">
        <button className="ta-back" onClick={onBack} aria-label="Back">
          <img src="/assets/backbtn.png" alt="Back" />
        </button>
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
        <div className="ta-passages ta-questionsCard">
          <div className="ta-passagesTitle">Questions</div>

          <div className="ta-questionList">
            {questions.map((q, index) => (
              <div key={index} className="ta-questionItem">
                <div className="ta-questionItemText">{q.q_text}</div>
                <div className="ta-questionItemRight">
                  <span className="ta-questionScore">{q.score}</span>
                  <div className="ta-questionMenuWrap">
                    <button
                      type="button"
                      className="ta-questionMenuBtn"
                      onClick={() => setOpenMenuIndex((prev) => (prev === index ? null : index))}
                      aria-label="Question options"
                    >
                      ⋮
                    </button>
                    {openMenuIndex === index && (
                      <div className="ta-questionMenu">
                        <button type="button" onClick={() => editQuestion(index)}>Edit</button>
                        <button type="button" onClick={() => removeQuestion(index)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="ta-addQuestionBtn" onClick={openNewQuestionEditor} disabled={isEditingQuestion}>
              + Add Question
            </button>
          </div>

          {isEditingQuestion && (
            <div className="ta-questionEditor">
              <div className="ta-questionRow">
                <input
                  className="ta-questionInput"
                  placeholder="Enter your question"
                  value={questionDraft.q_text}
                  onChange={(e) => onDraftQuestionChange("q_text", e.target.value)}
                />
                <input
                  className="ta-scoreInput"
                  type="number"
                  min={1}
                  value={questionDraft.score}
                  onChange={(e) => onDraftQuestionChange("score", Number(e.target.value) || 1)}
                />
                <button
                  type="button"
                  className="ta-removeQ"
                  onClick={cancelQuestionEditor}
                  title="Cancel"
                >
                  ✕
                </button>
                <button
                  type="button"
                  className="ta-confirmQ"
                  onClick={saveQuestion}
                  title="Save question"
                >
                  ✓
                </button>
              </div>
            </div>
          )}

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