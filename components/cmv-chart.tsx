"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

const chartData = [
  { month: "May", cmv: 45 },
  { month: "Jun", cmv: 48 },
  { month: "Jul", cmv: 51 },
  { month: "Aug", cmv: 49 },
  { month: "Sep", cmv: 53 },
  { month: "Oct", cmv: 55 },
  { month: "Nov", cmv: 54 },
  { month: "Dec", cmv: 57 },
  { month: "Jan", cmv: 59 },
  { month: "Feb", cmv: 58 },
  { month: "Mar", cmv: 61 },
  { month: "Apr", cmv: 63 },
]

const periods = ["1W", "1M", "3M", "1Y"] as const

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2 border border-border rounded-lg px-3 py-2">
        <p className="font-mono text-xs text-tertiary">{label}</p>
        <p className="font-mono text-sm font-semibold text-primary">
          CMV {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export function CMVChart() {
  const [activePeriod, setActivePeriod] = useState<(typeof periods)[number]>("1Y")

  const startValue = chartData[0].cmv
  const endValue = chartData[chartData.length - 1].cmv
  const peakValue = Math.max(...chartData.map((d) => d.cmv))
  const change = endValue - startValue

  return (
    <div className="bg-surface-1 border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary">CMV Evolution</h3>
        <div className="flex gap-1">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={cn(
                "px-2 py-1 rounded font-mono text-xs transition-colors",
                activePeriod === period
                  ? "bg-accent-primary/15 text-accent-primary"
                  : "text-tertiary hover:text-secondary"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,229,160,0.2)" />
                <stop offset="100%" stopColor="rgba(0,229,160,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cmv"
              stroke="#00E5A0"
              strokeWidth={2}
              fill="url(#greenGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#00E5A0", stroke: "#00E5A0" }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-6 mt-4 pt-4 border-t border-border">
        <div className="font-mono text-xs text-secondary">
          Start: <span className="text-primary">{startValue}</span>
        </div>
        <div className="font-mono text-xs text-secondary">
          Peak: <span className="text-primary">{peakValue}</span>
        </div>
        <div className="font-mono text-xs text-secondary">
          <span className="text-accent-primary">+{change} pts</span> over 12m
        </div>
      </div>
    </div>
  )
}
