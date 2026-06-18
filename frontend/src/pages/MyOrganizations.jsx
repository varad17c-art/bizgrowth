import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function MyOrganizations() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/api/organizations/my')
      if (res.success && res.data) {
        setOrganizations(res.data)
      } else {
        setOrganizations([])
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve organizations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrganizations()
  }, [fetchOrganizations])

  const handleDelete = async (id) => {
    setError('')
    setDeletingId(id)
    try {
      const res = await api.delete(`/api/organizations/${id}`)
      if (res.success) {
        // Remove from local state immediately to avoid full page reloads
        setOrganizations(prev => prev.filter(org => org.id !== id))
        setDeleteConfirmId(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete the organization node')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface relative z-10 px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">sync</span>
          <p className="font-label-md text-label-md font-semibold text-on-surface-variant tracking-wider">
            Accessing Organization Registry...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile md:px-margin-desktop py-12 relative z-10">
      <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in">
        
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/20 pb-6">
          <div className="space-y-1">
            <h1 className="font-headline-xl text-headline-xl text-primary font-semibold">
              Organization Nodes
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage your registered corporate nodes and business partnerships.
            </p>
          </div>
          <Link
            to="/organizations/new"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary/95 transition-all shadow-sm font-semibold text-center justify-center self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Node
          </Link>
        </div>

        {/* Global Inline Error Banner */}
        {error && (
          <div className="p-4 bg-red-500/10 text-error rounded-lg text-left text-body-md border border-red-500/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/30 shadow-md text-center space-y-6 py-16">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline-variant mx-auto">
              <span className="material-symbols-outlined text-[36px]">corporate_fare</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-headline-md text-headline-md text-primary font-semibold">No Registered Nodes</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                You have not registered any business entities yet. Connect your organization to start networking inside the strategic ecosystem.
              </p>
            </div>
            <Link
              to="/organizations/new"
              className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-secondary/90 transition-all font-semibold"
            >
              Register First Node
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.map((org) => (
              <div 
                key={org.id} 
                className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/30 text-primary">
                        <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-[18px] leading-6 text-primary font-semibold line-clamp-1">
                          {org.name}
                        </h3>
                        {org.industry && (
                          <span className="inline-block font-label-md text-[10px] uppercase tracking-wider text-secondary bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10 mt-1">
                            {org.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">
                    {org.description || 'No corporate description provided for this business node.'}
                  </p>
                </div>

                {/* Card Actions / Inline Confirmation deletion */}
                <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  {deleteConfirmId === org.id ? (
                    <div className="w-full flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-xl p-2 animate-fade-in">
                      <span className="font-label-md text-[11px] text-error font-semibold pl-2">
                        Confirm Node Deletion?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(org.id)}
                          disabled={deletingId === org.id}
                          className="px-3 py-1.5 bg-error text-on-error font-label-md text-[11px] rounded-lg hover:bg-error/90 transition-all font-semibold"
                        >
                          {deletingId === org.id ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={deletingId === org.id}
                          className="px-3 py-1.5 border border-outline-variant text-primary font-label-md text-[11px] rounded-lg hover:bg-surface transition-all font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`/organizations/${org.id}`}
                        className="font-label-md text-label-md text-secondary hover:underline font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View Details
                      </Link>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/organizations/${org.orgId || org.id}/edit`}
                          className="px-3.5 py-1.5 border border-outline-variant text-primary font-label-md text-[11px] rounded-lg hover:bg-surface-container-low transition-all font-semibold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(org.id)}
                          className="px-3.5 py-1.5 border border-red-500/20 text-error font-label-md text-[11px] rounded-lg hover:bg-red-500/5 transition-all font-semibold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
