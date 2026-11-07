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
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9EDF2] text-slate-600">
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-semibold ${toneStyles[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}