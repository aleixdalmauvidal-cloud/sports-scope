"use client"

import { Instagram } from "lucide-react"

export function SocialSignalsCard() {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary">Social Signals</h3>
        <span className="px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] text-tertiary font-mono text-[10px]">
          Public data
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Instagram */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="w-4 h-4 text-secondary" />
            <span className="font-mono text-xs text-secondary">Instagram</span>
          </div>
          <div className="font-mono text-xl font-semibold text-primary">12.4M</div>
          <div className="font-mono text-xs text-accent-primary mt-1">+127K this month</div>
          <div className="font-mono text-xs text-secondary mt-1">Engagement: 4.2%</div>
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            <span className="font-mono text-xs text-secondary">TikTok</span>
          </div>
          <div className="font-mono text-xl font-semibold text-primary">8.1M</div>
          <div className="font-mono text-xs text-accent-primary mt-1">+340K this month</div>
          <div className="font-mono text-xs text-secondary mt-1">Avg Views: 1.8M</div>
        </div>
      </div>

      <div className="border-t border-border mt-4 pt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase text-tertiary">Engagement Rate</div>
          <div className="font-mono text-sm text-primary mt-1">4.2%</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-tertiary">Media Mentions</div>
          <div className="font-mono text-sm text-primary mt-1">312/30d</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-tertiary">Search Trend</div>
          <div className="font-mono text-sm text-accent-primary mt-1">↑</div>
        </div>
      </div>
    </div>
  )
}
