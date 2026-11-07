import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GuestRoute from './app/routes/guestRoutes'
import ProtectedRoute from './app/routes/protectedRoutes'
import AppLayout from '../src/features/components/AppLayout'
import AuthProvider from './features/components/authProvider'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TransactionsPage from './pages/TransactionsPage'
import WalletsPage from './pages/WalletsPage'
import BudgetsPage from './pages/BudgetsPage'

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
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/wallets" element={<WalletsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/settings" element={<h1 className="text-2xl font-semibold text-[#202A35]">Settings</h1>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App