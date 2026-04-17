export type PlayerTier = "elite" | "premium" | "mid" | "emerging"
export type Position = "FW" | "MF" | "DF" | "GK"

// Map each player to a local photo matching their club colors & appearance.
// Photos are stored at /public/players/rank-{N}.jpg for ranks 1-15.
export function getPlayerPhoto(rankOrId: number | string): string {
  let rank: number
  if (typeof rankOrId === "string") {
    const p = mockPlayers.find((pl) => pl.id === rankOrId)
    rank = p?.rank ?? 1
  } else {
    rank = rankOrId
  }
  const photoNumber = ((rank - 1) % 15) + 1
  return `/players/rank-${photoNumber}.jpg`
}

export interface Player {
  id: string
  rank: number
  name: string
  nationality: string
  nationalityFlag: string
  club: string
  league: string
  position: Position
  age: number
  cmvScore: number
  sportsScore: number
  socialScore: number
  oppScore: number
  delta7d: number
  tier: PlayerTier
  trendData: number[]
  trend: "up" | "down" | "flat"
  imageId?: number
}

export const mockPlayers: Player[] = [
  {
    id: "a1000000-0000-0000-0000-000000000006",
    rank: 1,
    name: "Lamine Yamal",
    nationality: "Spain",
    nationalityFlag: "🇪🇸",
    club: "Barcelona",
    league: "LaLiga",
    position: "MF",
    age: 18,
    cmvScore: 82,
    sportsScore: 86,
    socialScore: 88,
    oppScore: 84,
    delta7d: 3.4,
    tier: "elite",
    trendData: [68, 72, 75, 78, 80, 82],
    trend: "up",
    imageId: 1073665,
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    rank: 2,
    name: "Vinicius Jr",
    nationality: "Brazil",
    nationalityFlag: "🇧🇷",
    club: "Real Madrid",
    league: "LaLiga",
    position: "FW",
    age: 24,
    cmvScore: 61,
    sportsScore: 80,
    socialScore: 88,
    oppScore: 47,
    delta7d: -2.1,
    tier: "elite",
    trendData: [64, 63, 63, 62, 62, 61],
    trend: "down",
    imageId: 278,
  },
  {
    id: "a1000000-0000-0000-0000-000000000023",
    rank: 3,
    name: "Mohamed Salah",
    nationality: "Egypt",
    nationalityFlag: "🇪🇬",
    club: "Liverpool",
    league: "Premier League",
    position: "MF",
    age: 32,
    cmvScore: 60,
    sportsScore: 91,
    socialScore: 74,
    oppScore: 47,
    delta7d: 1.2,
    tier: "elite",
    trendData: [57, 58, 58, 59, 59, 60],
    trend: "up",
    imageId: 306,
  },
  {
    id: "a1000000-0000-0000-0000-000000000008",
    rank: 4,
    name: "Raphinha",
    nationality: "Brazil",
    nationalityFlag: "🇧🇷",
    club: "Barcelona",
    league: "LaLiga",
    position: "FW",
    age: 28,
    cmvScore: 56,
    sportsScore: 88,
    socialScore: 66,
    oppScore: 47,
    delta7d: -0.8,
    tier: "elite",
    trendData: [58, 57, 57, 57, 56, 56],
    trend: "down",
    imageId: 61431,
  },
  {
    id: "a1000000-0000-0000-0000-000000000019",
    rank: 5,
    name: "Erling Haaland",
    nationality: "Norway",
    nationalityFlag: "🇳🇴",
    club: "Man City",
    league: "Premier League",
    position: "FW",
    age: 24,
    cmvScore: 56,
    sportsScore: 84,
    socialScore: 68,
    oppScore: 47,
    delta7d: -19.8,
    tier: "elite",
    trendData: [76, 72, 68, 62, 58, 56],
    trend: "down",
    imageId: 1100,
  },
  {
    id: "a1000000-0000-0000-0000-000000000007",
    rank: 6,
    name: "Pedri",
    nationality: "Spain",
    nationalityFlag: "🇪🇸",
    club: "Barcelona",
    league: "LaLiga",
    position: "MF",
    age: 22,
    cmvScore: 53,
    sportsScore: 77,
    socialScore: 62,
    oppScore: 47,
    delta7d: -18.2,
    tier: "premium",
    trendData: [71, 67, 63, 59, 55, 53],
    trend: "down",
    imageId: 161944,
  },
  {
    id: "a1000000-0000-0000-0000-000000000030",
    rank: 7,
    name: "Nico Williams",
    nationality: "Spain",
    nationalityFlag: "🇪🇸",
    club: "Athletic",
    league: "LaLiga",
    position: "FW",
    age: 22,
    cmvScore: 51,
    sportsScore: 72,
    socialScore: 62,
    oppScore: 47,
    delta7d: -8.6,
    tier: "premium",
    trendData: [60, 58, 56, 54, 52, 51],
    trend: "down",
    imageId: 402097,
  },
  {
    id: "a1000000-0000-0000-0000-000000000009",
    rank: 8,
    name: "Robert Lewandowski",
    nationality: "Poland",
    nationalityFlag: "🇵🇱",
    club: "Barcelona",
    league: "LaLiga",
    position: "FW",
    age: 36,
    cmvScore: 50,
    sportsScore: 84,
    socialScore: 47,
    oppScore: 47,
    delta7d: 3.0,
    tier: "premium",
    trendData: [45, 46, 47, 48, 49, 50],
    trend: "up",
    imageId: 521,
  },
  {
    id: "a1000000-0000-0000-0000-000000000020",
    rank: 9,
    name: "Phil Foden",
    nationality: "England",
    nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    club: "Man City",
    league: "Premier League",
    position: "MF",
    age: 24,
    cmvScore: 50,
    sportsScore: 70,
    socialScore: 58,
    oppScore: 47,
    delta7d: -11.2,
    tier: "premium",
    trendData: [61, 58, 55, 53, 51, 50],
    trend: "down",
    imageId: 629,
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    rank: 10,
    name: "Federico Valverde",
    nationality: "Uruguay",
    nationalityFlag: "🇺🇾",
    club: "Real Madrid",
    league: "LaLiga",
    position: "MF",
    age: 26,
    cmvScore: 49,
    sportsScore: 78,
    socialScore: 48,
    oppScore: 47,
    delta7d: -8.3,
    tier: "premium",
    trendData: [57, 55, 53, 51, 50, 49],
    trend: "down",
    imageId: 730,
  },
  {
    id: "a1000000-0000-0000-0000-000000000011",
    rank: 11,
    name: "Antoine Griezmann",
    nationality: "France",
    nationalityFlag: "🇫🇷",
    club: "Atletico",
    league: "LaLiga",
    position: "FW",
    age: 33,
    cmvScore: 49,
    sportsScore: 79,
    socialScore: 47,
    oppScore: 47,
    delta7d: 0.6,
    tier: "premium",
    trendData: [48, 48, 48, 49, 49, 49],
    trend: "flat",
    imageId: 1863,
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    rank: 12,
    name: "Jude Bellingham",
    nationality: "England",
    nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    club: "Real Madrid",
    league: "LaLiga",
    position: "MF",
    age: 21,
    cmvScore: 47,
    sportsScore: 81,
    socialScore: 39,
    oppScore: 47,
    delta7d: -27.2,
    tier: "mid",
    trendData: [74, 68, 60, 55, 50, 47],
    trend: "down",
    imageId: 129718,
  },
  {
    id: "a1000000-0000-0000-0000-000000000013",
    rank: 13,
    name: "Victor Gyokeres",
    nationality: "Sweden",
    nationalityFlag: "🇸🇪",
    club: "Arsenal",
    league: "Premier League",
    position: "FW",
    age: 26,
    cmvScore: 43,
    sportsScore: 89,
    socialScore: 20,
    oppScore: 47,
    delta7d: 0,
    tier: "mid",
    trendData: [43, 43, 43, 43, 43, 43],
    trend: "flat",
    imageId: 175982,
  },
  {
    id: "a1000000-0000-0000-0000-000000000014",
    rank: 14,
    name: "Kylian Mbappé",
    nationality: "France",
    nationalityFlag: "🇫🇷",
    club: "Real Madrid",
    league: "LaLiga",
    position: "FW",
    age: 26,
    cmvScore: 43,
    sportsScore: 88,
    socialScore: 20,
    oppScore: 47,
    delta7d: 0,
    tier: "mid",
    trendData: [43, 43, 43, 43, 43, 43],
    trend: "flat",
    imageId: 278,
  },
  {
    id: "a1000000-0000-0000-0000-000000000015",
    rank: 15,
    name: "Bryan Mbeumo",
    nationality: "Cameroon",
    nationalityFlag: "🇨🇲",
    club: "Man United",
    league: "Premier League",
    position: "FW",
    age: 25,
    cmvScore: 43,
    sportsScore: 87,
    socialScore: 20,
    oppScore: 47,
    delta7d: 0,
    tier: "mid",
    trendData: [43, 43, 43, 43, 43, 43],
    trend: "flat",
    imageId: 156597,
  },
]

