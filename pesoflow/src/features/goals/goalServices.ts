import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { SavingsGoal, SavingsGoalContribution } from '../../types'
import { toISO } from '../../utils/date'

function mapGoal(document: { id: string; data: () => Record<string, unknown> }): SavingsGoal {
  const data = document.data()
  return {
    id: document.id,
    name: String(data.name ?? ''),
    targetAmount: Number(data.targetAmount ?? 0),
    savedAmount: Number(data.savedAmount ?? 0),
    targetDate: typeof data.targetDate === 'string' ? data.targetDate : undefined,
    walletIds: Array.isArray(data.walletIds) ? data.walletIds.filter((id): id is string => typeof id === 'string') : [],
    createdAt: data.createdAt,
  }
}

export function subscribeToGoals(
  userId: string,
  onData: (goals: SavingsGoal[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'users', userId, 'savingsGoals')),
    (snapshot) => onData(snapshot.docs.map(mapGoal)),
    onError,
  )
}

export function subscribeToGoalContributions(
  userId: string,
  goalId: string,
  onData: (contributions: SavingsGoalContribution[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const contributionsRef = collection(
    db,
    'users',
    userId,
    'savingsGoals',
    goalId,
    'contributions',
  )

  return onSnapshot(
    query(contributionsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      onData(
        snapshot.docs.map((document) => {
          const data = document.data()
          return {
            id: document.id,
            amount: Number(data.amount ?? 0),
            walletId: String(data.walletId ?? ''),
            createdAt: data.createdAt ? toISO(data.createdAt) : undefined,
          }
        }),
      )
    },
    onError,
  )
}

export async function createSavingsGoal(
  userId: string,
  goal: Omit<SavingsGoal, 'id' | 'savedAmount' | 'createdAt'>,
): Promise<string> {
  const { targetDate, ...goalFields } = goal
  const result = await addDoc(collection(db, 'users', userId, 'savingsGoals'), {
    ...goalFields,
    ...(targetDate ? { targetDate } : {}),
    savedAmount: 0,
    createdAt: serverTimestamp(),
  })
  return result.id
}

export async function addGoalContribution(
  userId: string,
  goalId: string,
  amount: number,
  walletId: string,
): Promise<void> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Contribution must be greater than zero.')
  }

  await runTransaction(db, async (transaction) => {
    const goalRef = doc(db, 'users', userId, 'savingsGoals', goalId)
    const goalSnapshot = await transaction.get(goalRef)
    if (!goalSnapshot.exists()) throw new Error('This savings goal no longer exists.')

    const goal = goalSnapshot.data()
    const remaining = Number(goal.targetAmount ?? 0) - Number(goal.savedAmount ?? 0)
    if (amount > remaining) throw new Error('Contribution cannot exceed the remaining goal amount.')

    const contributionRef = doc(collection(goalRef, 'contributions'))
    transaction.set(contributionRef, {
      amount,
      walletId,
      createdAt: serverTimestamp(),
    })
    transaction.update(goalRef, { savedAmount: increment(amount) })
  })
}
