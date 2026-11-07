import { formatPeso } from '../../../utils/money'

interface Props {
  limit: number
  spent: number
}

export default function BudgetProgress({ limit, spent }: Props) {
  const percent = limit > 0 ? (spent / limit) * 100 : 0
  const isOver = spent > limit
  const remaining = limit - spent

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold text-[#202A35]">Monthly Budget</h3>

      <div className="mb-2 flex items-end justify-between">
        <span className="text-2xl font-semibold text-[#202A35]">{formatPeso(spent)}</span>
        <span className="text-sm text-slate-500">of {formatPeso(limit)}</span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-[#E9EDF2]">
        <div
          className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-[#278568]'}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <p className={`mt-3 text-sm ${isOver ? 'font-medium text-red-600' : 'text-slate-500'}`}>
        {isOver
          ? `Over budget by ${formatPeso(Math.abs(remaining))}`
          : `${formatPeso(remaining)} left (${Math.round(percent)}% used)`}
      </p>
    </div>
  )
}