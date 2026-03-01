import React, { useRef, useEffect } from "react";
import TaptapAvatar from "./TaptapAvatar";

const ChatPanel = ({ messages = [], input, onInput, onSend, avatarSrc }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) onSend();
    }
  };

  return (
    <div className="chat-panel">
      {messages.map((msg, i) =>
        msg.role === "ai" ? (
          <div key={i}>
            <div className="chat-label">Taptap</div>
            <div className="chat-row-ai">
              <TaptapAvatar src={avatarSrc} />
              <div className="chat-bubble-ai">{msg.text}</div>
            </div>
          </div>
        ) : (
          <div key={i} className="chat-bubble-user">{msg.text}</div>
        )
      )}
      <div ref={bottomRef} />

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Enter your thoughts..."
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={onSend}
          disabled={!input.trim()}
          aria-label="Send"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;