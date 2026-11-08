import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AccountDeletedPage() {
  useEffect(() => {
    window.sessionStorage.removeItem('pesoflow-account-deleted')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#278568] text-2xl font-bold text-white">
          ✓
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-[#202A35]">Account deleted</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your PesoFlow account and financial data have been permanently deleted.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block bg-[#278568] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f6e55]"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  )
}
