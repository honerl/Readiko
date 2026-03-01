import { useState, useEffect } from "react";
import "./TeacherHome.css";
import { supabase } from "./services/supabaseClient";

// module-level memo to avoid duplicate fetches during remounts
let lastTeacherIdFetched = null;

export default function TeacherHome({ user }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    className: "",
    description: "",
    gradeLevel: "Grade 1",
    subject: "English",
  });

  // reset memo when user changes
  useEffect(() => {
    lastTeacherIdFetched = null;
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    // skip fetch if already loaded for this teacher
    if (lastTeacherIdFetched === user.id) {
      console.log("[TeacherHome] skipping fetch – already loaded");
      setLoading(false);
      return;
    }

    lastTeacherIdFetched = user.id;

    const fetchTeacherClasses = async () => {
      try {
        console.log("[TeacherHome] Fetching classes for teacher:", user.id);
        const response = await fetch(
          `http://localhost:8000/teacher/by-teacher/${user.id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch classes: ${response.status}`);
        }

        const data = await response.json();
        console.log("[TeacherHome] Classes loaded:", data);
        setClasses(data);
      } catch (err) {
        console.error("[TeacherHome] Failed to load classes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [user?.id]);

  const openCreate = () => setShowCreate(true);
  const closeCreate = () => setShowCreate(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const gradeMap = {
    "Grade 1": 1,
    "Grade 2": 2,
    "Grade 3": 3,
    "Grade 4": 4,
    "Grade 5": 5,
    "Grade 6": 6,
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.className.trim()) return;

    try {
      const response = await fetch("http://localhost:8000/teacher/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.className.trim(),
          description: form.description.trim() || "—",
          grade_level: gradeMap[form.gradeLevel],
          subject: form.subject.trim() || "—",
          teacher_id: user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create class");
      const newClass = await response.json();
      setClasses((prev) => [newClass, ...prev]);

      setForm({
        className: "",
        description: "",
        gradeLevel: "Grade 1",
        subject: "English",
      });
      closeCreate();
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div className="th-page">
      <aside className="th-sidebar">
        <div className="th-brand">ReadiKo</div>

        <nav className="th-nav">
          <select className="th-select" defaultValue="classes">
            <option value="classes">Classes</option>
          </select>

          <button className="th-link">Profile</button>

          <button className="th-link" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="th-content">
        <h2 className="th-title">Active Classes</h2>

        <section className="th-panel">
          <div className="th-grid">
            {classes.map((c) => (
              <div key={c.id} className="th-classCard">
                <div className="th-className">{c.name}</div>
                <div className="th-classDesc">{c.description}</div>
                <div className="th-classTeacher">{user.email}</div>
              </div>
            ))}

            <button className="th-createCard" onClick={openCreate} type="button">
              + Create Class
            </button>
          </div>
        </section>

        {showCreate && (
          <div className="th-overlay" onClick={closeCreate}>
            <aside className="th-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="th-drawerHeader">
                <button className="th-back" onClick={closeCreate} aria-label="Back">
                  ←
                </button>
                <div className="th-drawerTitle">Create Class</div>
              </div>

              <form className="th-form" onSubmit={onCreate}>
                <label className="th-label">
                  Class Name
                  <input
                    className="th-inputLine"
                    name="className"
                    value={form.className}
                    onChange={onChange}
                    placeholder="Class Name"
                  />
                </label>

                <label className="th-label">
                  Description
                  <textarea
                    className="th-textarea"
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Enter description"
                  />
                </label>

                <label className="th-label">
                  Grade Level
                  <select
                    className="th-selectWide"
                    name="gradeLevel"
                    value={form.gradeLevel}
                    onChange={onChange}
                  >
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                  </select>
                </label>

                <label className="th-label">
                  Subject
                  <input
                    className="th-inputBox"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="English"
                  />
                </label>

                <div className="th-actions">
                  <button className="th-createBtn" type="submit">
                    Create
                  </button>
                </div>
              </form>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}