import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ACTOR_ID = 'shu8hvrXbJbY3Eb9W'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
  }
}

async function runApifyActor(usernames: string[]) {
  const uniqueUsernames = [...new Set(usernames)]
  console.log(`🚀 Lanzando Apify para: ${uniqueUsernames.join(', ')}`)

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        directUrls: uniqueUsernames.map(u => `https://www.instagram.com/${u}/`),
        resultsType: 'posts',
        resultsLimit: 12,
        addParentData: true,
      }),
    }
  )

  const run = await runRes.json()
  const runId = run.data?.id

  if (!runId) {
    console.error('❌ Error lanzando actor:', run)
    return null
  }

  console.log(`⏳ Run iniciado: ${runId} — esperando resultados...`)

  let status = 'RUNNING'
  while (status === 'RUNNING' || status === 'READY') {
    await new Promise(r => setTimeout(r, 5000))
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { headers: getHeaders() }
    )
    const statusData = await statusRes.json()
    status = statusData.data?.status
    console.log(`   status: ${status}`)
  }

  if (status !== 'SUCCEEDED') {
    console.error(`❌ Run falló con status: ${status}`)
    return null
  }

  const runInfoRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}`,
    { headers: getHeaders() }
  )
  const runInfo = await runInfoRes.json()
  const datasetId = runInfo.data.defaultDatasetId

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    { headers: getHeaders() }
  )
  return await itemsRes.json()
}

async function getFollowersMonthAgo(athleteId: string): Promise<number | null> {
  const today = new Date()
  const from = new Date(today)
  from.setDate(from.getDate() - 35)
  const to = new Date(today)
  to.setDate(to.getDate() - 25)

  const { data } = await supabase
    .from('social_metrics')
    .select('ig_followers')
    .eq('athlete_id', athleteId)
    .gte('date', from.toISOString().split('T')[0])
    .lte('date', to.toISOString().split('T')[0])
    .not('ig_followers', 'is', null)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  return data?.ig_followers ?? null
}

async function saveToSupabase(
  athleteId: string,
  posts: any[],
  followers: number | null,
) {
  const today = new Date().toISOString().split('T')[0]
  const captions = posts
    .map((p: any) => p.caption ?? p.text ?? '')
    .filter(Boolean)
    .slice(0, 12)
  const avgLikes = posts.length > 0
    ? Math.round(posts.reduce((acc: number, p: any) => acc + (p.likesCount ?? 0), 0) / posts.length)
    : null
  const avgComments = posts.length > 0
    ? Math.round(posts.reduce((acc: number, p: any) => acc + (p.commentsCount ?? 0), 0) / posts.length)
    : null

  const viewCounts = posts
    .map((p: any) => p.videoViewCount ?? p.videoPlayCount)
    .filter((v: any) => typeof v === 'number' && Number.isFinite(v))
  const avgViews = viewCounts.length > 0
    ? Math.round(viewCounts.reduce((acc: number, v: number) => acc + v, 0) / viewCounts.length)
    : null

  const savesCounts = posts
    .map((p: any) => p.savesCount)
    .filter((v: any) => typeof v === 'number' && Number.isFinite(v))
  const avgSaves = savesCounts.length > 0
    ? Math.round(savesCounts.reduce((acc: number, v: number) => acc + v, 0) / savesCounts.length)
    : null

  const postingFrequency = posts.length > 0
    ? parseFloat((posts.length / 30).toFixed(4))
    : null

  const previousFollowers = await getFollowersMonthAgo(athleteId)
  const followerGrowth30d =
    (previousFollowers != null && followers != null)
      ? followers - previousFollowers
      : null
  const engagementRate = followers && avgLikes
    ? parseFloat(((avgLikes / followers) * 100).toFixed(2))
    : null

  const { error } = await supabase
    .from('social_metrics')
    .upsert({
      athlete_id: athleteId,
      date: today,
      ig_followers: followers,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      avg_views: avgViews,
      posting_frequency: postingFrequency,
      follower_growth_30d: followerGrowth30d,
      avg_saves: avgSaves,
      latest_post_captions: captions,
      engagement_rate: engagementRate,
    }, { onConflict: 'athlete_id,date' })

  if (error) {
    console.error(`❌ Error guardando ${athleteId}:`, error.message)
  } else {
    console.log(`✅ Guardado — ${athleteId} — followers: ${followers}`)
  }
}

async function main() {
  const { data: athletes, error } = await supabase
    .from('athletes')
    .select('id, name, instagram_handle')
    .not('instagram_handle', 'is', null)

  if (error || !athletes?.length) {
    console.log('⚠️  No hay atletas con instagram_handle.')
    return
  }

  console.log(`📋 ${athletes.length} atletas con Instagram handle`)

  const batchSize = 10
  for (let i = 0; i < athletes.length; i += batchSize) {
    const rawBatch = athletes.slice(i, i + batchSize)
    const uniqueBatchByHandle = new Map<string, (typeof rawBatch)[number]>()
    for (const a of rawBatch) {
      const handle = a.instagram_handle?.toLowerCase()
      if (!handle) continue
      if (!uniqueBatchByHandle.has(handle)) uniqueBatchByHandle.set(handle, a)
    }
    const batch = [...uniqueBatchByHandle.values()]
    const uniqueUsernames = [...new Set(batch.map(a => a.instagram_handle!))]
    const results = await runApifyActor(uniqueUsernames)
    if (!results) continue

    const postsByOwner = new Map<string, { posts: any[]; followersCount: number | null }>()

    for (const post of results) {
      const ownerUsername: string | undefined =
        post.ownerUsername ??
        post.owner?.username ??
        post?.user?.username

      if (!ownerUsername) continue

      const key = ownerUsername.toLowerCase()

      const followersFromPost: number | null =
        post.ownerProfile?.followersCount ??
        post.owner?.followersCount ??
        post.followersCount ??
        null

      const existing = postsByOwner.get(key)
      if (existing) {
        existing.posts.push(post)
        if (existing.followersCount == null && followersFromPost != null) {
          existing.followersCount = followersFromPost
        }
      } else {
        postsByOwner.set(key, {
          posts: [post],
          followersCount: followersFromPost,
        })
      }
    }

    for (const athlete of batch) {
      const handle = athlete.instagram_handle
      if (!handle) continue

      const key = handle.toLowerCase()
      const grouped = postsByOwner.get(key)
      if (!grouped) continue

      await saveToSupabase(athlete.id, grouped.posts, grouped.followersCount)
    }
  }

  console.log('🎉 Scraping completado')
}

main()
