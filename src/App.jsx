import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout     from './components/layout/AppLayout'

import Login       from './pages/Login'
import Register    from './pages/Register'
import Dashboard   from './pages/Dashboard'
import Employees   from './pages/Employees'
import Departments from './pages/Departments'
import Attendance  from './pages/Attendance'
import Leaves      from './pages/Leaves'
import Payroll     from './pages/Payroll'
import NotFound    from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />

          {/* Protected — all logged-in users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/attendance"  element={<Attendance />} />
              <Route path="/leaves"      element={<Leaves />} />
              <Route path="/payroll"     element={<Payroll />} />

              {/* HR+ only */}
              <Route element={<ProtectedRoute minRole="hr" />}>
                <Route path="/employees"   element={<Employees />} />
                <Route path="/departments" element={<Departments />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
