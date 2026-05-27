import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loading } from '../ui'

export default function ProtectedRoute({ minRole }) {
  const { user, loading, isAtLeast } = useAuth()

  if (loading) return <Loading text="Authenticating..." />
  if (!user)   return <Navigate to="/login" replace />
  if (minRole && !isAtLeast(minRole)) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
