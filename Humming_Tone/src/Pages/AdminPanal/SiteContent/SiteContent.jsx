import { useMemo, useState } from 'react'
import './SiteContent.css'
import {
  getSiteContent,
  updateFooter,
  updateGenderCategory,
  resetSiteContent,
} from '../../../utils/siteContentStore'

export default function SiteContent() {
  const initial = useMemo(() => getSiteContent(), [])
  const [okMsg, setOkMsg] = useState('')
  const [error, setError] = useState('')
  const [expandedCard, setExpandedCard] = useState(null)

  const [footerDraft, setFooterDraft] = useState(initial.footer)
  const [genderCategoryDraft, setGenderCategoryDraft] = useState(initial.genderCategory)

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
    setError('')
    setOkMsg('')
  }

  const updateFooterField = (path, value) => {
    setFooterDraft(prev => {
      const next = { ...(prev || {}) }
      if (path.includes('.')) {
        const [k1, k2] = path.split('.')
        next[k1] = { ...(next[k1] || {}), [k2]: value }
      } else {
        next[path] = value
      }
      return next
    })
  }

  const genders = Object.keys(genderCategoryDraft || {}).sort()

  const addGender = () => {
    const name = prompt('Enter new gender name (example: Women)')
    if (!name) return
    setGenderCategoryDraft(prev => {
      if (prev?.[name]) return prev
      return { ...(prev || {}), [name]: ['All Categories'] }
    })
  }

  const removeGender = gender => {
    if (!confirm(`Remove gender "${gender}"?`)) return
    setGenderCategoryDraft(prev => {
      const next = { ...(prev || {}) }
      delete next[gender]
      return next
    })
  }

  const addCategory = gender => {
    const name = prompt(`Add category for ${gender}`)
    if (!name) return
    setGenderCategoryDraft(prev => {
      const list = Array.isArray(prev?.[gender]) ? prev[gender] : []
      if (list.includes(name)) return prev
      return { ...(prev || {}), [gender]: [...list, name] }
    })
  }

  const removeCategory = (gender, category) => {
    setGenderCategoryDraft(prev => {
      const list = Array.isArray(prev?.[gender]) ? prev[gender] : []
      return { ...(prev || {}), [gender]: list.filter(c => c !== category) }
    })
  }

  const saveFooter = () => {
    try {
      setError('')
      setOkMsg('')
      updateFooter(footerDraft)
      setOkMsg('Footer saved successfully!')
    } catch (e) {
      setError(e?.message || 'Failed to save footer')
    }
  }

  const saveGenderCategory = () => {
    try {
      setError('')
      setOkMsg('')
      updateGenderCategory(genderCategoryDraft)
      setOkMsg('Gender/Category mapping saved successfully!')
    } catch (e) {
      setError(e?.message || 'Failed to save mapping')
    }
  }

  const resetAll = () => {
    if (!confirm('Reset all content to defaults?')) return
    const defaults = resetSiteContent()
    setFooterDraft(defaults.footer)
    setGenderCategoryDraft(defaults.genderCategory)
    setOkMsg('All content reset to defaults!')
    setError('')
    setExpandedCard(null)
  }

  return (
    <section className="tab-content">
      <div className="sitecontent-header">
        <div className="sitecontent-header-actions">
          <button className="sitecontent-btn danger" onClick={resetAll}>
            Reset All to Defaults
          </button>
        </div>
      </div>

      {error && (
        <div className="sitecontent-alert sitecontent-alert-error">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="sitecontent-alert sitecontent-alert-success">
          {okMsg}
        </div>
      )}

      <div className="sitecontent-cards">
        {/* Footer Content Card */}
        <div className={`sitecontent-main-card ${expandedCard === 'footer' ? 'expanded' : ''}`}>
          <div className="sitecontent-card-header" onClick={() => toggleCard('footer')}>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Footer Content</h3>
              <p className="sitecontent-card-desc">Manage footer text, contact info, and social links</p>
            </div>
            <div className="sitecontent-card-toggle">
              <span className={`sitecontent-arrow ${expandedCard === 'footer' ? 'rotated' : ''}`}>▼</span>
            </div>
          </div>

          {expandedCard === 'footer' && (
            <div className="sitecontent-card-content">
              <div className="sitecontent-form">
                <div className="sitecontent-row">
                  <label>Brand Name</label>
                  <input 
                    value={footerDraft?.brandName || ''} 
                    onChange={e => updateFooterField('brandName', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="sitecontent-row">
                  <label>Description</label>
                  <textarea 
                    value={footerDraft?.description || ''} 
                    onChange={e => updateFooterField('description', e.target.value)}
                    placeholder="Enter brand description"
                  />
                </div>

                <div className="sitecontent-row">
                  <label>Email</label>
                  <input 
                    type="email"
                    value={footerDraft?.company?.email || ''} 
                    onChange={e => updateFooterField('company.email', e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>

                <div className="sitecontent-row">
                  <label>Phone</label>
                  <input 
                    type="tel"
                    value={footerDraft?.company?.phone || ''} 
                    onChange={e => updateFooterField('company.phone', e.target.value)}
                    placeholder="Enter contact phone"
                  />
                </div>

                <div className="sitecontent-row">
                  <label>Address</label>
                  <textarea 
                    value={footerDraft?.company?.address || ''} 
                    onChange={e => updateFooterField('company.address', e.target.value)}
                    placeholder="Enter business address"
                  />
                </div>
              </div>

              <div className="sitecontent-card-actions">
                <button className="sitecontent-btn primary" onClick={saveFooter}>
                  Save Footer Content
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gender Categories Card */}
        <div className={`sitecontent-main-card ${expandedCard === 'categories' ? 'expanded' : ''}`}>
          <div className="sitecontent-card-header" onClick={() => toggleCard('categories')}>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Gender Categories</h3>
              <p className="sitecontent-card-desc">Configure product categories for each gender type</p>
            </div>
            <div className="sitecontent-card-toggle">
              <span className={`sitecontent-arrow ${expandedCard === 'categories' ? 'rotated' : ''}`}>▼</span>
            </div>
          </div>

          {expandedCard === 'categories' && (
            <div className="sitecontent-card-content">
              <div className="sitecontent-categories-header">
                <button className="sitecontent-btn secondary" onClick={addGender}>
                  Add New Gender
                </button>
              </div>

              <div className="sitecontent-categories-list">
                {genders.map(gender => (
                  <div key={gender} className="sitecontent-category-item">
                    <div className="sitecontent-category-header">
                      <span className="sitecontent-badge">{gender}</span>
                      <button 
                        className="sitecontent-btn danger small" 
                        onClick={() => removeGender(gender)}
                      >
                        Remove Gender
                      </button>
                    </div>
                    
                    <div className="sitecontent-category-tags">
                      {(genderCategoryDraft?.[gender] || []).map(cat => (
                        <div key={cat} className="sitecontent-tag">
                          <span className="sitecontent-tag-text">{cat}</span>
                          <button
                            className="sitecontent-tag-remove"
                            onClick={() => removeCategory(gender, cat)}
                            title="Remove category"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button 
                        className="sitecontent-btn secondary small" 
                        onClick={() => addCategory(gender)}
                      >
                        + Add Category
                      </button>
                    </div>
                  </div>
                ))}

                {genders.length === 0 && (
                  <div className="sitecontent-empty-state">
                    <p>No gender categories configured yet.</p>
                    <p>Click "Add New Gender" to get started.</p>
                  </div>
                )}
              </div>

              <div className="sitecontent-card-actions">
                <button className="sitecontent-btn primary" onClick={saveGenderCategory}>
                  Save Categories
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
