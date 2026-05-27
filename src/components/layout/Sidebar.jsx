import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Building2, Clock, CalendarOff,
  Banknote, LogOut, ChevronRight, Zap
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   roles: null },
  { to: '/employees',   icon: Users,           label: 'Employees',   roles: ['hr', 'admin', 'super_admin'] },
  { to: '/departments', icon: Building2,        label: 'Departments', roles: ['hr', 'admin', 'super_admin'] },
  { to: '/attendance',  icon: Clock,            label: 'Attendance',  roles: null },
  { to: '/leaves',      icon: CalendarOff,      label: 'Leaves',      roles: null },
  { to: '/payroll',     icon: Banknote,         label: 'Payroll',     roles: null },
]

export default function Sidebar() {
  const { user, logout, isAtLeast } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const visible = NAV.filter(n => !n.roles || n.roles.some(r => isAtLeast(r)))

  return (
    <aside style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
      className="w-64 min-h-screen flex flex-col p-4 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent)' }}>
          <Zap size={16} color="var(--bg-primary)" fill="var(--bg-primary)" />
        </div>
        <span className="font-display font-700 text-lg tracking-tight"
          style={{ color: 'var(--text-primary)' }}>
          OfficePulse
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="px-3 mb-2 text-xs font-display font-600 tracking-widest uppercase"
          style={{ color: 'var(--text-faint)' }}>Menu</p>

        {visible.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
            <Icon size={17} />
            <span>{label}</span>
            <ChevronRight size={13} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2"
          style={{ background: 'var(--bg-hover)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-700 shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-500 truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs truncate capitalize" style={{ color: 'var(--text-muted)' }}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-link w-full text-left"
          style={{ color: 'var(--rose)' }}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
