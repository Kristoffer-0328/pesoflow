import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  ArrowLeftRight,
  BarChart3,
  Home,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Plus,
  Settings,
  Wallet as WalletIcon,
} from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { logout } from '../../features/auth/services/authServices'
import type { TransactionType } from '../../types'
import AddTransactionMenu from '../../features/transactions/components/addTransactionMenu'
import AddTransactionModal from '../../features/transactions/components/addTransactionsModal'

const desktopNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/wallets', label: 'Wallets', icon: WalletIcon },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const mobileNav = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/transactions', label: 'Activity', icon: ArrowLeftRight },
  { to: '/wallets', label: 'Wallets', icon: WalletIcon },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function AppLayout() {
  const { user } = useAuth()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)

  const openAddMenu = () => setAddMenuOpen(true)
  const closeAddMenu = () => setAddMenuOpen(false)
  const openTransactionForm = (type: TransactionType) => {
    setTransactionType(type)
    setAddMenuOpen(false)
  }
  const closeTransactionForm = () => setTransactionType(null)

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#278568] text-lg font-bold text-white">
            ₱
          </div>
          <span className="text-lg font-semibold text-[#202A35]">PesoFlow</span>
        </div>

        <nav className="flex flex-col gap-1">
          {desktopNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#278568]/10 text-[#278568]'
                    : 'text-slate-600 hover:bg-[#E9EDF2]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={openAddMenu}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#278568] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6e55]"
        >
          <Plus size={18} />
          Add Transaction
        </button>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="truncate px-2 text-sm font-medium text-[#202A35]">
            {user?.displayName ?? user?.email}
          </p>
          <p className="truncate px-2 text-xs text-slate-400">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-[#E9EDF2]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {mobileNav.slice(0, 2).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}

          <button
            type="button"
            onClick={openAddMenu}
            aria-label="Add transaction"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#278568] text-white shadow-lg ring-4 ring-[#F7F8FA]"
          >
            <Plus size={26} />
          </button>

          {mobileNav.slice(2).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {addMenuOpen && (
        <AddTransactionMenu onClose={closeAddMenu} onSelect={openTransactionForm} />
      )}
      {transactionType && (
        <AddTransactionModal initialType={transactionType} onClose={closeTransactionForm} />
      )}
    </div>
  )
}

function MobileLink({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: typeof Home
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-16 flex-col items-center gap-1 text-[11px] font-medium ${
          isActive ? 'text-[#278568]' : 'text-slate-500'
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )
}