"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface CMVHistoryChartProps {
  data: number[]
}

export function CMVHistoryChart({ data }: CMVHistoryChartProps) {
  // Generate dates for the last 90 days (15 data points representing ~6 day intervals)
  const chartData = data.map((value, index) => {
    const daysAgo = 90 - (index * 6)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      cmv: value,
    }
  })

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cmvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38A047" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#38A047" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            horizontal={true}
            vertical={false}
            stroke="rgba(56,160,71,0.10)"
            strokeDasharray="0"
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7A9490', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7A9490', fontSize: 12 }}
            dx={-10}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(56,160,71,0.22)', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: '#1C2420',
              border: '1px solid rgba(56,160,71,0.22)',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
            labelStyle={{ color: '#7A9490', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            itemStyle={{ color: '#FFFFFF', fontSize: 16, fontWeight: 700 }}
            labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
            formatter={(value: number) => [`CMV: ${value}`, '']}
          />
          <Area
            type="monotone"
            dataKey="cmv"
            stroke="#38A047"
            strokeWidth={2}
            fill="url(#cmvGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#38A047', stroke: '#0D1110', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
