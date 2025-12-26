function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav')
  const iconOpen = document.getElementById('menu-icon-open')
  const iconClose = document.getElementById('menu-icon-close')

  nav.classList.toggle('hidden')
  iconOpen.classList.toggle('hidden')
  iconClose.classList.toggle('hidden')
}

window.toggleMobileMenu = toggleMobileMenu
