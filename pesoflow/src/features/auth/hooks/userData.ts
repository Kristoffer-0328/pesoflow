import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeToBudget } from '../../budgets/budgetServices'
import { subscribeToTransactions } from '../../transactions/services/transactionServices'
import { subscribeToWallets } from '../services/walletServices'
import { subscribeToCategories } from '../services/categoryServices'
import type { Budget, Category, Transaction, Wallet } from '../../../types'

/**
 * Live data for the signed-in user.
 * `null` / `undefined` means "not loaded yet"; an empty array means "loaded, nothing there".
 */
export function useUserData(monthKey: string) {
  const { user } = useAuth()
  const uid = user?.uid

  const [wallets, setWallets] = useState<Wallet[] | null>(null)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [budget, setBudget] = useState<Budget | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid) return

    const handleError = (e: Error) => setError(e.message)

    const unsubscribers = [
      subscribeToWallets(uid, setWallets, handleError),
      subscribeToCategories(uid, setCategories, handleError),
      subscribeToTransactions(uid, setTransactions, handleError),
      subscribeToBudget(uid, monthKey, setBudget, handleError),
    ]

    // Stop listening when the page unmounts, the user changes, or the month rolls over.
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [uid, monthKey])

  const loading =
    !error &&
    (wallets === null || categories === null || transactions === null || budget === undefined)

  return {
    wallets: wallets ?? [],
    categories: categories ?? [],
    transactions: transactions ?? [],
    budget: budget ?? null,
    loading,
    error,
  }
}