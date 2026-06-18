import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function OrganizationDetail() {
  const { id } = useParams()
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrgDetail = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get(`/api/organizations/${id}`)
        if (res.success && res.data) {
          setOrganization(res.data)
        } else {
          throw new Error('Organization details could not be found.')
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve organization node details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrgDetail()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Loading Node Credentials...
          </p>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-surface px-margin-mobile py-12 relative z-10">
        <div className="max-w-[800px] mx-auto space-y-6">
          <Link to="/organizations" className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Registry
          </Link>
          <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{error || 'Organization node not found.'}</span>
          </div>
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

        {/* Detail Panel */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg space-y-8">
          
          {/* Node Branding Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-outline-variant/20 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/30 text-primary shrink-0">
                {organization.logoUrl ? (
                  <img 
                    src={organization.logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = '<span class="material-symbols-outlined text-[32px]">corporate_fare</span>';
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-[32px]">corporate_fare</span>
                )}
              </div>
              <div className="space-y-1">
                <h1 className="font-headline-xl text-[28px] leading-8 text-primary font-bold">
                  {organization.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {organization.type && (
                    <span className="inline-block font-label-md text-[10px] uppercase tracking-wider text-primary bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                      {organization.type}
                    </span>
                  )}
                  {organization.industry && (
                    <span className="inline-block font-label-md text-[10px] uppercase tracking-wider text-secondary bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">
                      {organization.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Link
              to={`/organizations/${organization.id}/edit`}
              className="inline-flex items-center gap-2 border border-outline text-primary hover:text-on-primary bg-transparent hover:bg-primary font-label-md text-label-md px-6 py-2.5 rounded-full transition-all duration-300 scale-95 active:scale-90 font-semibold justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Node
            </Link>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="font-headline-md text-[18px] text-primary font-semibold border-l-4 border-secondary pl-3">
              Corporate Description
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {organization.description || 'No detailed business description available for this registered corporate node.'}
            </p>
          </div>

          {/* Information Metadata Grid */}
          <div className="space-y-6 pt-4 border-t border-outline-variant/20">
            <h3 className="font-headline-md text-[18px] text-primary font-semibold border-l-4 border-secondary pl-3">
              Node Metadata
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* Contact Node Info */}
              <div className="space-y-2">
                <h4 className="font-label-md text-secondary tracking-wide uppercase text-[10px]">Contact Info</h4>
                <div className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                    <span>{organization.email || 'No email registered'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">call</span>
                    <span>{organization.phone || 'No phone registered'}</span>
                  </div>
                </div>
              </div>

              {/* Portal Info */}
              <div className="space-y-2">
                <h4 className="font-label-md text-secondary tracking-wide uppercase text-[10px]">Portals</h4>
                <div className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">language</span>
                    {organization.website ? (
                      <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all font-semibold">
                        {organization.website}
                      </a>
                    ) : (
                      <span>No website registered</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">link</span>
                    {organization.linkedinUrl ? (
                      <a href={organization.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all font-semibold">
                        LinkedIn Profile
                      </a>
                    ) : (
                      <span>No LinkedIn registered</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Geographic Coordinates */}
              <div className="space-y-2 md:col-span-2 pt-2 border-t border-outline-variant/10">
                <h4 className="font-label-md text-secondary tracking-wide uppercase text-[10px]">Geographic Node Coordinates</h4>
                <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                  <span>
                    {[organization.city, organization.state, organization.country]
                      .filter(Boolean)
                      .join(', ') || 'No coordinates mapped'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
