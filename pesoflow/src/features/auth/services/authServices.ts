import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { auth, db } from '../../../lib/firebase'
import { defaultCategories, defaultWallet } from '../../../lib/defaultData'

function toFriendlyError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return new Error('Invalid email or password.')
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists.')
      case 'auth/weak-password':
        return new Error('Password must be at least 6 characters.')
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.')
      case 'auth/too-many-requests':
        return new Error('Too many attempts. Please try again later.')
      case 'auth/network-request-failed':
        return new Error('Network error. Check your connection.')
    }
  }
  return new Error('Something went wrong. Please try again.')
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (err) {
    throw toFriendlyError(err)
  }
}

export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string,
): Promise<void> {
  let createdUser: User | null = null

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    createdUser = user
    await updateProfile(user, { displayName })

    // One atomic write: profile + default categories + starter wallet.
    const userRef = doc(db, 'users', user.uid)
    const now = serverTimestamp()
    const batch = writeBatch(db)

    batch.set(userRef, {
      displayName,
      email,
      currency: 'PHP',
      createdAt: now,
      updatedAt: now,
    })

    defaultCategories.forEach((category) => {
      batch.set(doc(collection(userRef, 'categories')), {
        ...category,
        isDefault: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    })

    batch.set(doc(collection(userRef, 'wallets')), {
      ...defaultWallet,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    await batch.commit()
  } catch (err) {
    // Roll back the auth account if setup failed, so nobody ends up
    // with a login but no profile.
    if (createdUser) await createdUser.delete().catch(() => {})
    throw toFriendlyError(err)
  }
}

export async function logout(): Promise<void> {
  await signOut(auth)
}