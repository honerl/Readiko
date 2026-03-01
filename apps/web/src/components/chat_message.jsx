import React from 'react';

const ChatMessage = ({ role, text }) => {
  const isAI = role === 'ai';

  return (
    <div className={`message-container ${isAI ? 'ai-align' : 'user-align'}`}>
      {isAI && (
        <div className="avatar">
          <img src="/path-to-bee-icon.png" alt="Taptap" />
          <span className="avatar-label">Taptap</span>
        </div>
      )}
      <div className={`bubble ${isAI ? 'ai-bubble' : 'user-bubble'}`}>
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;