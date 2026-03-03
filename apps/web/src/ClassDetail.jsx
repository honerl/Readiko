import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClassDetail = ({ cls, onBack }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ongoing');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // Fetch activities from backend
  useEffect(() => {
    fetchActivities();
  }, [cls?.id]);

  const fetchActivities = async () => {
    if (!cls?.id) return; // ensure we have a classroom ID

    setLoading(true);
    try {
      // Use full backend URL with classroom_id
      const res = await fetch(`http://localhost:8000/activities?classroom_id=${cls.id}`);

      // Check response content type
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON, got:\n${text}`);
      }

      const data = await res.json();

      // Map data for UI
      setActivities(
        data.map(a => ({
          id: a.id, // or a.classroom_id if your table uses that
          title: a.topic,
          type: a.type_of_activity
            ? a.type_of_activity.charAt(0).toUpperCase() + a.type_of_activity.slice(1)
            : 'Lesson',
          due: a.close_date
            ? new Date(a.close_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : null,
          progress: 0, // default, can calculate later
        }))
      );
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

    // Temporary fallback items if API returns nothing
    const sampleItems = [
      { id: 'temp-1', title: "Aesop’s Fables", type: 'Exam', due: 'Mar 4, 11:59 PM', progress: 0 },
      { id: 'temp-2', title: 'Folk lore', type: 'Lesson', due: 'Mar 4, 11:59 PM', progress: 67 },
      { id: 'temp-3', title: 'King Arthur', type: 'Quiz', due: 'Mar 1, 11:59 PM', progress: 100 },
    ];

  const allItems = activities.length > 0 ? activities : sampleItems;
  const ongoingItems = allItems.filter(i => (i.progress ?? 0) < 100);
  const completedItems = allItems.filter(i => (i.progress ?? 0) >= 100);

  // ── Button label + style based on progress ──────────────
  const getButtonLabel = (progress) => {
    if (progress >= 100) return 'Review';
    if (progress > 0)    return 'Continue';
    return 'Start';
  };

  // Review gets a softer outlined style; Start/Continue stay coral
  const getButtonStyle = (progress) => ({
    ...styles.actionBtn,
    ...(progress >= 100 ? styles.actionBtnReview : {}),
  });

  // ── Navigation ──────────────────────────────────────────
  const handleItemClick = (item) => {
    if (!item.id) return;
    const base = `/class/${cls.id}/item/${item.id}`;
    if (item.progress >= 100) {
      navigate(`${base}/review`);
    } else {
      console.log('Item clicked (no real DB ID):', item);
    }
  };

  const handleButtonClick = (e, item) => {
    e.stopPropagation(); // don't also fire the card's onClick
    handleItemClick(item);
  };

  const displayedItems = activeTab === 'ongoing' ? ongoingItems : completedItems;

  return (
    <section style={styles.container}>
      <style>{`
        .tab-btn:hover {
          color: #EE6A60 !important;
          border-bottom: 3px solid rgba(238, 106, 96, 0.3) !important;
        }
      `}</style>

      {/* Header card */}
      <div style={styles.headerCard} onClick={onBack}>
        <h2 style={styles.header}>{cls?.title || 'Class Name'}</h2>
        <p style={styles.desc}>{cls?.description || 'No description available.'}</p>
        <p style={styles.teacher}>{cls?.teacher_name || 'Ms. English Teacher'}</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          className="tab-btn"
          style={activeTab === 'ongoing' ? styles.activeTab : styles.inactiveTab}
          onClick={() => setActiveTab('ongoing')}
        >
          On going
        </button>
        <button
          className="tab-btn"
          style={activeTab === 'completed' ? styles.activeTab : styles.inactiveTab}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {/* Content */}
      <div style={styles.contentArea}>
        {displayedItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8d7b5f' }}>
            {activeTab === 'ongoing'
              ? 'No activities in progress.'
              : 'No completed activities yet.'}
          </p>
        ) : (
          displayedItems.map(item => (
            <div
              key={item.id}
              style={styles.itemCard}
              onClick={() => handleItemClick(item)}
            >
              {/* LEFT: title + progress */}
              <div style={styles.itemLeft}>
                <h4 style={styles.itemTitle}>
                  {item.title}
                  {item.type && <span style={styles.typeBadge}>{item.type}</span>}
                </h4>
                <div style={styles.progressContainer}>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${item.progress ?? 0}%`,
                        // completed bar turns green
                        background: (item.progress ?? 0) >= 100 ? '#7CC588' : '#EE6A60',
                      }}
                    />
                  </div>
    
                  {(item.progress ?? 0) >= 100 && (
                    <img
                      src="/assets/trophy.png"
                      alt="Completed"
                      style={styles.trophy}
                    />
                  )}
                </div>
              </div>

              {/* RIGHT: due date + action button */}
              <div style={styles.itemRight}>
                {item.due && (
                  <div style={styles.dueDate}>Due {item.due}</div>
                )}
                <button
                  style={getButtonStyle(item.progress ?? 0)}
                  onClick={(e) => handleButtonClick(e, item)}
                >
                  {getButtonLabel(item.progress ?? 0)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ClassDetail;

// ── Styles ────────────────────────────────────────────────
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'flex-start',
    paddingRight: '220px',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
  },
  headerCard: {
    backgroundColor: '#FFFDF5',
    padding: '20px 30px',
    borderRadius: '14px',
    border: '1px solid #BAAAAA',
    boxShadow: '0 4px 4px #BAAAAA',
    cursor: 'pointer',
  },
  header: {
    marginTop: 0,
    marginBottom: '5px',
    fontSize: '32px',
    color: '#6C530E',
    fontWeight: 'normal',
  },
  desc: { fontSize: '16px', color: '#7a6b4a', marginBottom: '8px', marginTop: '8px' },
  teacher: { textAlign: 'right', color: '#6C530E', fontSize: '14px', margin: 0 },

  tabContainer: {
    display: 'flex',
    gap: '120px',
    marginTop: '30px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  activeTab: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    borderRadius: '0',
    fontWeight: 'bold',
    color: '#EE6A60',
    cursor: 'pointer',
    paddingBottom: '8px',
    outline: 'none',
    borderBottom: '3px solid #EE6A60',
  },
  inactiveTab: {
    background: 'none',
    border: 'none',
    borderRadius: '0',
    fontSize: '16px',
    color: '#4a3b20',
    cursor: 'pointer',
    paddingBottom: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease, color 0.2s ease',
  },

  contentArea: {
    backgroundColor: '#FFFDF5',
    borderRadius: '14px',
    padding: '35px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    height: '100%',
    boxSizing: 'border-box',
    border: '1px solid #BAAAAA',
    boxShadow: '0 4px 4px #BAAAAA',
  },

  itemCard: {
    backgroundColor: '#fcf0c8',
    padding: '20px 25px',
    borderRadius: '14px',
    border: '1px solid #6C530E',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '36px',
    minHeight: '100px',
    boxShadow: '0 2px 4px #BAAAAA',
    cursor: 'pointer',
  },

  itemLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
    margin: '0',
    padding: '0',
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '32px',
  },

  itemTitle: {
    fontSize: '20px',
    color: '#4a3b20',
    margin: 0,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
  },

  typeBadge: {
    height: '18px',
    width: '60px',
    textAlign: 'center',
    backgroundColor: '#7CC588',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '12px',
    padding: '2px 8px',
    marginLeft: 'auto',
    marginRight: '25px',
  },
  dueDate: {
    fontSize: '14px',
    color: '#4a3b20',
    textAlign: 'right',
    fontWeight: '500',
  },

  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  progressBarBg: {
    background: '#fff',
    flex: 1,
    height: '16px',
    borderRadius: '6px',
    overflow: 'hidden',
    minWidth: '150px',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '14px',
    color: '#4a3b20',
    minWidth: '36px',
    textAlign: 'center',
    fontWeight: '500',
  },
 // trophy: { fontSize: '18px', marginLeft: '-25px', paddingRight: '20px' },

  trophy: {
    width: '28px',       // ← adjust size here
    height: '28px',
    objectFit: 'contain',
    flexShrink: 0,
    marginLeft: '-25px', // ← position it overlapping the progress bar
    paddingRight: '20px',
  },

  /* ── Start / Continue button (coral) ── */
  actionBtn: {
    backgroundColor: '#EE6A60',
    color: '#fff',
    border: 'none',
    padding: '8px 32px',
    borderRadius: '10px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 2px 4px #6C530E',
    fontSize: '16px',
    fontWeight: '500',
    width: '150px',
    transition: 'opacity 0.2s ease',
  },

  /* ── Review button override (outlined, softer) ── */
  actionBtnReview: {
    backgroundColor: '#7CC588',
    color: '#fff',
    boxShadow: '0 2px 4px #6C530E',
  },
};
