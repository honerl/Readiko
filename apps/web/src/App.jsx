import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import RoleSelection from './RoleSelection';
import StudentHomepage from './StudentHomepage';
import { supabase } from './services/supabaseClient';

function App() {
  const [user, setUser] = useState(null);

  // synchronize with supabase session when the app loads
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getInitialSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('auth event:', event);
      
      // Update user state based on event
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
      } else if (session?.user) {
        // avoid bumping the state if the id hasn't actually changed;
        // Supabase sometimes emits INITIAL_SESSION after SIGNED_IN,
        // which leads to two identical user objects and a double
        // render downstream.
        if (session.user.id !== user?.id) {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // handler that child components can call when they obtain the user
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

          {/* Role selection after signup */}
          <Route path="/role" element={<RoleSelection />} />

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