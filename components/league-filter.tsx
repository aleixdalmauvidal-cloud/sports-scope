"use client";

/** @deprecated Prefer `RankingsFilterBar` + `lib/rankings-filters` on the home page. */
interface LeagueFilterProps {
  selected: string;
  onChange: (league: string) => void;
}

const leagues = ["All", "LaLiga", "Premier League", "Ligue 1", "Bundesliga", "Serie A"];

export function LeagueFilter({ selected, onChange }: LeagueFilterProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {leagues.map((league) => (
        <button
          key={league}
          type="button"
          onClick={() => onChange(league)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            selected === league
              ? "bg-[#38A047] text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {league}
        </button>
      ))}
    </div>
  );
}
