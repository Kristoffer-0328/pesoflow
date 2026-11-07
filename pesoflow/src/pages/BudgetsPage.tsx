import { useEffect, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, Folder, Plus, X } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { subscribeToBudgets } from '../features/budgets/budgetServices'
import type { Budget } from '../types'
import { getMonthKey } from '../utils/date'
import { formatPeso } from '../utils/money'
import NewBudgetModal from '../features/budgets/components/NewBudgetModal'

const defaultBudget: Budget = {
  id: 'default-50-30-20',
  month: getMonthKey(new Date()),
  totalLimit: 0,
  name: '50 / 30 / 20',
  template: '50/30/20',
  planType: 'monthly',
  allocations: { needs: 50, wants: 30, savings: 20 },
}

const icons = [Folder, BriefcaseBusiness, CalendarDays]

export default function BudgetsPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [detailBudget, setDetailBudget] = useState<Budget | null>(null)
  const [selectedId, setSelectedId] = useState(defaultBudget.id)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    return subscribeToBudgets(
      user.uid,
      (nextBudgets) => {
        setBudgets(nextBudgets)
        setLoading(false)
      },
      (loadError) => {
        setError(loadError.message)
        setLoading(false)
      },
    )
  }, [user])

  const plans = [defaultBudget, ...budgets]
  return (
    <div className="max-w-6xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#278568]">Budget folders</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#202A35]">Your plans</h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep everyday spending and personal goals in separate folders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreator(true)
            setSelectedId('')
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#278568] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6e55]"
        >
          <Plus size={18} />
          New plan
        </button>
      </header>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9EDF2] border-t-[#278568]" />
        </div>
      ) : (
        <section
          className="max-h-[min(34rem,60vh)] overflow-y-auto overscroll-contain pr-1"
          aria-label="Budget folders"
        >
          <div className="grid grid-cols-2 gap-4">
            {plans.map((budget, index) => (
              <button
                key={budget.id}
                type="button"
                onClick={() => {
                  setSelectedId(budget.id ?? '')
                  setShowCreator(false)
                  setDetailBudget(budget)
                }}
                className={`rounded-2xl bg-white p-4 text-left ring-1 transition hover:-translate-y-0.5 sm:p-5 ${
                  selectedId === budget.id && !showCreator
                    ? 'ring-2 ring-[#278568]'
                    : 'ring-slate-200 hover:ring-[#278568]/50'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#278568]/10 text-[#278568] sm:h-11 sm:w-11">
                    {(() => {
                      const Icon = icons[index % icons.length]
                      return <Icon size={22} />
                    })()}
                  </span>
                  {index === 0 && (
                    <span className="rounded-full bg-[#278568]/10 px-2 py-1 text-[10px] font-medium text-[#278568] sm:px-2.5 sm:text-xs">
                      Default
                    </span>
                  )}
                </span>
                <h2 className="mt-4 truncate text-base font-semibold text-[#202A35] sm:mt-5 sm:text-lg">
                  {budget.name}
                </h2>
                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  {budget.template === '50/30/20'
                    ? 'Needs 50% · Wants 30% · Savings 20%'
                    : `${budget.planType === 'monthly' ? 'Monthly' : 'One-time'} plan`}
                </p>
                {budget.totalLimit > 0 && (
                  <p className="mt-4 text-sm font-semibold text-[#202A35]">
                    {formatPeso(budget.totalLimit)}
                  </p>
                )}
                {budget.groups && budget.groups.length > 0 && (
                  <p className="mt-1 text-xs text-slate-400">{budget.groups.length} dividers</p>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCreator(true)
                setSelectedId('')
              }}
              className="flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-3 text-center text-slate-500 transition hover:border-[#278568] hover:text-[#278568]"
            >
              <Plus size={26} />
              <span className="mt-2 font-semibold">New plan</span>
              <span className="mt-1 text-xs">Create your own dividers</span>
            </button>
          </div>
        </section>
      )}

      {showCreator && <NewBudgetModal userId={user?.uid} onClose={() => {
        setShowCreator(false)
        setSelectedId(defaultBudget.id)
      }} onSaved={(budget) => {
        setBudgets((current) => [...current, budget])
        setSelectedId(budget.id ?? '')
        setShowCreator(false)
      }} />}
      {detailBudget && (
        <BudgetDetailsModal budget={detailBudget} onClose={() => setDetailBudget(null)} />
      )}
    </div>
  )
}

function BudgetDetailsModal({ budget, onClose }: { budget: Budget; onClose: () => void }) {
  const isDefault = budget.template === '50/30/20'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center">
      <button type="button" aria-label="Close budget details" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <section role="dialog" aria-modal="true" aria-label={`${budget.name} budget details`} className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#278568]">{isDefault ? 'Default folder' : 'Budget folder'}</p>
            <h2 className="mt-1 text-xl font-semibold text-[#202A35]">{budget.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {budget.planType === 'monthly' ? 'Monthly plan' : 'One-time plan'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-[#E9EDF2]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-[#F7F8FA] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total budget</p>
          {budget.totalLimit > 0 ? (
            <p className="mt-1 text-3xl font-semibold text-[#202A35]">{formatPeso(budget.totalLimit)}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No amount set yet</p>
          )}
          {budget.planType === 'one-time' && budget.startDate && budget.endDate && (
            <p className="mt-2 text-sm text-slate-500">{budget.startDate} to {budget.endDate}</p>
          )}
        </div>

        {isDefault ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Needs', '50%', 'Essentials and bills'],
              ['Wants', '30%', 'Lifestyle and fun'],
              ['Savings', '20%', 'Emergency fund and goals'],
            ].map(([name, percentage, description]) => (
              <div key={name} className="rounded-xl bg-[#F7F8FA] p-4">
                <p className="font-semibold text-[#202A35]">{name}</p>
                <p className="mt-2 text-2xl font-semibold text-[#278568]">{percentage}</p>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between">
              <h3 className="font-semibold text-[#202A35]">Budget dividers</h3>
              <span className="text-xs text-slate-400">{budget.groups?.length ?? 0} groups</span>
            </div>
            {(budget.groups ?? []).length > 0 ? (
              <div className="mt-3 space-y-3">
                {(budget.groups ?? []).map((group) => (
                  <div key={`${group.name}-${group.amount}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span className="text-sm font-medium text-[#202A35]">{group.name}</span>
                    <span className="text-sm font-semibold text-[#278568]">{formatPeso(group.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-[#F7F8FA] p-4 text-sm text-slate-500">
                No custom dividers. This folder will be tracked by category.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
