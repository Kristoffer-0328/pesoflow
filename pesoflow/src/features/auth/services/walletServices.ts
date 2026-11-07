import { addDoc, collection, onSnapshot, query, serverTimestamp } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Wallet } from '../../../types'

export function subscribeToWallets(
  userId: string,
  onData: (wallets: Wallet[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'users', userId, 'wallets'))

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            name: data.name,
            type: data.type,
            provider: data.provider,
            initialBalance: data.initialBalance ?? 0,
            color: data.color,
            isActive: data.isActive ?? true,
          }
        }),
      )
    },
    onError,
  )
}

export interface NewWalletInput {
  name: string
  type: Wallet['type']
  provider?: string
  initialBalance: number
  color: string
}

export async function addWallet(userId: string, input: NewWalletInput): Promise<void> {
  await addDoc(collection(db, 'users', userId, 'wallets'), {
    ...input,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}