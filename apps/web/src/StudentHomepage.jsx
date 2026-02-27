import React, { useState, useEffect } from 'react';

const StudentHomepage = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  // NEW: State to track which tab is selected
  const [activeTab, setActiveTab] = useState('classes');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`http://localhost:8000/classes?student_id=${user?.id}`);
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchClasses();
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

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h1 style={styles.logo}>ReadiKo</h1>
        <nav style={styles.nav}>
          <button style={styles.activeLink}>Learn</button>
          <button style={styles.link}>Achievements</button>
          <select style={styles.select}><option>Enrolled</option></select>
          <button style={styles.link}>Shop</button>
          <button style={styles.link}>Profile</button>
        </nav>
      </aside>
      
      <main style={styles.main}>
        <h2 style={styles.title}>Let's learn</h2>

        {/*Navigation Tabs */}
        <div style={styles.tabContainer}>
          <button 
            style={activeTab === 'classes' ? styles.activeTab : styles.inactiveTab}
            onClick={() => setActiveTab('classes')}
          >
            Classes
          </button>
          <button 
            style={activeTab === 'explore' ? styles.activeTab : styles.inactiveTab}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
        </div>
        
        <section style={styles.contentLayout}>
          <div style={styles.classScrollArea}>
            
            {/* Logic for "Classes" Tab */}
            {activeTab === 'classes' && (
              <>
                {loading ? (
                  <p>Loading your classes...</p>
                ) : (
                  <>
                    {classes.map((cls) => (
                      <div key={cls.id} style={styles.classCard}>
                        <h3>{cls.title}</h3>
                        <p style={styles.desc}>{cls.description}</p>
                        <p style={styles.teacherName}>{cls.teacher_name || 'Ms. English Teacher'}</p>
                      </div>
                    ))}
                    <button onClick={handleJoinClass} style={styles.joinBtn}>
                      + Join Class
                    </button>
                  </>
                )}
              </>
            )}

            {/* Logic for "Explore" Tab */}
            {activeTab === 'explore' && (
              <div style={styles.emptyCard}>
                <h3>Explore New Content</h3>
                <p>Coming soon! You'll be able to find new subjects here.</p>
              </div>
            )}

          </div>
          <aside style={styles.questPanel}>
            <h4 style={styles.questTitle}>Daily Quest</h4>
            <div style={styles.questItem}>dashboard</div>
            <div style={styles.questItem}>Shop</div>
          </aside>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    height: '100vh', 
    backgroundColor: '#fdf7e7', 
    fontFamily: 'sans-serif' 
  },
  
  // --- SIDEBAR ---
  sidebar: { 
    width: '240px', 
    backgroundColor: '#f7e5a1', 
    padding: '30px 20px', 
    borderRight: '2px solid #e0d090', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  logo: { 
    color: '#153204', 
    fontSize: '32px', 
    fontWeight: 'bold', 
    marginBottom: '50px', 
    textAlign: 'center' 
  },
  nav: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
  },
  link: { 
    background: 'none', 
    border: 'none', 
    textAlign: 'left', 
    fontSize: '18px', 
    color: '#6C530E', 
    cursor: 'pointer', 
    padding: '10px 15px' 
  },
  activeLink: { 
    padding: '10px 15px', 
    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
    border: '1px solid #d4c4a8', 
    borderRadius: '10px', 
    color: '#6C530E', 
    fontWeight: 'bold', 
    textAlign: 'left', 
    cursor: 'pointer' 
  },
  select: { 
    padding: '10px', 
    borderRadius: '10px', 
    border: '1px solid #d4c4a8', 
    marginTop: '10px', 
    backgroundColor: '#fff', 
    color: '#6C530E' 
  },

  // --- MAIN AREA ---
  main: { 
    flex: 1, 
    padding: '40px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: '56px', 
    color: '#6C530E', 
    marginBottom: '20px', 
    fontWeight: 'bold' 
  },

  // --- TABS NAV ---
  tabContainer: { 
    display: 'flex', 
    gap: '40px', 
    marginBottom: '30px' 
  },
  activeTab: { 
    background: 'none', 
    border: 'none', 
    fontSize: '22px', 
    fontWeight: 'bold', 
    color: '#f2746a', 
    borderBottom: '4px solid #f2746a', 
    cursor: 'pointer', 
    paddingBottom: '5px' 
  },
  inactiveTab: { 
    background: 'none', 
    border: 'none', 
    fontSize: '22px', 
    color: '#d4c4a8', 
    cursor: 'pointer', 
    paddingBottom: '5px' 
  },

  // --- CONTENT LAYOUT ---
  contentLayout: { 
    display: 'flex', 
    gap: '30px', 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'flex-start' 
  },
  classScrollArea: { 
    width: '100%', 
    maxWidth: '600px', 
    backgroundColor: '#fff', 
    borderRadius: '35px', 
    padding: '40px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    maxHeight: '65vh', 
    overflowY: 'auto', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
  },
  classCard: { 
    backgroundColor: '#fcf0c8', 
    padding: '25px', 
    borderRadius: '20px', 
    border: '1px solid #e0d090', 
    textAlign: 'left' 
  },
  desc: { 
    fontSize: '16px', 
    color: '#7a6b4a', 
    margin: '10px 0' 
  },
  teacherName: { 
    textAlign: 'right', 
    fontWeight: 'bold', 
    color: '#6C530E', 
    fontSize: '14px' 
  },
  joinBtn: { 
    border: '2px dashed #d4c4a8', 
    padding: '35px', 
    borderRadius: '20px', 
    backgroundColor: '#fffcf5', 
    cursor: 'pointer', 
    fontSize: '18px', 
    color: '#8d7b5f' 
  },

  // --- RIGHT PANEL ---
  questPanel: { 
    width: '220px', 
    backgroundColor: '#e6d5b0', 
    borderRadius: '25px', 
    padding: '25px', 
    height: 'fit-content' 
  },
  questTitle: { 
    textAlign: 'center', 
    marginBottom: '20px', 
    fontSize: '20px', 
    color: '#4a3b20', 
    borderBottom: '1px solid #d4c4a8', 
    paddingBottom: '10px' 
  },
  questItem: { 
    padding: '12px 0', 
    borderBottom: '1px solid rgba(212, 196, 168, 0.5)', 
    color: '#6C530E', 
    fontSize: '16px' 
  }
};

export default StudentHomepage;