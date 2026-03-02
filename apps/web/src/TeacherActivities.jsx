import React, { useState, useEffect } from "react";
import "./TeacherActivities.css";
import { apiFetch } from "./services/api";

const TeacherActivities = ({ cls, onBack }) => {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    topic: "",
    openDate: "",
    dueDate: "",
    timeLimit: "While the activity is still open",
    testType: "",
  });

  // Fetch activities for this class
  useEffect(() => {
    if (!cls?.c_id) return;

    const fetchActivities = async () => {
      try {
        console.log("[TeacherActivities] Fetching activities for class:", cls.c_id);
        const response = await apiFetch(`/activities/${cls.c_id}`);
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        console.log("[TeacherActivities] Activities loaded:", data);
        setActivities(data);
      } catch (err) {
        console.error("[TeacherActivities] Failed to load activities:", err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [cls?.c_id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return;

    try {
      const response = await apiFetch("/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroom_id: cls.c_id,
          topic: form.topic.trim(),
          open_date: form.openDate || null,
          close_date: form.dueDate || null,
          type_of_activity: form.testType || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create activity");
      const newActivity = await response.json();
      console.log("[TeacherActivities] Activity created:", newActivity);
      setActivities((prev) => [newActivity, ...prev]);

      setForm({
        topic: "",
        openDate: "",
        dueDate: "",
        timeLimit: "While the activity is still open",
        testType: "",
      });
      setShowCreate(false);
    } catch (err) {
      console.error("[TeacherActivities] Failed to create activity:", err);
      alert("Failed to create activity. Please try again.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="teacher-activities-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">Readiko</div>
        <nav>
          <ul>
            <li>Learn</li>
            <li>Achievements</li>
            <li>Shop</li>
            <li>Profile</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header Card */}
        <div className="class-header">
          <div>
            <button onClick={onBack} style={{ marginBottom: "0.5rem", cursor: "pointer" }}>
              ← Back
            </button>
            <h1>{cls?.name}</h1>
            <p>{cls?.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <span className="active-tab">Activities</span>
          <span>Class Record</span>
        </div>

        {/* Activities Section */}
        <div className="activities-container">
          {loadingActivities ? (
            <p>Loading activities...</p>
          ) : activities.length === 0 ? (
            <p style={{ color: "#888" }}>No activities yet. Create one!</p>
          ) : (
            activities.map((a) => (
              <div key={a.a_id} className="activity-card" style={{ marginBottom: "12px" }}>
                <div className="activity-left">
                  <h3>{a.topic}</h3>
                  <p>Open {formatDate(a.open_date)}</p>
                  <p>Due {formatDate(a.close_date)}</p>
                </div>
                <div className="activity-right">
                  <span className="points">{a.type_of_activity || "—"}</span>
                  <button className="review-btn">Review</button>
                </div>
              </div>
            ))
          )}

          <div className="create-btn-wrapper">
            <button className="create-btn" onClick={() => setShowCreate(true)}>
              + Create Activity
            </button>
          </div>
        </div>
      </div>

      {/* Overlay + Drawer */}
      {showCreate && (
        <div className="ta-overlay" onClick={() => setShowCreate(false)}>
          <aside className="ta-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ta-drawerHeader">
              <button className="ta-back" onClick={() => setShowCreate(false)}>
                ←
              </button>
              <div className="ta-drawerTitle">Create Activity</div>
            </div>

            <form className="ta-form" onSubmit={onCreateSubmit}>
              <input
                className="ta-inputLine"
                name="topic"
                value={form.topic}
                onChange={onChange}
                placeholder="Activity Name"
              />

              <div className="ta-row">
                <label className="ta-label">
                  Open Date &amp; Time
                  <input
                    className="ta-inputBox"
                    type="datetime-local"
                    name="openDate"
                    value={form.openDate}
                    onChange={onChange}
                  />
                </label>

                <label className="ta-label">
                  Due Date &amp; Time
                  <input
                    className="ta-inputBox"
                    type="datetime-local"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={onChange}
                  />
                </label>
              </div>

              <div className="ta-row">
                <label className="ta-label">
                  Time Limit
                  <select
                    className="ta-inputBox"
                    name="timeLimit"
                    value={form.timeLimit}
                    onChange={onChange}
                  >
                    <option>While the activity is still open</option>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>60 minutes</option>
                  </select>
                </label>

                <label className="ta-label">
                  Test Type
                  <select
                    className="ta-inputBox"
                    name="testType"
                    value={form.testType}
                    onChange={onChange}
                  >
                    <option value="">Select type</option>
                    <option value="lesson">Lesson</option>
                    <option value="exam">Exam</option>
                  </select>
                </label>
              </div>

              {/* Passages section placeholder */}
              <div className="ta-passages">
                <div className="ta-passagesTitle">Passages</div>
                <div className="ta-addPassage">+ Add Passage</div>
              </div>

              <div className="ta-actions">
                <button className="ta-createBtn" type="submit">
                  Create
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
};

export default TeacherActivities;