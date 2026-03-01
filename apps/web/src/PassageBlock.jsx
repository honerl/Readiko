import React from "react";

const PassageBlock = ({ title, content, difficulty }) => (
  <div className="passage-panel">
    {difficulty && (
      <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    )}
    <h2>{title}</h2>
    {/* Support multi-paragraph content passed as string or array */}
    {Array.isArray(content)
      ? content.map((para, i) => <p key={i}>{para}</p>)
      : <p>{content}</p>
    }
  </div>
);

export default PassageBlock;
