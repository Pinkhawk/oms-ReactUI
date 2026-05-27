import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Register() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const { authApi } = await import('../services/api')
      await authApi.register({
        first_name:    data.first_name,
        last_name:     data.last_name,
        email:         data.email,
        password:      data.password,
        employee_code: data.employee_code,
        phone:         data.phone,
      })
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Zap size={16} color="var(--bg-primary)" fill="var(--bg-primary)" />
          </div>
          <span className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>OfficePulse</span>
        </div>

        <h2 className="font-display font-700 text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Create account
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Join your team's workspace
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input className="input" placeholder="Jane"
                {...register('first_name', { required: 'Required' })} />
              {errors.first_name && <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" placeholder="Doe"
                {...register('last_name', { required: 'Required' })} />
              {errors.last_name && <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="jane@company.com"
              {...register('email', { required: 'Required' })} />
            {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Employee Code</label>
            <input className="input" placeholder="EMP-0042"
              {...register('employee_code', { required: 'Required' })} />
            {errors.employee_code && <p className="text-xs mt-1" style={{ color: 'var(--rose)' }}>{errors.employee_code.message}</p>}
          </div>

          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" placeholder="+91 98765 43210"
              {...register('phone')} />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-11"
                placeholder="Min 8 characters"
                {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
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
            {loading ? 'Creating account...' : (
              <><span>Create account</span><ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }} className="font-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
