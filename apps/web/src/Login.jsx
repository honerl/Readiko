import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { supabase } from './services/supabaseClient';

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
    
    console.log('Attempting supabase login:', formData.email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // when login succeeds the session will be stored in
      // localStorage and supabase.auth.getSession() will return it.  We
      // can also pass the user back to the parent to show UI.
      onLoginSuccess(data.user);
      navigate('/home');
    } catch (err) {
      console.error('Supabase sign‑in error:', err);
      alert(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className='container'>
      <div className='card'>
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
    paddingLeft: '130px', 
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