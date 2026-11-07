import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { registerWithEmail } from '../features/auth/services/authServices'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition focus:border-[#278568] focus:ring-2 focus:ring-[#278568]/20'
const labelClass = 'mb-1 block text-sm font-medium text-[#202A35]'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = (): string => {
    if (!name.trim() || !email.trim() || !password || !confirm) return 'Please fill in all fields.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    return ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)
    try {
      // On success, onAuthStateChanged fires and GuestRoute redirects to /dashboard.
      await registerWithEmail(name.trim(), email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#278568] text-2xl font-bold text-white">
            ₱
          </div>
          <h1 className="text-2xl font-semibold text-[#202A35]">PesoFlow</h1>
          <p className="mt-1 text-sm text-slate-500">Know where your money goes.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
        >
          <h2 className="mb-6 text-lg font-semibold text-[#202A35]">Create your account</h2>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={`${inputClass} mb-4`}
          />

          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`${inputClass} mb-4`}
          />

          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <div className="relative mb-4">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={`${inputClass} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500 hover:text-[#278568]"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <label className={labelClass} htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            className={`${inputClass} mb-6`}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#278568] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6e55] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#278568] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}