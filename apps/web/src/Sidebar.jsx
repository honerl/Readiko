import React from 'react';

const Sidebar = ({ activeItem, onSelect, classes, onChooseClass, onLogout }) => {
  return (
    <aside className="student-sidebar">
      <h1 className="sidebar-logo">ReadiKo</h1>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${activeItem === 'learn' ? 'active' : ''}`}
          onClick={() => onSelect('learn')}
        >
          Learn
        </button>
        <button className="sidebar-link">Achievements</button>
        <select
          className={`sidebar-select ${activeItem === 'enrolled' ? 'active' : ''}`}
          onClick={() => {
            // Only activate 'enrolled' if the student actually has classes
            if (classes && classes.length > 0) {
              onSelect('enrolled');
            } else {
              // keep it on 'learn' when there are no enrolled classes
              onSelect('learn');
            }
          }}
          onChange={e => {
            const val = e.target.value;
            // if user picks the blank placeholder, revert to 'learn'
            if (!val) {
              onSelect('learn');
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
        <button className="sidebar-link">Shop</button>
        <button className="sidebar-link">Profile</button>
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-link logout-link" onClick={onLogout}>Log Out</button>
      </div>
    </aside>
  );
};

export default Sidebar;