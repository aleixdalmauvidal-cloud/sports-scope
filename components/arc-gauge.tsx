"use client"

// Subscore colors
export const subscoreColors = {
  sports: "#38A047",
  social: "#7A9490",
  commercial: "#C8D8D4",
  brandFit: "#4A5E58",
  momentum: "#2D9E50",
  adjustments: "#2D7A3A",
} as const

export type SubscoreType = keyof typeof subscoreColors

interface ArcGaugeProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color: string
  label?: string
  showLabel?: boolean
}

export function ArcGauge({ 
  value, 
  max = 100, 
  size = 36, 
  strokeWidth = 3,
  color,
  label,
  showLabel = true 
}: ArcGaugeProps) {
  const radius = parseFloat((((size - strokeWidth) / 2).toFixed(4)))
  const center = parseFloat((size / 2).toFixed(4))

  // Arc from -135° to +135° (270° total sweep)
  const startAngle = -135
  const endAngle = 135
  const totalSweep = endAngle - startAngle

  // Calculate the arc path (round all floats to avoid SSR/client hydration mismatches)
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180
    return {
      x: parseFloat((cx + r * Math.cos(angleInRadians)).toFixed(4)),
      y: parseFloat((cy + r * Math.sin(angleInRadians)).toFixed(4)),
    }
  }

  const describeArc = (cx: number, cy: number, r: number, startAngleDeg: number, endAngleDeg: number) => {
    const start = polarToCartesian(cx, cy, r, endAngleDeg)
    const end = polarToCartesian(cx, cy, r, startAngleDeg)
    const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1"
    const rr = parseFloat(r.toFixed(4))
    return `M ${start.x} ${start.y} A ${rr} ${rr} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  const percentage = Math.min(value / max, 1)
  const filledAngle = parseFloat((startAngle + totalSweep * percentage).toFixed(4))

  const backgroundPath = describeArc(center, center, radius, startAngle, endAngle)
  const filledPath = describeArc(center, center, radius, startAngle, filledAngle)
  
  // Font size scales with gauge size
  const fontSize = size <= 40 ? 10 : size <= 60 ? 14 : 20
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background arc */}
          <path
            d={backgroundPath}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={filledPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
        {/* Value in center */}
        <div 
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ color, fontSize }}
        >
          {value}
        </div>
      </div>
      {showLabel && label && (
        <span className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  )
}

// Large arc gauge for player profile page using exact SVG spec
interface LargeArcGaugeCardProps {
  value: number
  color: string
  label: string
  weight: string
}

export function LargeArcGaugeCard({ value, color, label, weight }: LargeArcGaugeCardProps) {
  // Total arc length is 201.06 (for a 270° arc with radius 32)
  const totalArcLength = 201.06
  const fillLength = (value / 100) * totalArcLength
  const dashArray = `${fillLength.toFixed(2)} ${totalArcLength}`
  
  return (
    <div 
      className="rounded-[10px] p-5 flex flex-col items-center"
      style={{ 
        backgroundColor: "#0C0C18",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Background track */}
        <path
          d="M 14.645 65.355 A 32 32 0 1 1 65.355 65.355"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Colored fill arc */}
        <path
          d="M 14.645 65.355 A 32 32 0 1 1 65.355 65.355"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={dashArray}
        />
        {/* Score label */}
        <text 
          x="40" 
          y="45" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill={color}
          fontSize="16"
          fontWeight="500"
        >
          {value}
        </text>
      </svg>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "8px", textAlign: "center" }}>{label}</p>
      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: "4px" }}>{weight}</p>
    </div>
  )
}
