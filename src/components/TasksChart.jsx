import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

/**
 * @param {object} props
 * @param {number} props.completed
 * @param {number} props.pending
 */
export default function TasksChart({ completed, pending }) {
  const data = [
    { name: 'Completed', value: completed, key: 'done' },
    { name: 'Pending', value: pending, key: 'pend' },
  ].filter((d) => d.value > 0 || (completed === 0 && pending === 0))

  const empty = completed === 0 && pending === 0
  const chartData = empty ? [{ name: 'No data', value: 1, key: 'empty' }] : data

  const COLORS = {
    done: '#34d399',
    pend: '#818cf8',
    empty: '#334155',
  }

  return (
    <div className="flex h-full min-h-[220px] flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overview</p>
      <h3 className="mt-1 text-lg font-semibold text-white">Completed vs pending</h3>
      <div className="mt-4 flex flex-1 min-h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={empty ? 0 : 2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={COLORS[entry.key] ?? '#64748b'}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
              formatter={(value, name) => [value, name]}
            />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {empty ? (
        <p className="text-center text-xs text-slate-500">Add tasks to see the chart.</p>
      ) : null}
    </div>
  )
}
