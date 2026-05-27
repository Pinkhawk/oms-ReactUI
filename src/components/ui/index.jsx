import clsx from 'clsx'
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display font-700 text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'amber', trend }) {
  const colors = {
    amber: { bg: 'var(--accent-dim)', fg: 'var(--accent)' },
    jade:  { bg: 'var(--jade-dim)',   fg: 'var(--jade)'   },
    rose:  { bg: 'var(--rose-dim)',   fg: 'var(--rose)'   },
    sky:   { bg: 'var(--sky-dim)',    fg: 'var(--sky)'    },
  }
  const c = colors[color] || colors.amber
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-display font-600 tracking-widest uppercase"
          style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: c.bg }}>
          <Icon size={17} color={c.fg} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display font-700 text-4xl" style={{ color: 'var(--text-primary)' }}>
          {value}
        </span>
        {trend && (
          <span className="text-xs mb-1.5 font-mono"
            style={{ color: trend > 0 ? 'var(--jade)' : 'var(--rose)' }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'muted' }) {
  return <span className={clsx('badge', `badge-${variant}`)}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = {
    active:    ['jade',  'Active'],
    inactive:  ['muted', 'Inactive'],
    present:   ['jade',  'Present'],
    absent:    ['rose',  'Absent'],
    half_day:  ['amber', 'Half Day'],
    on_leave:  ['sky',   'On Leave'],
    pending:   ['amber', 'Pending'],
    approved:  ['jade',  'Approved'],
    rejected:  ['rose',  'Rejected'],
    cancelled: ['muted', 'Cancelled'],
    paid:      ['jade',  'Paid'],
    processed: ['sky',   'Processed'],
  }
  const [variant, label] = map[status] || ['muted', status]
  return <Badge variant={variant}>{label}</Badge>
}

// ── Loading ───────────────────────────────────────────────────────────────────
export function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-20 gap-3"
      style={{ color: 'var(--text-muted)' }}>
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm font-display">{text}</span>
    </div>
  )
}

// ── Error ─────────────────────────────────────────────────────────────────────
export function ErrorMsg({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl"
      style={{ background: 'var(--rose-dim)', border: '1px solid var(--rose)', color: 'var(--rose)' }}>
      <AlertCircle size={16} />
      <span className="text-sm">{message || 'Something went wrong'}</span>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function Empty({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{ background: 'var(--bg-hover)' }}>
          <Icon size={24} style={{ color: 'var(--text-faint)' }} />
        </div>
      )}
      <p className="font-display font-600" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {subtitle && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, keyField = 'id' }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-display font-600 text-xs tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: 'var(--bg-card)' }}>
          {data.map((row) => (
            <tr key={row[keyField]} className="table-row">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="btn-ghost px-3 py-2 disabled:opacity-30">
        <ChevronLeft size={15} />
      </button>
      <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
        {page} / {pages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page === pages} className="btn-ghost px-3 py-2 disabled:opacity-30">
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,7,10,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="card w-full max-w-lg p-6 animate-slide-up"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost px-2 py-1 text-xs">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Form Field ────────────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs mt-0.5" style={{ color: 'var(--rose)' }}>{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ options, ...props }) {
  return (
    <select className="input" {...props}
      style={{ background: 'var(--bg-secondary)', color: props.value ? 'var(--text-primary)' : 'var(--text-faint)' }}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-display font-700 shrink-0', sizes[size])}
      style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
      {initials}
    </div>
  )
}
