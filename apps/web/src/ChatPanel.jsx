import React, { useRef, useEffect } from "react";
import TaptapAvatar from "./TaptapAvatar";

const ChatPanel = ({ messages = [], input, onInput, onSend, avatarSrc }) => {
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-expand textarea as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) onSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
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
      </div>

      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Enter your thoughts..."
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="1"
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