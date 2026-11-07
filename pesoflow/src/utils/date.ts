import { Timestamp } from 'firebase/firestore'

/** Month key like "2026-11", using the device's local time (Philippine time for you). */
export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Value for an <input type="date">, e.g. "2026-11-07", in local time. */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Firestore Timestamp -> ISO string. Falls back to now for a timestamp still pending on the server. */
export function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return new Date().toISOString()
}