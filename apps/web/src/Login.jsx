import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Attempting login for:', formData.email);

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user); 
        navigate('/home'); 
      } else {
        alert(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Cannot connect to the backend server.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>ReadiKo</h1>
        <h2 style={styles.title}>Sign In</h2>
        
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
            required
          />
          <p style={styles.linkTextSmall}>Forgot password? Click here</p>
          
          <button type="submit" className="btn_primary">LOGIN</button>
        </form>

        <p style={styles.text}>Don't have an account?</p>
        
        {/* Using navigate for the register button */}
        <button 
          onClick={() => navigate('/register')} 
          className="btn_secondary"
        >
          REGISTER
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    height: '100vh', 
    backgroundColor: '#FEF0D5' 
  },
  card: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    width: '450px', 
    backgroundColor: 'transparent', 
    borderRadius: '12px', 
    textAlign: 'center' 
  },
  logo: { 
    color: '#153204', 
    margin: '70px 0 30px 0', 
    fontSize: '40px'
  },
  input: { 
    marginBottom: '15px'
  },
  title: { 
    fontSize: '25px', 
    color: '#6C530E', 
    marginBottom: '30px', 
    alignSelf: 'flex-start', 
    paddingLeft: '62px', 
    fontWeight: '500' 
  },
  form: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'column', 
    gap: '15px',
    width: '100%'
  },
  linkTextSmall: { 
    fontSize: '0.8rem', 
    color: '#6C530E', 
    cursor: 'pointer', 
    margin: '-5px 0 20px 0', 
    fontWeight: '500',  
  },
  text: { 
    margin: '30px 0 30px 0', 
    fontSize: '0.9rem', 
    color: '#555', 
    fontWeight: '500' 
  },
};

export default Login;