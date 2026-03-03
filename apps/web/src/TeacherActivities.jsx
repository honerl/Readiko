import React, { useState, useEffect } from "react";
import "./TeacherActivities.css";
import { apiFetch } from "./services/api";
import AddPassage from "./AddPassage";

const TeacherActivities = ({ cls, onBack }) => {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddPassage, setShowAddPassage] = useState(false); // ← was missing
  const [passages, setPassages] = useState([]);
  
  // New features
  const [activeTab, setActiveTab] = useState("activities");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [form, setForm] = useState({
    topic: "",
    openDate: "",
    dueDate: "",
    timeLimit: "While the activity is still open",
    testType: "",
  });

  const getOrdinal = (n) => {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
  };

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

  useEffect(() => {
  if (!cls?.c_id || activeTab !== "records") return;

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      console.log("[TeacherActivities] Fetching students for class:", cls.c_id);

      const res = await apiFetch(`/classes/${cls.c_id}/students`);
      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      console.log("[TeacherActivities] Students loaded:", data);

      // Sort by average descending and compute rank
      const sorted = [...data].sort((a, b) => b.average - a.average);

      const ranked = sorted.map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

      setStudents(ranked);
      } catch (err) {
        console.error("[TeacherActivities] Failed to load students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [cls?.c_id, activeTab]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handlePassageAdded = (passage) => {
    setPassages((prev) => [...prev, passage]);
    setShowAddPassage(false);
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

      // Save passages and questions
      for (const passage of passages) {
        const passageRes = await apiFetch("/passages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_id: newActivity.a_id,
            title: passage.title,
            content: passage.content,
          }),
        });
        if (passageRes.ok) {
          const newPassage = await passageRes.json();
          for (const q of passage.questions) {
            await apiFetch("/questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                passage_id: newPassage.p_id,
                q_text: q.q_text,
                difficulty_level: q.score,
              }),
            });
          }
        }
      }

      setActivities((prev) => [newActivity, ...prev]);
      setForm({
        topic: "",
        openDate: "",
        dueDate: "",
        timeLimit: "While the activity is still open",
        testType: "",
      });
      setPassages([]);
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

  const closeAll = () => {
    setShowCreate(false);
    setShowAddPassage(false);
    setPassages([]);
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
        <div className="class-header">
          <div>
            <button onClick={onBack} style={{ marginBottom: "0.5rem", cursor: "pointer" }}>
              ← Back
            </button>
            <h1>{cls?.name}</h1>
            <p>{cls?.description}</p>
          </div>
        </div>

        <div className="tabs">
          <span
            className={activeTab === "activities" ? "active-tab" : ""}
            onClick={() => setActiveTab("activities")}
          >
            Activities
          </span>
          <span
            className={activeTab === "records" ? "active-tab" : ""}
            onClick={() => setActiveTab("records")}
          >
            Class Record
          </span>
        </div>

        <div className="activities-container">
          {activeTab === "activities" ? (
            <>
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
            </>
          ) : (
            <>
              {loadingStudents ? (
                <p>Loading students...</p>
              ) : students.length === 0 ? (
                <p style={{ color: "#888" }}>No students enrolled.</p>
              ) : (
                students.map((s) => (
                  <div key={s.uid} className="record-card">
                    <div className="record-left">
                      <div className="avatar-circle" />
                      <div>
                        <strong>{s.lname}</strong>
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>
                          {s.fname}
                        </div>
                      </div>
                    </div>

                    <div className="record-middle">
                      <div>{s.average?.toFixed(2) ?? "—"}</div>
                      <div>{s.rank}{getOrdinal(s.rank)}</div>
                    </div>

                    <div className="record-right">
                      <button
                        className="menu-btn"
                        onClick={() =>
                          setOpenMenuId(openMenuId === s.u_id ? null : s.u_id)
                        }
                      >
                        ⋮
                      </button>

                      {openMenuId === s.u_id && (
                        <div className="dropdown-menu">
                          <div onClick={() => alert("Open class profile")}>
                            Class Profile
                          </div>
                          <div
                            style={{ color: "red" }}
                            onClick={() => handleRemoveStudent(s.u_id)}
                          >
                            Remove
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {(showCreate || showAddPassage) && (
        <div className="ta-overlay" onClick={closeAll}>
          {showAddPassage ? (
            <AddPassage
              onBack={() => setShowAddPassage(false)}
              onAdd={handlePassageAdded}
            />
          ) : (
            <aside className="ta-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="ta-drawerHeader">
                <button className="ta-back" onClick={() => setShowCreate(false)}>←</button>
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
                    <select className="ta-inputBox" name="timeLimit" value={form.timeLimit} onChange={onChange}>
                      <option>While the activity is still open</option>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>60 minutes</option>
                    </select>
                  </label>
                  <label className="ta-label">
                    Test Type
                    <select className="ta-inputBox" name="testType" value={form.testType} onChange={onChange}>
                      <option value="">Select type</option>
                      <option value="lesson">Lesson</option>
                      <option value="exam">Exam</option>
                    </select>
                  </label>
                </div>

                <div className="ta-passages">
                  <div className="ta-passagesTitle">Passages</div>
                  {passages.map((p, i) => (
                    <div key={i} className="ta-passageItem">
                      <span>{p.title}</span>
                      <button
                        type="button"
                        className="ta-removeQ"
                        onClick={() => setPassages((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ta-addPassage"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddPassage(true);
                    }}
                  >
                    + Add Passage
                  </button>
                </div>

                <div className="ta-actions">
                  <button className="ta-createBtn" type="submit">Create</button>
                </div>
              </form>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherActivities;