import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string
  icon: ReactNode
  tone?: 'default' | 'positive' | 'negative'
  hint?: string
}

const toneStyles = {
  default: 'text-[#202A35]',
  positive: 'text-[#278568]',
  negative: 'text-red-600',
}

export default function SummaryCard({ label, value, icon, tone = 'default', hint }: Props) {
  return (
    <div className="border-2 border-[#19372D] bg-white p-4 shadow-[3px_3px_0_#A9BC91] sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center border border-[#19372D] bg-[#CFE3C4] text-[#19372D]">
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-semibold tracking-wide ${toneStyles[tone]}`}>{value}</p>
      {hint && <p className="mt-2 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}