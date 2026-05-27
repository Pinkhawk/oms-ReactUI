import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refresh}` }
          })
          localStorage.setItem('access_token', data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
  refresh:  ()     => api.post('/auth/refresh'),
}

// ── Employees ──────────────────────────────────────────────────────────────────
export const employeesApi = {
  list:   (params) => api.get('/employees/', { params }),
  get:    (id)     => api.get(`/employees/${id}`),
  create: (data)   => api.post('/employees/', data),
  update: (id, d)  => api.put(`/employees/${id}`, d),
  delete: (id)     => api.delete(`/employees/${id}`),
}

// ── Departments ────────────────────────────────────────────────────────────────
export const departmentsApi = {
  list:   ()       => api.get('/departments/'),
  get:    (id)     => api.get(`/departments/${id}`),
  create: (data)   => api.post('/departments/', data),
  update: (id, d)  => api.put(`/departments/${id}`, d),
  delete: (id)     => api.delete(`/departments/${id}`),
}

// ── Attendance ─────────────────────────────────────────────────────────────────
export const attendanceApi = {
  checkIn:  (data)   => api.post('/attendance/check-in', data),
  checkOut: ()       => api.post('/attendance/check-out'),
  my:       (params) => api.get('/attendance/my', { params }),
  all:      (params) => api.get('/attendance/', { params }),
  update:   (id, d)  => api.put(`/attendance/${id}`, d),
}

// ── Leaves ─────────────────────────────────────────────────────────────────────
export const leavesApi = {
  apply:   (data)   => api.post('/leaves/apply', data),
  my:      (params) => api.get('/leaves/my', { params }),
  all:     (params) => api.get('/leaves/', { params }),
  review:  (id, d)  => api.put(`/leaves/${id}/review`, d),
  cancel:  (id)     => api.put(`/leaves/${id}/cancel`),
}

// ── Payroll ────────────────────────────────────────────────────────────────────
export const payrollApi = {
  list:        (params) => api.get('/payroll/', { params }),
  my:          (params) => api.get('/payroll/my', { params }),
  get:         (id)     => api.get(`/payroll/${id}`),
  create:      (data)   => api.post('/payroll/', data),
  update:      (id, d)  => api.put(`/payroll/${id}`, d),
  markPaid:    (id, d)  => api.put(`/payroll/${id}/mark-paid`, d),
  bulkProcess: (data)   => api.post('/payroll/process-bulk', data),
}

export default api
