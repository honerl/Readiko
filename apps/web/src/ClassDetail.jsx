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

  const handleItemClick = item => {
    if (cls?.id && item?.id && !item.id.toString().startsWith('temp')) {
      navigate(`/exam/${cls.id}/${item.id}`);
    } else {
      console.log('Item clicked (no real DB ID):', item);
    }
  };

  // --- Styles (keep your existing styles, abbreviated here for clarity) ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', paddingRight: '220px', width: '100%', height: '100%' },
    headerCard: { backgroundColor: '#FFFDF5', padding: '20px 30px', borderRadius: 14, border: '1px solid #BAAAAA', cursor: 'pointer' },
    header: { fontSize: 32, color: '#6C530E', margin: 0 },
    desc: { fontSize: 16, color: '#7a6b4a', margin: '8px 0' },
    teacher: { textAlign: 'right', color: '#6C530E', fontSize: 14 },
    tabContainer: { display: 'flex', gap: 120, justifyContent: 'center', margin: '30px 0 20px' },
    activeTab: { background: 'none', border: 'none', fontSize: 16, fontWeight: 'bold', color: '#EE6A60', cursor: 'pointer', borderBottom: '3px solid #EE6A60', paddingBottom: 8, outline: 'none' },
    inactiveTab: { background: 'none', border: 'none', fontSize: 16, color: '#d4c4a8', cursor: 'pointer', paddingBottom: 8, outline: 'none' },
    contentArea: { backgroundColor: '#FFFDF5', borderRadius: 14, padding: '35px 48px', display: 'flex', flexDirection: 'column', gap: 24, boxSizing: 'border-box', border: '1px solid #BAAAAA' },
    itemCard: { backgroundColor: '#fcf0c8', padding: '20px 25px', borderRadius: 14, border: '1px solid #e0d090', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 36, height: 100 },
    itemLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
    itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 },
    itemTitle: { fontSize: 20, color: '#4a3b20', margin: 0, display: 'flex', alignItems: 'center' },
    typeBadge: { marginLeft: 12, backgroundColor: '#A4D65E', color: '#fff', borderRadius: 12, fontSize: 12, padding: '2px 8px' },
    dueDate: { fontSize: 14, color: '#4a3b20', fontWeight: 500 },
    progressContainer: { display: 'flex', alignItems: 'center', gap: 12, width: '100%' },
    progressBarBg: { background: '#fff', flex: 1, height: 16, borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center' },
    progressBarFill: { background: '#EE6A60', height: '100%' },
    progressText: { fontSize: 14, color: '#4a3b20', minWidth: 30, textAlign: 'center', fontWeight: 500 },
    trophy: { fontSize: 18 },
    actionBtn: { backgroundColor: '#EE6A60', color: '#fff', border: 'none', padding: '8px 32px', borderRadius: 10, cursor: 'pointer', outline: 'none', fontSize: 20, fontWeight: 500 },
  };

  return (
    <section style={styles.container}>
      <div style={styles.headerCard} onClick={onBack}>
        <h2 style={styles.header}>{cls?.title || 'Class Name'}</h2>
        <p style={styles.desc}>{cls?.description || 'No description available.'}</p>
        <p style={styles.teacher}>{cls?.teacher_name || 'Ms. English Teacher'}</p>
      </div>

      <div style={styles.tabContainer}>
        <button style={activeTab === 'ongoing' ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab('ongoing')}>On going</button>
        <button style={activeTab === 'completed' ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab('completed')}>Completed</button>
      </div>

      <div style={styles.contentArea}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#8d7b5f' }}>Loading activities...</p>
        ) : (activeTab === 'ongoing' ? ongoingItems : completedItems).length > 0 ? (
          (activeTab === 'ongoing' ? ongoingItems : completedItems).map(item => (
            <div key={item.id} style={styles.itemCard}>
              <div style={styles.itemLeft}>
                <h4 style={styles.itemTitle}>
                  {item.title} {item.type && <span style={styles.typeBadge}>{item.type}</span>}
                </h4>
                <div style={styles.progressContainer}>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${item.progress ?? 0}%` }} />
                  </div>
                  <span style={styles.progressText}>{item.progress ?? 0}%</span>
                  <span style={styles.trophy}>🏆</span>
                </div>
              </div>
              <div style={styles.itemRight}>
                {item.due && <div style={styles.dueDate}>Due {item.due}</div>}
                <button style={styles.actionBtn} onClick={() => handleItemClick(item)}>
                  {(item.progress ?? 0) > 0 ? 'Continue' : 'Start'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#8d7b5f' }}>
            {activeTab === 'ongoing' ? 'No activities in progress.' : 'No completed activities yet.'}
          </p>
        )}
      </div>
    </section>
  );
};

export default ClassDetail;