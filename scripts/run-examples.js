#!/usr/bin/env node
/**
 * Auto-discover and run all TypeScript examples
 */

const { execSync } = require('child_process')
const { readdirSync } = require('fs')
const { join } = require('path')

const examplesDir = join(__dirname, '../examples')
const files = readdirSync(examplesDir)
  .filter(file => file.endsWith('.ts'))
  .sort()

console.log(`📚 Running ${files.length} examples...\n`)

files.forEach((file, index) => {
  const filePath = join(examplesDir, file)
  console.log(`\n${'='.repeat(60)}`)
  console.log(`[${index + 1}/${files.length}] 📝 ${file}`)
  console.log('='.repeat(60))

  try {
    execSync(
      `ts-node -r tsconfig-paths/register "${filePath}"`,
      {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      }
    )
    console.log(`\n✅ ${file} - Type check and execution passed`)
  } catch (error) {
    console.error(`\n❌ ${file} - Failed`)
    process.exit(1)
  }
})

console.log(`\n🎉 All ${files.length} examples passed!`)
