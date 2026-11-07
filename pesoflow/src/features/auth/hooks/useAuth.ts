import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}