import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GuestRoute from './app/routes/guestRoutes'
import ProtectedRoute from './app/routes/protectedRoutes'
import AppLayout from '../src/features/components/AppLayout'
import AuthProvider from './features/components/authProvider'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WalletsPage from './pages/WalletsPage'

const Placeholder = ({ title }: { title: string }) => (
  <h1 className="text-2xl font-semibold text-[#202A35]">{title}</h1>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<Placeholder title="Transactions" />} />
              <Route path="/wallets" element={<WalletsPage />} />
              <Route path="/budgets" element={<Placeholder title="Budgets" />} />
              <Route path="/reports" element={<Placeholder title="Reports" />} />
              <Route path="/settings" element={<Placeholder title="Settings" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App