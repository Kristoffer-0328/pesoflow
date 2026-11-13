import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  Home,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Target,
  Plus,
  Settings,
  Wallet as WalletIcon,
  X,
} from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { logout } from '../../features/auth/services/authServices'
import type { TransactionType } from '../../types'
import AddTransactionMenu from '../../features/transactions/components/addTransactionMenu'
import AddTransactionModal from '../../features/transactions/components/addTransactionsModal'

const desktopNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/debts', label: 'Debts', icon: HandCoins },
  { to: '/wallets', label: 'Wallets', icon: WalletIcon },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const mobileNav = [
  { to: '/transactions', label: 'Activity', icon: ArrowLeftRight },
  { to: '/debts', label: 'Debts', icon: HandCoins },
  { to: '/wallets', label: 'Wallets', icon: WalletIcon },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/goals', label: 'Goals', icon: Target },
]

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)

  const openAddMenu = () => setAddMenuOpen(true)
  const closeAddMenu = () => setAddMenuOpen(false)
  const closeMobileMenu = () => setMobileMenuOpen(false)
  const openTransactionForm = (type: TransactionType) => {
    setTransactionType(type)
    setAddMenuOpen(false)
  }
  const closeTransactionForm = () => setTransactionType(null)

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-[#19372D] bg-[#FFFDF0] p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#19372D] bg-[#247354] text-lg font-bold text-white shadow-[3px_3px_0_#163F33]">
            ₱
          </div>
          <span className="text-lg font-semibold text-[#19372D]">PesoFlow</span>
        </div>

        <nav className="flex flex-col gap-1">
          {desktopNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-2 border-[#19372D] bg-[#B9D58D] text-[#19372D] shadow-[3px_3px_0_#A9BC91]'
                    : 'text-slate-600 hover:bg-[#CFE3C4]'
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
          className="mt-auto flex items-center justify-center gap-2 border-2 border-[#19372D] bg-[#4A9A70] py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#163F33] transition hover:bg-[#247354]"
        >
          <Plus size={18} />
          Add Transaction
        </button>

        <div className="mt-4 border-t-2 border-[#19372D] pt-4">
          <p className="truncate px-2 text-sm font-medium text-[#19372D]">
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

      {/* Mobile header and navigation drawer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-[#19372D] bg-[#FFFDF0] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-[#19372D] bg-[#247354] font-bold text-white">
            ₱
          </div>
          <span className="font-semibold text-[#19372D]">PesoFlow</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-[#E9EDF2]"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="fixed inset-0 z-30 bg-slate-900/30 md:hidden"
          />
          <aside
            id="mobile-navigation-drawer"
            className="fixed inset-y-0 right-0 z-40 flex w-[min(20rem,85vw)] flex-col border-l-2 border-[#19372D] bg-[#FFFDF0] p-4 shadow-xl md:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-semibold text-[#19372D]">Menu</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-[#E9EDF2]"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {desktopNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'border-2 border-[#19372D] bg-[#B9D58D] text-[#19372D] shadow-[3px_3px_0_#A9BC91]'
                        : 'text-slate-600 hover:bg-[#CFE3C4]'
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
              onClick={() => {
                closeMobileMenu()
                openAddMenu()
              }}
              className="mt-4 flex items-center justify-center gap-2 border-2 border-[#19372D] bg-[#4A9A70] py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#163F33] transition hover:bg-[#247354]"
            >
              <Plus size={18} />
              Add Transaction
            </button>

            <div className="mt-auto border-t-2 border-[#19372D] pt-4">
              <p className="truncate px-2 text-sm font-medium text-[#19372D]">
                {user?.displayName ?? user?.email}
              </p>
              <p className="truncate px-2 text-xs text-slate-400">{user?.email}</p>
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu()
                  void logout()
                }}
                className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-[#E9EDF2]"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Page content */}
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#19372D] bg-[#FFFDF0] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {mobileNav.slice(0, 2).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}

          <button
            type="button"
            onClick={openAddMenu}
            aria-label="Add transaction"
            className="-mt-7 flex h-12 w-12 items-center justify-center border-2 border-[#19372D] bg-[#4A9A70] text-white shadow-[3px_3px_0_#163F33]"
          >
            <Plus size={22} />
          </button>

          {mobileNav.slice(2).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {addMenuOpen && (
        <AddTransactionMenu
          onClose={closeAddMenu}
          onSelect={openTransactionForm}
          onHome={() => {
            closeAddMenu()
            navigate('/dashboard')
          }}
        />
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
          isActive ? 'text-[#247354]' : 'text-slate-500'
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )
}