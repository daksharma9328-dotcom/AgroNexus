const TABLE = 'agronexus_demo_state'

export function getCloudConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '')
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
  return { url, key, enabled: Boolean(url && key) }
}

function headers(key, json = false) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

export async function loadCloudState() {
  const { url, key, enabled } = getCloudConfig()
  if (!enabled || !navigator.onLine) return null

  const response = await fetch(
    `${url}/rest/v1/${TABLE}?id=eq.demo&select=payload,updated_at`,
    { headers: { ...headers(key), 'Cache-Control': 'no-cache' }, cache: 'no-store' }
  )
  if (!response.ok) throw new Error(`Cloud read failed (${response.status})`)

  const rows = await response.json()
  return rows[0] ? { ...rows[0].payload, cloudUpdatedAt: rows[0].updated_at } : null
}

export async function saveCloudState(state) {
  const { url, key, enabled } = getCloudConfig()
  if (!enabled || !navigator.onLine) return { skipped: true }

  const response = await fetch(`${url}/rest/v1/${TABLE}?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...headers(key, true),
      'Cache-Control': 'no-cache',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: 'demo',
      payload: state,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Cloud write failed (${response.status})${detail ? `: ${detail}` : ''}`)
  }
  return { saved: true }
}

export function cloudSyncEnabled() {
  return getCloudConfig().enabled
}

// Uses Supabase Realtime's Postgres Changes protocol directly so this
// source-only Vite bundle does not need an additional npm dependency.
// Realtime must be enabled for public.agronexus_demo_state in Supabase.
export function subscribeToCloudState(onSnapshot, onConnectionChange) {
  const { url, key, enabled } = getCloudConfig()
  if (!enabled || typeof WebSocket === 'undefined') return () => {}

  const origin = url.replace(/^http/i, 'ws')
  const socket = new WebSocket(`${origin}/realtime/v1/websocket?apikey=${encodeURIComponent(key)}&vsn=1.0.0`)
  const topic = `realtime:public:${TABLE}`
  let heartbeat

  socket.onopen = () => {
    socket.send(JSON.stringify({
      topic,
      event: 'phx_join',
      payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: '*', schema: 'public', table: TABLE, filter: 'id=eq.demo' }] } },
      ref: '1',
    }))
    heartbeat = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(Date.now()) }))
    }, 25000)
    onConnectionChange?.('connected')
  }
  socket.onmessage = event => {
    try {
      const message = JSON.parse(event.data)
      if (message.event !== 'postgres_changes') return
      const record = message.payload?.data?.record
      if (record?.id !== 'demo' || !record.payload) return
      const payload = typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload
      onSnapshot?.({ ...payload, cloudUpdatedAt: record.updated_at })
    } catch (error) { console.warn('AgroNexus realtime message:', error) }
  }
  socket.onerror = () => onConnectionChange?.('failed')
  socket.onclose = () => {
    if (heartbeat) window.clearInterval(heartbeat)
    onConnectionChange?.('closed')
  }
  return () => {
    if (heartbeat) window.clearInterval(heartbeat)
    socket.close()
  }
}
