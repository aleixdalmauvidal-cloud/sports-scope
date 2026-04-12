"use client"

interface LeagueFilterProps {
  selected: string
  onChange: (league: string) => void
}

const leagues = ["All", "LaLiga", "Premier League"]

export function LeagueFilter({ selected, onChange }: LeagueFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {leagues.map((league) => (
        <button
          key={league}
          onClick={() => onChange(league)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            selected === league
              ? "bg-[#7C6FFF] text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {league}
        </button>
      ))}
    </div>
  )
}
