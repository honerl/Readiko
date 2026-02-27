import React from 'react';

const ClassDetail = ({ cls, onBack }) => {
  if (!cls) return null;

  return (
    <section style={{ padding: '40px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>← Back to classes</button>
      <h2>{cls.title}</h2>
      <p>{cls.description}</p>
      <p>
        <strong>Teacher:</strong> {cls.teacher_name || 'Ms. English Teacher'}
      </p>
      {/* TODO: add class interface items here (lessons, quizzes, etc.) */}
    </section>
  );
};

export default ClassDetail;