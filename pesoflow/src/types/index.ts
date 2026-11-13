export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt'
export type DebtDirection = 'borrowed' | 'lent'
export type DebtAction = 'initial' | 'payment'

export interface Wallet {
  id: string
  name: string
  type: 'cash' | 'e-wallet' | 'bank' | 'credit-card' | 'other'
  provider?: string
  initialBalance: number // integer centavos
  color: string
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number // integer centavos
  walletId?: string // income / expense
  categoryId?: string // income / expense
  fromWalletId?: string // transfer
  toWalletId?: string // transfer
  debtId?: string
  debtDirection?: DebtDirection
  debtAction?: DebtAction
  debtPerson?: string
  description: string
  transactionDate: string // ISO string for now, Timestamp once services are connected
  isDeleted: boolean
}

export interface Budget {
  id?: string
  month: string // YYYY-MM
  totalLimit: number // integer centavos
  name?: string
  template?: '50/30/20' | 'custom'
  planType?: 'one-time' | 'monthly'
  startDate?: string
  endDate?: string
  groups?: BudgetGroup[]
  funding?: BudgetFunding[]
  allocations?: {
    needs: number
    wants: number
    savings: number
  }
}

export interface BudgetGroup {
  name: string
  amount: number // integer centavos
  icon?: string
  walletPercentages?: Record<string, number>
}

export interface BudgetFunding {
  walletId: string
  percentage: number
}

export interface SavingsGoal {
  id?: string
  name: string
  targetAmount: number
  savedAmount: number
  targetDate?: string
  walletIds: string[]
  createdAt?: unknown
}

export interface SavingsGoalContribution {
  id: string
  amount: number
  walletId: string
  createdAt?: unknown
}