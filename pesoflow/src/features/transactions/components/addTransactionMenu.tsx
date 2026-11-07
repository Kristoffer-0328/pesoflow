import { useEffect, useState } from 'react'
import {
  ArrowLeftRight,
  CircleDollarSign,
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
  angle: number // degrees, 180 = left, 90 = straight up, 0 = right
  type?: TransactionType
}

// Left to right. Main actions in the middle, coming-soon on the edges.
const actions: Action[] = [
  { label: 'Asset', icon: TrendingUp, color: 'bg-[#e2ad27]', angle: 160 },
  { label: 'Income', icon: CircleDollarSign, color: 'bg-[#278568]', angle: 125, type: 'income' },
  { label: 'Transfer', icon: ArrowLeftRight, color: 'bg-[#3185bd]', angle: 90, type: 'transfer' },
  { label: 'Expense', icon: ReceiptText, color: 'bg-[#d4483b]', angle: 55, type: 'expense' },
  { label: 'Debt', icon: UsersRound, color: 'bg-[#64716c]', angle: 20 },
]

const RADIUS = 128 // px from FAB center
const SIZE = 64 // px, button size

export default function AddTransactionMenu({
  onClose,
  onSelect,
}: {
  onClose: () => void
  onSelect: (type: TransactionType) => void
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

      {/* Origin point = FAB center. Tune bottom-[..] to match your nav. */}
      <div
        role="dialog"
        aria-label="Choose what to add"
        className="absolute bottom-[43px] left-1/2 h-0 w-0 md:bottom-24"
      >
        {actions.map(({ label, icon: Icon, color, angle, type }, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * RADIUS
          const y = Math.sin(rad) * RADIUS

          return (
            <button
              key={label}
              type="button"
              disabled={!type}
              onClick={() => type && onSelect(type)}
              aria-label={type ? `Add ${label}` : `${label} (coming soon)`}
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
                !type ? 'cursor-not-allowed' : ''
              }`}
            >
              <span
                className={`flex h-full w-full items-center justify-center rounded-2xl ${color} text-white shadow-[3px_4px_0_rgba(15,23,42,0.25)] transition group-active:translate-y-0.5 ${
                  type ? 'group-hover:-translate-y-1' : 'opacity-60'
                }`}
              >
                <Icon size={28} strokeWidth={2.2} />
              </span>

              <span className="absolute left-1/2 top-full mt-1.5 flex -translate-x-1/2 flex-col items-center whitespace-nowrap">
                <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-xs font-bold text-white">
                  {label}
                </span>
                {!type && (
                  <span className="mt-0.5 text-[10px] font-medium text-white/80">
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
          className="absolute left-0 top-0 flex items-center justify-center rounded-2xl bg-[#278568] text-white shadow-[3px_4px_0_rgba(15,23,42,0.25)] transition hover:bg-[#1f6e55]"
        >
          <X
            size={32}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${open ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>
      </div>
    </div>
  )
}