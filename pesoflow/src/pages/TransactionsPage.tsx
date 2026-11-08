import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Tags,
  WalletCards,
} from 'lucide-react'
import { useUserData } from '../features/auth/hooks/userData'
import type { Category, Transaction, Wallet } from '../types'
import { formatPeso } from '../utils/money'

type EntryFilter = 'all' | 'income' | 'expense' | 'transfer'

const dayFormatter = new Intl.DateTimeFormat('en-PH', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const monthFormatter = new Intl.DateTimeFormat('en-PH', {
  day: 'numeric',
  month: 'short',
})

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  result.setDate(result.getDate() - daysSinceMonday)
  result.setHours(0, 0, 0, 0)
  return result
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isWithinWeek(date: Date, weekStart: Date) {
  const nextWeek = addDays(weekStart, 7)
  return date >= weekStart && date < nextWeek
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export default function TransactionsPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [search, setSearch] = useState('')
  const [entryFilter, setEntryFilter] = useState<EntryFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [walletFilter, setWalletFilter] = useState('all')
  const { wallets, categories, transactions, loading, error } = useUserData(
    `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}`,
  )

  const weekEnd = addDays(weekStart, 6)
  const weekTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          !transaction.isDeleted && isWithinWeek(new Date(transaction.transactionDate), weekStart),
      ),
    [transactions, weekStart],
  )

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return weekTransactions
      .filter((transaction) => entryFilter === 'all' || transaction.type === entryFilter)
      .filter((transaction) => categoryFilter === 'all' || transaction.categoryId === categoryFilter)
      .filter((transaction) => {
        if (walletFilter === 'all') return true
        return (
          transaction.walletId === walletFilter ||
          transaction.fromWalletId === walletFilter ||
          transaction.toWalletId === walletFilter
        )
      })
      .filter((transaction) => {
        if (!query) return true
        const category = categories.find((item) => item.id === transaction.categoryId)
        const wallet = wallets.find((item) => item.id === transaction.walletId)
        return [transaction.description, category?.name, wallet?.name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      })
      .sort((a, b) => +new Date(b.transactionDate) - +new Date(a.transactionDate))
  }, [
    categoryFilter,
    categories,
    entryFilter,
    search,
    walletFilter,
    wallets,
    weekTransactions,
  ])

  const expenseTotal = weekTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)
  const incomeTotal = weekTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)
  const chartMaximum = Math.max(
    ...Array.from({ length: 7 }, (_, index) => {
      const day = addDays(weekStart, index)
      return weekTransactions
        .filter((transaction) => dateKey(new Date(transaction.transactionDate)) === dateKey(day))
        .reduce((total, transaction) => total + transaction.amount, 0)
    }),
    1,
  )

  const groupedTransactions = groupByDay(filteredTransactions)
  const weekLabel = `${monthFormatter.format(weekStart)} – ${monthFormatter.format(weekEnd)}`

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
        Couldn&apos;t load your transactions: {error}
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

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#278568] text-white">
              <CalendarDays size={21} />
            </div>
            <h1 className="text-2xl font-semibold text-[#202A35]">Transactions</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">Review and manage your activity</p>
        </div>
        <div className="hidden rounded-xl bg-[#278568]/10 px-3 py-2 text-sm font-medium text-[#278568] sm:block">
          {weekTransactions.length} {weekTransactions.length === 1 ? 'entry' : 'entries'} this week
        </div>
      </header>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setWeekStart((date) => addDays(date, -7))}
            aria-label="Previous week"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#E9EDF2]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="text-center"
          >
            <p className="text-base font-semibold uppercase tracking-wide text-[#202A35]">
              {weekLabel}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Week · tap to return to today
            </p>
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((date) => addDays(date, 7))}
            aria-label="Next week"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#E9EDF2]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_2fr] md:items-end">
          <div>
            <p className="text-sm text-slate-500">Weekly expenses</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-[#202A35]">
              {formatPeso(expenseTotal)}
            </p>
            <p className="mt-2 text-sm text-[#278568]">
              {formatPeso(incomeTotal)} income received
            </p>
          </div>
          <div className="flex h-28 items-end gap-2 border-b border-[#278568]/20">
            {Array.from({ length: 7 }, (_, index) => {
              const day = addDays(weekStart, index)
              const amount = weekTransactions
                .filter(
                  (transaction) =>
                    dateKey(new Date(transaction.transactionDate)) === dateKey(day),
                )
                .reduce((total, transaction) => total + transaction.amount, 0)
              const isToday = dateKey(day) === dateKey(new Date())
              return (
                <div key={dateKey(day)} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className={`w-full max-w-10 rounded-t-md ${isToday ? 'bg-[#278568]' : 'bg-[#278568]/20'}`}
                    style={{ height: `${Math.max((amount / chartMaximum) * 80, amount ? 8 : 3)}%` }}
                    title={formatPeso(amount)}
                  />
                  <span className="text-[10px] font-medium text-slate-400">
                    {day.toLocaleDateString('en-PH', { weekday: 'short' }).slice(0, 2)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <label className="relative block">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="off"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes, categories, amounts..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#278568] focus:ring-2 focus:ring-[#278568]/20"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterSelect
            icon={<Filter size={16} />}
            value={entryFilter}
            onChange={(value) => setEntryFilter(value as EntryFilter)}
            options={[
              ['all', 'All entries'],
              ['expense', 'Expenses'],
              ['income', 'Income'],
              ['transfer', 'Transfers'],
            ]}
          />
          <FilterSelect
            icon={<Tags size={16} />}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[['all', 'All categories'], ...categories.map((category) => [category.id, category.name])]}
          />
          <FilterSelect
            icon={<WalletCards size={16} />}
            value={walletFilter}
            onChange={setWalletFilter}
            options={[['all', 'All wallets'], ...wallets.map((wallet) => [wallet.id, wallet.name])]}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        {groupedTransactions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Eye size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-[#202A35]">No transactions found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try another week or adjust your filters.
            </p>
          </div>
        ) : (
          groupedTransactions.map(([day, dayTransactions]) => (
            <div key={day} className="border-b border-slate-100 last:border-b-0">
              <div className="flex items-center justify-between bg-[#F7F8FA] px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {day}
                </p>
                <p className="text-sm font-semibold text-[#202A35]">
                  {formatPeso(dayTransactions.reduce((total, transaction) => total + transaction.amount, 0))}
                </p>
              </div>
              <ul className="divide-y divide-dotted divide-slate-200 px-5">
                {dayTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    category={categories.find((category) => category.id === transaction.categoryId)}
                    wallets={wallets}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

function groupByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  transactions.forEach((transaction) => {
    const key = dayFormatter.format(new Date(transaction.transactionDate))
    groups.set(key, [...(groups.get(key) ?? []), transaction])
  })
  return Array.from(groups.entries())
}

function FilterSelect({
  icon,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  options: string[][]
}) {
  return (
    <label className="relative flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-[#202A35]">
      <span className="text-slate-500">{icon}</span>
      <select
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-40 appearance-none bg-transparent pr-5 outline-none"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-2 text-slate-400" />
    </label>
  )
}

function TransactionRow({
  transaction,
  category,
  wallets,
}: {
  transaction: Transaction
  category?: Category
  wallets: Wallet[]
}) {
  const isTransfer = transaction.type === 'transfer'
  const walletName = (id?: string) => wallets.find((wallet) => wallet.id === id)?.name ?? 'Unknown wallet'
  const Icon = isTransfer
    ? ArrowLeftRight
    : transaction.type === 'income'
      ? ArrowDownLeft
      : ArrowUpRight
  const color =
    isTransfer ? '#64748B' : transaction.type === 'income' ? '#278568' : category?.color ?? '#F59E0B'
  const amountPrefix = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''
  const subtitle = isTransfer
    ? `${walletName(transaction.fromWalletId)} → ${walletName(transaction.toWalletId)}`
    : `${category?.name ?? 'Uncategorized'} · ${walletName(transaction.walletId)}`

  return (
    <li className="flex items-center gap-3 py-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: color }}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#202A35]">
          {transaction.description || (isTransfer ? 'Wallet transfer' : category?.name ?? 'Transaction')}
        </p>
        <p className="truncate text-sm text-slate-400">{subtitle}</p>
      </div>
      <p
        className={`shrink-0 text-base font-semibold ${
          transaction.type === 'income'
            ? 'text-[#278568]'
            : transaction.type === 'expense'
              ? 'text-[#202A35]'
              : 'text-slate-500'
        }`}
      >
        {amountPrefix}
        {formatPeso(transaction.amount)}
      </p>
    </li>
  )
}
