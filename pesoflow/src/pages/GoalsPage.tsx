import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, Plus, Target, X } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { addGoalContribution, createSavingsGoal, subscribeToGoalContributions, subscribeToGoals } from '../features/goals/goalServices'
import type { SavingsGoal, SavingsGoalContribution, Wallet } from '../types'
import { formatPeso, parsePesoToCentavos } from '../utils/money'
import { getWalletBalance } from '../utils/calculation'
import { useUserData } from '../features/auth/hooks/userData'
import { getMonthKey } from '../utils/date'

const inputClass = 'w-full rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none focus:border-[#278568]'

export default function GoalsPage() {
  const { user } = useAuth()
  const { wallets, transactions } = useUserData(getMonthKey(new Date()))
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [bookGoal, setBookGoal] = useState<SavingsGoal | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    return subscribeToGoals(user.uid, setGoals, (loadError) => setError(loadError.message))
  }, [user])

  return (
    <div className="max-w-5xl space-y-7">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#278568]">Savings goals</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#202A35]">What are you saving for?</h1>
          <p className="mt-2 text-sm text-slate-500">Goals track money you plan to accumulate, separate from monthly spending budgets.</p>
        </div>
        <button type="button" onClick={() => { setError(''); setShowCreator(true) }} className="flex items-center gap-2 rounded-xl bg-[#278568] px-4 py-3 text-sm font-semibold text-white">
          <Plus size={18} /> New goal
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      {goals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Target className="mx-auto text-[#278568]" size={34} />
          <h2 className="mt-3 font-semibold text-[#202A35]">No savings goals yet</h2>
          <p className="mt-1 text-sm text-slate-500">Create a trip, emergency fund, or other future goal.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              wallets={wallets}
              onOpen={() => setBookGoal(goal)}
            />
          ))}
        </div>
      )}

      {showCreator && user && (
        <GoalCreator
          wallets={wallets}
          transactions={transactions}
          onClose={() => setShowCreator(false)}
          onSave={async (goal) => {
            try {
              await createSavingsGoal(user.uid, goal)
              setShowCreator(false)
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : 'Could not create goal.')
            }
          }}
        />
      )}
      {bookGoal && user && (
        <GoalBook
          userId={user.uid}
          goal={bookGoal}
          wallets={wallets}
          onClose={() => setBookGoal(null)}
        />
      )}
    </div>
  )
}

function GoalCard({
  goal,
  wallets,
  onOpen,
}: {
  goal: SavingsGoal
  wallets: Wallet[]
  onOpen: () => void
}) {
  const [now] = useState(() => Date.now())
  const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0)
  const sourceNames = goal.walletIds.map((id) => wallets.find((wallet) => wallet.id === id)?.name).filter(Boolean).join(', ')
  const months = goal.targetDate ? Math.max(1, Math.ceil((new Date(`${goal.targetDate}T00:00:00`).getTime() - now) / (1000 * 60 * 60 * 24 * 30.4375))) : null
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[#202A35]">{goal.name}</h2>
          <p className="mt-1 text-xs text-slate-500">{sourceNames || 'No source wallet selected'}</p>
        </div>
        {goal.targetDate && <span className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={14} /> {goal.targetDate}</span>}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <strong className="text-2xl text-[#202A35]">{formatPeso(goal.savedAmount)}</strong>
        <span className="text-sm text-slate-500">of {formatPeso(goal.targetAmount)}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E9EDF2]"><div className="h-full rounded-full bg-[#278568]" style={{ width: `${progress}%` }} /></div>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>{Math.round(progress)}% saved</span>
        <span>{formatPeso(remaining)} remaining</span>
      </div>
      {months && remaining > 0 && <p className="mt-3 rounded-lg bg-[#F7F8FA] px-3 py-2 text-xs text-slate-600">Suggested monthly saving: <strong>{formatPeso(Math.ceil(remaining / months))}</strong></p>}
      <button type="button" onClick={onOpen} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-[#278568]">
        <BookOpen size={16} /> Open goal ledger
      </button>
    </article>
  )
}

