import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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

/**
 * Creates one transaction document. A transfer is a single record, so wallet
 * balances stay consistent without needing to update anything else.
 * Firestore rejects `undefined` fields, which is why the input is a union
 * rather than one shape with optional wallet and category IDs.
 */
export async function addTransaction(userId: string, input: NewTransactionInput): Promise<void> {
  const { transactionDate, ...fields } = input

  await addDoc(collection(db, 'users', userId, 'transactions'), {
    ...fields,
    transactionDate: Timestamp.fromDate(transactionDate),
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}