export const weeklyMovers = {
  risers: [
    { id: "a1000000-0000-0000-0000-000000000006", name: "Lamine Yamal", club: "Barcelona", cmv: 63, delta: 3.4 },
    { id: "a1000000-0000-0000-0000-000000000009", name: "Robert Lewandowski", club: "Barcelona", cmv: 50, delta: 3.0 },
    { id: "a1000000-0000-0000-0000-000000000023", name: "Mohamed Salah", club: "Liverpool", cmv: 60, delta: 1.2 },
  ],
  fallers: [
    { id: "a1000000-0000-0000-0000-000000000003", name: "Jude Bellingham", club: "Real Madrid", cmv: 47, delta: -27.2 },
    { id: "a1000000-0000-0000-0000-000000000019", name: "Erling Haaland", club: "Man City", cmv: 56, delta: -19.8 },
    { id: "a1000000-0000-0000-0000-000000000007", name: "Pedri", club: "Barcelona", cmv: 53, delta: -18.2 },
  ],
}

export interface StatCard {
  label: string
  value: string | number
  change: number
  trend: "up" | "down" | "flat"
}

export const mockStats: StatCard[] = [
  { label: "Total Players Tracked", value: "2,847", change: 12, trend: "up" },
  { label: "Elite Tier", value: 156, change: 3, trend: "up" },
  { label: "Avg Market Value", value: "€47.2M", change: -2, trend: "down" },
  { label: "Active Transfers", value: 23, change: 5, trend: "up" },
]

