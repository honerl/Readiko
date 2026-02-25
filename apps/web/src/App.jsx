import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  return (
    <div className="app-container">
      {view === 'login' && (
        <Login 
          onSwitch={() => setView('register')} 
          onLoginSuccess={handleAuthSuccess} 
        />
      )}

      {view === 'register' && (
        <Register 
          onSwitch={() => setView('login')} 
        />
      )}

      {view === 'dashboard' && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Welcome to ReadiKo, {user?.email}!</h1>
          <button onClick={() => setView('login')}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;