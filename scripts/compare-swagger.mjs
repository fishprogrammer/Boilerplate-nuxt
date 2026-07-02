import fs from 'node:fs'

const schema = fs.readFileSync('.tmp-schema.json', 'utf8')
const swaggerPaths = [...schema.matchAll(/^  (\/api\/[^:]+):/gm)].map((m) =>
  m[1].replace(/\\-/g, '-'),
)

const endpointsSource = fs.readFileSync('api/endpoints.ts', 'utf8')
const frontendPaths = new Set()
for (const m of endpointsSource.matchAll(/['`](\/api\/[^'`]+)['`]/g)) {
  let p = m[1]
  p = p.replace(/\$\{[^}]+\}/g, '{id}')
  frontendPaths.add(p)
}

function normalize(p) {
  return p.replace(/\{slug\}/g, '{id}').replace(/\{user_id\}/g, '{id}').replace(/\{order_id\}/g, '{id}').replace(/\{token\}/g, '{id}')
}

const covered = new Set([...frontendPaths].map(normalize))

const missing = swaggerPaths.filter((p) => {
  const n = normalize(p)
  if (covered.has(n)) return false
  if (covered.has(n.replace(/\/$/, ''))) return false
  if ([...covered].some((f) => f.replace(/\/$/, '') === n.replace(/\/$/, ''))) return false
  return true
})

console.log('Swagger paths:', swaggerPaths.length)
console.log('Frontend path patterns:', frontendPaths.size)
console.log('\nMissing in frontend endpoints.ts:')
missing.sort().forEach((p) => console.log(p))
