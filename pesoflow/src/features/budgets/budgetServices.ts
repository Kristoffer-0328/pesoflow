import { collection, limit, onSnapshot, query, where } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Budget } from '../../types'

/** Listens to the budget for one month (e.g. "2026-11"). Returns null if none is set. */
export function subscribeToBudget(
  userId: string,
  month: string,
  onData: (budget: Budget | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users', userId, 'budgets'),
    where('month', '==', month),
    limit(1),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(null)
        return
      }
      const data = snapshot.docs[0].data()
      onData({ month: data.month, totalLimit: data.totalLimit ?? 0 })
    },
    onError,
  )
}