import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { FullScreenLoader } from './protectedRoutes'

/** Login and register pages. Signed-in users get sent to the dashboard. */
export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}