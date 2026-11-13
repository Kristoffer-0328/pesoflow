import { useEffect, useState } from 'react'
import {
  ArrowLeftRight,
  CircleDollarSign,
  Home,
  ReceiptText,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react'
import type { TransactionType } from '../../../types'

type Action = {
  label: string
  icon: typeof CircleDollarSign
  color: string
  type?: TransactionType
  home?: boolean
}

const actions: Action[] = [
  { label: 'Asset', icon: TrendingUp, color: 'bg-[#e2ad27]' },
  { label: 'Income', icon: CircleDollarSign, color: 'bg-[#278568]', type: 'income' },
  { label: 'Home', icon: Home, color: 'bg-[#247354]', home: true },
  { label: 'Transfer', icon: ArrowLeftRight, color: 'bg-[#3185bd]', type: 'transfer' },
  { label: 'Expense', icon: ReceiptText, color: 'bg-[#d4483b]', type: 'expense' },
  { label: 'Debt', icon: UsersRound, color: 'bg-[#64716c]', type: 'debt' },
]

const RADIUS = 145 // px from FAB center
const SIZE = 50 // px, button size
const START_ANGLE = 160 // leftmost button
const END_ANGLE = 20 // rightmost button (symmetric around 90°)

export default function AddTransactionMenu({
  onClose,
  onSelect,
  onHome,
}: {
  onClose: () => void
  onSelect: (type: TransactionType) => void
  onHome: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close add menu"
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Origin point matches the mobile FAB center: nav center minus half the FAB height. */}
      <div
        role="dialog"
        aria-label="Choose what to add"
        className="absolute bottom-14 left-1/2 h-0 w-0 md:bottom-24"
      >
        {actions.map(({ label, icon: Icon, color, type, home }, i) => {
          const angle = START_ANGLE + (i * (END_ANGLE - START_ANGLE)) / (actions.length - 1)
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * RADIUS
          const y = Math.sin(rad) * RADIUS

          const handleClick = () => {
            if (home) {
              onHome()
            } else if (type) {
              onSelect(type)
            }
          }

          return (
            <button
              key={label}
              type="button"
              disabled={!type && !home}
              onClick={handleClick}
              aria-label={home ? 'Go to Home' : type ? `Add ${label}` : `${label} (coming soon)`}
              style={{
                width: SIZE,
                height: SIZE,
                marginLeft: -SIZE / 2,
                marginTop: -SIZE / 2,
                transform: open
                  ? `translate(${x}px, ${-y}px) scale(1)`
                  : 'translate(0px, 0px) scale(0.3)',
                opacity: open ? 1 : 0,
                transitionDelay: open ? `${i * 30}ms` : '0ms',
              }}
              className={`group absolute left-0 top-0 transition-all duration-300 ease-out motion-reduce:transition-none ${
                !type && !home ? 'cursor-not-allowed' : ''
              }`}
            >
              <span
                className={`flex h-full w-full items-center justify-center border-2 border-[#19372D] ${color} text-white shadow-[4px_4px_0_#19372D] transition group-active:translate-x-1 group-active:translate-y-1 ${
                  type || home ? 'group-hover:-translate-y-1' : 'opacity-60'
                }`}
              >
                <Icon size={24} strokeWidth={2.2} />
              </span>

              <span className="absolute left-1/2 top-full mt-1.5 flex -translate-x-1/2 flex-col items-center whitespace-nowrap">
                <span className="border-2 border-[#19372D] bg-[#FFFDF0] px-2 py-0.5 text-xs font-bold text-[#19372D] shadow-[2px_2px_0_#19372D]">
                  {label}
                </span>
                {!type && !home && (
                  <span className="mt-1 border border-[#19372D] bg-[#FFFDF0] px-1 text-[10px] font-medium text-[#19372D]">
                    Coming soon
                  </span>
                )}
              </span>
            </button>
          )
        })}

        {/* Close button sits exactly on the FAB */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add menu"
          style={{
            width: SIZE,
            height: SIZE,
            marginLeft: -SIZE / 2,
            marginTop: -SIZE / 2,
          }}
          className="absolute left-0 top-0 flex items-center justify-center border-2 border-[#19372D] bg-[#278568] text-white shadow-[4px_4px_0_#19372D] transition hover:bg-[#1f6e55]"
        >
          <X
            size={28}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${open ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>
      </div>
    </div>
  )
}