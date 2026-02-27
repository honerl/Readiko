import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./services/supabaseClient";
import { apiFetch } from "./services/api";
import "./RoleSelection.css";

export default function RoleSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};

  // Redirect back to register if email/password not provided
  useEffect(() => {
    if (!email || !password) {
      navigate('/register');
    }
  }, [email, password, navigate]);

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    universityName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!email || !password) {
    return null;
  }

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
      // Step 1: Create auth account with email/password from Register
      console.log('Signing up with Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const uid = authData.user?.id;
      console.log('Auth signup successful, uid:', uid);
      if (!uid) throw new Error("Failed to get user ID from auth");

      // Step 2: Create user profile in public.users table
      const payload = {
        uid,
        fname: form.firstName,
        lname: form.lastName,
        email,
        role,
      };

      console.log('Creating profile with payload:', payload);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log('Profile creation response:', { status: res.status, data: responseData });

      if (!res.ok) {
        throw new Error(responseData.detail || "Failed to create profile");
      }

      console.log('Profile created successfully');
      // Profile created, go to home
      navigate("/home");
    } catch (err) {
      console.error("Role selection submit error:", err);
      alert(err.message || "Failed to complete signup");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rs-page">
      <header className="rs-topbar">
        <button className="rs-back" aria-label="Back" onClick={() => history.back()}>
          ←
        </button>
        <div className="rs-title">Role Selection ({isTeacher ? "Teacher" : "Student"})</div>
      </header>

      <main className="rs-card">
        <h1 className="rs-heading">Welcome to ReadiKo</h1>
        <p className="rs-subheading">
          Please select your role to help us personalize your reading experience.
        </p>

        <div className="rs-roleRow">
          <RoleButton
            label="Student"
            selected={role === "student"}
            onClick={() => setRole("student")}
          />
          <RoleButton
            label="Teacher"
            selected={role === "teacher"}
            onClick={() => setRole("teacher")}
          />
        </div>

        <form className="rs-form" onSubmit={onSubmit}>
          <input
            className="rs-input"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={onChange}
            autoComplete="given-name"
          />
          <input
            className="rs-input"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={onChange}
            autoComplete="family-name"
          />

          {isTeacher && (
            <input
              className="rs-input"
              name="universityName"
              placeholder="University Name"
              value={form.universityName}
              onChange={onChange}
            />
          )}

          <button className="rs-submit" type="submit" disabled={!canSubmit || isLoading}>
            {isLoading ? 'SIGNING UP...' : 'Sign up'}
          </button>
        </form>
      </main>
    </div>
  );
}

function RoleButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`rs-roleBtn ${selected ? "is-selected" : ""}`}
      onClick={onClick}
    >
      <span className="rs-icon" aria-hidden="true" />
      <span className="rs-roleLabel">{label}</span>
    </button>
  );
}