import { useEffect, useState } from 'react'
import { subscribeToCategories } from '../services/categoryServices'
import type { Category, Wallet } from '../../../types'
import { useAuth } from '../../auth/hooks/useAuth'
import { subscribeToWallets } from '../services/walletServices'

export function useTransactionOptions() {
  const { user } = useAuth()
  const uid = user?.uid

  const [wallets, setWallets] = useState<Wallet[] | null>(null)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid) return

    const handleError = (e: Error) => setError(e.message)
    const unsubscribers = [
      subscribeToWallets(uid, setWallets, handleError),
      subscribeToCategories(uid, setCategories, handleError),
    ]

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [uid])

  return {
    wallets: (wallets ?? []).filter((w) => w.isActive),
    categories: categories ?? [],
    loading: !error && (wallets === null || categories === null),
    error,
  }
}