export const leagues = ["All", "LaLiga", "Premier League", "Ligue 1", "Bundesliga", "Serie A"] as const
export type League = (typeof leagues)[number]

// ============================================================
// DETAILED PLAYER PROFILE DATA
// ============================================================

export interface PlayerProfile {
  marketValue: string | null
  commercial: {
    brandedPostsPerMonth: number | null
    sponsorshipDensity: string | null
    brandVerticals: string[]
    detectedCategories: string[]
    recommendedCampaigns: string[]
    mainSponsors: string[]
    brandFit: {
      lifestyleAppeal: number | null
      sportswearFit: number | null
      bettingFit: number | null
      brandSafety: number | null
    }
  }
  social: {
    instagram: {
      followers: string | null
      engagementRate: string | null
      engagementLabel: string | null
      avgLikes: string | null
      avgComments: string | null
    }
    tiktok: {
      followers: string | null
      avgViews: string | null
    }
    x: { followers: string | null }
    youtube: { subscribers: string | null; avgViews: string | null }
  }
  content: {
    postingFrequency: string | null
    avgVideoViews: string | null
  }
  audienceQuality: "Elite" | "Excellent" | "Above average" | "Good" | null
  sports: {
    goals: number
    assists: number
    apps: number
    minutes: number
    formRating: number
    passAccuracy: number
    goalsPer90: number
    assistsPer90: number
    season: string
  }
}

