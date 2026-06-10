/**
 * Aplica as migrations do PipeFlow CRM no Supabase.
 *
 * Pré-requisito: adicionar ao .env.local
 *   SUPABASE_DB_URL=postgresql://postgres:[SENHA]@db.hmxmtzqbioxyyjqmobyd.supabase.co:5432/postgres
 *
 * A senha está em: Supabase Dashboard → Settings → Database → Connection string
 *
 * Uso:
 *   node supabase/apply-migrations.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dir = dirname(fileURLToPath(import.meta.url))

// Carregar .env.local manualmente (sem dotenv instalado globalmente)
function loadEnv() {
  try {
    const envPath = join(__dir, '..', '.env.local')
    const lines = readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local pode não existir em CI
  }
}

loadEnv()

const DB_URL = process.env.SUPABASE_DB_URL

if (!DB_URL) {
  console.error(`
❌  SUPABASE_DB_URL não encontrada no .env.local

Adicione a linha abaixo ao arquivo .env.local:
  SUPABASE_DB_URL=postgresql://postgres:[SENHA]@db.hmxmtzqbioxyyjqmobyd.supabase.co:5432/postgres

Encontre a senha em:
  Supabase Dashboard → Settings → Database → Connection string (URI)
`)
  process.exit(1)
}

// Verificar se pg está instalado
let pg
try {
  const req = createRequire(import.meta.url)
  pg = req('pg')
} catch {
  console.error(`
❌  Pacote "pg" não encontrado. Instale-o temporariamente:
  pnpm add -D pg
`)
  process.exit(1)
}

const { Client } = pg

const MIGRATIONS_DIR = join(__dir, 'migrations')

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('✅ Conectado ao banco\n')

  // Tabela de controle de migrations
  await client.query(`
    create table if not exists public._migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    )
  `)

  const { rows: applied } = await client.query(
    'select name from public._migrations order by name'
  )
  const appliedSet = new Set(applied.map((r) => r.name))

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let count = 0
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏭  ${file} — já aplicada`)
      continue
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`⏳ Aplicando ${file}…`)
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO public._migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`✅ ${file} — aplicada com sucesso`)
      count++
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`❌ ${file} — ERRO:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()

  if (count === 0) {
    console.log('\n🎉 Todas as migrations já estavam aplicadas.')
  } else {
    console.log(`\n🎉 ${count} migration(s) aplicada(s) com sucesso.`)
  }
}

run().catch((err) => {
  console.error('Erro inesperado:', err)
  process.exit(1)
})
