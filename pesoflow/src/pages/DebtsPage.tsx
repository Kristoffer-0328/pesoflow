import { useMemo, useState } from 'react'
import { HandCoins } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useUserData } from '../features/auth/hooks/userData'
import { addTransaction } from '../features/transactions/services/transactionServices'
import { formatPeso, parsePesoToCentavos } from '../utils/money'
import { toDateInputValue } from '../utils/date'
import type { Transaction } from '../types'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition focus:border-[#278568] focus:ring-2 focus:ring-[#278568]/20'

export default function DebtsPage() {
  const { user } = useAuth()
  const { transactions, loading, error } = useUserData(toDateInputValue(new Date()).slice(0, 7))
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const debts = useMemo(() => {
    const records = new Map<string, { initial: Transaction; payments: Transaction[] }>()
    transactions
      .filter((transaction) => !transaction.isDeleted && transaction.type === 'debt')
      .forEach((transaction) => {
        const id = transaction.debtId ?? transaction.id
        const record = records.get(id) ?? { initial: transaction, payments: [] }
        if (transaction.debtAction === 'payment') record.payments.push(transaction)
        else record.initial = transaction
        records.set(id, record)
      })

    return Array.from(records, ([id, record]) => {
      const paid = record.payments.reduce((total, payment) => total + payment.amount, 0)
      return { id, ...record, paid, remaining: Math.max(record.initial.amount - paid, 0) }
    }).sort((a, b) => +new Date(b.initial.transactionDate) - +new Date(a.initial.transactionDate))
  }, [transactions])

  const closePayment = () => {
    setPaymentDebtId(null)
    setAmount('')
    setDate(toDateInputValue(new Date()))
    setNote('')
    setFormError('')
  }

  const savePayment = async (debt: (typeof debts)[number]) => {
    if (!user) return
    const centavos = parsePesoToCentavos(amount)
    if (centavos === null || centavos <= 0 || centavos > debt.remaining) {
      setFormError(`Enter a payment between ₱0.01 and ${formatPeso(debt.remaining)}.`)
      return
    }
    if (!date) {
      setFormError('Select a payment date.')
      return
    }

    const [year, month, day] = date.split('-').map(Number)
    setSaving(true)
    setFormError('')
    try {
      await addTransaction(user.uid, {
        type: 'debt',
        amount: centavos,
        description: note.trim(),
        transactionDate: new Date(year, month - 1, day, 12),
        walletId: debt.initial.walletId!,
        debtId: debt.id,
        debtDirection: debt.initial.debtDirection!,
        debtAction: 'payment',
        debtPerson: debt.initial.debtPerson ?? 'Unknown',
      })
      closePayment()
    } catch {
      setFormError('Could not save the payment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9EDF2] border-t-[#278568]" /></div>
  if (error) return <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">Couldn&apos;t load your debts: {error}</div>

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64716c] text-white"><HandCoins size={21} /></div>
        <div>
          <h1 className="text-2xl font-semibold text-[#202A35]">Debts</h1>
          <p className="text-sm text-slate-500">Track borrowed and lent money</p>
        </div>
      </header>

      {debts.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
          <p className="font-medium text-[#202A35]">No debt history yet</p>
          <p className="mt-1 text-sm text-slate-400">Use the add button to record borrowed or lent money.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {debts.map((debt) => (
            <section key={debt.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#202A35]">
                    {debt.initial.debtDirection === 'borrowed' ? 'Borrowed from' : 'Lent to'} {debt.initial.debtPerson}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {debt.initial.debtDirection === 'borrowed' ? 'Borrowed' : 'Lent'} · {new Date(debt.initial.transactionDate).toLocaleDateString('en-PH')}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${debt.remaining ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {debt.remaining ? 'Active' : 'Settled'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div><p className="text-xs text-slate-400">Original</p><p className="font-semibold">{formatPeso(debt.initial.amount)}</p></div>
                <div><p className="text-xs text-slate-400">Paid</p><p className="font-semibold">{formatPeso(debt.paid)}</p></div>
                <div><p className="text-xs text-slate-400">Remaining</p><p className="font-semibold text-[#278568]">{formatPeso(debt.remaining)}</p></div>
              </div>
              {debt.payments.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Payment history</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {debt.payments.map((payment) => (
                      <li key={payment.id} className="flex justify-between">
                        <span>{new Date(payment.transactionDate).toLocaleDateString('en-PH')}</span>
                        <span>{formatPeso(payment.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {debt.remaining > 0 && (
                paymentDebtId === debt.id ? (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <input className={inputClass} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Payment amount" />
                    <input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                    <input className={inputClass} maxLength={100} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Payment note (optional)" />
                    {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void savePayment(debt)} disabled={saving} className="flex-1 rounded-xl bg-[#278568] py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save payment'}</button>
                      <button type="button" onClick={closePayment} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => { setPaymentDebtId(debt.id); setFormError('') }} className="mt-4 w-full rounded-xl border-2 border-[#19372D] py-2.5 text-sm font-semibold text-[#19372D]">Add payment</button>
                )
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
