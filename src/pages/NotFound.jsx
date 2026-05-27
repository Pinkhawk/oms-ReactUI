import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-6"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="font-display font-800 text-8xl" style={{ color: 'var(--accent)', lineHeight: 1 }}>
        404
      </div>
      <div>
        <h1 className="font-display font-700 text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          The page you're looking for doesn't exist or was moved.
        </p>
      </div>
      <Link to="/dashboard" className="btn-primary">
        <Zap size={15} /> Back to Dashboard
      </Link>
    </div>
  )
}
