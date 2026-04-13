import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ACTOR_ID = 'dSCLg0C3YEZ83HzYX'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
  }
}

async function runApifyActor(usernames: string[]) {
  console.log(`🚀 Lanzando Apify para: ${usernames.join(', ')}`)

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ usernames, resultsLimit: 1 }),
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

async function saveToSupabase(athleteId: string, igData: any) {
  const today = new Date().toISOString().split('T')[0]
  const followers = igData.followersCount ?? null
  const posts = igData.latestPosts ?? []
  const avgLikes = posts.length > 0
    ? Math.round(posts.reduce((acc: number, p: any) => acc + (p.likesCount ?? 0), 0) / posts.length)
    : null
  const avgComments = posts.length > 0
    ? Math.round(posts.reduce((acc: number, p: any) => acc + (p.commentsCount ?? 0), 0) / posts.length)
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
    const batch = athletes.slice(i, i + batchSize)
    const usernames = batch.map(a => a.instagram_handle!)
    const results = await runApifyActor(usernames)
    if (!results) continue

    for (const igData of results) {
      const athlete = batch.find(
        a => a.instagram_handle?.toLowerCase() === igData.username?.toLowerCase()
      )
      if (!athlete) continue
      await saveToSupabase(athlete.id, igData)
    }
  }

  console.log('🎉 Scraping completado')
}

main()
