import React, { useState } from 'react';
import './Login.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login({ onSuccess }) {
  // State for input fields — empty by default, user must type credentials
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // State for error handling
  const [error, setError] = useState('');
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Loading state to prevent double-submit and show feedback
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Prevent double-submit while a request is in-flight
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save the JWT token securely
        localStorage.setItem('adminToken', data.token);
        
        // Trigger parent function to navigate to admin panel
        if (onSuccess) onSuccess('admin'); 
      } else {
        setError(data.error?.message || data.message || 'Invalid username or password.');
        // Clear password field on failed attempt for security
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
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
                autoComplete="off"
                disabled={isLoading}
              />
              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? (
                  <VisibilityOff className="admin-login-password-icon" />
                ) : (
                  <Visibility className="admin-login-password-icon" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`admin-login-btn ${isLoading ? 'admin-login-btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="admin-login-spinner-wrapper">
                <span className="admin-login-spinner"></span>
                Authenticating...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}