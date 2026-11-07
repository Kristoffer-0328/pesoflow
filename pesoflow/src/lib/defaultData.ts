interface DefaultCategory {
  name: string
  type: 'income' | 'expense'
  icon: string // lucide icon name
  color: string
}

export const defaultCategories: DefaultCategory[] = [
  // Expense (from your blueprint)
  { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#F59E0B' },
  { name: 'Transportation', type: 'expense', icon: 'car', color: '#3B82F6' },
  { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#8B5CF6' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#EC4899' },
  { name: 'Health', type: 'expense', icon: 'heart-pulse', color: '#EF4444' },
  { name: 'Entertainment', type: 'expense', icon: 'clapperboard', color: '#14B8A6' },
  { name: 'Family Contribution', type: 'expense', icon: 'users', color: '#F97316' },
  { name: 'Others', type: 'expense', icon: 'ellipsis', color: '#94A3B8' },
  // Income
  { name: 'Salary', type: 'income', icon: 'banknote', color: '#278568' },
  { name: 'Business', type: 'income', icon: 'briefcase', color: '#0EA5E9' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#6366F1' },
  { name: 'Investment Returns', type: 'income', icon: 'trending-up', color: '#10B981' },
  { name: 'Other Income', type: 'income', icon: 'circle-plus', color: '#94A3B8' },
]

export const defaultWallet = {
  name: 'Cash on Hand',
  type: 'cash' as const,
  initialBalance: 0, // integer centavos
  color: '#278568',
}