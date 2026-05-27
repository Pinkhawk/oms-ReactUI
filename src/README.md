# OfficePulse — React UI

Frontend for the Office Management System. Built with React 18, Vite, and Tailwind CSS.

## 🧰 Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Vite | Dev server + bundler |
| Tailwind CSS | Utility styling |
| Recharts | Dashboard charts |
| React Hook Form | Form handling |
| Axios | HTTP client + JWT interceptor |
| date-fns | Date formatting |
| Lucide React | Icons |

---

## 📁 Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx   # JWT-gated route wrapper
│   ├── layout/
│   │   ├── AppLayout.jsx        # Sidebar + main outlet
│   │   └── Sidebar.jsx          # Nav with role-based visibility
│   └── ui/
│       └── index.jsx            # Shared: Table, Modal, Badge, StatCard...
├── context/
│   └── AuthContext.jsx          # Auth state, login/logout, role helpers
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Employees.jsx
│   ├── Departments.jsx
│   ├── Attendance.jsx
│   ├── Leaves.jsx
│   └── Payroll.jsx
├── services/
│   └── api.js                   # Axios instance + all API calls
├── App.jsx                      # Routes
└── main.jsx                     # Entry point
```

---

## 🚀 Local Development

```bash
cp .env.example .env
npm install
npm run dev
# → http://localhost:3000
```

Make sure the backend is running at `http://localhost:80`.

---

## 🐳 Docker (with backend)

Add this service to the backend's `docker-compose.yml`:

```yaml
ui:
  build: ./office-ui
  container_name: office_ui
  ports:
    - "3000:80"
  depends_on:
    - api
  networks:
    - office_net
```

Then:
```bash
docker compose up -d
# → http://localhost:3000
```

---

## 🔐 Role-Based UI

| Role | Access |
|---|---|
| `employee` | Dashboard, own Attendance, own Leaves, own Payslips |
| `manager` | Above + review leave requests |
| `hr` | Above + all Employees, Departments, all Attendance |
| `admin` | Above + mark payroll paid, bulk process |
| `super_admin` | Full access |

Sidebar nav items are automatically hidden based on role. Protected routes redirect to `/dashboard` if role is insufficient.

---

## 🎨 Design

- **Font**: Syne (display/headings) + DM Sans (body) + JetBrains Mono (numbers/code)
- **Theme**: Dark — deep ink palette with amber accent
- **Colors**: `--accent` amber, `--jade` green, `--rose` red, `--sky` blue
- All CSS variables defined in `src/index.css`
