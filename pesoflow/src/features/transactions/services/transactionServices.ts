import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Transaction } from '../../../types'
import { toISO } from '../../../utils/date'

export function subscribeToTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  // Single-field ordering needs no composite index.
  // Soft-deleted records are filtered out in calculations.ts and the UI.
  const q = query(
    collection(db, 'users', userId, 'transactions'),
    orderBy('transactionDate', 'desc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            type: data.type,
            amount: data.amount,
            walletId: data.walletId,
            categoryId: data.categoryId,
            fromWalletId: data.fromWalletId,
            toWalletId: data.toWalletId,
            debtId: data.debtId,
            debtDirection: data.debtDirection,
            debtAction: data.debtAction,
            debtPerson: data.debtPerson,
            description: data.description ?? '',
            transactionDate: toISO(data.transactionDate),
            isDeleted: data.isDeleted ?? false,
          }
        }),
      )
    },
    onError,
  )
}

interface BaseInput {
  amount: number // integer centavos
  description: string
  transactionDate: Date
}

export type NewTransactionInput =
  | (BaseInput & {
      type: 'income' | 'expense'
      walletId: string
      categoryId: string
    })
  | (BaseInput & {
      type: 'transfer'
      fromWalletId: string
      toWalletId: string
    })
  | (BaseInput & {
      type: 'debt'
      walletId: string
      debtId?: string
      debtDirection: 'borrowed' | 'lent'
      debtAction: 'initial' | 'payment'
      debtPerson: string
    })

/**
 * Creates one transaction document. A transfer is a single record, so wallet
 * balances stay consistent without needing to update anything else.
 * Firestore rejects `undefined` fields, which is why the input is a union
 * rather than one shape with optional wallet and category IDs.
 */
export async function addTransaction(userId: string, input: NewTransactionInput): Promise<void> {
  const { transactionDate, ...fields } = input
  const transactionRef = doc(collection(db, 'users', userId, 'transactions'))

  await setDoc(transactionRef, {
    ...fields,
    ...(input.type === 'debt' && !input.debtId ? { debtId: transactionRef.id } : {}),
    transactionDate: Timestamp.fromDate(transactionDate),
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}