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

      const user = data.user;
      if (!user) throw new Error('No user returned from login.');

      // Fetch the user's role from the users table using uid
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('uid', user.id)
        .single();

      if (userError) throw userError;
      const role = userData?.role;
      console.log('DEBUG: Logged in user role is:', role);

      onLoginSuccess(user, role);
      if(role === 'teacher') {
        navigate('/teacher/home');
      } else if (role === 'student') {
        navigate('/home');
      }
    } catch (err) {
      console.error('Supabase sign‑in error:', err);
      alert(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className='container'>
      <div className='card'>
        <img src={'/assets/logo1.png'} alt="ReadiKo Logo" style={styles.logoImage} />
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
  logoImage: {
    width: '300px',     
    height: 'auto',
    margin: '70px 0 10px 0',
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