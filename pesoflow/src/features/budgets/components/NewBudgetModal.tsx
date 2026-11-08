import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, TouchEvent } from 'react'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Heart,
  Plus,
  Shield,
  ShoppingBag,
  Trash2,
  Utensils,
  X,
} from 'lucide-react'
import { createBudget } from '../budgetServices'
import type { Budget, BudgetGroup, Transaction, Wallet } from '../../../types'
import { getWalletBalance } from '../../../utils/calculation'
import { getMonthKey } from '../../../utils/date'
import { formatPeso, parsePesoToCentavos } from '../../../utils/money'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition focus:border-[#278568] focus:ring-2 focus:ring-[#278568]/20'
const labelClass = 'mb-1 block text-sm font-medium text-[#202A35]'

const ideas = [
  { name: 'Transportation', icon: 'transport', Icon: BriefcaseBusiness },
  { name: 'Food', icon: 'food', Icon: Utensils },
  { name: 'Shopping', icon: 'shopping', Icon: ShoppingBag },
  { name: 'Buffer', icon: 'buffer', Icon: Shield },
]

const groupIcons = [
  { key: 'transport', Icon: BriefcaseBusiness },
  { key: 'food', Icon: Utensils },
  { key: 'shopping', Icon: ShoppingBag },
  { key: 'buffer', Icon: Shield },
  { key: 'heart', Icon: Heart },
]

export default function NewBudgetModal({
  userId,
  wallets,
  transactions,
  onClose,
  onSaved,
}: {
  userId?: string
  wallets: Wallet[]
  transactions: Transaction[]
  onClose: () => void
  onSaved: (budget: Budget) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [planType, setPlanType] = useState<'one-time' | 'monthly'>('one-time')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [groups, setGroups] = useState<BudgetGroup[]>([])
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([])
  const [walletPercentages, setWalletPercentages] = useState<Record<string, number>>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const groupsViewportRef = useRef<HTMLDivElement>(null)
  const touchYRef = useRef<number | null>(null)
  const total = parsePesoToCentavos(amount) ?? 0
  const walletBalances = useMemo(
    () =>
      new Map(
        wallets
          .filter((wallet) => wallet.isActive)
          .map((wallet) => [wallet.id, getWalletBalance(wallet, transactions)]),
      ),
    [transactions, wallets],
  )
  const selectedWalletTotal = selectedWalletIds.reduce(
    (sum, walletId) => sum + (walletBalances.get(walletId) ?? 0),
    0,
  )
  const walletPercentageTotal = selectedWalletIds.reduce(
    (sum, walletId) => sum + (walletPercentages[walletId] ?? 0),
    0,
  )
  const assigned = useMemo(() => groups.reduce((sum, group) => sum + group.amount, 0), [groups])
  const remaining = total - assigned
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        if (editingIndex !== null) setEditingIndex(null)
        else onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [editingIndex, onClose, saving])

  const validatePlan = () => {
    if (!name.trim()) return 'Give your plan a name.'
    if (!Number.isFinite(total) || total <= 0) return 'Enter a total budget greater than zero.'
    if (selectedWalletIds.length === 0) return 'Choose at least one source wallet.'
    if (walletPercentageTotal !== 100) return 'Source wallet percentages must total 100%.'
    if (total > selectedWalletTotal) return 'The budget cannot exceed the available funds in selected wallets.'
    if (planType === 'one-time') {
      if (!startDate || !endDate) return 'Choose a start date and an end date.'
      if (endDate < startDate) return 'The end date must be after the start date.'
    }
    return ''
  }

  const addGroup = (groupName = '', icon = 'heart') => {
    const equalPercentage = selectedWalletIds.length > 0 ? 100 / selectedWalletIds.length : 0
    setGroups((current) => [
      ...current,
      {
        name: groupName,
        amount: 0,
        icon,
        walletPercentages: Object.fromEntries(
          selectedWalletIds.map((walletId) => [walletId, equalPercentage]),
        ),
      },
    ])
    setEditingIndex(groups.length)
  }

  const updateGroup = (index: number, changes: Partial<BudgetGroup>) => {
    setGroups((current) =>
      current.map((group, groupIndex) =>
        groupIndex === index ? { ...group, ...changes } : group,
      ),
    )
  }

  const handleGroupsTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchYRef.current = event.touches[0].clientY
  }

  const handleGroupsTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const previousY = touchYRef.current
    const viewport = groupsViewportRef.current
    if (previousY === null || !viewport) return

    const currentY = event.touches[0].clientY
    viewport.scrollTop += previousY - currentY
    touchYRef.current = currentY
    event.preventDefault()
  }

  const handleGroupsTouchEnd = () => {
    touchYRef.current = null
  }

  const goToGroups = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validatePlan()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep(2)
  }

  const goToReview = () => {
    if (assigned > total) {
      setError('Your groups cannot be greater than the total budget.')
      return
    }
    setError('')
    setStep(3)
  }

  const save = async () => {
    const validGroups = groups.filter((group) => group.name.trim() && group.amount > 0)
    if (!userId) return setError('You must be signed in to create a plan.')

    setError('')
    setSaving(true)
    try {
      const budget: Budget = {
        month: getMonthKey(new Date()),
        totalLimit: total,
        name: name.trim(),
        template: 'custom',
        planType,
        ...(planType === 'one-time' ? { startDate, endDate } : {}),
        groups: validGroups,
        funding: selectedWalletIds.map((walletId) => ({
          walletId,
          percentage: walletPercentages[walletId] ?? 0,
        })),
      }
      const id = await createBudget(userId, budget)
      onSaved({ ...budget, id })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your plan.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => !saving && onClose()} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create new budget plan"
        className={`relative max-h-[92vh] w-full max-w-2xl rounded-t-3xl bg-white p-6 pb-8 shadow-xl md:rounded-3xl ${
          step === 2 ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button type="button" onClick={() => { setError(''); setStep((step - 1) as 1 | 2) }} aria-label="Previous step" className="rounded-lg p-2 text-slate-500 hover:bg-[#E9EDF2]">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <p className="text-xs font-medium text-[#278568]">New folder</p>
              <h2 className="text-lg font-semibold text-[#202A35]">
                {step === 1 ? 'Plan details' : step === 2 ? 'Groups' : 'Review plan'}
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#E9EDF2] disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5">
          <div className="h-2 overflow-hidden rounded-full bg-[#E9EDF2]">
            <div className="h-full rounded-full bg-[#278568] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">Step {step} of 3 · {step === 2 ? 'Groups' : step === 1 ? 'Folder' : 'Review'}</p>
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        {step === 1 && (
          <form onSubmit={goToGroups}>
            <p className="mb-5 text-sm text-slate-500">Set up the plan first. You can decide how to split it next.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Plan name
                <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Palawan vacation" className={`${inputClass} mt-1`} />
              </label>
              <label className={labelClass}>
                Total budget
                <span className="mt-1 flex rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 focus-within:border-[#278568] focus-within:ring-2 focus-within:ring-[#278568]/20">
                  <span className="py-2.5 text-slate-400">₱</span>
                  <input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="20000.00" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" required />
                </span>
              </label>
            </div>
            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <p className={labelClass}>Source wallets</p>
              <p className="mb-3 text-xs text-slate-500">
                Available funds: {formatPeso(selectedWalletTotal)}. The budget total cannot exceed this amount.
              </p>
              <div className="space-y-2">
                {wallets.filter((wallet) => wallet.isActive).map((wallet) => {
                  const selected = selectedWalletIds.includes(wallet.id)
                  return (
                    <div key={wallet.id} className="flex items-center gap-3">
                      <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[#202A35]">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedWalletIds((current) => [...current, wallet.id])
                              setWalletPercentages((current) => ({
                                ...current,
                                [wallet.id]: 0,
                              }))
                            } else {
                              setSelectedWalletIds((current) => current.filter((id) => id !== wallet.id))
                              setWalletPercentages((current) => {
                                const next = { ...current }
                                delete next[wallet.id]
                                return next
                              })
                            }
                          }}
                        />
                        <span className="truncate">{wallet.name}</span>
                        <span className="ml-auto text-xs text-slate-500">{formatPeso(walletBalances.get(wallet.id) ?? 0)}</span>
                      </label>
                      {selected && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={walletPercentages[wallet.id] ?? 0}
                          onChange={(event) => setWalletPercentages((current) => ({
                            ...current,
                            [wallet.id]: Number(event.target.value) || 0,
                          }))}
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm"
                          aria-label={`${wallet.name} funding percentage`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <p className={`mt-2 text-right text-xs ${walletPercentageTotal === 100 ? 'text-slate-500' : 'text-red-600'}`}>
                {walletPercentageTotal}% assigned
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              {(['one-time', 'monthly'] as const).map((type) => (
                <button key={type} type="button" onClick={() => { setPlanType(type); setError('') }} className={`rounded-xl px-4 py-2 text-sm font-medium ${planType === type ? 'bg-[#278568] text-white' : 'bg-[#F7F8FA] text-slate-600'}`}>
                  {type === 'one-time' ? 'One-time' : 'Monthly'}
                </button>
              ))}
            </div>
            {planType === 'one-time' ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={`${inputClass} mt-1`} required /></label>
                <label className={labelClass}>End date<input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className={`${inputClass} mt-1`} required /></label>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-[#F7F8FA] px-4 py-3 text-sm text-slate-500">This plan repeats monthly, so it does not need a start or end date.</p>
            )}
            <button type="submit" className="mt-6 w-full rounded-xl bg-[#278568] py-3 font-semibold text-white transition hover:bg-[#1f6e55]">Next</button>
          </form>
        )}

        {step === 2 && (
          <div className="flex min-h-0 flex-col">
            <div className="flex items-end justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Total budget</span>
              <strong className="text-2xl text-[#202A35]">{formatPeso(total)}</strong>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E9EDF2]">
              <div className={`h-full rounded-full transition-all ${assigned > total ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((assigned / Math.max(total, 1)) * 100, 100)}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-500">{formatPeso(assigned)} assigned to groups</span>
              <strong className={remaining < 0 ? 'text-red-600' : 'text-[#202A35]'}>{formatPeso(Math.max(remaining, 0))} left to assign</strong>
            </div>

            <div
              aria-label="Created budget groups"
              className="mt-6 h-[min(28rem,42vh)] min-h-0 shrink-0 overflow-y-scroll overscroll-contain pr-1 touch-pan-y"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
              ref={groupsViewportRef}
              onTouchStart={handleGroupsTouchStart}
              onTouchMove={handleGroupsTouchMove}
              onTouchEnd={handleGroupsTouchEnd}
              onTouchCancel={handleGroupsTouchEnd}
            >
              <div className="grid grid-cols-2 gap-3">
                {groups.map((group, index) => {
                  const Icon = groupIcons.find((item) => item.key === group.icon)?.Icon ?? Heart
                  const percentage = total > 0 ? Math.round((group.amount / total) * 100) : 0
                  return (
                    <div key={index} className="rounded-2xl border-2 border-blue-500 bg-white p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-10 sm:w-10"><Icon size={20} /></span>
                        <button type="button" onClick={() => setGroups((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${group.name || 'group'}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <button type="button" onClick={() => setEditingIndex(index)} className="mt-3 block w-full text-left">
                        <p className="truncate text-sm font-semibold text-[#202A35]">{group.name || 'Unnamed group'}</p>
                        <p className="mt-2 text-lg font-semibold text-[#202A35] sm:text-xl">{formatPeso(group.amount)}</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(percentage, 100)}%` }} /></div>
                        <p className="mt-2 text-right text-xs font-semibold text-slate-500">{percentage}%</p>
                      </button>
                    </div>
                  )
                })}
                <button type="button" onClick={() => addGroup()} className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-2 text-center text-slate-500 transition hover:border-[#278568] hover:text-[#278568]">
                  <Plus size={25} />
                  <span className="mt-2 text-sm font-semibold">Custom group</span>
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 mt-4 bg-white pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ideas for this folder</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ideas.map(({ name: ideaName, icon, Icon }) => (
                  <button key={ideaName} type="button" onClick={() => addGroup(ideaName, icon)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-[#202A35] hover:border-[#278568]">
                    <Icon size={16} /> {ideaName}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3 pb-1">
                <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-[#278568]">Back</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-[#278568]">Skip</button>
                <button type="button" onClick={goToReview} className="flex-1 rounded-xl bg-[#278568] py-3 font-semibold text-white">Next</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="rounded-2xl bg-[#F7F8FA] p-5">
              <p className="text-sm text-slate-500">{name}</p>
              <p className="mt-1 text-3xl font-semibold text-[#202A35]">{formatPeso(total)}</p>
              <p className="mt-2 text-sm text-slate-500">{planType === 'monthly' ? 'Monthly plan' : `${startDate} to ${endDate}`}</p>
            </div>
            <h3 className="mt-6 font-semibold text-[#202A35]">Your groups</h3>
            <div className="mt-3 space-y-2">
              {groups.length === 0 ? <p className="text-sm text-slate-500">No groups added. This plan will be tracked by category.</p> : groups.map((group) => (
                <div key={`${group.name}-${group.amount}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <span className="text-sm font-medium text-[#202A35]">{group.name}</span>
                  <span className="font-semibold text-[#278568]">{formatPeso(group.amount)}</span>
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
            <button type="button" onClick={save} disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#278568] py-3 font-semibold text-white disabled:opacity-60">
              <Check size={18} /> {saving ? 'Creating plan...' : 'Create plan'}
            </button>
          </div>
        )}
      </div>

      {editingIndex !== null && (
        <GroupEditor
          group={groups[editingIndex]}
          total={total}
          assigned={assigned - groups[editingIndex].amount}
          onClose={() => {
            if (groups[editingIndex].amount === 0) {
              setGroups((current) => current.filter((_, index) => index !== editingIndex))
            }
            setEditingIndex(null)
          }}
          onSave={(changes) => {
            updateGroup(editingIndex, changes)
            setEditingIndex(null)
          }}
          wallets={wallets}
          selectedWalletIds={selectedWalletIds}
        />
      )}
    </div>
  )
}

function GroupEditor({
  group,
  total,
  assigned,
  onClose,
  onSave,
  wallets,
  selectedWalletIds,
}: {
  group: BudgetGroup
  total: number
  assigned: number
  onClose: () => void
  onSave: (changes: Partial<BudgetGroup>) => void
  wallets: Wallet[]
  selectedWalletIds: string[]
}) {
  const [name, setName] = useState(group.name)
  const [amount, setAmount] = useState(group.amount ? String(group.amount / 100) : '')
  const [icon, setIcon] = useState(group.icon ?? 'heart')
  const [walletPercentages, setWalletPercentages] = useState<Record<string, number>>(
    group.walletPercentages ?? Object.fromEntries(
      selectedWalletIds.map((walletId) => [walletId, 100 / selectedWalletIds.length]),
    ),
  )
  const currentAmount = parsePesoToCentavos(amount) ?? 0
  const percentage = total > 0 ? Math.round((currentAmount / total) * 100) : 0
  const free = total - assigned - currentAmount

  return (
    <div className="absolute inset-0 z-10 flex items-end bg-slate-900/40 md:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl md:mx-auto md:max-w-lg md:rounded-3xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#202A35]">Edit group</h3>
          <button type="button" onClick={onClose} aria-label="Close group editor" className="rounded-lg p-2 text-slate-500 hover:bg-[#E9EDF2]"><X size={18} /></button>
        </div>
        <label className={`${labelClass} mt-5`}>Group name<input value={name} onChange={(event) => setName(event.target.value)} className={`${inputClass} mt-1`} autoFocus /></label>
        <p className="mt-5 text-sm font-medium text-[#202A35]">Icon</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {groupIcons.map(({ key, Icon }) => (
            <button key={key} type="button" onClick={() => setIcon(key)} className={`flex h-12 w-12 items-center justify-center rounded-xl border ${icon === key ? 'border-[#278568] bg-[#278568]/10 text-[#278568]' : 'border-slate-200 text-slate-500'}`} aria-label={`Use ${key} icon`}><Icon size={19} /></button>
          ))}
        </div>
        <p className="mt-5 text-sm font-medium text-[#202A35]">Wallet split for this group</p>
        <div className="mt-2 space-y-2">
          {selectedWalletIds.map((walletId) => {
            const wallet = wallets.find((candidate) => candidate.id === walletId)
            return (
              <label key={walletId} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>{wallet?.name ?? 'Wallet'}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={walletPercentages[walletId] ?? 0}
                  onChange={(event) => setWalletPercentages((current) => ({
                    ...current,
                    [walletId]: Number(event.target.value) || 0,
                  }))}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right"
                  aria-label={`${wallet?.name ?? 'Wallet'} group percentage`}
                />
              </label>
            )
          })}
        </div>
        <p className={`mt-2 text-right text-xs ${
          Object.values(walletPercentages).reduce((sum, percentage) => sum + percentage, 0) === 100
            ? 'text-slate-500'
            : 'text-red-600'
        }`}>
          {Object.values(walletPercentages).reduce((sum, percentage) => sum + percentage, 0)}% assigned
        </p>
        <div className="mt-6 flex items-end justify-between">
          <p className="text-sm font-medium text-slate-500">Budget <strong className="text-blue-600">{percentage}%</strong></p>
          <p className="text-sm text-slate-500">of {formatPeso(total)}</p>
        </div>
        <div className="mt-2 flex rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 focus-within:border-[#278568]">
          <span className="py-3 text-slate-400">₱</span>
          <input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="w-full bg-transparent px-2 py-3 text-lg font-semibold outline-none" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(percentage, 100)}%` }} /></div>
        <p className="mt-2 text-sm text-slate-500">{formatPeso(Math.max(free, 0))} free {free < 0 ? 'remaining' : ''}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[10, 20, 25, 30, 50, 100].map((value) => (
            <button key={value} type="button" onClick={() => setAmount(String((total * value) / 100 / 100))} className="rounded-xl border border-slate-200 py-3 font-semibold text-[#202A35] hover:border-[#278568]">{value}%</button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSave({ name: name.trim(), amount: currentAmount, icon, walletPercentages })}
          disabled={
            !name.trim() ||
            currentAmount <= 0 ||
            free < 0 ||
            Object.values(walletPercentages).reduce((sum, percentage) => sum + percentage, 0) !== 100
          }
          className="mt-5 w-full rounded-xl bg-[#278568] py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Done
        </button>
      </div>
    </div>
  )
}
