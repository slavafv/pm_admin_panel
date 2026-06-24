import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProjectsPage } from './pages/ProjectsPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { EquipmentPage } from './pages/EquipmentPage'
import { ProjectLayout } from './pages/ProjectLayout'
import { SummaryPage } from './pages/SummaryPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { SchedulePage } from './pages/SchedulePage'
import { DashboardsPage } from './pages/DashboardsPage'
import { RisksPage } from './pages/RisksPage'
import { ReportsPage } from './pages/ReportsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/projects/:id" element={<ProjectLayout />}>
          <Route index element={<SummaryPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          {/* legacy path */}
          <Route path="setup" element={<Navigate to=".." relative="path" replace />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="risks" element={<RisksPage />} />
          <Route path="reports" element={<ReportsPage />} />
          {/* settings removed; legacy path falls back to overview */}
          <Route path="settings" element={<Navigate to=".." relative="path" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  )
}
