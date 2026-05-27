import { useState, useEffect } from 'react'
import { employeesApi, departmentsApi } from '../services/api'
import { PageHeader, Table, Loading, Empty, Pagination, StatusBadge, Avatar, Modal, Field, Select } from '../components/ui'
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'employee',    label: 'Employee'    },
  { value: 'manager',     label: 'Manager'     },
  { value: 'hr',          label: 'HR'          },
  { value: 'admin',       label: 'Admin'       },
  { value: 'super_admin', label: 'Super Admin' },
]

export default function Employees() {
  const [employees, setEmployees]   = useState([])
  const [departments, setDepts]     = useState([])
  const [total, setTotal]           = useState(0)
  const [pages, setPages]           = useState(1)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // null | 'create' | employee object
  const [saving, setSaving]         = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await employeesApi.list({ page, per_page: 15, role: roleFilter || undefined })
      setEmployees(data.employees)
      setTotal(data.total)
      setPages(data.pages)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [page, roleFilter])
  useEffect(() => {
    departmentsApi.list().then(({ data }) => setDepts(data.departments || []))
  }, [])

  const openCreate = () => { reset({}); setModal('create') }
  const openEdit   = (emp) => { reset(emp); setModal(emp) }
  const closeModal = () => { setModal(null); reset({}) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await employeesApi.create(data)
      } else {
        await employeesApi.update(modal.id, data)
      }
      closeModal()
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Error saving')
    }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return
    await employeesApi.delete(id)
    load()
  }

  const filtered = employees.filter(e =>
    !search || `${e.full_name} ${e.email} ${e.employee_code}`.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'name', label: 'Employee',
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.full_name} size="sm" />
          <div>
            <p className="font-500 text-sm" style={{ color: 'var(--text-primary)' }}>{e.full_name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.employee_code}</p>
          </div>
        </div>
      )
    },
    { key: 'email',       label: 'Email',      render: (e) => <span style={{ color: 'var(--text-muted)' }}>{e.email}</span> },
    { key: 'department',  label: 'Department', render: (e) => e.department || <span style={{ color: 'var(--text-faint)' }}>—</span> },
    { key: 'designation', label: 'Role',       render: (e) => (
        <span className="capitalize text-xs font-mono" style={{ color: 'var(--accent)' }}>{e.role?.replace('_', ' ')}</span>
      )
    },
    { key: 'date_of_joining', label: 'Joined', render: (e) => (
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {e.date_of_joining ? format(new Date(e.date_of_joining), 'MMM yyyy') : '—'}
        </span>
      )
    },
    { key: 'is_active', label: 'Status', render: (e) => <StatusBadge status={e.is_active ? 'active' : 'inactive'} /> },
    {
      key: 'actions', label: '',
      render: (e) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => openEdit(e)} className="btn-ghost px-2 py-1.5">
            <Pencil size={13} />
          </button>
          <button onClick={() => handleDelete(e.id, e.full_name)} className="btn-ghost px-2 py-1.5"
            style={{ color: 'var(--rose)', borderColor: 'transparent' }}>
            <Trash2 size={13} />
          </button>
        </div>
      )
    },
  ]

  const deptOptions = [
    { value: '', label: 'No Department' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ]

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${total} total employees`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Add Employee
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
          <input className="input pl-9" placeholder="Search employees..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <Empty icon={Users} title="No employees found" subtitle="Try adjusting your filters" />
      ) : (
        <>
          <Table columns={columns} data={filtered} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal open={!!modal} onClose={closeModal}
        title={modal === 'create' ? 'Add Employee' : `Edit — ${modal?.full_name}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" error={errors.first_name?.message}>
              <input className="input" {...register('first_name', { required: 'Required' })} />
            </Field>
            <Field label="Last Name" error={errors.last_name?.message}>
              <input className="input" {...register('last_name', { required: 'Required' })} />
            </Field>
          </div>
          <Field label="Email" error={errors.email?.message}>
            <input type="email" className="input" {...register('email', { required: 'Required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee Code" error={errors.employee_code?.message}>
              <input className="input" {...register('employee_code', { required: 'Required' })} />
            </Field>
            <Field label="Phone">
              <input className="input" {...register('phone')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select className="input" {...register('role')}>
                {ROLES.slice(1).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <select className="input" {...register('department_id')}>
                {deptOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Designation">
            <input className="input" {...register('designation')} />
          </Field>
          {modal === 'create' && (
            <Field label="Password" error={errors.password?.message}>
              <input type="password" className="input" {...register('password', { required: 'Required' })} />
            </Field>
          )}
          <div className="flex gap-3 justify-end mt-2">
            <button type="button" onClick={closeModal} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : modal === 'create' ? 'Create Employee' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
