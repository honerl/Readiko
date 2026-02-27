import React, { useState, useEffect } from 'react';
import ClassDetail from './ClassDetail';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';

const StudentHomepage = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  const [activeSidebarItem, setActiveSidebarItem] = useState('learn');
  const [currentClass, setCurrentClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`http://localhost:8000/classes?student_id=${user?.id}`);
        if (!response.ok) {
          setClasses([]);
          return;
        }
        let data = [];
        try {
          data = await response.json();
        } catch (err) {
          data = [];
        }
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load classes", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchClasses();
    } else {
      setLoading(false);
      setClasses([]);
    }
  }, [user?.id]);

  const handleJoinClass = async () => {
    const classCode = prompt("Enter Class Code:");
    if (!classCode) return;
    try {
      const response = await fetch('http://localhost:8000/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, class_code: classCode })
      });
      if (response.ok) {
        const newJoinedClass = await response.json();
        setClasses([...classes, newJoinedClass]);
      }
    } catch (err) {
      alert("Error joining class");
    }
  };

  // logout function passed to sidebar
  const handleLogout = async () => {
    try {
      await import('./services/supabaseClient').then(m => m.supabase.auth.signOut());
      // App.jsx listens for auth state changes and will clean up the user state
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar
        activeItem={activeSidebarItem}
        onSelect={item => {
          setActiveSidebarItem(item);
          if (item === 'learn') setCurrentClass(null);
        }}
        classes={classes}
        onChooseClass={setCurrentClass}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        {currentClass ? (
          <ClassDetail cls={currentClass} onBack={() => setCurrentClass(null)} />
        ) : (
          <Dashboard
            classes={classes}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectClass={setCurrentClass}
            onJoinClass={handleJoinClass}
          />
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    height: '100vh', 
    backgroundColor: '#fdf7e7', 
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    overflow: 'hidden',
    width: '100%'
  },
  
  main: { 
    flex: 1, 
    padding: '40px 180px', 
    width: '100%',
    height: '100%',
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
  }
};

export default StudentHomepage;