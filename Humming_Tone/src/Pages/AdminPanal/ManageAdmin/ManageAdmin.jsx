import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LockResetIcon from '@mui/icons-material/LockReset'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CloseIcon from '@mui/icons-material/Close'
import KeyIcon from '@mui/icons-material/Key'
import SearchIcon from '@mui/icons-material/Search'
import ShieldIcon from '@mui/icons-material/Shield'
import './ManageAdmin.css'
import { API_BASE_URL } from '../../../utils/apiConfig'

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
  } catch {
    return null
  }
}

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Create Admin Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createUsername, setCreateUsername] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCreatePass, setShowCreatePass] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  // In-Card Change Password Modal State
  const [passwordModalUser, setPasswordModalUser] = useState(null)
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
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
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
      setCreateError('All required fields must be filled.')
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
      const token = localStorage.getItem('adminToken')
      await axios.post(
        `${API_BASE_URL}/admin/users`,
        {
          username: createUsername.trim(),
          email: createEmail.trim() || undefined,
          password: createPassword,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )

      setCreateSuccess(`Admin "${createUsername}" created successfully!`)
      setCreateUsername('')
      setCreateEmail('')
      setCreatePassword('')
      setConfirmPassword('')
      fetchAdmins()
      setTimeout(() => {
        setShowCreateModal(false)
        setCreateSuccess('')
      }, 1500)
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create admin user.')
    } finally {
      setSubmittingCreate(false)
    }
  }

  // Open Change Password Modal for specific user card
  const openPasswordModal = (user) => {
    setPasswordModalUser(user)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setChangeError('')
    setChangeSuccess('')
    setShowCurrentPass(false)
    setShowNewPass(false)
  }

  const closePasswordModal = () => {
    setPasswordModalUser(null)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setChangeError('')
    setChangeSuccess('')
  }

  // Change password submit for user
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangeError('')
    setChangeSuccess('')

    if (!passwordModalUser) return

    const isSelf = parseInt(passwordModalUser.id) === parseInt(currentUser?.id)

    if (isSelf && !currentPassword) {
      setChangeError('Please enter your current password.')
      return
    }

    if (!newPassword || !confirmNewPassword) {
      setChangeError('Please enter and confirm the new password.')
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
      const token = localStorage.getItem('adminToken')
      await axios.put(
        `${API_BASE_URL}/admin/users/${passwordModalUser.id}/password`,
        {
          currentPassword: isSelf ? currentPassword : undefined,
          newPassword,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )

      setChangeSuccess(`Password for "${passwordModalUser.username}" updated successfully!`)
      setTimeout(() => {
        closePasswordModal()
      }, 1500)
    } catch (err) {
      setChangeError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update password.')
    } finally {
      setSubmittingChange(false)
    }
  }

  // Delete admin user
  const handleDeleteAdmin = async (id, username) => {
    if (parseInt(id) === parseInt(currentUser?.id)) {
      alert('You cannot delete your own active admin account.')
      return
    }

    if (window.confirm(`Are you sure you want to delete administrator "${username}"?`)) {
      try {
        const token = localStorage.getItem('adminToken')
        await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
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
    })
  }

  const filteredAdmins = admins.filter((adm) => {
    const q = searchQuery.toLowerCase()
    return (
      adm.username?.toLowerCase().includes(q) ||
      adm.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="manage-admin-container">
      {/* 1. TOP HEADER & METRICS BAR */}
      <div className="ma-top-bar">
        <div className="ma-top-left">
          <div className="ma-badge-tag">ADMINISTRATION • ACCESS CONTROL</div>
          <h1 className="ma-page-title">Admin Users</h1>
        </div>

        <div className="ma-top-actions">
          <div className="ma-search-wrap">
            <SearchIcon className="ma-search-icon" fontSize="small" />
            <input
              type="text"
              placeholder="Search admin users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ma-search-input"
            />
          </div>

          <button
            type="button"
            className="ma-btn ma-btn-primary"
            onClick={() => {
              setShowCreateModal(true)
              setCreateError('')
              setCreateSuccess('')
            }}
          >
            <PersonAddIcon fontSize="small" />
            Create Admin
          </button>
        </div>
      </div>

      {/* 2. ADMIN USERS CARDS GRID */}
      <div className="ma-cards-section">
        {loading ? (
          <div className="ma-loading-box">
            <div className="ma-spinner" />
            <span>Loading admin users...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="ma-empty-box">
            <ShieldIcon className="ma-empty-icon" />
            <h3>No admin users found</h3>
            <p>Try refining your search query or add a new administrator account.</p>
          </div>
        ) : (
          <div className="ma-users-grid">
            {filteredAdmins.map((adm) => {
              const isSelf = parseInt(adm.id) === parseInt(currentUser?.id)

              return (
                <div key={adm.id} className={`ma-user-card ${isSelf ? 'card-self' : ''}`}>
                  {/* Top Card Info */}
                  <div className="ma-user-card-header">
                    <div className="ma-avatar-wrap">
                      {adm.avatar_url ? (
                        <img
                          src={adm.avatar_url}
                          alt={adm.username}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="ma-avatar-img"
                        />
                      ) : (
                        <div className="ma-avatar-initials">
                          {adm.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="ma-online-dot" title="Active Account" />
                    </div>

                    <div className="ma-user-meta">
                      <div className="ma-name-row">
                        <h3 className="ma-user-name">{adm.username}</h3>
                        {isSelf && <span className="ma-badge-self">You</span>}
                      </div>
                      <span className="ma-user-email">{adm.email || 'No email linked'}</span>
                    </div>
                  </div>

                  {/* Badges & Meta Details */}
                  <div className="ma-user-card-body">
                    <div className="ma-meta-tags">
                      <span className="ma-tag ma-tag-role">
                        <ShieldIcon fontSize="inherit" /> Administrator
                      </span>
                      {adm.google_id && (
                        <span className="ma-tag ma-tag-google">
                          ✓ Google Linked
                        </span>
                      )}
                    </div>

                    <div className="ma-meta-info-row">
                      <span className="ma-meta-label">MEMBER SINCE</span>
                      <span className="ma-meta-val">{fmtDate(adm.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions in User Card */}
                  <div className="ma-user-card-footer">
                    <button
                      type="button"
                      className="ma-btn ma-btn-card-action"
                      onClick={() => openPasswordModal(adm)}
                      title={`Change password for ${adm.username}`}
                    >
                      <KeyIcon fontSize="small" />
                      Change Password
                    </button>

                    <button
                      type="button"
                      className="ma-btn-delete-card"
                      onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                      disabled={isSelf}
                      title={isSelf ? 'Cannot delete your own logged-in account' : `Delete ${adm.username}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL 1: CHANGE PASSWORD FOR USER ===== */}
      {passwordModalUser && (
        <div className="ma-modal-overlay" onClick={closePasswordModal}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal-header">
              <div className="ma-modal-icon-wrap accent">
                <LockResetIcon className="ma-modal-icon" />
              </div>
              <div>
                <h3 className="ma-modal-title">Change Password</h3>
                <p className="ma-modal-sub">
                  Update credentials for <strong>{passwordModalUser.username}</strong>
                </p>
              </div>
              <button className="ma-modal-close-btn" onClick={closePasswordModal}>
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="ma-modal-body">
              {changeError && (
                <div className="ma-alert error">
                  <ErrorOutlineIcon fontSize="small" />
                  <span>{changeError}</span>
                </div>
              )}
              {changeSuccess && (
                <div className="ma-alert success">
                  <CheckCircleOutlineIcon fontSize="small" />
                  <span>{changeSuccess}</span>
                </div>
              )}

              {parseInt(passwordModalUser.id) === parseInt(currentUser?.id) && (
                <div className="ma-form-group">
                  <label htmlFor="currentPassword">Current Password <span className="req">*</span></label>
                  <div className="ma-pass-wrap">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={submittingChange}
                      required
                      className="ma-input"
                    />
                    <button
                      type="button"
                      className="ma-pass-toggle"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="ma-form-group">
                <label htmlFor="newPassword">New Password <span className="req">*</span></label>
                <div className="ma-pass-wrap">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={submittingChange}
                    required
                    className="ma-input"
                  />
                  <button
                    type="button"
                    className="ma-pass-toggle"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </button>
                </div>
              </div>

              <div className="ma-form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password <span className="req">*</span></label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={submittingChange}
                  required
                  className="ma-input"
                />
              </div>

              <div className="ma-modal-footer">
                <button type="button" className="ma-btn ma-btn-outline" onClick={closePasswordModal} disabled={submittingChange}>
                  Cancel
                </button>
                <button type="submit" className="ma-btn ma-btn-primary" disabled={submittingChange}>
                  {submittingChange ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL 2: CREATE ADMIN USER ===== */}
      {showCreateModal && (
        <div className="ma-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal-header">
              <div className="ma-modal-icon-wrap primary">
                <PersonAddIcon className="ma-modal-icon" />
              </div>
              <div>
                <h3 className="ma-modal-title">Create Admin User</h3>
                <p className="ma-modal-sub">Add a new admin account with store panel privileges</p>
              </div>
              <button className="ma-modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="ma-modal-body">
              {createError && (
                <div className="ma-alert error">
                  <ErrorOutlineIcon fontSize="small" />
                  <span>{createError}</span>
                </div>
              )}
              {createSuccess && (
                <div className="ma-alert success">
                  <CheckCircleOutlineIcon fontSize="small" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div className="ma-form-group">
                <label htmlFor="createUsername">Username <span className="req">*</span></label>
                <input
                  type="text"
                  id="createUsername"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="e.g. admin_alex"
                  disabled={submittingCreate}
                  required
                  className="ma-input"
                />
              </div>

              <div className="ma-form-group">
                <label htmlFor="createEmail">Email Address (Optional)</label>
                <input
                  type="email"
                  id="createEmail"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="e.g. alex@gmail.com (for Google Login)"
                  disabled={submittingCreate}
                  className="ma-input"
                />
              </div>

              <div className="ma-form-group">
                <label htmlFor="createPassword">Password <span className="req">*</span></label>
                <div className="ma-pass-wrap">
                  <input
                    type={showCreatePass ? 'text' : 'password'}
                    id="createPassword"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={submittingCreate}
                    required
                    className="ma-input"
                  />
                  <button
                    type="button"
                    className="ma-pass-toggle"
                    onClick={() => setShowCreatePass(!showCreatePass)}
                  >
                    {showCreatePass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </button>
                </div>
              </div>

              <div className="ma-form-group">
                <label htmlFor="confirmPassword">Confirm Password <span className="req">*</span></label>
                <input
                  type={showCreatePass ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  disabled={submittingCreate}
                  required
                  className="ma-input"
                />
              </div>

              <div className="ma-modal-footer">
                <button type="button" className="ma-btn ma-btn-outline" onClick={() => setShowCreateModal(false)} disabled={submittingCreate}>
                  Cancel
                </button>
                <button type="submit" className="ma-btn ma-btn-primary" disabled={submittingCreate}>
                  {submittingCreate ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
