// ── Attendance Page ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { attendanceApi } from '../services/api'
import { PageHeader, Table, Loading, Empty, Pagination, StatusBadge } from '../components/ui'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

export default function Attendance() {
  const { isAtLeast } = useAuth()
  const [records, setRecords] = useState([])
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState('')
  const [today, setToday]     = useState(null)

  const month = new Date().getMonth() + 1
  const year  = new Date().getFullYear()

  const load = async () => {
    setLoading(true)
    try {
      const fn = isAtLeast('hr') ? attendanceApi.all : attendanceApi.my
      const { data } = await fn({ month, year, page, per_page: 20 })
      setRecords(data.records)
      setPages(data.pages || 1)
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      setToday(data.records.find(r => r.date === todayStr) || null)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  const handleCheckIn = async () => {
    setChecking('in')
    try { await attendanceApi.checkIn(); load() }
    catch (e) { alert(e.response?.data?.error) }
    setChecking('')
  }
  const handleCheckOut = async () => {
    setChecking('out')
    try { await attendanceApi.checkOut(); load() }
    catch (e) { alert(e.response?.data?.error) }
    setChecking('')
  }

  const columns = [
    { key: 'date',       label: 'Date',
      render: r => <span className="font-mono text-sm">{format(new Date(r.date), 'EEE, MMM dd')}</span> },
    { key: 'employee_name', label: 'Employee',
      render: r => r.employee_name || <span style={{ color: 'var(--text-faint)' }}>—</span> },
    { key: 'check_in',  label: 'Check In',
      render: r => <span className="font-mono text-sm" style={{ color: 'var(--jade)' }}>
        {r.check_in ? format(new Date(r.check_in), 'HH:mm') : '—'}
      </span> },
    { key: 'check_out', label: 'Check Out',
      render: r => <span className="font-mono text-sm" style={{ color: 'var(--rose)' }}>
        {r.check_out ? format(new Date(r.check_out), 'HH:mm') : '—'}
      </span> },
    { key: 'work_hours', label: 'Hours',
      render: r => <span className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
        {r.work_hours ? `${r.work_hours}h` : '—'}
      </span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Attendance" subtitle={`${format(new Date(), 'MMMM yyyy')}`}
        action={
          <div className="flex gap-2">
            {!today?.check_in && (
              <button onClick={handleCheckIn} disabled={checking === 'in'} className="btn-primary">
                <LogIn size={15} />{checking === 'in' ? 'Checking in...' : 'Check In'}
              </button>
            )}
            {today?.check_in && !today?.check_out && (
              <button onClick={handleCheckOut} disabled={checking === 'out'} className="btn-ghost"
                style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}>
                <LogOut size={15} />{checking === 'out' ? 'Checking out...' : 'Check Out'}
              </button>
            )}
          </div>
        }
      />
      {loading ? <Loading /> : records.length === 0 ? (
        <Empty icon={Clock} title="No attendance records" subtitle="Check in to start tracking" />
      ) : (
        <>
          <Table columns={columns} data={records} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
