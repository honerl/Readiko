import React, { useState, useEffect, use } from 'react';
import ClassDetail from './ClassDetail';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import { apiFetch } from './services/api';

// simple module‑level memo to avoid duplicate network requests when
// React StrictMode mounts/unmounts the component. the ref inside the
// component is reset on unmount, but this variable persists across
// re‑mounts for the lifetime of the page. we also clear it when the
// user logs out so a future login with the same id will re‑fetch.
let lastStudentIdFetched = null;

const StudentHomepage = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  const [activeSidebarItem, setActiveSidebarItem] = useState('learn');
  const [currentClass, setCurrentClass] = useState(null);

  // whenever the user toggles away we want to forget the previous
  // fetch so a future login with the same id will trigger a request.
  useEffect(() => {
    if (!user) {
      lastStudentIdFetched = null;
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    // if we already fetched for this student during this session, skip.
    if (lastStudentIdFetched === user.id) {
      console.log('[StudentHomepage] skipping fetch – already loaded');
      // the component may have been remounted so loading reset to true
      setLoading(false);
      return;
    }

    lastStudentIdFetched = user.id;

    const fetchClasses = async () => {
      try {
        console.log('[StudentHomepage] Fetching classes for user:', user.id);
        const response = await apiFetch(`/classes?student_id=${user.id}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          console.error('[StudentHomepage] Classes fetch failed:', {
            status: response.status,
            error: errorData
          });
          throw new Error(`Failed to load classes: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        console.log('[StudentHomepage] Classes loaded:', data);
        setClasses(data);
      } catch (err) {
        console.error('[StudentHomepage] Failed to load classes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id]);

  useEffect(() => {
    console.log('[StudentHomepage] classes state changed:', classes);
  }, [classes]);

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