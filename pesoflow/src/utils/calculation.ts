import type { Category, Transaction, Wallet } from '../types'

const isSameMonth = (iso: string, ref: Date) => {
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

/** Initial + income - expenses + transfers in - transfers out + debt effects */
export function getWalletBalance(wallet: Wallet, transactions: Transaction[]): number {
  return transactions
    .filter((t) => !t.isDeleted)
    .reduce((balance, t) => {
      if (t.type === 'income' && t.walletId === wallet.id) return balance + t.amount
      if (t.type === 'expense' && t.walletId === wallet.id) return balance - t.amount
      if (t.type === 'transfer') {
        if (t.toWalletId === wallet.id) balance += t.amount
        if (t.fromWalletId === wallet.id) balance -= t.amount
      }
      if (t.type === 'debt' && t.walletId === wallet.id) {
        const borrowedEffect = t.debtDirection === 'borrowed' ? 1 : -1
        balance += t.debtAction === 'payment' ? -borrowedEffect * t.amount : borrowedEffect * t.amount
      }
      return balance
    }, wallet.initialBalance)
}

export function getTotalBalance(wallets: Wallet[], transactions: Transaction[]): number {
  return wallets
    .filter((w) => w.isActive)
    .reduce((sum, w) => sum + getWalletBalance(w, transactions), 0)
}

export function getMonthlySummary(transactions: Transaction[], month: Date) {
  const monthTx = transactions.filter((t) => !t.isDeleted && isSameMonth(t.transactionDate, month))

  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savings = income - expenses
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  return { income, expenses, savings, savingsRate }
}

export function getExpenseBreakdown(
  transactions: Transaction[],
  categories: Category[],
  month: Date,
) {
  const totals = new Map<string, number>()

  transactions
    .filter((t) => !t.isDeleted && t.type === 'expense' && t.categoryId && isSameMonth(t.transactionDate, month))
    .forEach((t) => totals.set(t.categoryId!, (totals.get(t.categoryId!) ?? 0) + t.amount))

  return Array.from(totals.entries())
    .map(([categoryId, amount]) => {
      const cat = categories.find((c) => c.id === categoryId)
      return { categoryId, name: cat?.name ?? 'Unknown', color: cat?.color ?? '#94A3B8', amount }
    })
    .sort((a, b) => b.amount - a.amount)
}