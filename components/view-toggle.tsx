"use client"

import { LayoutGrid, TableIcon } from "lucide-react"

interface ViewToggleProps {
  view: "table" | "card"
  onChange: (view: "table" | "card") => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-full border border-border bg-muted/30 p-1">
      <button
        onClick={() => onChange("table")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === "table"
            ? "bg-[#38A047] text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <TableIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => onChange("card")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === "card"
            ? "bg-[#38A047] text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  )
}
