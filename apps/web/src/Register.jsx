import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Pass email and password to RoleSelection via state
    navigate('/role', {
      state: {
        email: formData.email,
        password: formData.password,
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>ReadiKo</h1>
        <h2 style={styles.title}>Sign Up</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            style={styles.input}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input"
            style={styles.input}
            required
          />

          <button type="submit" className="btn_primary">
            REGISTER
          </button>
        </form>

        <p style={styles.text}>Already have an account?</p>
        <button
          onClick={() => navigate('/login')}
          className="btn_secondary"
        >
          LOGIN
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', height: '100vh', backgroundColor: '#FEF0D5' },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '450px', backgroundColor: 'transparent', borderRadius: '12px', textAlign: 'center' },
  logo: { color: '#153204', margin: '70px 0 30px 0', fontSize: '40px'},
  input: { marginBottom: '15px'},
  title: { fontSize: '25px', color: '#6C530E', marginBottom: '30px', alignSelf: 'flex-start', paddingLeft: '62px', fontWeight: '500' },
  form: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '15px', width: '100%' },
  text: { margin: '30px 0 30px 0', fontSize: '0.9rem', color: '#555', fontWeight: '500' },
};

export default Register;
