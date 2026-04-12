import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { CMVHistoryChart } from "@/components/cmv-history-chart"
import { getPlayerProfile, mapPlayerProfileToV0Player } from "@/lib/players"
import { formatScore } from "@/lib/format"

interface PlayerPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { id } = await params
  const profile = await getPlayerProfile(id)

  if (!profile) {
    return { title: "Player Not Found | Sports Scope" }
  }

  return {
    title: `${profile.name} | CMV ${formatScore(profile.cmv_total)} | Sports Scope`,
    description: `${profile.name} commercial market value profile. CMV Score: ${formatScore(profile.cmv_total)}/100. ${profile.club} | ${profile.position}`,
  }
}



function ArcGauge({ score, color }: { score: number; color: string }) {
  const radius = 28;
  const cx = 40;
  const cy = 40;
  const totalArc = 201.06;
  const filled = (score / 100) * totalArc;
  const startAngle = -220;
  const endAngle = 40;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(toRad(startAngle));
  const y1 = cy + radius * Math.sin(toRad(startAngle));
  const x2 = cx + radius * Math.cos(toRad(endAngle));
  const y2 = cy + radius * Math.sin(toRad(endAngle));

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x2} ${y2}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${totalArc}`}
      />
      <text
        x="40"
        y="44"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="16"
        fontWeight="500"
      >
        {score}
      </text>
    </svg>
  );
}

function CMVBreakdown({ player }: { player: { sportsScore: number; socialScore: number; commercialScore: number; brandFitScore: number; momentumScore: number; adjustmentsScore: number } }) {
  const gauges = [
    { label: "Sports Value", weight: "20%", score: player.sportsScore, color: "#7C6FFF" },
    { label: "Social & Marketing", weight: "35%", score: player.socialScore, color: "#00E5A0" },
    { label: "Commercial History", weight: "15%", score: player.commercialScore, color: "#FFB547" },
    { label: "Brand Fit", weight: "10%", score: player.brandFitScore, color: "#4FC3F7" },
    { label: "Momentum", weight: "10%", score: player.momentumScore, color: "#FF6B9D" },
    { label: "Adjustments", weight: "10%", score: player.adjustmentsScore, color: "#69F0AE" },
  ];

  return (
    <div style={{ marginBottom: "32px" }}>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
        CMV Breakdown
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px"
      }}>
        {gauges.map((g) => (
          <div key={g.label} style={{
            background: "#0C0C18",
            borderRadius: "10px",
            borderLeft: `3px solid ${g.color}`,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px"
          }}>
            <ArcGauge score={g.score} color={g.color} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              {g.label}
            </p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
              {g.weight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerPhotoArea({ player }: { player: { photoGradient: string; accentColor: string; shirtNumber: number; name: string; club: string } }) {
  return (
    <div 
      style={{
        width: "280px",
        height: "320px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        background: player.photoGradient,
        flexShrink: 0,
      }}
    >
      {/* Accent color top bar */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          backgroundColor: player.accentColor,
        }}
      />
      
      {/* Dot grid pattern top-right */}
      <div 
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 3px)",
          gap: "10px",
        }}
      >
        {[...Array(9)].map((_, i) => (
          <div 
            key={i}
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: player.accentColor,
              opacity: 0.15,
            }}
          />
        ))}
      </div>
      
      {/* Shirt number watermark */}
      <span 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "140px",
          fontWeight: 900,
          color: "white",
          opacity: 0.06,
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        {player.shirtNumber}
      </span>
      
      {/* Player initials circle */}
      <div 
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: `${player.accentColor}26`,
          border: `2px solid ${player.accentColor}B3`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span 
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: player.accentColor,
          }}
        >
          {player.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      
      {/* Club logo badge */}
      <div 
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          backgroundColor: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span 
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: player.accentColor,
          }}
        >
          {player.club[0]}
        </span>
      </div>
    </div>
  );
}

function SocialMetricCard({ 
  label, 
  value, 
  change,
  status
}: { 
  label: string
  value: string
  change?: string
  status?: string
}) {
  return (
    <div className="bg-muted/50 rounded-[10px] p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
      {change && (
        <p className="text-xs text-[#00E5A0] mt-1">{change} this month</p>
      )}
      {status && (
        <p className="text-xs text-muted-foreground mt-1">({status})</p>
      )}
    </div>
  )
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  const profile = await getPlayerProfile(id)

  if (!profile) {
    notFound()
  }

  const player = mapPlayerProfileToV0Player(profile)

  const isPositiveChange = player.weeklyChange >= 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Back Link */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Rankings</span>
            </Link>
            <Link
              href={`/compare?with=${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-[#7C6FFF]/40 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#7C6FFF]" />
              Compare with another player
            </Link>
          </div>

          {/* Player Header - 2 Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Left Column - Photo Area */}
            <div className="hidden lg:block">
              <PlayerPhotoArea player={player} />
            </div>
            
            {/* Right Column - Info & CMV */}
            <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {/* Club & Position & Nationality & National Team */}
                <div className="flex items-center gap-3 mb-4 text-muted-foreground text-sm flex-wrap">
                  <span>{player.club}</span>
                  <span className="text-border">·</span>
                  <span>{player.position}</span>
                  <span className="text-border">·</span>
                  <span>{player.nationality} {player.flag}</span>
                  <span className="text-border">·</span>
                  {/* National Team Indicator */}
                  <span 
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
                    style={{ 
                      backgroundColor: player.calledUp ? "rgba(0, 229, 160, 0.1)" : "rgba(255,255,255,0.05)",
                      border: player.calledUp ? "1px solid rgba(0, 229, 160, 0.2)" : "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    {player.calledUp && (
                      <span 
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#00E5A0",
                        }}
                      />
                    )}
                    <span>{player.flag}</span>
                    <span style={{ color: player.calledUp ? "#00E5A0" : "rgba(255,255,255,0.4)", fontSize: "11px" }}>
                      {player.calledUp ? "Called up" : "INT"}
                    </span>
                  </span>
                </div>

                {/* Player Name */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-none mb-3">
                  {player.name}
                </h1>
                
                {/* Age & Market Value */}
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span>Age {player.age}</span>
                  <span className="text-border">·</span>
                  <span>Market Value {player.marketValue}</span>
                </div>
              </div>

              {/* CMV Score */}
              <div className="lg:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Commercial Market Value
                </p>
                <p 
                  className="text-[120px] font-bold text-[#7C6FFF] leading-none" 
                  style={{ textShadow: '0 0 80px rgba(124, 111, 255, 0.5), 0 0 120px rgba(124, 111, 255, 0.3)' }}
                >
                  {player.cmvScore}
                </p>
                <div className={`flex items-center gap-1 mt-3 ${isPositiveChange ? 'text-[#00E5A0]' : 'text-[#FF4D6A]'} lg:justify-end`}>
                  {player.weeklyChange !== 0 && (
                    isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isPositiveChange ? '+' : ''}{player.weeklyChange.toFixed(1)} vs last week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CMV Breakdown */}
          <CMVBreakdown player={player} />

          {/* Social Stats */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-foreground mb-4">Social Stats</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SocialMetricCard 
                label="Instagram Followers" 
                value={player.instagram} 
                change={player.instagramGrowth}
              />
              <SocialMetricCard 
                label="TikTok Followers" 
                value={player.tiktok} 
                change={player.tiktokGrowth}
              />
              <SocialMetricCard 
                label="Engagement Rate" 
                value={player.engagementRate} 
                status={player.engagementStatus}
              />
              <SocialMetricCard 
                label="Follower Growth 30d" 
                value={player.followerGrowth30d} 
              />
            </div>
          </div>

          {/* CMV History Chart */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-foreground mb-4">CMV History (90 Days)</h2>
            <div className="bg-card rounded-[10px] border border-border p-6">
              <CMVHistoryChart data={player.cmvHistory} />
            </div>
          </div>

          {/* Brand Verticals */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-foreground mb-4">Brand Verticals</h2>
            <div className="flex flex-wrap gap-3">
              {player.brandVerticals.map((vertical) => (
                <span 
                  key={vertical}
                  className="px-4 py-2 bg-[#7C6FFF]/10 border border-[#7C6FFF]/20 rounded-lg text-sm text-foreground hover:bg-[#7C6FFF]/15 hover:border-[#7C6FFF]/40 transition-colors cursor-default"
                >
                  {vertical}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
