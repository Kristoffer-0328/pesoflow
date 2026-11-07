import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
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
      onData({
        id: snapshot.docs[0].id,
        month: data.month,
        totalLimit: data.totalLimit ?? 0,
        name: data.name,
        template: data.template,
        planType: data.planType,
        startDate: data.startDate,
        endDate: data.endDate,
        groups: data.groups,
        allocations: data.allocations,
      })
    },
    onError,
  )
}

export function subscribeToBudgets(
  userId: string,
  onData: (budgets: Budget[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'users', userId, 'budgets'))

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((document) => {
          const data = document.data()
          return {
            id: document.id,
            month: data.month,
            totalLimit: data.totalLimit ?? 0,
            name: data.name,
            template: data.template,
            planType: data.planType,
            startDate: data.startDate,
            endDate: data.endDate,
            groups: data.groups,
            allocations: data.allocations,
          }
        }),
      )
    },
    onError,
  )
}

export async function createBudget(
  userId: string,
  budget: Budget,
): Promise<string> {
  const { allocations, groups, ...budgetFields } = budget
  delete budgetFields.id
  const document = await addDoc(collection(db, 'users', userId, 'budgets'), {
    ...budgetFields,
    ...(allocations ? { allocations } : {}),
    ...(groups ? { groups } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return document.id
}