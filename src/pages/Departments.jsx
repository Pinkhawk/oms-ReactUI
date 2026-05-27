import { useState, useEffect } from 'react'
import { departmentsApi } from '../services/api'
import { PageHeader, Loading, Empty, Modal, Field } from '../components/ui'
import { Building2, Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function Departments() {
  const [depts, setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await departmentsApi.list()
      setDepts(data.departments || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { reset({}); setModal('create') }
  const openEdit   = (d)  => { reset(d);  setModal(d) }
  const closeModal = () => { setModal(null); reset({}) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (modal === 'create') await departmentsApi.create(data)
      else await departmentsApi.update(modal.id, data)
      closeModal(); load()
    } catch (e) {
      alert(e.response?.data?.error || 'Error')
    }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await departmentsApi.delete(id); load() }
    catch (e) { alert(e.response?.data?.error) }
  }

  if (loading) return <Loading />

  return (
    <div>
      <PageHeader title="Departments" subtitle={`${depts.length} departments`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Add Department
          </button>
        }
      />

      {depts.length === 0 ? (
        <Empty icon={Building2} title="No departments yet" subtitle="Create your first department" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {depts.map(dept => (
            <div key={dept.id} className="card p-5 flex flex-col gap-4 animate-slide-up">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-dim)' }}>
                  <Building2 size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="btn-ghost px-2 py-1.5">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(dept.id, dept.name)}
                    className="btn-ghost px-2 py-1.5" style={{ color: 'var(--rose)', borderColor: 'transparent' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>
                  {dept.name}
                </h3>
                {dept.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {dept.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <Users size={13} style={{ color: 'var(--text-faint)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {dept.employee_count} employee{dept.employee_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={closeModal}
        title={modal === 'create' ? 'New Department' : `Edit — ${modal?.name}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Department Name" error={errors.name?.message}>
            <input className="input" placeholder="e.g. Engineering"
              {...register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Description">
            <textarea rows={3} className="input resize-none"
              placeholder="What does this department do?"
              {...register('description')} />
          </Field>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={closeModal} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : modal === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