// Manually curated profiles for top players to match real stats
const playerProfiles: Record<string, Partial<PlayerProfile>> = {
  // Lamine Yamal
  "a1000000-0000-0000-0000-000000000006": {
    marketValue: null,
    social: {
      instagram: {
        followers: "41.5M",
        engagementRate: "10.7%",
        engagementLabel: "Above average",
        avgLikes: "4.4M",
        avgComments: "64.5K",
      },
      tiktok: { followers: "38.3M", avgViews: null },
      x: { followers: null },
      youtube: { subscribers: null, avgViews: null },
    },
    content: { postingFrequency: "0.37 posts/day", avgVideoViews: "7,630,061" },
    audienceQuality: "Elite",
    sports: {
      goals: 15,
      assists: 11,
      apps: 27,
      minutes: 2224,
      formRating: 7.94,
      passAccuracy: 80.0,
      goalsPer90: 0.61,
      assistsPer90: 0.45,
      season: "2025/26",
    },
  },
  // Vinicius Jr
  "a1000000-0000-0000-0000-000000000002": {
    marketValue: "€180M",
    social: {
      instagram: {
        followers: "56.8M",
        engagementRate: "8.4%",
        engagementLabel: "Excellent",
        avgLikes: "3.2M",
        avgComments: "48.1K",
      },
      tiktok: { followers: "24.1M", avgViews: "12.4M" },
      x: { followers: "9.2M" },
      youtube: { subscribers: "1.8M", avgViews: "420K" },
    },
    content: { postingFrequency: "0.48 posts/day", avgVideoViews: "9,241,320" },
    audienceQuality: "Elite",
    sports: {
      goals: 18,
      assists: 9,
      apps: 29,
      minutes: 2480,
      formRating: 7.82,
      passAccuracy: 78.3,
      goalsPer90: 0.65,
      assistsPer90: 0.33,
      season: "2025/26",
    },
    commercial: {
      brandedPostsPerMonth: 3.2,
      sponsorshipDensity: "High",
      brandVerticals: ["Sportswear", "Lifestyle", "Automotive"],
      detectedCategories: ["Nike", "Pepsi", "Red Bull"],
      recommendedCampaigns: ["Social Activation", "Influencer Campaign", "Product Launch"],
      mainSponsors: ["Nike", "Pepsi", "EA Sports"],
      brandFit: { lifestyleAppeal: 92, sportswearFit: 95, bettingFit: 41, brandSafety: 78 },
    },
  },
  // Salah
  "a1000000-0000-0000-0000-000000000023": {
    marketValue: "€55M",
    social: {
      instagram: {
        followers: "68.4M",
        engagementRate: "4.2%",
        engagementLabel: "Good",
        avgLikes: "2.8M",
        avgComments: "32.4K",
      },
      tiktok: { followers: "15.2M", avgViews: "8.1M" },
      x: { followers: "18.6M" },
      youtube: { subscribers: "2.4M", avgViews: "680K" },
    },
    content: { postingFrequency: "0.42 posts/day", avgVideoViews: "5,120,480" },
    audienceQuality: "Excellent",
    sports: {
      goals: 21,
      assists: 14,
      apps: 31,
      minutes: 2710,
      formRating: 8.12,
      passAccuracy: 82.7,
      goalsPer90: 0.70,
      assistsPer90: 0.46,
      season: "2025/26",
    },
  },
  // Haaland
  "a1000000-0000-0000-0000-000000000019": {
    marketValue: "€200M",
    social: {
      instagram: {
        followers: "38.2M",
        engagementRate: "9.1%",
        engagementLabel: "Excellent",
        avgLikes: "2.9M",
        avgComments: "41.2K",
      },
      tiktok: { followers: "12.8M", avgViews: "6.4M" },
      x: { followers: "4.1M" },
      youtube: { subscribers: "1.2M", avgViews: "340K" },
    },
    content: { postingFrequency: "0.31 posts/day", avgVideoViews: "4,820,150" },
    audienceQuality: "Elite",
    sports: {
      goals: 28,
      assists: 6,
      apps: 30,
      minutes: 2580,
      formRating: 8.34,
      passAccuracy: 71.2,
      goalsPer90: 0.98,
      assistsPer90: 0.21,
      season: "2025/26",
    },
  },
}

