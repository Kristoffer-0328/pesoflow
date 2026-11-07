import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatPeso } from '../../../utils/money'

interface Item {
  categoryId: string
  name: string
  color: string
  amount: number
}

export default function SpendingBreakdown({ data }: { data: Item[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold text-[#202A35]">Spending Breakdown</h3>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">No expenses recorded this month.</p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.categoryId} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPeso(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-sm font-semibold text-[#202A35]">{formatPeso(total)}</span>
            </div>
          </div>

          <ul className="w-full space-y-2.5">
            {data.map((d) => (
              <li key={d.categoryId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-[#202A35]">
                  {formatPeso(d.amount)}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {Math.round((d.amount / total) * 100)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}