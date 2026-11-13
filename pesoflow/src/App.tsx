import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GuestRoute from './app/routes/guestRoutes'
import ProtectedRoute from './app/routes/protectedRoutes'
import AppLayout from '../src/features/components/AppLayout'
import AuthProvider from './features/components/authProvider'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountDeletedPage from './pages/AccountDeletedPage'
import SplashScreen from './pages/SplashScreen'
import TermsPage from './pages/TermsPage'
import TransactionsPage from './pages/TransactionsPage'
import WalletsPage from './pages/WalletsPage'
import BudgetsPage from './pages/BudgetsPage'
import GoalsPage from './pages/GoalsPage'
import SettingsPage from './pages/SettingsPage'
import DebtsPage from './pages/DebtsPage'
import { useAuth } from './features/auth/hooks/useAuth'
import { canUsePinkTheme, pinkThemeStorageKey } from './utils/theme'

function ThemeController() {
  const { user } = useAuth()

  useEffect(() => {
    const applyTheme = () => {
      const enabled = canUsePinkTheme(user?.email) && localStorage.getItem(pinkThemeStorageKey) === 'true'
      document.documentElement.dataset.theme = enabled ? 'pink' : ''
    }

    applyTheme()
    window.addEventListener('storage', applyTheme)
    window.addEventListener('pesoflow-theme-change', applyTheme)
    return () => {
      window.removeEventListener('storage', applyTheme)
      window.removeEventListener('pesoflow-theme-change', applyTheme)
    }
  }, [user?.email])

  return null
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeController />
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Routes>
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/account-deleted" element={<AccountDeletedPage />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/debts" element={<DebtsPage />} />
                <Route path="/wallets" element={<WalletsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App