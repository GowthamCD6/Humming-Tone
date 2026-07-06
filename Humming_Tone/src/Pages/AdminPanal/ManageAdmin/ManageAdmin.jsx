import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LockIcon from '@mui/icons-material/Lock'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import './ManageAdmin.css'

const API_BASE_URL = 'http://localhost:5000'

// Simple robust JWT decoder
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Form states - Create Admin
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCreatePass, setShowCreatePass] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  // Form states - Change Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [changeError, setChangeError] = useState('')
  const [changeSuccess, setChangeSuccess] = useState('')
  const [submittingChange, setSubmittingChange] = useState(false)

  // Fetch admin users
  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/admin/users`)
      setAdmins(res.data)
    } catch (err) {
      console.error('Error fetching admin users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
    const token = localStorage.getItem('adminToken')
    if (token) {
      const decoded = decodeToken(token)
      setCurrentUser(decoded)
    }
  }, [])

  // Create admin submit
  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    if (!createUsername.trim() || !createPassword || !confirmPassword) {
      setCreateError('All fields are required.')
      return
    }

    if (createUsername.trim().length < 3) {
      setCreateError('Username must be at least 3 characters long.')
      return
    }

    if (createPassword.length < 6) {
      setCreateError('Password must be at least 6 characters long.')
      return
    }

    if (createPassword !== confirmPassword) {
      setCreateError('Passwords do not match.')
      return
    }

    try {
      setSubmittingCreate(true)
      await axios.post(`${API_BASE_URL}/admin/users`, {
        username: createUsername.trim(),
        password: createPassword,
      })

      setCreateSuccess(`Admin "${createUsername}" created successfully!`)
      setCreateUsername('')
      setCreatePassword('')
      setConfirmPassword('')
      fetchAdmins()
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create admin user.')
    } finally {
      setSubmittingCreate(false)
    }
  }

  // Change password submit
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangeError('')
    setChangeSuccess('')

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setChangeError('All fields are required.')
      return
    }

    if (newPassword.length < 6) {
      setChangeError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setChangeError('New passwords do not match.')
      return
    }

    try {
      setSubmittingChange(true)
      await axios.put(`${API_BASE_URL}/admin/change-password`, {
        currentPassword,
        newPassword,
      })

      setChangeSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      setChangeError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to change password.')
    } finally {
      setSubmittingChange(false)
    }
  }

  // Delete admin user
  const handleDeleteAdmin = async (id, username) => {
    if (parseInt(id) === parseInt(currentUser?.id)) {
      alert('You cannot delete your own admin account.')
      return
    }

    if (window.confirm(`Are you sure you want to delete admin "${username}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/users/${id}`)
        fetchAdmins()
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete admin user.')
      }
    }
  }

  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="manage-admin-container">
      {/* LEFT COLUMN: FORMS */}
      <div className="admin-forms-col">
        {/* CREATE ADMIN FORM */}
        <div className="admin-card">
          <div className="card-header-with-icon">
            <div className="icon-badge primary">
              <PersonAddIcon />
            </div>
            <div>
              <h2 className="card-title">Create Admin User</h2>
              <p className="card-subtitle">Add a new admin account to manage the store</p>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="admin-form">
            {createError && (
              <div className="alert-message error">
                <ErrorOutlineIcon className="alert-icon" />
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div className="alert-message success">
                <CheckCircleOutlineIcon className="alert-icon" />
                <span>{createSuccess}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="createUsername">Username</label>
              <input
                type="text"
                id="createUsername"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="e.g. admin_jane"
                disabled={submittingCreate}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="createPassword">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCreatePass ? 'text' : 'password'}
                  id="createPassword"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={submittingCreate}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCreatePass(!showCreatePass)}
                >
                  {showCreatePass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showCreatePass ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                disabled={submittingCreate}
                required
              />
            </div>

            <button type="submit" className="admin-btn-submit" disabled={submittingCreate}>
              {submittingCreate ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        {/* CHANGE PASSWORD FORM */}
        <div className="admin-card">
          <div className="card-header-with-icon">
            <div className="icon-badge accent">
              <LockIcon />
            </div>
            <div>
              <h2 className="card-title">Change Password</h2>
              <p className="card-subtitle">Update your admin account credentials</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="admin-form">
            {changeError && (
              <div className="alert-message error">
                <ErrorOutlineIcon className="alert-icon" />
                <span>{changeError}</span>
              </div>
            )}
            {changeSuccess && (
              <div className="alert-message success">
                <CheckCircleOutlineIcon className="alert-icon" />
                <span>{changeSuccess}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={submittingChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={submittingChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type={showNewPass ? 'text' : 'password'}
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={submittingChange}
                required
              />
            </div>

            <button type="submit" className="admin-btn-submit accent-btn" disabled={submittingChange}>
              {submittingChange ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: LIST */}
      <div className="admin-list-col">
        <div className="admin-card list-card">
          <div className="card-header-with-icon">
            <div className="icon-badge info">
              <AdminPanelSettingsIcon />
            </div>
            <div>
              <h2 className="card-title">Administrator Accounts</h2>
              <p className="card-subtitle">Active accounts with panel privileges</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="loading-cell">
                      <div className="spinner" />
                      <span>Loading admin users...</span>
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-cell">
                      No admin users found.
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => {
                    const isSelf = parseInt(adm.id) === parseInt(currentUser?.id)
                    return (
                      <tr key={adm.id} className={isSelf ? 'row-self' : ''}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="user-avatar-circle">
                              {adm.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="username-info">
                              <span className="name">{adm.username}</span>
                              {isSelf && <span className="self-badge">You</span>}
                            </div>
                          </div>
                        </td>
                        <td className="date-cell">{fmtDate(adm.created_at)}</td>
                        <td>
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete your logged-in account' : `Delete ${adm.username}`}
                          >
                            <DeleteOutlineIcon />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
