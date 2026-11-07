import type { Category, Transaction, Wallet } from '../../../types'
import { formatPeso } from '../../../utils/money'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  wallets: Wallet[]
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' })

export default function RecentTransactions({ transactions, categories, wallets }: Props) {
  const walletName = (id?: string) => wallets.find((w) => w.id === id)?.name ?? 'Unknown'

  const recent = transactions
    .filter((t) => !t.isDeleted)
    .sort((a, b) => +new Date(b.transactionDate) - +new Date(a.transactionDate))
    .slice(0, 6)

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold text-[#202A35]">Recent Transactions</h3>

      {recent.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">No transactions yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((t) => {
            const category = categories.find((c) => c.id === t.categoryId)
            const isTransfer = t.type === 'transfer'
            const color = isTransfer ? '#94A3B8' : category?.color ?? '#94A3B8'

            const amountStyle =
              t.type === 'income'
                ? 'text-[#278568]'
                : t.type === 'expense'
                  ? 'text-red-600'
                  : 'text-slate-500'
            const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''

            return (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {isTransfer ? '⇄' : (category?.name[0] ?? '?')}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#202A35]">{t.description}</p>
                  <p className="truncate text-xs text-slate-400">
                    {isTransfer
                      ? `${walletName(t.fromWalletId)} → ${walletName(t.toWalletId)}`
                      : `${category?.name} · ${walletName(t.walletId)}`}
                    {' · '}
                    {dateFormatter.format(new Date(t.transactionDate))}
                  </p>
                </div>

                <span className={`text-sm font-semibold ${amountStyle}`}>
                  {sign}
                  {formatPeso(t.amount)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}