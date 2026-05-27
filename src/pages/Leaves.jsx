import { useState, useEffect } from 'react'
import { leavesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Table, Loading, Empty, Pagination, StatusBadge, Modal, Field } from '../components/ui'
import { CalendarOff, Plus, CheckCircle, XCircle, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format, addDays } from 'date-fns'

const LEAVE_TYPES = ['casual', 'sick', 'annual', 'unpaid', 'maternity', 'paternity']

export default function Leaves() {
  const { isAtLeast } = useAuth()
  const [leaves, setLeaves]     = useState([])
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [loading, setLoading]   = useState(true)
  const [applyOpen, setApplyOpen] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [reviewModal, setReviewModal] = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      end_date:   format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      leave_type: 'casual',
    }
  })

  const load = async () => {
    setLoading(true)
    try {
      const fn = isAtLeast('manager') ? leavesApi.all : leavesApi.my
      const { data } = await fn({ page, per_page: 15 })
      setLeaves(data.leaves)
      setPages(data.pages || 1)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  const onApply = async (data) => {
    setSaving(true)
    try {
      await leavesApi.apply(data)
      setApplyOpen(false)
      reset()
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to apply leave')
    }
    setSaving(false)
  }

  const handleReview = async (action) => {
    const comment = document.getElementById('review-comment')?.value
    try {
      await leavesApi.review(reviewModal.id, { action, comment })
      setReviewModal(null)
      load()
    } catch (e) {
      alert(e.response?.data?.error)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this leave?')) return
    try { await leavesApi.cancel(id); load() }
    catch (e) { alert(e.response?.data?.error) }
  }

  const columns = [
    { key: 'employee_name', label: 'Employee',
      render: r => r.employee_name || '—' },
    { key: 'leave_type', label: 'Type',
      render: r => (
        <span className="capitalize font-mono text-xs px-2 py-1 rounded-lg"
          style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}>
          {r.leave_type}
        </span>
      )
    },
    { key: 'dates', label: 'Duration',
      render: r => (
        <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <p>{format(new Date(r.start_date), 'MMM dd')} → {format(new Date(r.end_date), 'MMM dd')}</p>
          <p style={{ color: 'var(--accent)' }}>{r.total_days} day{r.total_days > 1 ? 's' : ''}</p>
        </div>
      )
    },
    { key: 'reason', label: 'Reason',
      render: r => <span className="text-xs line-clamp-1 max-w-48" style={{ color: 'var(--text-muted)' }}>{r.reason}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {isAtLeast('manager') && r.status === 'pending' && (
            <button onClick={() => setReviewModal(r)} className="btn-ghost px-2 py-1 text-xs">Review</button>
          )}
          {r.status === 'pending' && (
            <button onClick={() => handleCancel(r.id)} className="btn-ghost px-2 py-1"
              style={{ color: 'var(--rose)', borderColor: 'transparent' }}>
              <X size={13} />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Leaves" subtitle="Manage leave requests"
        action={
          <button onClick={() => setApplyOpen(true)} className="btn-primary">
            <Plus size={15} /> Apply Leave
          </button>
        }
      />

      {loading ? <Loading /> : leaves.length === 0 ? (
        <Empty icon={CalendarOff} title="No leave records" subtitle="Apply for a leave to get started" />
      ) : (
        <>
          <Table columns={columns} data={leaves} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      {/* Apply Leave Modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit(onApply)} className="flex flex-col gap-4">
          <Field label="Leave Type">
            <select className="input" {...register('leave_type')}>
              {LEAVE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" error={errors.start_date?.message}>
              <input type="date" className="input" {...register('start_date', { required: 'Required' })} />
            </Field>
            <Field label="End Date" error={errors.end_date?.message}>
              <input type="date" className="input" {...register('end_date', { required: 'Required' })} />
            </Field>
          </div>
          <Field label="Reason" error={errors.reason?.message}>
            <textarea rows={3} className="input resize-none"
              placeholder="Briefly describe your reason..."
              {...register('reason', { required: 'Reason is required' })} />
          </Field>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setApplyOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)}
        title={`Review Leave — ${reviewModal?.employee_name}`}>
        {reviewModal && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
              <p className="text-sm font-500 mb-2" style={{ color: 'var(--text-primary)' }}>
                {reviewModal.leave_type} leave · {reviewModal.total_days} day(s)
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {format(new Date(reviewModal.start_date), 'MMM dd')} → {format(new Date(reviewModal.end_date), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{reviewModal.reason}</p>
            </div>
            <Field label="Comment (optional)">
              <textarea id="review-comment" rows={2} className="input resize-none"
                placeholder="Add a note for the employee..." />
            </Field>
            <div className="flex gap-3 justify-end">
              <button onClick={() => handleReview('rejected')} className="btn-ghost"
                style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                <XCircle size={15} /> Reject
              </button>
              <button onClick={() => handleReview('approved')} className="btn-primary">
                <CheckCircle size={15} /> Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
