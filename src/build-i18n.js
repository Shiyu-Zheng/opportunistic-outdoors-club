import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

// Support --outDir argument for production builds
const args = process.argv.slice(2)
const outDirIndex = args.indexOf('--outDir')
const outDir = outDirIndex !== -1 && args[outDirIndex + 1]
  ? path.resolve(rootDir, args[outDirIndex + 1])
  : rootDir

// Load Vite manifest for production builds (to get hashed asset paths)
let manifest = null
const manifestPath = path.join(outDir, '.vite', 'manifest.json')
if (outDir !== rootDir && fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  console.log('Using Vite manifest for asset paths')
}

// Replace source paths with built asset paths from manifest
function replaceAssetPaths(html) {
  if (!manifest) return html

  const entry = manifest['index.html']
  if (!entry) return html

  // Replace CSS path
  if (entry.css && entry.css[0]) {
    html = html.replace(
      /href="\/src\/styles\.css"/g,
      `href="/${entry.css[0]}"`
    )
  }

  // Replace JS path
  if (entry.file) {
    html = html.replace(
      /src="\/src\/main\.js"/g,
      `src="/${entry.file}"`
    )
  }

  return html
}

const localesDir = path.join(rootDir, 'locales')
const templatesDir = path.join(rootDir, 'templates')
const partialsDir = path.join(rootDir, 'partials')

// Load English as the base/authority for all locales
const enTranslations = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'))

// Fields that always come from English (not translated)
const ENGLISH_ONLY_FIELDS = ['date', 'times', 'spotsFilled', 'spotsTotal', 'startLat', 'startLng', 'endLat', 'endLng']

// Copy English-only fields to locale trips
function applyEnglishFields(localeData) {
  if (!localeData.events?.trips || !enTranslations.events?.trips) return localeData

  localeData.events.trips.forEach(trip => {
    const enTrip = enTranslations.events.trips.find(t => t.slug === trip.slug)
    if (!enTrip) return
    ENGLISH_ONLY_FIELDS.forEach(field => {
      if (enTrip[field] !== undefined) {
        trip[field] = enTrip[field]
      }
    })
  })

  return localeData
}

// Get trip slugs from translations object
function getTripSlugs(translations) {
  if (!translations.events?.trips) return []
  return translations.events.trips.map(trip => trip.slug)
}

// Get trip data by slug
function getTripBySlug(translations, slug) {
  if (!translations.events?.trips) return null
  return translations.events.trips.find(trip => trip.slug === slug)
}

// Resolve nested keys like "faq.title" from object
function resolve(obj, key) {
  return key.split('.').reduce((o, k) => o?.[k], obj)
}

// Load all partials into memory
const partials = {}
if (fs.existsSync(partialsDir)) {
  for (const file of fs.readdirSync(partialsDir).filter(f => f.endsWith('.html'))) {
    const name = path.basename(file, '.html')
    partials[name] = fs.readFileSync(path.join(partialsDir, file), 'utf-8')
  }
}

// Replace {{> partialName}} with partial content
function applyPartials(template) {
  return template.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (match, name) => {
    return partials[name] !== undefined ? partials[name] : match
  })
}

// Process {{#each path.to.array}} blocks with {{item.X}} or {{@index}} placeholders
function processEachBlocks(template, translations) {
  const eachRegex = /\{\{#each ([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g
  return template.replace(eachRegex, (match, arrayPath, blockContent) => {
    const arr = resolve(translations, arrayPath)
    if (!Array.isArray(arr)) return match

    // Determine item variable name from path (e.g., "events.trips" -> "trip", "faq.items" -> "item")
    const pathParts = arrayPath.split('.')
    const lastPart = pathParts[pathParts.length - 1]
    const itemName = lastPart === 'trips' ? 'trip' : 'item'

    return arr.map((item, index) => {
      let result = blockContent
      // Replace {{@index}} with current index
      result = result.replace(/\{\{@index\}\}/g, index)
      // Replace {{itemName.X}} with actual values
      const itemRegex = new RegExp(`\\{\\{${itemName}\\.([^}]+)\\}\\}`, 'g')
      result = result.replace(itemRegex, (m, key) => {
        const value = resolve(item, key)
        if (value === undefined) return m
        if (typeof value === 'object') return JSON.stringify(value)
        return value
      })
      return result
    }).join('\n')
  })
}

const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'))
const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'))

for (const templateFile of templateFiles) {
  const pageName = path.basename(templateFile, '.html')
  const templatePath = path.join(templatesDir, templateFile)
  const rawTemplate = fs.readFileSync(templatePath, 'utf-8')
  const templateWithPartials = applyPartials(rawTemplate)

  for (const localeFile of localeFiles) {
    const lang = path.basename(localeFile, '.json')
    const localePath = path.join(localesDir, localeFile)
    const localeData = JSON.parse(fs.readFileSync(localePath, 'utf-8'))

    // Apply English-only fields (dates, spots, coordinates) to non-English locales
    const translations = lang === 'en' ? localeData : applyEnglishFields(localeData)

    // Get trip slugs from English (authority for what trips exist)
    const tripSlugs = getTripSlugs(translations)

    // For event.html, generate a page for each trip
    const variants = pageName === 'event' ? tripSlugs : [null]

    for (const tripSlug of variants) {
      // Get trip data for event pages
      const tripData = tripSlug ? getTripBySlug(translations, tripSlug) : null

      // Replace TRIP_SLUG placeholder and inject trip data
      let template = templateWithPartials
      if (tripSlug && tripData) {
        template = template.replace(/TRIP_SLUG/g, tripSlug)

        // Process {{#each trip.X}} blocks (e.g., trip.bring)
        template = template.replace(/\{\{#each trip\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, blockContent) => {
          const arr = tripData[arrayKey]
          if (!Array.isArray(arr)) return match
          return arr.map(item => {
            return blockContent.replace(/\{\{this\}\}/g, item)
          }).join('\n')
        })

        // Replace {{trip.X}} with actual trip values for event pages
        template = template.replace(/\{\{trip\.([^}]+)\}\}/g, (m, key) => {
          const value = resolve(tripData, key)
          if (value === undefined) return m
          if (typeof value === 'object') return JSON.stringify(value)
          return value
        })
      }

      // Process {{#each events}} blocks
      template = processEachBlocks(template, translations)

      // Replace all {{key}} or {{nested.key}} placeholders
      const output = template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = resolve(translations, key)
        if (value === undefined) return match
        // Stringify arrays and objects for use in data attributes
        if (typeof value === 'object') {
          return JSON.stringify(value)
        }
        return value
      })

      // Determine output path
      const outputName = tripSlug || pageName
      let outputPath
      if (outputName === 'index') {
        if (lang === 'en') {
          outputPath = path.join(outDir, 'index.html')
        } else {
          outputPath = path.join(outDir, lang, 'index.html')
        }
      } else {
        if (lang === 'en') {
          outputPath = path.join(outDir, outputName, 'index.html')
        } else {
          outputPath = path.join(outDir, lang, outputName, 'index.html')
        }
      }

      // Ensure directory exists
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Replace source paths with built asset paths for production
      const finalOutput = replaceAssetPaths(output)

      fs.writeFileSync(outputPath, finalOutput)
      const relativePath = path.relative(outDir, outputPath)
      console.log(`Generated: ${relativePath}`)
    }
  }
}

console.log('i18n build complete!')
