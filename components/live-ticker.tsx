"use client"

const tickerData = [
  { name: "LAMINE YAMAL", cmv: 63, delta: 3.4, up: true },
  { name: "VINICIUS JR", cmv: 61, delta: -2.1, up: false },
  { name: "SALAH", cmv: 60, delta: 1.2, up: true },
  { name: "RAPHINHA", cmv: 56, delta: -0.8, up: false },
  { name: "HAALAND", cmv: 56, delta: -19.8, up: false },
  { name: "MBAPPÉ", cmv: 58, delta: 2.3, up: true },
  { name: "BELLINGHAM", cmv: 55, delta: 1.8, up: true },
  { name: "SAKA", cmv: 52, delta: -0.5, up: false },
]

function TickerItem({ name, cmv, delta, up }: { name: string; cmv: number; delta: number; up: boolean }) {
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap">
      <span className="text-foreground font-medium">{name}</span>
      <span className="text-foreground-tertiary">CMV</span>
      <span className="font-semibold text-accent-primary">{cmv}</span>
      <span className={`font-semibold ${up ? "text-positive" : "text-negative"}`}>
        {up ? "+" : ""}{delta.toFixed(1)}
      </span>
    </span>
  )
}

export function LiveTicker() {
  const items = [...tickerData, ...tickerData] // Duplicate for seamless loop

  return (
    <div className="w-full overflow-hidden border-t border-b border-border-default bg-[rgba(0,255,135,0.02)]">
      <div className="animate-ticker flex items-center gap-12 py-3.5 font-mono text-xs">
        {items.map((item, index) => (
          <TickerItem key={index} {...item} />
        ))}
      </div>
    </div>
  )
}
