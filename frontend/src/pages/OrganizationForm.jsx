import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function OrganizationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    type: 'Corporate', // First option as default
    industry: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    linkedinUrl: '',
    logoUrl: ''
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isEditMode) return

    const fetchOrganization = async () => {
      try {
        setFetching(true)
        setError('')
        const res = await api.get(`/api/organizations/${id}`)
        if (res.success && res.data) {
          const org = res.data
          setFormData({
            name: org.name || '',
            type: org.type || 'Corporate',
            industry: org.industry || '',
            description: org.description || '',
            website: org.website || '',
            email: org.email || '',
            phone: org.phone || '',
            city: org.city || '',
            state: org.state || '',
            country: org.country || '',
            linkedinUrl: org.linkedinUrl || '',
            logoUrl: org.logoUrl || ''
          })
        } else {
          throw new Error('Organization details could not be resolved.')
        }
      } catch (err) {
        setError(err.message || 'Failed to load organization coordinates')
      } finally {
        setFetching(false)
      }
    }

    fetchOrganization()
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isEditMode) {
        // Edit mode: PUT to /api/organizations/:id
        const res = await api.put(`/api/organizations/${id}`, formData)
        if (res.success) {
          setSuccess('Organization details updated successfully.')
          setTimeout(() => {
            navigate('/organizations')
          }, 1500)
        }
      } else {
        // Create mode: POST to /api/organizations
        const res = await api.post('/api/organizations', formData)
        if (res.success) {
          setSuccess('Organization node registered successfully.')
          setTimeout(() => {
            navigate('/organizations')
          }, 1500)
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the organization node.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Accessing Node Coordinates...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile md:px-margin-desktop py-12 relative z-10">
      <div className="max-w-[800px] mx-auto space-y-6 animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <Link to="/organizations" className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Registry
        </Link>

        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg space-y-8">
          
          {/* Header */}
          <div className="border-b border-outline-variant/20 pb-6 space-y-1">
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
              {isEditMode ? 'Edit Organization Node' : 'Register Corporate Node'}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {isEditMode 
                ? 'Update your organization metadata and corporate parameters.' 
                : 'Inject a new business node into the strategic networking ecosystem.'}
            </p>
          </div>

          {/* Inline Feedback Alerts */}
          {error && (
            <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-left text-body-md border border-green-500/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Core Entity Details */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Corporate Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="name">
                    Organization Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Organization Name"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="type">
                    Corporate Type Node
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="MSME">MSME</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Trade Organization">Trade Organization</option>
                    <option value="Association">Association</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="industry">
                    Business Sector / Industry
                  </label>
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Technology, Finance, Energy"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="logoUrl">
                    Corporate Logo Image URL
                  </label>
                  <input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Matrix */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Communications Matrix
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="email">
                    Node Contact Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="phone">
                    Connection Telephone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="website">
                    Enterprise Portal URL
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="linkedinUrl">
                    LinkedIn Organization URL
                  </label>
                  <input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/name"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Geographic coordinates */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Geographic coordinates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="state">
                    State / Region
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="NY"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="United States"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Bio / Description */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-primary font-semibold border-l-4 border-secondary pl-3">
                Entity Summary
              </h2>
              <div className="space-y-1">
                <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="description">
                  Business Description Summary
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share a summary of your organization's mission, business model, and strategic networking objectives."
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md resize-y"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Link
                to="/organizations"
                className="px-6 py-3 border border-outline-variant text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-all font-semibold flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/95 transition-all shadow-sm font-semibold flex items-center justify-center gap-2 ${
                  loading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving node coordinates...' : (isEditMode ? 'Save Coordinates' : 'Register Node')}
                {!loading && <span className="material-symbols-outlined text-sm">save</span>}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}