function GoalBook({
  userId,
  goal,
  wallets,
  onClose,
}: {
  userId: string
  goal: SavingsGoal
  wallets: Wallet[]
  onClose: () => void
}) {
  const [page, setPage] = useState(0)
  const [contributions, setContributions] = useState<SavingsGoalContribution[]>([])
  const [historyError, setHistoryError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState(goal.walletIds[0] ?? '')
  const [saving, setSaving] = useState(false)
  const rowsPerPage = 10
  const pageCount = Math.max(1, Math.ceil(contributions.length / rowsPerPage))
  const pageContributions = contributions.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0

  const saveContribution = async () => {
    const parsedAmount = parsePesoToCentavos(amount)
    if (!goal.id || !parsedAmount || !walletId) return
    setSaving(true)
    setHistoryError('')
    try {
      await addGoalContribution(userId, goal.id, parsedAmount, walletId)
      setAmount('')
      setIsAdding(false)
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Could not add contribution.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!goal.id) return
    return subscribeToGoalContributions(userId, goal.id, setContributions, (error) => {
      setHistoryError(error.message)
    })
  }, [goal.id, userId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-2 sm:p-6">
      <section role="dialog" aria-modal="true" aria-label={`${goal.name} savings ledger`} className="relative max-h-[calc(100dvh-1rem)] w-full max-w-[calc(100vw-1rem)] overflow-y-auto md:max-h-none md:max-w-4xl md:overflow-visible">
        <div className="absolute right-2 top-2 z-20 md:right-3 md:top-3">
          <button type="button" onClick={onClose} aria-label="Close goal ledger" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#6B3F25] bg-[#FFF9E8] text-[#6B3F25] shadow-lg sm:h-10 sm:w-10">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 overflow-hidden rounded-[1.25rem] border-4 border-[#6B3F25] bg-[#E4C99A] shadow-2xl md:grid-cols-2">
          <div className="flex min-h-[12rem] flex-col justify-between bg-[#7A482B] p-5 text-[#FFF7DD] sm:min-h-[16rem] sm:p-8 md:min-h-[36rem]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F3D69C]">Savings journal</p>
              <BookOpen className="mt-5 text-[#F3D69C] sm:mt-12" size={42} />
              <h2 className="mt-3 break-words text-2xl font-semibold leading-tight sm:mt-6 sm:text-4xl">{goal.name}</h2>
              <p className="mt-2 text-xs text-[#F3D69C] sm:mt-4 sm:text-sm">A record of every contribution toward your goal.</p>
            </div>
            <div>
              <div className="h-3 overflow-hidden rounded-full bg-[#4F2C1C]"><div className="h-full bg-[#F3D69C]" style={{ width: `${progress}%` }} /></div>
              <p className="mt-3 text-sm">{formatPeso(goal.savedAmount)} saved of {formatPeso(goal.targetAmount)}</p>
            </div>
          </div>
          <div className="min-h-[27rem] bg-[#FFF9E8] p-4 text-[#3D3328] sm:p-8 md:min-h-[36rem]">
            <div className="border-b-2 border-[#8E806C] pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6C6258]">Contribution ledger</p>
              <div className="mt-2 grid grid-cols-[2rem_1fr_5rem] gap-2 text-xs font-semibold uppercase text-[#6C6258]">
                <span>No.</span><span>Date · Wallet</span><span className="text-right">Amount</span>
              </div>
            </div>
            {historyError ? (
              <p role="alert" className="mt-6 text-sm text-red-600">{historyError}</p>
            ) : (
              <div className="mt-2">
                {pageContributions.map((contribution, index) => {
                  const walletName = wallets.find((wallet) => wallet.id === contribution.walletId)?.name ?? 'Unknown wallet'
                  const date = typeof contribution.createdAt === 'string'
                    ? new Date(contribution.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Pending date'
                  return (
                    <div key={contribution.id} className="grid min-h-12 grid-cols-[2rem_1fr_5rem] items-center gap-2 border-b border-[#D8CCB4] text-xs">
                      <span>{page * rowsPerPage + index + 1}</span>
                      <span><strong className="block font-medium">{date}</strong><span className="text-[#756B60]">{walletName}</span></span>
                      <strong className="text-right text-[#247354]">{formatPeso(contribution.amount)}</strong>
                    </div>
                  )
                })}
                {isAdding && page === pageCount - 1 && (
                  <div className="grid min-h-16 grid-cols-[2rem_1fr_5rem] items-center gap-2 border-b border-[#D8CCB4] text-xs">
                    <span>{contributions.length + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-[#756B60]">New contribution</p>
                      <select
                        value={walletId}
                        onChange={(event) => setWalletId(event.target.value)}
                        className="mt-1 max-w-full border-b border-[#8E806C] bg-transparent py-1 text-xs outline-none"
                        aria-label="Contribution wallet"
                      >
                        {wallets.filter((wallet) => goal.walletIds.includes(wallet.id)).map((wallet) => (
                          <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[#756B60]">₱</span>
                      <input
                        autoFocus
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            void saveContribution()
                          }
                        }}
                        placeholder="0.00"
                        className="w-16 border-b border-[#247354] bg-transparent py-1 text-right text-xs outline-none"
                        aria-label="Contribution amount"
                      />
                      <button
                        type="button"
                        onClick={() => void saveContribution()}
                        disabled={!parsePesoToCentavos(amount) || !walletId || saving}
                        aria-label="Save new contribution"
                        className="text-[#247354] disabled:opacity-30"
                      >
                        <Check size={15} />
                      </button>
                      <button type="button" onClick={() => { setIsAdding(false); setAmount('') }} aria-label="Cancel new contribution" className="ml-1 text-[#9B4B3B]">
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                )}
                {contributions.length === 0 && !isAdding && <p className="py-12 text-center text-sm text-[#756B60]">No contributions recorded yet.</p>}
              </div>
            )}
            <div className="mt-5 flex items-center justify-between border-t-2 border-[#8E806C] pt-3">
              <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0} className="flex items-center gap-1 text-sm font-semibold text-[#247354] disabled:opacity-30"><ChevronLeft size={16} /> Previous</button>
              <span className="text-xs text-[#756B60]">Page {page + 1} of {pageCount}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(current + 1, pageCount - 1))} disabled={page >= pageCount - 1} className="flex items-center gap-1 text-sm font-semibold text-[#247354] disabled:opacity-30">Next <ChevronRight size={16} /></button>
            </div>
            <button
              type="button"
              onClick={() => {
                setHistoryError('')
                setIsAdding(true)
                setPage(pageCount - 1)
              }}
              disabled={goal.savedAmount >= goal.targetAmount || isAdding || saving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#247354] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus size={16} /> Add contribution
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function GoalCreator({ wallets, transactions, onClose, onSave }: { wallets: Wallet[]; transactions: import('../types').Transaction[]; onClose: () => void; onSave: (goal: Omit<SavingsGoal, 'id' | 'savedAmount' | 'createdAt'>) => Promise<void> }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [walletIds, setWalletIds] = useState<string[]>([])
  const balances = useMemo(() => new Map(wallets.filter((wallet) => wallet.isActive).map((wallet) => [wallet.id, getWalletBalance(wallet, transactions)])), [transactions, wallets])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const targetAmount = parsePesoToCentavos(target)
    if (!name.trim() || !targetAmount || targetAmount <= 0 || walletIds.length === 0) return
    void onSave({ name: name.trim(), targetAmount, targetDate: targetDate || undefined, walletIds })
  }
  return <Modal title="Create savings goal" onClose={onClose}><form onSubmit={submit} className="space-y-4">
    <label className="block text-sm font-medium text-[#202A35]">Goal name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Palawan trip" className={`${inputClass} mt-1`} /></label>
    <label className="block text-sm font-medium text-[#202A35]">Target amount<div className="mt-1 flex rounded-xl border border-slate-200 bg-[#F7F8FA] px-3"><span className="py-2.5 text-slate-400">₱</span><input type="number" inputMode="decimal" min="0" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="50000.00" className="w-full bg-transparent px-2 py-2.5 outline-none" /></div></label>
    <label className="block text-sm font-medium text-[#202A35]">Target date <span className="font-normal text-slate-400">(optional)</span><input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className={`${inputClass} mt-1`} /></label>
    <fieldset><legend className="text-sm font-medium text-[#202A35]">Source wallets</legend><p className="mt-1 text-xs text-slate-500">These wallets are where you plan to save from.</p><div className="mt-2 space-y-2">{wallets.filter((wallet) => wallet.isActive).map((wallet) => <label key={wallet.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={walletIds.includes(wallet.id)} onChange={(event) => setWalletIds((current) => event.target.checked ? [...current, wallet.id] : current.filter((id) => id !== wallet.id))} /><span className="flex-1">{wallet.name}</span><span className="text-xs text-slate-500">{formatPeso(balances.get(wallet.id) ?? 0)}</span></label>)}</div></fieldset>
    <button type="submit" disabled={!name.trim() || !parsePesoToCentavos(target) || walletIds.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#278568] py-3 font-semibold text-white disabled:opacity-50"><Check size={18} /> Create goal</button>
  </form></Modal>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-[#202A35]">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-[#E9EDF2]"><X size={18} /></button></div>{children}</section></div>
}
