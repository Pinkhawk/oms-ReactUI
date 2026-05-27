import { useState, useEffect } from 'react'
import { payrollApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Table, Loading, Empty, Pagination, StatusBadge, Modal, Field } from '../components/ui'
import { Banknote, Plus, CheckCircle, Zap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

export default function Payroll() {
  const { isAtLeast } = useAuth()
  const [records, setRecords] = useState([])
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), hra: 0, allowances: 0, deductions: 0, tax: 0 }
  })

  const load = async () => {
    setLoading(true)
    try {
      const fn = isAtLeast('hr') ? payrollApi.list : payrollApi.my
      const { data } = await fn({ page, per_page: 15, year: new Date().getFullYear() })
      setRecords(data.payrolls || data.payslips || [])
      setPages(data.pages || 1)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  const handleMarkPaid = async (id) => {
    const ref = prompt('Payment reference (optional):')
    if (ref === null) return
    try { await payrollApi.markPaid(id, { payment_ref: ref }); load() }
    catch (e) { alert(e.response?.data?.error) }
  }

  const handleBulkProcess = async () => {
    if (!confirm('Generate payroll for all active employees this month?')) return
    setBulkLoading(true)
    try {
      await payrollApi.bulkProcess({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
      alert('Payroll processing queued! Check back shortly.')
    } catch (e) {
      alert(e.response?.data?.error)
    }
    setBulkLoading(false)
  }

  const onCreate = async (data) => {
    setSaving(true)
    try {
      await payrollApi.create({
        ...data,
        employee_id:  parseInt(data.employee_id),
        month:        parseInt(data.month),
        year:         parseInt(data.year),
        basic_salary: parseFloat(data.basic_salary),
        hra:          parseFloat(data.hra || 0),
        allowances:   parseFloat(data.allowances || 0),
        deductions:   parseFloat(data.deductions || 0),
        tax:          parseFloat(data.tax || 0),
      })
      setCreateOpen(false); reset(); load()
    } catch (e) {
      alert(e.response?.data?.error || 'Error creating payroll')
    }
    setSaving(false)
  }

  const fmtCurrency = (n) => n != null
    ? `₹${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
    : '—'

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const columns = [
    { key: 'employee_name', label: 'Employee', render: r => r.employee_name || '—' },
    { key: 'period', label: 'Period',
      render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        {MONTHS[r.month - 1]} {r.year}
      </span>
    },
    { key: 'basic_salary', label: 'Basic',
      render: r => <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{fmtCurrency(r.basic_salary)}</span> },
    { key: 'deductions', label: 'Deductions',
      render: r => <span className="font-mono text-sm" style={{ color: 'var(--rose)' }}>-{fmtCurrency(r.deductions + r.tax)}</span> },
    { key: 'net_salary', label: 'Net Salary',
      render: r => <span className="font-mono font-700 text-sm" style={{ color: 'var(--jade)' }}>{fmtCurrency(r.net_salary)}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {isAtLeast('admin') && r.status !== 'paid' && (
            <button onClick={() => handleMarkPaid(r.id)} className="btn-ghost px-2 py-1 text-xs"
              style={{ color: 'var(--jade)', borderColor: 'var(--jade)' }}>
              <CheckCircle size={12} /> Mark Paid
            </button>
          )}
          {r.paid_at && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
              {format(new Date(r.paid_at), 'MMM dd')}
            </span>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Salary and payment records"
        action={
          <div className="flex gap-2">
            {isAtLeast('admin') && (
              <button onClick={handleBulkProcess} disabled={bulkLoading} className="btn-ghost">
                <Zap size={14} />{bulkLoading ? 'Queuing...' : 'Bulk Process'}
              </button>
            )}
            {isAtLeast('hr') && (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus size={15} /> Add Payroll
              </button>
            )}
          </div>
        }
      />

      {loading ? <Loading /> : records.length === 0 ? (
        <Empty icon={Banknote} title="No payroll records" subtitle="Create or bulk-process payroll for this month" />
      ) : (
        <>
          <Table columns={columns} data={records} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Create Payroll Record">
        <form onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Employee ID" error={errors.employee_id?.message}>
              <input type="number" className="input" {...register('employee_id', { required: 'Required' })} />
            </Field>
            <Field label="Month">
              <select className="input" {...register('month')}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <input type="number" className="input" {...register('year')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Basic Salary (₹)" error={errors.basic_salary?.message}>
              <input type="number" step="0.01" className="input" {...register('basic_salary', { required: 'Required' })} />
            </Field>
            <Field label="HRA (₹)">
              <input type="number" step="0.01" className="input" {...register('hra')} />
            </Field>
            <Field label="Allowances (₹)">
              <input type="number" step="0.01" className="input" {...register('allowances')} />
            </Field>
            <Field label="Deductions (₹)">
              <input type="number" step="0.01" className="input" {...register('deductions')} />
            </Field>
            <Field label="Tax (₹)">
              <input type="number" step="0.01" className="input" {...register('tax')} />
            </Field>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setCreateOpen(false); reset() }} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
