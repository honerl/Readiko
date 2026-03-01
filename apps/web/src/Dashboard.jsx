import React from 'react';
import { useNavigate } from "react-router-dom";

const Dashboard = ({
  classes,
  loading,
  activeTab,
  setActiveTab,
  onSelectClass,
  onJoinClass
}) => {
  const styles = {
    title: { 
      fontSize: '52px', 
      color: '#6C530E', 
      marginBottom: '30px', 
      marginTop: '0px',
      fontWeight: 'bold' 
    },
    tabContainer: { 
      display: 'flex', 
      gap: '160px', 
      marginBottom: '20px',
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    activeTab: { 
      background: 'none', 
      border: 'none', 
      borderRadius: '0px',
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: '#EE6A60', 
      cursor: 'pointer', 
      paddingBottom: '8px',
      outline: 'none',
      boxShadow: 'none',
      borderBottom: '3px solid #EE6A60'
    },
    inactiveTab: { 
      background: 'none', 
      border: 'none', 
      fontSize: '16px', 
      color: '#d4c4a8', 
      cursor: 'pointer', 
      paddingBottom: '8px',
      outline: 'none',
      boxShadow: 'none'
    },
    contentLayout: { 
      display: 'flex', 
      gap: '80px', 
      width: '100%', 
      height: '100%',
      alignItems: 'flex-start' 
    },
    leftColumn: {
      flex: 1,
      display: 'flex',
      textAlign: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      paddingLeft: '60px',
      marginBottom: '100px',
      overflow: 'hidden'
    },

    classScrollArea: { 
      flex: 1,
      backgroundColor: '#FFFDF5', 
      borderRadius: '20px',
      marginBottom: '10px',
      padding: '35px 30px', 
      display: 'flex', 
      width: 'calc(100% - 80px)',
      height: '100%',
      flexDirection: 'column', 
      gap: '40px', 
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      border: '1px solid #BAAAAA',
      boxShadow: '0 4px 4px #BAAAAA',
    },
    classCard: { 
      backgroundColor: '#fcf0c8', 
      padding: '25px', 
      borderRadius: '20px', 
      border: '1px solid #e0d090',
      cursor: 'pointer'
    },
    classTitle: {
      fontSize: '32px',
      color: '#4a3b20',
      marginBottom: '8px',
      alignSelf: 'flex-start',
      fontWeight: 'normal',
      textAlign: 'left',
      marginTop: '0px'
    },
    desc: { 
      fontSize: '16px', 
      color: '#7a6b4a', 
      lineHeight: '1.4',
      marginBottom: '15px' 
    },
    teacherName: { 
      textAlign: 'right', 
      fontWeight: 'bold', 
      color: '#6C530E', 
      fontSize: '14px',
      fontStyle: 'italic'
    },
    joinBtn: { 
      border: '2px dashed #8d7b5f',
      padding: '60px', 
      borderRadius: '20px', 
      backgroundColor: '#EEE7D7', 
      cursor: 'pointer', 
      fontSize: '18px', 
      color: '#8d7b5f',
      transition: '0.2s',
      outline: 'none',
      boxShadow: 'none'
    },
    emptyCard: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#d4c4a8'
    },
    exploreGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '40px',
      alignItems: 'start'
    },
    exploreCard: {
      backgroundColor: '#FFEFC4',
      padding: '16px 32px 18px 32px',
      borderRadius: '18px',
      border: '1px solid #C79898',
      boxShadow: '0 4px 4px #C79898',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    exploreBtn: {
      marginTop: '14px',
      alignSelf: 'flex-start',
      backgroundColor: '#EE6A60',
      color: '#fff',
      border: '1px solid #6C530E',
      boxShadow: '0 2px 4px #6C530E',
      padding: '8px 48px',
      borderRadius: '10px',
      fontWeight: 'normal',
      cursor: 'pointer',
      outline: 'none'
    },
    questPanel: {
      flex: '0 0 auto',
      width: '160px',
      height: '120px',
      backgroundColor: '#F3DFB8',
      border: '1px solid #6C530E',
      marginTop: '170px',
      marginRight: '100px',
      borderRadius: '20px',
      padding: '5px 25px 55px 25px',
      overflowY: 'auto'
    },
    questTitle: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '18px',
      color: '#6C530E',
      paddingBottom: '12px',
      fontWeight: 'normal'
    }
  };

  const navigate = useNavigate();

  const exploreItems = [
    {
      id: 'exp-1',
      title: 'Self-Paced Learning'
    }
  ];

  console.log('[Dashboard] received classes prop:', classes);

  return (
    <section style={styles.contentLayout}>
      <div style={styles.leftColumn}>
        <h2 style={styles.title}>Let's learn</h2>

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
        
        <div style={styles.classScrollArea} className="hide-scrollbar">
          {activeTab === 'classes' ? (
            <>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#8d7b5f' }}>Loading your classes...</p>
              ) : (
                <>
                  {console.log('[Dashboard] rendering classes length', Array.isArray(classes) ? classes.length : typeof classes)}
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      style={styles.classCard}
                      onClick={() => onSelectClass(cls)}
                    >
                      <h3 style={styles.classTitle}>{cls.title}</h3>
                      <p style={styles.desc}>{cls.description}</p>
                      <p style={styles.teacherName}>{cls.teacher_name || 'Ms. English Teacher'}</p>
                    </div>
                  ))}
                  <button onClick={onJoinClass} style={styles.joinBtn}>
                    + Join Class  
                  </button>
                </>
              )}
            </>
          ) : (
            <div style={styles.exploreGrid}>
              {exploreItems.map((item) => (
                <div key={item.id} style={styles.exploreCard}>
                  <div>
                    <h3 style={styles.classTitle}>{item.title}</h3>
                  </div>
                  <button
                    style={styles.exploreBtn}
                    onClick={() => {
                    if (item.id === "exp-1") {
                        navigate("/explore");
                    }
                    }}
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- QUEST PANEL --- */}
      <aside style={styles.questPanel}>
        <h4 style={styles.questTitle}>Daily Quest</h4>
      </aside>
    </section>
  );
};

export default Dashboard;