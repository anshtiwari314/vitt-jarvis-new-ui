import { execSync } from 'child_process'
import { cpSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Run the normal Vite build
console.log('Running Vite build...')
execSync('vite build', { stdio: 'inherit' })

// Ensure dist folder exists
const distDir = join(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Copy lame.min.js
console.log('Copying lame.min.js to dist...')
cpSync(join(process.cwd(), 'lame.min.js'), join(distDir, 'lame.min.js'))

// Copy required assets from node_modules
const copyFrom = (src, dest) => {
  if (!existsSync(src)) {
    console.warn(`Source path not found: ${src}`)
    return
  }
  cpSync(src, dest, { recursive: true })
}

console.log('Copying ONNX runtime wasm files...')
copyFrom(
  join(process.cwd(), 'node_modules', 'onnxruntime-web', 'dist'),
  distDir
)

console.log('Copying VAD web assets...')
copyFrom(
  join(process.cwd(), 'node_modules', '@ricky0123', 'vad-web', 'dist'),
  distDir
)

console.log('Build complete.')
