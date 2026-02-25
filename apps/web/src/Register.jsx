import React, { useState } from 'react';

const Register = ({ onSwitch }) => {
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
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log('Registering user:', formData);
    // Add backend fetch logic here
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>ReadiKo</h1>
        <h2 style={styles.title}>Sign Up</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className='input' required  style={styles.input}/>
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className='input' style={styles.input} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className='input' style={styles.input} required />
          
          <button type="submit" className='btn_primary'>REGISTER</button>
        </form>

        <p style={styles.text}>Already have an account?</p>
        <button onClick={onSwitch} className="btn_secondary">LOGIN</button>
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
  form: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '15px' },
  linkTextSmall: { fontSize: '0.8rem', color: '#6C530E', cursor: 'pointer', margin: '-5px 0 20px 0', fontWeight: '500' },
  text: { margin: '30px 0 30px 0', fontSize: '0.9rem', color: '#555', fontWeight: '500' },
};

export default Register;