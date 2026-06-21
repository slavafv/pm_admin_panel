import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectLayout } from './pages/ProjectLayout'
import { SummaryPage } from './pages/SummaryPage'
import { SetupPage } from './pages/SetupPage'
import { SchedulePage } from './pages/SchedulePage'
import { DashboardsPage } from './pages/DashboardsPage'
import { ReportsPage } from './pages/ReportsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectLayout />}>
          <Route index element={<SummaryPage />} />
          <Route path="setup" element={<SetupPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="reports" element={<ReportsPage />} />
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
