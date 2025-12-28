import React, { useState } from 'react';
import './Login.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login({ onSuccess }) {
  // State for input fields
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin123'
  });

  // State for error handling
  const [error, setError] = useState('');
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Hardcoded credentials as requested
  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'admin123';
  const USER_USERNAME = 'user';
  const USER_PASSWORD = 'user123';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Check for empty fields
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // 2. Validate Admin Credentials
    if (formData.username === VALID_USERNAME && formData.password === VALID_PASSWORD) {
      setError('');
      console.log('Admin Login Successful');
      // Trigger parent function to navigate to admin panel
      if (onSuccess) onSuccess('admin'); 
    } 
    // 3. Validate User Credentials
    else if (formData.username === USER_USERNAME && formData.password === USER_PASSWORD) {
      setError('');
      console.log('User Login Successful');
      // Trigger parent function to navigate to user page
      if (onSuccess) onSuccess('user');
    } 
    else {
      // 4. Set Error for invalid credentials
      setError('Invalid username or password.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Please log in to continue</p>
        </div>

        {/* Error Alert UI */}
        {error && (
          <div className="error-alert">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`form-input ${error ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <VisibilityOff className="password-icon" />
                ) : (
                  <Visibility className="password-icon" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}