interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-zinc-500 text-xs uppercase tracking-widest">
        {label}
      </span>
      <span className="text-white text-2xl md:text-3xl font-light tabular-nums">
        {value}
      </span>
    </div>
  )
}
