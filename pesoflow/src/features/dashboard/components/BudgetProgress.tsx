import { formatPeso } from '../../../utils/money'

interface Props {
  limit: number
  spent: number
  name?: string
}

export default function BudgetProgress({ limit, spent, name }: Props) {
  const percent = limit > 0 ? (spent / limit) * 100 : 0
  const isOver = spent > limit
  const remaining = limit - spent

  return (
    <div className="border-2 border-[#19372D] bg-white p-5 shadow-[3px_3px_0_#A9BC91]">
      <div className="mb-4 border-b-2 border-[#19372D] pb-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Your spending plan</p>
        <h3 className="mt-1 text-sm font-semibold text-[#202A35]">{name ?? 'Monthly Budget'}</h3>
      </div>

      <div className="mb-2 flex items-end justify-between">
        <span className="text-2xl font-semibold text-[#202A35]">{formatPeso(spent)}</span>
        <span className="text-sm text-slate-500">of {formatPeso(limit)}</span>
      </div>

      <div
        className="grid h-4 grid-cols-10 gap-1 border-2 border-[#19372D] bg-[#CFE3C4] p-0.5"
        aria-label={`${Math.round(percent)}% of budget used`}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={index < Math.ceil(Math.min(percent, 100) / 10)
              ? isOver
                ? 'bg-[#EF9580]'
                : 'bg-[#4A9A70]'
              : 'bg-[#FFFDF0]'}
          />
        ))}
      </div>

      <p className={`mt-3 text-sm ${isOver ? 'font-medium text-red-600' : 'text-slate-500'}`}>
        {isOver
          ? `Over budget by ${formatPeso(Math.abs(remaining))}`
          : `${formatPeso(remaining)} left (${Math.round(percent)}% used)`}
      </p>
    </div>
  )
}