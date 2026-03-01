import React from "react";

const ProgressBar = ({ current, total }) => {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;