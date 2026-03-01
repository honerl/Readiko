import React, { useState } from 'react';
import ChatMessage from './chat_message';

const QuestionScreen = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Based on that, what do you think moving about moving a house?' },
    { role: 'user', text: 'It is hard UwU' },
    { role: 'ai', text: 'Great! What makes it hard?' },
    { role: 'user', text: 'heavy' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    // Logic for AI response would go here (calling your service)
  };

  return (
    <div className="question-container">
      {/* Left Section: Reading Content */}
      <div className="content-section">
        <div className="difficulty-badge">Easy</div>
        <h1>The Bayanihan Spirit in the City</h1>
        <p>
          In the small town of San Jose, the tradition of Bayanihan was alive. 
          Neighbors would literally carry a bamboo house on their shoulders to help a friend move. 
          It was a beautiful sight of unity and heavy lifting.
        </p>
      </div>

      {/* Right Section: Chat Interface */}
      <div className="chat-section">
        <div className="message-list">
          {messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} text={msg.text} />
          ))}
        </div>

        <div className="input-wrapper">
          <input 
            type="text" 
            placeholder="Enter your thoughts..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="send-btn">▶</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;