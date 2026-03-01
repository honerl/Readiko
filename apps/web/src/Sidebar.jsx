import React from 'react';

const Sidebar = ({ activeItem, onSelect, classes, onChooseClass, onLogout }) => {
  // Helper to handle navigation and reset class view
  const handleNavClick = (item) => {
    onSelect(item);
    // Passing null to onChooseClass clears the currentClass state in Homepage
    onChooseClass(null); 
  };

  return (
    <aside className="student-sidebar">
      <img src={'/assets/logo2.png'} alt="ReadiKo Logo" className="sidebar-logo" />
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${activeItem === 'learn' ? 'active' : ''}`}
          onClick={() => handleNavClick('learn')}
        >
          Learn
        </button>
        
        <button 
          className={`sidebar-link ${activeItem === 'achievements' ? 'active' : ''}`}
          onClick={() => handleNavClick('achievements')}
        >
          Achievements
        </button>

        <select
          className={`sidebar-select ${activeItem === 'enrolled' ? 'active' : ''}`}
          value={activeItem === 'enrolled' ? "" : ""} // Keep "Enrolled" visible as label
          onChange={e => {
            const val = e.target.value;
            if (!val) {
              handleNavClick('learn');
              return;
            }
            const selected = classes.find(c => String(c.id) === val);
            if (selected) {
              onChooseClass(selected);
              onSelect('enrolled');
            }
          }}
        >
          <option value="">Enrolled</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.title}</option>
          ))}
        </select>

        <button 
          className={`sidebar-link ${activeItem === 'shop' ? 'active' : ''}`}
          onClick={() => handleNavClick('shop')}
        >
          Shop
        </button>
        
        <button 
          className={`sidebar-link ${activeItem === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavClick('profile')}
        >
          Profile
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-link" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;