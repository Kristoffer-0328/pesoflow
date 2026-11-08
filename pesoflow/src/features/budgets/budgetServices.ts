import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Budget } from '../../types'

const getBudgetFromDocument = (document: QueryDocumentSnapshot<DocumentData>): Budget => {
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
    funding: data.funding,
    allocations: data.allocations,
  }
}

/** Listens to every budget for one month (e.g. "2026-11"). */
export function subscribeToBudgetsForMonth(
  userId: string,
  month: string,
  onData: (budgets: Budget[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users', userId, 'budgets'),
    where('month', '==', month),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map(getBudgetFromDocument))
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
      onData(snapshot.docs.map(getBudgetFromDocument))
    },
    onError,
  )
}

export function getBudgetSelectionKey(userId: string, month: string) {
  return `pesoflow:dashboard-budget:${userId}:${month}`
}

export function getSelectedBudgetId(userId: string, month: string) {
  return window.localStorage.getItem(getBudgetSelectionKey(userId, month))
}

export function setSelectedBudgetId(userId: string, month: string, budgetId: string) {
  window.localStorage.setItem(getBudgetSelectionKey(userId, month), budgetId)
}

export async function createBudget(
  userId: string,
  budget: Budget,
): Promise<string> {
  const { allocations, groups, funding, ...budgetFields } = budget
  delete budgetFields.id
  const document = await addDoc(collection(db, 'users', userId, 'budgets'), {
    ...budgetFields,
    ...(allocations ? { allocations } : {}),
    ...(groups ? { groups } : {}),
    ...(funding ? { funding } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return document.id
}