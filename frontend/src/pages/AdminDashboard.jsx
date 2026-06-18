import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function AdminDashboard() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/api/users')
      if (res.success && res.data) {
        setUsers(res.data)
      } else {
        setUsers([])
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve portal members directory')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (targetUserId, newRole) => {
    setError('')
    setSuccess('')
    setUpdatingId(targetUserId)
    try {
      const res = await api.patch(`/api/users/${targetUserId}`, { role: newRole })
      if (res.success && res.user) {
        // Update user state row instantly without full page reloads
        setUsers(prev => 
          prev.map(u => u.id === targetUserId ? { ...u, role: res.user.role } : u)
        )
        setSuccess(`User role updated successfully to ${newRole}.`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to update user administrative credentials')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async (targetUserId) => {
    setError('')
    setSuccess('')
    setDeletingId(targetUserId)
    try {
      const res = await api.delete(`/api/users/${targetUserId}`)
      if (res.success) {
        // Remove user row instantly
        setUsers(prev => prev.filter(u => u.id !== targetUserId))
        setDeleteConfirmId(null)
        setSuccess('User successfully removed from the system.')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to remove user account')
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
            Loading Node Registry Directory...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile md:px-margin-desktop py-12 relative z-10">
      <div className="max-w-[1100px] mx-auto space-y-8 animate-fade-in">
        
        {/* Page Title Header */}
        <div className="border-b border-outline-variant/20 pb-6 space-y-1">
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">
            Administrative Clearance Node
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Coordinate registry roles, evaluate credentials, and enforce access parameters.
          </p>
        </div>

        {/* Feedback Messages */}
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

        {/* User Directory Table Grid */}
        <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-md card-shadow">
          <table className="w-full border-collapse">
            
            {/* Table Head */}
            <thead className="bg-surface-container border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 text-left font-label-md text-secondary tracking-wide uppercase text-[11px]">
                  Representative Name
                </th>
                <th className="px-6 py-4 text-left font-label-md text-secondary tracking-wide uppercase text-[11px]">
                  Enterprise Email
                </th>
                <th className="px-6 py-4 text-left font-label-md text-secondary tracking-wide uppercase text-[11px]">
                  Security Node Role
                </th>
                <th className="px-6 py-4 text-left font-label-md text-secondary tracking-wide uppercase text-[11px]">
                  Joined Coordinates
                </th>
                <th className="px-6 py-4 text-center font-label-md text-secondary tracking-wide uppercase text-[11px] w-[260px]">
                  Node Controls
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-outline-variant/10">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                const joinedDate = new Date(u.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })

                return (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                    
                    {/* Representative Name */}
                    <td className="px-6 py-4 font-headline-md text-[14px] leading-5 text-primary font-semibold align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30 text-primary font-semibold shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{u.name ? u.name[0].toUpperCase() : 'P'}</span>
                          )}
                        </div>
                        <div>
                          <span>{u.name || 'Anonymous Node'}</span>
                          {isSelf && (
                            <span className="ml-2 font-label-md text-[9px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Enterprise Email */}
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant align-middle">
                      {u.email}
                    </td>

                    {/* Role Badge representation */}
                    <td className="px-6 py-4 align-middle">
                      <span className={`inline-block font-label-md text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        u.role === 'admin'
                          ? 'bg-red-500/5 text-error border-red-500/10 font-bold'
                          : u.role === 'consultant'
                          ? 'bg-secondary/5 text-secondary border-secondary/10'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : u.role === 'consultant' ? 'Consultant' : 'Client'}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 font-body-sm text-body-sm text-outline align-middle">
                      {joinedDate}
                    </td>

                    {/* Node Controls Actions */}
                    <td className="px-6 py-4 align-middle text-center">
                      {isSelf ? (
                        <span className="font-label-md text-[11px] text-outline italic">
                          System Account Protected
                        </span>
                      ) : deleteConfirmId === u.id ? (
                        <div className="flex items-center justify-center gap-2 animate-fade-in">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingId === u.id}
                            className="px-3 py-1.5 bg-error text-on-error font-label-md text-[10px] rounded-lg hover:bg-error/90 transition-all font-semibold"
                          >
                            {deletingId === u.id ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deletingId === u.id}
                            className="px-3 py-1.5 border border-outline-variant text-primary font-label-md text-[10px] rounded-lg hover:bg-surface transition-all font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          
                          {/* Role Selector dropdown */}
                          <select
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-[11px] font-semibold"
                          >
                            <option value="client">Client</option>
                            <option value="consultant">Consultant</option>
                            <option value="admin">Admin</option>
                          </select>

                          {/* Delete Account */}
                          <button
                            onClick={() => setDeleteConfirmId(u.id)}
                            className="px-3.5 py-1.5 border border-red-500/20 text-error font-label-md text-[11px] rounded-lg hover:bg-red-500/5 transition-all font-semibold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Remove
                          </button>

                        </div>
                      )}
                    </td>

                  </tr>
                )
              })}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  )
}
