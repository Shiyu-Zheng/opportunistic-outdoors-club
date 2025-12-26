import chokidar from 'chokidar'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

let buildTimeout = null

function runBuild() {
  console.log('\n[watch-i18n] Changes detected, rebuilding...')
  const build = spawn('node', ['src/build-i18n.js'], { cwd: rootDir, stdio: 'inherit' })
  build.on('close', (code) => {
    if (code === 0) {
      console.log('[watch-i18n] Rebuild complete, waiting for changes...\n')
    }
  })
}

// Debounce builds to avoid multiple rapid rebuilds
function debouncedBuild() {
  if (buildTimeout) clearTimeout(buildTimeout)
  buildTimeout = setTimeout(runBuild, 100)
}

// Watch locales, templates, and partials
const watcher = chokidar.watch([
  path.join(rootDir, 'locales', '*.json'),
  path.join(rootDir, 'templates', '*.html'),
  path.join(rootDir, 'partials', '*.html')
], {
  ignoreInitial: true,
  usePolling: true,
  interval: 500,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50
  }
})

watcher
  .on('change', (filePath) => {
    console.log(`[watch-i18n] File changed: ${path.relative(rootDir, filePath)}`)
    debouncedBuild()
  })
  .on('add', (filePath) => {
    console.log(`[watch-i18n] File added: ${path.relative(rootDir, filePath)}`)
    debouncedBuild()
  })
  .on('ready', () => {
    console.log('[watch-i18n] Watching for changes in locales/, templates/, partials/...\n')
  })
