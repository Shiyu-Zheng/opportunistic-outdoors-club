function getCurrentLanguage() {
  return location.pathname.startsWith('/zh') ? 'zh' : 'en'
}

function setLanguage(lang) {
  localStorage.setItem('preferredLanguage', lang)
  if (lang === getCurrentLanguage()) return

  const path = location.pathname
  let newPath

  if (lang === 'zh') {
    // Add /zh prefix
    newPath = '/zh' + path
  } else {
    // Remove /zh prefix
    newPath = path.replace(/^\/zh/, '') || '/'
  }

  window.location.href = newPath
}

// Set dropdown to current language
const langSelect = document.getElementById('lang-select')
if (langSelect) langSelect.value = getCurrentLanguage()

window.setLanguage = setLanguage