// Generate reasonable defaults for any player based on their scores
export function getPlayerProfile(player: Player): PlayerProfile {
  const override = playerProfiles[player.id] || {}

  // Derive sensible defaults from scores
  const socialK = Math.round((player.socialScore / 100) * 80 + 5) // 5M to 85M followers
  const sportsFactor = player.sportsScore / 100
  const commercialFactor = player.oppScore / 100

  const defaultProfile: PlayerProfile = {
    marketValue: null,
    commercial: {
      brandedPostsPerMonth: player.oppScore > 60 ? Math.round(commercialFactor * 40) / 10 : null,
      sponsorshipDensity: player.oppScore > 70 ? "High" : player.oppScore > 50 ? "Medium" : null,
      brandVerticals: [],
      detectedCategories: [],
      recommendedCampaigns: ["Social Activation", "Influencer Campaign"],
      mainSponsors: [],
      brandFit: {
        lifestyleAppeal: null,
        sportswearFit: null,
        bettingFit: null,
        brandSafety: null,
      },
    },
    social: {
      instagram: {
        followers: `${socialK.toFixed(1)}M`,
        engagementRate: `${(4 + (player.socialScore / 100) * 8).toFixed(1)}%`,
        engagementLabel: player.socialScore > 80 ? "Excellent" : player.socialScore > 60 ? "Above average" : "Good",
        avgLikes: `${(socialK * 0.08).toFixed(1)}M`,
        avgComments: `${Math.round(socialK * 1.5)}K`,
      },
      tiktok: {
        followers: player.socialScore > 50 ? `${(socialK * 0.6).toFixed(1)}M` : null,
        avgViews: player.socialScore > 70 ? `${(socialK * 0.15).toFixed(1)}M` : null,
      },
      x: { followers: player.socialScore > 60 ? `${(socialK * 0.2).toFixed(1)}M` : null },
      youtube: {
        subscribers: player.socialScore > 70 ? `${(socialK * 0.04).toFixed(1)}M` : null,
        avgViews: player.socialScore > 70 ? `${Math.round(socialK * 10)}K` : null,
      },
    },
    content: {
      postingFrequency: `${(0.2 + (player.socialScore / 100) * 0.4).toFixed(2)} posts/day`,
      avgVideoViews: (Math.round(socialK * 180000)).toLocaleString("en-US"),
    },
    audienceQuality: player.socialScore > 85 ? "Elite" : player.socialScore > 70 ? "Excellent" : player.socialScore > 55 ? "Above average" : "Good",
    sports: {
      goals: Math.round(sportsFactor * 22),
      assists: Math.round(sportsFactor * 14),
      apps: Math.round(24 + sportsFactor * 8),
      minutes: Math.round(1800 + sportsFactor * 900),
      formRating: Math.round((5.5 + sportsFactor * 3.2) * 100) / 100,
      passAccuracy: Math.round((65 + sportsFactor * 20) * 10) / 10,
      goalsPer90: Math.round(sportsFactor * 90) / 100,
      assistsPer90: Math.round(sportsFactor * 55) / 100,
      season: "2025/26",
    },
  }

  return {
    ...defaultProfile,
    ...override,
    commercial: { ...defaultProfile.commercial, ...(override.commercial || {}) },
    social: {
      instagram: { ...defaultProfile.social.instagram, ...(override.social?.instagram || {}) },
      tiktok: { ...defaultProfile.social.tiktok, ...(override.social?.tiktok || {}) },
      x: { ...defaultProfile.social.x, ...(override.social?.x || {}) },
      youtube: { ...defaultProfile.social.youtube, ...(override.social?.youtube || {}) },
    },
    content: { ...defaultProfile.content, ...(override.content || {}) },
    sports: { ...defaultProfile.sports, ...(override.sports || {}) },
  }
}
