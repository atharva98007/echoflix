import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css';

function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! You can now login.");
        navigate('/login');
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Signup to EchoFlix</h2>
        <input name="username" placeholder="Username" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Sign Up</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

export default Signup;
