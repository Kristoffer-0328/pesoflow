import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import type { TransactionType } from '../../../types'
import { toDateInputValue } from '../../../utils/date'
import { formatPesoInput, parsePesoToCentavos } from '../../../utils/money'
import { useAuth } from '../../auth/hooks/useAuth'
import { useTransactionOptions } from '../../auth/hooks/useTransactionsOptions'
import { addTransaction } from '../services/transactionServices'
import type { NewTransactionInput } from '../services/transactionServices'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition focus:border-[#278568] focus:ring-2 focus:ring-[#278568]/20'
const labelClass = 'mb-1 block text-sm font-medium text-[#202A35]'

const typeOptions: { value: TransactionType; label: string; active: string }[] = [
  { value: 'expense', label: 'Expense', active: 'bg-red-600 text-white' },
  { value: 'income', label: 'Income', active: 'bg-[#278568] text-white' },
  { value: 'transfer', label: 'Transfer', active: 'bg-slate-700 text-white' },
]

export default function AddTransactionModal({
  onClose,
  initialType = 'expense',
}: {
  onClose: () => void
  initialType?: TransactionType
}) {
  const { user } = useAuth()
  const { wallets, categories, loading, error: loadError } = useTransactionOptions()

  const [type, setType] = useState<TransactionType>(initialType)
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Close on Escape and lock background scrolling while open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  // Derived selections: default to sensible wallets without needing effects.
  const fromId = walletId || wallets[0]?.id || ''
  const toId = toWalletId || wallets.find((w) => w.id !== fromId)?.id || ''
  const filteredCategories = categories.filter((c) => c.type === type)
  const selectedCategoryId = filteredCategories.some((c) => c.id === categoryId) ? categoryId : ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const centavos = parsePesoToCentavos(amount)
    if (centavos === null || centavos <= 0) {
      setError('Enter an amount greater than zero (up to 2 decimal places).')
      return
    }
    if (!fromId) {
      setError(type === 'transfer' ? 'Select the wallet to transfer from.' : 'Select a wallet.')
      return
    }
    if (type === 'transfer') {
      if (!toId) {
        setError('Select the wallet to transfer to.')
        return
      }
      if (fromId === toId) {
        setError('Choose two different wallets.')
        return
      }
    } else if (!selectedCategoryId) {
      setError('Select a category.')
      return
    }
    if (!date) {
      setError('Select a date.')
      return
    }

    // Noon local time keeps the date stable regardless of timezone conversion.
    const [y, m, d] = date.split('-').map(Number)
    const base = {
      amount: centavos,
      description: description.trim(),
      transactionDate: new Date(y, m - 1, d, 12),
    }

    const input: NewTransactionInput =
      type === 'transfer'
        ? { ...base, type, fromWalletId: fromId, toWalletId: toId }
        : { ...base, type, walletId: fromId, categoryId: selectedCategoryId }

    setError('')
    setSaving(true)
    try {
      await addTransaction(user.uid, input)
      onClose() // The dashboard updates by itself through its live listeners.
    } catch {
      setError('Could not save the transaction. Please try again.')
      setSaving(false)
    }
  }

  const isTransfer = type === 'transfer'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />

      {/* Bottom sheet on mobile, centered modal on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add transaction"
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 pb-8 shadow-xl md:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#202A35]">Add Transaction</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#E9EDF2]"
          >
            <X size={18} />
          </button>
        </div>

        {loadError ? (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Couldn&apos;t load your wallets and categories: {loadError}
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E9EDF2] border-t-[#278568]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Type toggle */}
            <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-[#E9EDF2] p-1">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setType(option.value)
                    setError('')
                  }}
                  className={`rounded-lg py-2 text-sm font-medium transition ${
                    type === option.value ? option.active : 'text-slate-600 hover:text-[#202A35]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Amount */}
            <label className={labelClass} htmlFor="amount">
              Amount
            </label>
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-3 flex items-center text-lg font-semibold text-slate-400">
                ₱
              </span>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(formatPesoInput(e.target.value))}
                placeholder="0.00"
                className={`${inputClass} py-3 pl-8 text-lg font-semibold`}
              />
            </div>

            {/* Wallets */}
            <label className={labelClass} htmlFor="wallet">
              {isTransfer ? 'From wallet' : 'Wallet'}
            </label>
            <select
              id="wallet"
              value={fromId}
              onChange={(e) => setWalletId(e.target.value)}
              className={`${inputClass} mb-4`}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {isTransfer ? (
              <>
                <label className={labelClass} htmlFor="toWallet">
                  To wallet
                </label>
                <select
                  id="toWallet"
                  value={toId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className={`${inputClass} mb-4`}
                >
                  {wallets
                    .filter((w) => w.id !== fromId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
                {wallets.length < 2 && (
                  <p className="-mt-2 mb-4 text-xs text-slate-500">
                    You need at least two wallets to make a transfer.
                  </p>
                )}
              </>
            ) : (
              <>
                <label className={labelClass} htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${inputClass} mb-4`}
                >
                  <option value="">Select a category</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Date */}
            <label className={labelClass} htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputClass} mb-4`}
            />

            {/* Description */}
            <label className={labelClass} htmlFor="description">
              Note <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="description"
              type="text"
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isTransfer ? 'e.g. Top up GCash' : 'e.g. Lunch at Jollibee'}
              className={`${inputClass} mb-6`}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#278568] py-3 text-sm font-semibold text-white transition hover:bg-[#1f6e55] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save transaction'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}