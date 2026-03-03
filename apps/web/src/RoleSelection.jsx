import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./services/supabaseClient";
import "./App.css";
import "./RoleSelection.css";

export default function RoleSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};

  useEffect(() => {
    if (!email || !password) navigate("/register");
  }, [email, password, navigate]);

  const [role, setRole]           = useState("student");
  const [form, setForm]           = useState({ firstName: "", lastName: "", universityName: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isBackPressed, setIsBackPressed] = useState(false);

  if (!email || !password) return null;

  const isTeacher = role === "teacher";

  const canSubmit = useMemo(() => {
    if (!form.firstName.trim() || !form.lastName.trim()) return false;
    if (isTeacher && !form.universityName.trim()) return false;
    return true;
  }, [form.firstName, form.lastName, form.universityName, isTeacher]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      const uid = authData.user?.id;
      if (!uid) throw new Error("Failed to get user ID from auth");

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, fname: form.firstName, lname: form.lastName, email, role }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.detail || "Failed to create profile");
      navigate("/home");
    } catch (err) {
      console.error("Role selection submit error:", err);
      alert(err.message || "Failed to complete signup");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container" style={styles.container}>

      {/* Back button — absolute top-left over the background */}
      <button
        style={{
          ...styles.backBtn,
          border: isBackHovered || isBackPressed ? "2px solid #f06d5f" : "none",
          transform: isBackPressed ? "scale(0.95)" : "scale(1)",
        }}
        onMouseEnter={() => setIsBackHovered(true)}
        onMouseLeave={() => {
          setIsBackHovered(false);
          setIsBackPressed(false);
        }}
        onMouseDown={() => setIsBackPressed(true)}
        onMouseUp={() => setIsBackPressed(false)}
        onBlur={() => setIsBackPressed(false)}
        onClick={() => navigate("/register")}
        aria-label="Back"
      >
        <img
          src="/assets/backbtn.png"
          alt="Back"
          style={{
            ...styles.backIcon,
            filter: isBackHovered || isBackPressed
              ? "brightness(0) saturate(100%) invert(52%) sepia(82%) saturate(1489%) hue-rotate(330deg) brightness(98%) contrast(90%)"
              : "none",
          }}
        />
      </button>

      {/* Card — full height, swap backgroundImage here for a different picture */}
      <div style={styles.card}>
        <div style={styles.inner}>

          <h1 style={styles.heading}>Welcome to ReadiKo</h1>
          <p style={styles.subheading}>
            Please select your role to help us personalize your reading experience.
          </p>

          {/* Role buttons */}
          <div style={styles.roleRow}>
            <RoleButton label="Student" icon="/assets/student.png" selected={role === "student"} onClick={() => setRole("student")} />
            <RoleButton label="Teacher" icon="/assets/teacher.png" selected={role === "teacher"} onClick={() => setRole("teacher")} />
          </div>

          {/* Form — uses .input and .btn_primary from App.css */}
          <form onSubmit={onSubmit} style={styles.form}>
            <input
              className="input"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={onChange}
              autoComplete="given-name"
              style={styles.input}
            />
            <input
              className="input"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={onChange}
              autoComplete="family-name"
              style={styles.input}
            />
            {isTeacher && (
              <input
                className="input"
                name="universityName"
                placeholder="University / School Name"
                style={styles.input}
                value={form.universityName}
                onChange={onChange}
              />
            )}

            <button
              type="submit"
              className="btn_primary"
              style={styles.btn}
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? "SIGNING UP..." : "SIGN UP"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

// ── Role toggle button ──────────────────────────────────────
function RoleButton({ label, icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.currentTarget.blur(); onClick(); }}
      className={`role-btn ${selected ? "is-selected" : ""}`}
    >
      {icon
        ? <img src={icon} alt="" className="role-btn-icon" />
        : <span className="role-btn-icon" />
      }
      <span>{label}</span>
    </button>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = {
  container: {
    justifyContent: "center",
    alignItems: "stretch",   // card stretches full height
    position: "relative",
  },

  input: { 
    height: '42px',
    marginBottom: '15px',
    width: '390px'
  },
  btn: {
    width: '410px'
  },

  backBtn: {
    position: "absolute",
    top: "24px",
    left: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#FEF0D5",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2a1f0e",
    zIndex: 10,
    margin: '15px',
    boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.1s ease, border-color 0.15s ease',
    },

  backIcon: {
    width: "18px",
    height: "18px",
    transition: "filter 0.2s ease",
  },

  /*
    Full-height card — swap backgroundImage here for a different picture.
    No top/bottom border-radius so it touches the screen edges.
  */
  card: {
    width: "800px",
    height: "100%",           // touches top and bottom
    backgroundImage: "url('/assets/container2.png')",  // ← swap image here
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "center",
  },

  /* Inner content box — centered inside the card */
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
    padding: "0 40px",
  },

  heading: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#2a1f0e",
    marginBottom: "6px",
    marginTop: "70px"
  },

  subheading: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "40px",
    maxWidth: "420px",
    lineHeight: "1.6",
  },

  roleRow: {
    display: "flex",
    gap: "32px",
    marginBottom: "26px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    width: "100%",
  },
};

const roleBtn = {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "190px",
    height: "76px",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    paddingLeft: "20px",
    marginBottom: "28px",
  },
  selected: {
    backgroundColor: "#fde8d8",
    color: "#2a1f0e",
    border: "2px solid #2a1f0e",
  },
  idle: {
    backgroundColor: "rgba(255,255,255,0.6)",
    color: "#2a1f0e",
    border: "1.5px solid #ccc",
  },
  iconBox: {
    display: "inline-block",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#bbb",
    flexShrink: 0,
  },
};
