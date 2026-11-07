import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Wallet as WalletIcon } from 'lucide-react'
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

export default function DashboardPage() {
  const today = new Date()
  const monthLabel = today.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  const { wallets, categories, transactions, budget, loading, error } = useUserData(
    getMonthKey(today),
  )

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
        Couldn&apos;t load your data: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9EDF2] border-t-[#278568]" />
      </div>
    )
  }

  const totalBalance = getTotalBalance(wallets, transactions)
  const { income, expenses, savingsRate } = getMonthlySummary(transactions, today)
  const breakdown = getExpenseBreakdown(transactions, categories, today)

  const budgetLimit = budget?.totalLimit ?? null
  const remainingBudget = budgetLimit === null ? null : budgetLimit - expenses

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#202A35]">Overview</h1>
        <p className="text-sm text-slate-500">{monthLabel}</p>
      </header>

      {/* Available balance */}
      <section className="rounded-2xl bg-[#278568] p-6 text-white">
        <p className="text-sm text-white/80">Available Balance</p>
        <p className="mt-1 text-3xl font-semibold sm:text-4xl">{formatPeso(totalBalance)}</p>
      </section>

      <WalletCarousel wallets={wallets} transactions={transactions} />

      {/* Monthly summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Income"
          value={formatPeso(income)}
          tone="positive"
          icon={<TrendingUp size={16} />}
          hint="This month"
        />
        <SummaryCard
          label="Expenses"
          value={formatPeso(expenses)}
          tone="negative"
          icon={<TrendingDown size={16} />}
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
          <BudgetProgress limit={budgetLimit} spent={expenses} />
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
        <h2 className="text-sm font-semibold text-[#202A35]">Your wallets</h2>
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#278568] ring-1 ring-slate-200 transition hover:bg-[#E9EDF2]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((selectedIndex + 1) % activeWallets.length)}
            aria-label="Next wallet"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#278568] ring-1 ring-slate-200 transition hover:bg-[#E9EDF2]"
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
      className="w-full shrink-0 rounded-2xl p-5 text-white shadow-sm"
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