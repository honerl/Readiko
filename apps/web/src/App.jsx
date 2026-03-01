import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import RoleSelection from './RoleSelection';
import StudentHomepage from './StudentHomepage';
import ExamMode from './ExamMode';
import LessonMode from './LessonMode';
import ExploreScreen from './ExploreScreen';
import './App.css';
import './Test.css'
import TeacherHome from './TeacherHome';
import { supabase } from './services/supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // synchronize with supabase session when the app loads
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('uid', session.user.id)
          .single();

        if (!error && data) {
          setUserRole(data.role);
        } else {
          console.error('Role fetch error:', error);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }

      setLoading(false);
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
          setUserRole(null);
        }
      }
    );
  }, []);

  // handler that child components can call when they obtain the user
  const handleAuthSuccess = (userData, role) => {
    setUser(userData);
    setUserRole(role); // assuming role is included in the user object
    console.log('DEBUG: handleAuthSuccess called with role', role);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* 1. Login Route */}
          <Route 
            path="/login" 
            element={
              user && userRole ? (
                userRole === 'teacher'
                  ? <Navigate to="/teacher/home" />
                  : <Navigate to="/home" />
              ) : (
                <Login onLoginSuccess={handleAuthSuccess} />
              )
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
              user && userRole === 'student' 
                ? <StudentHomepage user={user} /> 
                : <Navigate to="/login" />
              } 
          />
          <Route path="/exple" element={<ExamMode />} />
          <Route path="/explore" element={<LessonMode />} />
          <Route path="/exp" element={<ExploreScreen />} />

          {/* Teacher Home Route (Protected) */}
          <Route 
            path="/teacher/home" 
            element={
              user && userRole === 'teacher' 
                ? <TeacherHome user={user} /> 
                : <Navigate to="/login" />
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