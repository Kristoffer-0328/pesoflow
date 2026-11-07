export type TransactionType = 'income' | 'expense' | 'transfer'

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
}