import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet as WalletIcon,
} from 'lucide-react'
import BudgetProgress from '../features/dashboard/components/BudgetProgress'
import RecentTransactions from '../features/dashboard/components/RecentTransactions'
import SpendingBreakdown from '../features/dashboard/components/SpendingBreakdown'
import SummaryCard from '../features/dashboard/components/SummaryCard'
import { useUserData } from '../features/auth/hooks/userData'
import type { Transaction, Wallet } from '../types'
import {
  getExpenseBreakdown,
  getMonthlySummary,
  getTotalBalance,
  getWalletBalance,
} from '../utils/calculation'
import { getMonthKey } from '../utils/date'
import { formatPeso } from '../utils/money'
import { getWalletCardColors } from '../utils/walletColors'
import { useAuth } from '../features/auth/hooks/useAuth'

export default function DashboardPage() {
  const today = new Date()
  const monthLabel = today.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  const { user } = useAuth()
  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  const { wallets, categories, transactions, budget, loading, error } = useUserData(
    getMonthKey(today),
  )

  if (error) {
    return (
      <div role="alert" className="border-2 border-[#EF9580] bg-[#FFFDF0] p-5 text-sm text-red-600 shadow-[4px_4px_0_#EF9580]">
        Couldn&apos;t load your data: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin border-2 border-[#CFE3C4] border-t-[#247354]" />
      </div>
    )
  }

  const totalBalance = getTotalBalance(wallets, transactions)
  const { income, expenses, savingsRate } = getMonthlySummary(transactions, today)
  const breakdown = getExpenseBreakdown(transactions, categories, today)

  const budgetLimit = budget?.totalLimit ?? null
  const remainingBudget = budgetLimit === null ? null : budgetLimit - expenses

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4A9A70]">
            Your financial snapshot
          </p>
          <h1 className="text-2xl font-semibold uppercase tracking-wide text-[#19372D] sm:text-3xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s how your money is looking this month.</p>
        </div>
        <button
          type="button"
          className="hidden shrink-0 items-center gap-2 border-2 border-[#19372D] bg-[#FFFDF0] px-3 py-2 text-xs font-semibold text-[#19372D] shadow-[3px_3px_0_#A9BC91] transition hover:bg-[#CFE3C4] sm:flex"
        >
          {monthLabel}
          <ChevronDown size={14} />
        </button>
      </header>

      {/* Available balance */}
      <section
        className="relative overflow-hidden border-2 border-[#19372D] bg-[#2F7D5C] p-5 text-white shadow-[5px_5px_0_#163F33] sm:p-7"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(47,125,92,0.98) 0%, rgba(36,115,84,0.98) 60%, rgba(25,55,45,0.98) 100%), repeating-linear-gradient(45deg, transparent 0, transparent 10px, rgba(255,255,255,0.08) 10px, rgba(255,255,255,0.08) 12px)',
        }}
      >
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">Available balance</p>
            <p className="mt-2 text-3xl font-semibold tracking-wide sm:text-5xl">{formatPeso(totalBalance)}</p>
            <p className="mt-2 text-xs text-white/75">Across {wallets.filter((wallet) => wallet.isActive).length} active wallets</p>
          </div>
          <div className="hidden border border-white/50 px-3 py-2 text-right sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/70">This month</p>
            <p className="mt-1 text-sm font-semibold">{formatPeso(income - expenses)}</p>
            <p className="text-[10px] text-white/70">net change</p>
          </div>
        </div>
      </section>

      <WalletCarousel wallets={wallets} transactions={transactions} />

      {/* Monthly summary */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryCard
          label="Income"
          value={formatPeso(income)}
          tone="positive"
          icon={<ArrowDown size={16} />}
          hint="This month"
        />
        <SummaryCard
          label="Expenses"
          value={formatPeso(expenses)}
          tone="negative"
          icon={<ArrowUp size={16} />}
          hint={`Savings rate: ${Math.round(savingsRate)}%`}
        />
        <SummaryCard
          label="Remaining Budget"
          value={remainingBudget === null ? '—' : formatPeso(remainingBudget)}
          tone={remainingBudget !== null && remainingBudget < 0 ? 'negative' : 'default'}
          icon={<WalletIcon size={16} />}
          hint={budgetLimit === null ? 'No budget set' : `of ${formatPeso(budgetLimit)}`}
        />
      </section>

      {/* Breakdown + budget */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingBreakdown data={breakdown} />
        </div>

        {budgetLimit === null ? (
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="mb-4 text-sm font-semibold text-[#202A35]">Monthly Budget</h3>
            <p className="py-6 text-center text-sm text-slate-400">
              No budget set for this month yet.
            </p>
          </div>
        ) : (
          <BudgetProgress limit={budgetLimit} spent={expenses} name={budget?.name} />
        )}
      </section>

      <RecentTransactions transactions={transactions} categories={categories} wallets={wallets} />
    </div>
  )
}

function WalletCarousel({
  wallets,
  transactions,
}: {
  wallets: Wallet[]
  transactions: Transaction[]
}) {
  const activeWallets = wallets.filter((wallet) => wallet.isActive)
  const [activeIndex, setActiveIndex] = useState(0)

  if (activeWallets.length === 0) {
    return null
  }

  const selectedIndex = Math.min(activeIndex, activeWallets.length - 1)

  return (
    <section aria-label="Balance sources" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#19372D]">YOUR WALLETS</h2>
        <span className="text-xs text-slate-400">
          {selectedIndex + 1}/{activeWallets.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
        >
          {activeWallets.map((wallet) => (
            <WalletBalanceCard
              key={wallet.id}
              wallet={wallet}
              transactions={transactions}
            />
          ))}
        </div>
      </div>

      {activeWallets.length > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((selectedIndex - 1 + activeWallets.length) % activeWallets.length)
            }
            aria-label="Previous wallet"
            className="flex h-9 w-9 items-center justify-center border-2 border-[#19372D] bg-[#FFFDF0] text-[#247354] shadow-[2px_2px_0_#A9BC91] transition hover:bg-[#CFE3C4]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((selectedIndex + 1) % activeWallets.length)}
            aria-label="Next wallet"
            className="flex h-9 w-9 items-center justify-center border-2 border-[#19372D] bg-[#FFFDF0] text-[#247354] shadow-[2px_2px_0_#A9BC91] transition hover:bg-[#CFE3C4]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  )
}

function WalletBalanceCard({
  wallet,
  transactions,
}: {
  wallet: Wallet
  transactions: Transaction[]
}) {
  const cardColors = getWalletCardColors(wallet)

  return (
    <article
      className="w-full shrink-0 border-2 border-[#19372D] p-5 text-white shadow-[4px_4px_0_#163F33]"
      style={{ background: `linear-gradient(135deg, ${cardColors[0]}, ${cardColors[1]})` }}
    >
      <p className="text-sm text-white/75">{wallet.type === 'cash' ? 'Cash' : wallet.type}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <h3 className="text-xl font-semibold">{wallet.name}</h3>
        <p className="text-2xl font-semibold">{formatPeso(getWalletBalance(wallet, transactions))}</p>
      </div>
    </article>
  )
}