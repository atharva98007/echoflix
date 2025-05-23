import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate('/home'); // we’ll create this later
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Login to EchoFlix</h2>
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Login</button>
        <p>New to EchoFlix? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

export default Login;
