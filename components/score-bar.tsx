interface ScoreBarProps {
  label: string
  value: number
}

export function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs uppercase tracking-widest">
          {label}
        </span>
        <span className="text-white text-sm font-light tabular-nums">
          {value}
        </span>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#00ff87] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
