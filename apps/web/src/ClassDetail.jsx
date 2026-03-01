import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClassDetail = ({ cls, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ongoing');

  // sample data fall‑back in case cls does not include any items
  const sampleItems = [
    { id: '1', title: "Aesop’s Fables", type: 'Exam', due: 'March 4 11:59pm', progress: 0 },
    { id: '2', title: 'Folk lore', type: 'Lesson', due: 'March 4 11:59pm', progress: 67 },
    { id: '3', title: 'King Arthur', type: 'Quiz', due: 'March 1 11:59pm', progress: 100 }
  ];

  // prefer a property delivered by the API if available
  const allItems = cls?.items || sampleItems;
  const ongoingItems = allItems.filter(i => (i.progress ?? 0) < 100);
  const completedItems = allItems.filter(i => (i.progress ?? 0) >= 100);

  const styles = {
    container: { 
      display: 'flex',          
      flexDirection: 'column',   
      alignSelf: 'flex-start',
      paddingRight: '220px',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%'            
    },
    headerCard: {
      backgroundColor: '#FFFDF5',
      padding: '20px 30px 20px 30px',
      borderRadius: '14px',
      border: '1px solid #BAAAAA',
      boxShadow: '0 4px 4px #BAAAAA',
      cursor: 'pointer'
    },
    header: { marginTop: '0', marginBottom: '5px', fontSize: '32px', color: '#6C530E', fontWeight: 'normal' },
    desc: { fontSize: '16px', color: '#7a6b4a', marginBottom: '8px', marginTop: '8px' },
    teacher: { textAlign: 'right', color: '#6C530E', fontSize: '14px', margin: '0' },
    tabContainer: {
      display: 'flex',
      gap: '120px',
      marginTop: '30px',
      marginBottom: '20px',
      justifyContent: 'center'
    },
    activeTab: {
      background: 'none',
      border: 'none',
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
      boxShadow: '0 4px 4px #BAAAAA'
    },
    itemCard: {
      backgroundColor: '#fcf0c8',
      padding: '20px 25px',
      borderRadius: '14px',
      border: '1px solid #e0d090',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '36px',
      height: '100px'
    },
    itemLeft: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '36px'
    },
    itemRight: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '32px'
    },
    itemInfo: { flex: 1, marginRight: '20px' },
    itemTitle: { fontSize: '20px', color: '#4a3b20', margin: 0, textAlign: 'left', display: 'flex', alignItems: 'center' },
    typeBadge: {
      marginLeft: '12px',
      backgroundColor: '#A4D65E',
      color: '#fff',
      borderRadius: '12px',
      fontSize: '12px',
      padding: '2px 8px'
    },
    dueDate: { fontSize: '14px', color: '#4a3b20', textAlign: 'right', fontWeight: '500' },
    progressContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%'
    },
    progressBarBg: {
      background: '#fff',
      flex: 1,
      height: '16px',
      borderRadius: '6px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      minWidth: '150px'
    },
    progressBarFill: {
      background: '#EE6A60',
      height: '100%'
    },
    progressText: {
      fontSize: '14px',
      color: '#4a3b20',
      minWidth: '30px',
      textAlign: 'center',
      fontWeight: '500'
    },
    trophy: { fontSize: '18px' },
    actionBtn: {
      backgroundColor: '#EE6A60',
      color: '#fff',
      border: 'none',
      padding: '8px 32px',
      borderRadius: '10px',
      cursor: 'pointer',
      outline: 'none',
      boxShadow: '0 2px 4px #6C530E',
      fontSize: '20px',
      fontWeight: '500',
      width: '150px'
    }
  };

  const handleItemClick = item => {
    // navigate to the lesson/quiz page, fallback to console log
    if (item.id) {
      navigate(`/class/${cls.id}/item/${item.id}`);
    } else {
      console.log('clicked item', item);
    }
  };

  return (
    <section style={styles.container}>
      {/* header card */}
      <div style={styles.headerCard} onClick={onBack}>
        <h2 style={styles.header}>{cls?.title || 'Class Name'}</h2>
        <p style={styles.desc}>{cls?.description || 'No description available.'}</p>
        <p style={styles.teacher}>
          {cls?.teacher_name || 'Ms. English Teacher'}
        </p>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'ongoing' ? styles.activeTab : styles.inactiveTab}
          onClick={() => setActiveTab('ongoing')}
        >
          On going
        </button>
        <button
          style={activeTab === 'completed' ? styles.activeTab : styles.inactiveTab}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div style={styles.contentArea}> 
        {(activeTab === 'ongoing' ? ongoingItems : completedItems).map(item => (
          <div key={item.id} style={styles.itemCard} onClick={() => handleItemClick(item)}>
            {/* LEFT SECTION: Title and Progress */}
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
                      width: `${item.progress ?? 0}%`
                    }}
                  />
                </div>
                <span style={styles.progressText}>{item.progress ?? 0}%</span>
                <span style={styles.trophy}>🏆</span>
              </div>
            </div>
            {/* RIGHT SECTION: Due Date and Button */}
            <div style={styles.itemRight}>
              {item.due && <div style={styles.dueDate}>Due {item.due}</div>}
              <button style={styles.actionBtn}>
                {item.progress && item.progress > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          </div>
        ))}
        {(activeTab === 'ongoing' ? ongoingItems : completedItems).length === 0 && (
          <p style={{ textAlign: 'center', color: '#8d7b5f' }}>
            {activeTab === 'ongoing' ? 'No activities in progress.' : 'No completed activities yet.'}
          </p>
        )}
      </div>
    </section>
  );
};

export default ClassDetail;