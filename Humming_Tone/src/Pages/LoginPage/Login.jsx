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
    <div className="admin-login-page">
      <div className="admin-login-card">
        
        {/* Header */}
        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Please log in to continue</p>
        </div>

        {/* Error Alert UI */}
        {error && (
          <div className="admin-login-error-alert">
            <span className="admin-login-error-icon">!</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`admin-login-form-input ${error ? 'admin-login-input-error' : ''}`}
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="admin-login-form-group">
            <label htmlFor="password">Password</label>
            <div className="admin-login-password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`admin-login-form-input ${error ? 'admin-login-input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <VisibilityOff className="admin-login-password-icon" />
                ) : (
                  <Visibility className="admin-login-password-icon" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-btn">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}