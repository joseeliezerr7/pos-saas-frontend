/**
 * Pre-build validation script
 * Ensures the correct environment variables are set before building.
 * Prevents deploying with wrong API URL.
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const mode = process.argv[2] || 'production'
const envFile = mode === 'production' ? '.env.production' : `.env.${mode}`
const envPath = resolve(rootDir, envFile)

console.log(`\n🔍 Validating environment for mode: ${mode}`)
console.log(`   Reading: ${envFile}`)

if (!existsSync(envPath)) {
  console.error(`\n❌ ERROR: ${envFile} not found!`)
  console.error(`   Expected at: ${envPath}`)
  console.error(`   Create this file before building.\n`)
  process.exit(1)
}

const envContent = readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')
const env = {}

for (const line of lines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...valueParts] = trimmed.split('=')
  env[key.trim()] = valueParts.join('=').trim()
}

const apiUrl = env.VITE_API_URL

if (!apiUrl) {
  console.error('\n❌ ERROR: VITE_API_URL is not set!')
  process.exit(1)
}

// Production validations
if (mode === 'production') {
  if (!apiUrl.includes('api.vexosync.com')) {
    console.error(`\n❌ ERROR: Production build must use api.vexosync.com`)
    console.error(`   Current VITE_API_URL: ${apiUrl}`)
    console.error(`   Expected: https://api.vexosync.com/api\n`)
    process.exit(1)
  }

  if (apiUrl.includes('localhost') || apiUrl.includes('solucionestechn')) {
    console.error(`\n❌ ERROR: Production build is pointing to a non-production API!`)
    console.error(`   Current VITE_API_URL: ${apiUrl}\n`)
    process.exit(1)
  }
}

console.log(`   VITE_API_URL: ${apiUrl}`)
console.log(`   VITE_APP_NAME: ${env.VITE_APP_NAME || '(not set)'}`)
console.log(`✅ Environment validated successfully!\n`)
