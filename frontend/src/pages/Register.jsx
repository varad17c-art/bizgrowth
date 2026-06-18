import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await register(name, email, password, role)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface relative z-10 px-margin-mobile">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg text-center space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary font-semibold">domain</span>
          <span className="font-headline-md text-headline-md font-bold text-primary font-semibold">BizGrowth</span>
        </Link>
        <div className="space-y-2">
          <h1 className="font-headline-xl text-headline-xl text-primary font-semibold">Create Account</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Register your enterprise node to join the global business network.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-left text-body-sm border border-red-500/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="name">
              Full Name / Enterprise Rep
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="email">
              Enterprise Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="password">
              Secure Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-body-sm font-semibold text-on-surface-variant" htmlFor="role">
              Enterprise Role Node
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-outline focus:border-primary focus:outline-none transition-all text-body-md"
            >
              <option value="client">Client Node (Corporate / MSME)</option>
              <option value="consultant">Strategic Consultant</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-primary/95 transition-all shadow-sm font-semibold flex items-center justify-center gap-2 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Registering Node...' : 'Register Account'}
            {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
          </button>
        </form>

        <div className="font-body-sm text-body-sm text-outline pt-2">
          Already have an enterprise account?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Login here
          </Link>
        </div>

        <div className="pt-2 border-t border-outline-variant/20">
          <Link to="/" className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Return to Main Portal
          </Link>
        </div>
      </div>
    </div>
  )
}
