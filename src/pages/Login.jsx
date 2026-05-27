import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 shrink-0"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Zap size={16} color="var(--bg-primary)" fill="var(--bg-primary)" />
          </div>
          <span className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>OfficePulse</span>
        </div>

        <div>
          <blockquote className="font-display font-600 text-2xl leading-snug mb-4"
            style={{ color: 'var(--text-primary)' }}>
            "Your entire office,<br/>in one dashboard."
          </blockquote>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage employees, track attendance, handle leaves and payroll — all from a single, unified workspace.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'Active Employees', value: '124' },
            { label: 'Departments',      value: '8'   },
            { label: 'On Leave Today',   value: '7'   },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-3"
              style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs font-display font-500 uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="font-display font-700 text-xl" style={{ color: 'var(--accent)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <Zap size={16} color="var(--bg-primary)" fill="var(--bg-primary)" />
            </div>
            <span className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>OfficePulse</span>
          </div>

          <h2 className="font-display font-700 text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input"
                placeholder="you@company.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-11"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.password.message}</p>}
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--rose-dim)', color: 'var(--rose)', border: '1px solid var(--rose)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3 disabled:opacity-50">
              {loading ? 'Signing in...' : (
                <><span>Sign in</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)' }} className="font-500 hover:underline">
              Register
            </Link>
          </p>

          {/* OAuth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs" style={{ color: 'var(--text-faint)' }}>
              <span style={{ background: 'var(--bg-primary)', padding: '0 12px' }}>or continue with</span>
            </div>
          </div>

          <a href="/api/v1/auth/oauth/google"
            className="btn-ghost w-full justify-center py-3 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </a>
        </div>
      </div>
    </div>
  )
}
