import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { attendanceApi, leavesApi, employeesApi } from '../services/api'
import { StatCard, Loading, ErrorMsg, StatusBadge, Avatar } from '../components/ui'
import { Users, Clock, CalendarOff, Banknote, LogIn, LogOut } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

// Dummy weekly data — replace with real API aggregate in production
const weeklyData = [
  { day: 'Mon', present: 88, absent: 12 },
  { day: 'Tue', present: 92, absent: 8  },
  { day: 'Wed', present: 85, absent: 15 },
  { day: 'Thu', present: 90, absent: 10 },
  { day: 'Fri', present: 78, absent: 22 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-4 py-3 text-xs" style={{ minWidth: 120 }}>
      <p className="font-display font-700 mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, isAtLeast } = useAuth()
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [pendingLeaves, setPendingLeaves]     = useState([])
  const [stats, setStats]                     = useState({ employees: 0, present: 0, onLeave: 0 })
  const [loading, setLoading]                 = useState(true)
  const [checking, setChecking]               = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [attRes, leaveRes] = await Promise.all([
          attendanceApi.my({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
          leavesApi.my({ status: 'pending' }),
        ])
        const today = format(new Date(), 'yyyy-MM-dd')
        const todayRec = attRes.data.records?.find(r => r.date === today)
        setTodayAttendance(todayRec || null)
        setPendingLeaves(leaveRes.data.leaves?.slice(0, 4) || [])

        if (isAtLeast('hr')) {
          const empRes = await employeesApi.list({ per_page: 1 })
          setStats(s => ({ ...s, employees: empRes.data.total }))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleCheckIn = async () => {
    setChecking('in')
    try {
      const { data } = await attendanceApi.checkIn()
      setTodayAttendance(data.attendance)
    } catch (e) {
      alert(e.response?.data?.error || 'Check-in failed')
    }
    setChecking('')
  }

  const handleCheckOut = async () => {
    setChecking('out')
    try {
      const { data } = await attendanceApi.checkOut()
      setTodayAttendance(data.attendance)
    } catch (e) {
      alert(e.response?.data?.error || 'Check-out failed')
    }
    setChecking('')
  }

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-display mb-1" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
          <h1 className="font-display font-700 text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'var(--accent)' }}>{user?.first_name}</span> 👋
          </h1>
        </div>

        {/* Check in/out widget */}
        <div className="card p-4 flex flex-col gap-3 min-w-52">
          <p className="text-xs font-display font-600 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Today's Attendance
          </p>
          {todayAttendance ? (
            <>
              <div className="flex flex-col gap-1 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>In: <span style={{ color: 'var(--jade)' }}>
                  {todayAttendance.check_in ? format(new Date(todayAttendance.check_in), 'HH:mm') : '—'}
                </span></span>
                <span>Out: <span style={{ color: todayAttendance.check_out ? 'var(--rose)' : 'var(--text-faint)' }}>
                  {todayAttendance.check_out ? format(new Date(todayAttendance.check_out), 'HH:mm') : '—'}
                </span></span>
              </div>
              {!todayAttendance.check_out && (
                <button onClick={handleCheckOut} disabled={checking === 'out'}
                  className="btn-ghost text-xs justify-center py-2"
                  style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}>
                  <LogOut size={13} />
                  {checking === 'out' ? 'Checking out...' : 'Check Out'}
                </button>
              )}
            </>
          ) : (
            <button onClick={handleCheckIn} disabled={checking === 'in'}
              className="btn-primary text-xs justify-center py-2.5">
              <LogIn size={13} />
              {checking === 'in' ? 'Checking in...' : 'Check In'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Employees" value={stats.employees || '—'} icon={Users}    color="sky"   />
        <StatCard label="Present Today"   value={stats.present  || '—'} icon={Clock}    color="jade"  />
        <StatCard label="On Leave"        value={stats.onLeave  || '—'} icon={CalendarOff} color="amber" />
        <StatCard label="Pending Leaves"  value={pendingLeaves.length}  icon={Banknote} color="rose"  />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Attendance chart */}
        <div className="card p-6 lg:col-span-2">
          <p className="font-display font-700 mb-1" style={{ color: 'var(--text-primary)' }}>
            Weekly Attendance
          </p>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>This week's presence overview</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#8c8ca3', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8c8ca3', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333352' }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#34d399" strokeWidth={2} fill="url(#present)" />
              <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#fb7185" strokeWidth={2} fill="url(#absent)"  />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pending leaves */}
        <div className="card p-6 flex flex-col gap-4">
          <p className="font-display font-700" style={{ color: 'var(--text-primary)' }}>
            Pending Leaves
          </p>
          {pendingLeaves.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-faint)' }}>
              No pending leaves 🎉
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingLeaves.map(leave => (
                <div key={leave.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-hover)' }}>
                  <Avatar name={leave.employee_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-500 truncate" style={{ color: 'var(--text-primary)' }}>
                      {leave.employee_name}
                    </p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                      {leave.leave_type} · {leave.total_days}d
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
