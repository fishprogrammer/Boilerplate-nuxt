import { nextTick } from 'vue'

export const LAYOUT_MAIN_SELECTOR = '.layout-main'

const SCROLL_ROOT_SELECTORS = [
  LAYOUT_MAIN_SELECTOR,
  '.layout-main-content',
] as const

function releaseBodyScrollLock() {
  const body = document.body
  const html = document.documentElement
  if (body.style.position !== 'fixed') return

  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  html.style.overflow = ''
  body.style.overflow = ''
}

export function getLayoutMainElement(): HTMLElement | null {
  const node = document.querySelector(LAYOUT_MAIN_SELECTOR)
  return node instanceof HTMLElement ? node : null
}

export function scrollAppToTop(behavior: ScrollBehavior = 'smooth') {
  releaseBodyScrollLock()

  const options: ScrollToOptions = { top: 0, left: 0, behavior }

  for (const selector of SCROLL_ROOT_SELECTORS) {
    document.querySelectorAll(selector).forEach((node) => {
      if (node instanceof HTMLElement) {
        node.scrollTo(options)
      }
    })
  }

  window.scrollTo(options)
  document.documentElement.scrollTo(options)
  document.body.scrollTo(options)
}

let scrollToken = 0

export function scheduleScrollAppToTop(behavior: ScrollBehavior = 'smooth') {
  const token = ++scrollToken

  void nextTick(() => {
    requestAnimationFrame(() => {
      if (token !== scrollToken) return
      scrollAppToTop(behavior)

      requestAnimationFrame(() => {
        if (token !== scrollToken) return
        scrollAppToTop(behavior)
      })
    })
  })
}
