# The Opportunistic Outdoors Club

Static brochureware website for The Opportunistic Outdoors Club.

## Tech Stack

- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Vanilla JS** - No framework
- **i18n** - Custom build script for multi-language support

## Development

All development happens inside Docker. Use the PowerShell script:

```powershell
.\run.ps1
```

This builds the Docker image and starts the dev server at http://localhost:5173

## Key Commands

```bash
# Manual rebuild (normally not needed - dev server auto-rebuilds)
docker exec opportunisticoutdoorsclub-dev npm run build:i18n

# Production build
docker exec opportunisticoutdoorsclub-dev npm run build
```

## Deployment

Site deploys to GitHub Pages at `opportunisticoutdoors.club` via GitHub Actions.

- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Output**: `dist/` directory deployed to GitHub Pages

## Project Structure

- **`templates/`** - Page templates (one per page)
- **`partials/`** - Shared template fragments (header, footer, etc.)
- **`locales/`** - Translation JSON files (en.json, zh.json)
- **`src/`** - JS modules and build scripts
- **`public/`** - Static assets (logo, images) served at root
- **`docs/`** - Design references and documentation
- Generated HTML files are git-ignored; built from templates + locales

## i18n System

**Template syntax:**
- `{{key}}` or `{{nested.key}}` - replaced with locale values
- `{{> partialName}}` - includes `partials/partialName.html`
- `{{#each events.trips}}...{{/each}}` - loops over arrays, use `{{trip.X}}` inside
- `{{#each trip.bring}}...{{/each}}` - nested loops, use `{{this}}` for simple arrays
- `{{@index}}` - current index in loop
- `{{trip.field}}` - event page data (only in `event.html` template)

**Workflow:** Edit templates, partials, or locales → dev server auto-rebuilds → Vite hot-reloads

**Locale structure:** Hierarchical keys by section (`site`, `nav`, `home`, `about`, `faq`, `events`)

**Master file:** `en.json` is the source of truth; sync changes to `zh.json`

## Events

- **Date format**: ISO dates in JSON (e.g., `"2026-01-18"`) formatted by JS in the UI
- **Past events hidden**: Cards with dates before today are automatically hidden on the homepage
- **Structure**: Each trip has `itinerary` (timed stops), `faq` (per-trip Q&A), and `routeDescription` (summary)

**Adding a new event:**
1. Add trip object to `events.trips` array in `locales/en.json`
2. Copy and translate in `locales/zh.json`
3. Add slug to `.gitignore` (e.g., `/new-event-slug/`)
4. Build generates `/{slug}/index.html` and `/zh/{slug}/index.html`

## Conventions

- **Mobile-first**: Design for mobile, then scale up with Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- **Max width**: `max-w-6xl` (1152px) for content containers
- **Dark mode**: Class-based (`dark` class on `<html>`), persisted to localStorage
- **Language**: URL-based (`/` for English, `/zh/` for Chinese), preference in localStorage
- **Font**: Inter (loaded from Google Fonts)
- **Icons**: Inline SVGs with `stroke-width="1.5"`
- **Colors**: Zinc palette from Tailwind
- **Border radius**: `rounded-2xl` for major containers
- **Placeholder images**: Use https://placehold.co/
- **No em dashes**: Use periods, commas, or rewrite the sentence instead of em dashes (— or ——)

## Writing Style for Copy

These guidelines apply to `description`, `routeDescription`, and similar narrative fields.

### DO

- **Use "we or we'll"** - This is a group activity ("We start from the village...")
- **Write chronologically** - Describe the trip as it unfolds, from start to finish
- **Include real details** - Research actual facts: pub names, historical dates, place names
- **Focus on the place** - What will participants see, experience, walk through?
- **Be conversational but informative** - Friendly tone, real substance

### DO NOT

- **No marketing speak** - Avoid "fairytale", "hidden gem", "breathtaking", "unmissable"
- **No FOMO/dark patterns** - Never "Spaces limited!", "Book now!", "Don't miss out!"
- **No robotic formality** - Avoid "10:00am sharp", "participants will", "one can observe"
- **No fluffy transitions** - Skip "Nestled in...", "X sits majestically", "Boasting..."
- **No excessive enthusiasm** - No exclamation marks in descriptions

### Example (description field)

```json
{
  "description": "We start from the village, up through evergreen forest, then out onto open hillside with sheep grazing. At the top are Bronze Age burial mounds (4000 years old) and views across to Weston-super-Mare. We head back down a different route to the Gwaelod y Garth Inn, a 19th century pub with flagstone floors and open fires."
}
```
