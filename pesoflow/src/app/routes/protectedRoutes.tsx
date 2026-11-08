import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9EDF2] border-t-[#278568]" />
    </div>
  )
}

/** Only signed-in users get through. Everyone else goes to /login. */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!user) {
    const accountWasDeleted = window.sessionStorage.getItem('pesoflow-account-deleted') === 'true'
    return <Navigate to={accountWasDeleted ? '/account-deleted' : '/login'} replace />
  }
  return <Outlet />
}