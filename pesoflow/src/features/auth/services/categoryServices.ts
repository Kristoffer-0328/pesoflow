import { collection, onSnapshot, query } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Category } from '../../../types'

export function subscribeToCategories(
  userId: string,
  onData: (categories: Category[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'users', userId, 'categories'))

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data()
          return { id: d.id, name: data.name, type: data.type, color: data.color }
        }),
      )
    },
    onError,
  )
}