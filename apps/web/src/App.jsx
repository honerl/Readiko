import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import StudentHomepage from './StudentHomepage';

function App() {
  const [user, setUser] = useState(null);

  // Success handler now handles data and redirect logic is handled by the router
  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* 1. Login Route */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/home" /> : <Login onLoginSuccess={handleAuthSuccess} />
            } 
          />

          {/* 2. Register Route */}
          <Route path="/register" element={<Register />} />

          {/* 3. Student Home Route (Protected) */}
          <Route 
            path="/home" 
            element={
              user ? <StudentHomepage user={user} /> : <Navigate to="/login" />
            } 
          />

          {/* 4. Default: Redirect to login if path doesn't exist */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;