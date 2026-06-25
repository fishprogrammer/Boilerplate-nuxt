export type TooltipPlacement = 'top' | 'bottom'

export interface TooltipOptions {
  target: HTMLElement
  text: string
  placement?: TooltipPlacement
  wrap?: boolean
}

const SHOW_DELAY = 350
const GAP = 8
const VIEWPORT_PADDING = 8

let tooltipEl: HTMLDivElement | null = null
let showTimeout: ReturnType<typeof setTimeout> | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let activeTarget: HTMLElement | null = null

function getTooltipEl(): HTMLDivElement {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'app-tooltip-root'
    tooltipEl.setAttribute('role', 'tooltip')
    tooltipEl.className = 'app-tooltip'
    tooltipEl.style.opacity = '0'
    tooltipEl.style.visibility = 'hidden'
    document.body.appendChild(tooltipEl)
  }
  return tooltipEl
}

function positionTooltip(target: HTMLElement, el: HTMLDivElement, placement: TooltipPlacement) {
  const rect = target.getBoundingClientRect()

  el.style.left = '0'
  el.style.top = '0'
  el.style.visibility = 'hidden'
  el.style.opacity = '1'

  const tooltipRect = el.getBoundingClientRect()
  let top = placement === 'top'
    ? rect.top - tooltipRect.height - GAP
    : rect.bottom + GAP

  let left = rect.left + rect.width / 2 - tooltipRect.width / 2
  left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - tooltipRect.width - VIEWPORT_PADDING))

  if (top < VIEWPORT_PADDING) {
    top = rect.bottom + GAP
  }
  if (top + tooltipRect.height > window.innerHeight - VIEWPORT_PADDING) {
    top = rect.top - tooltipRect.height - GAP
  }

  el.style.left = `${Math.round(left)}px`
  el.style.top = `${Math.round(top)}px`
  el.style.visibility = 'visible'
}

export function showTooltip(options: TooltipOptions) {
  const text = options.text?.trim()
  if (!text) return

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (showTimeout) clearTimeout(showTimeout)

  activeTarget = options.target

  showTimeout = setTimeout(() => {
    if (activeTarget !== options.target) return

    const el = getTooltipEl()
    el.textContent = text
    el.classList.toggle('app-tooltip--wrap', Boolean(options.wrap))
    positionTooltip(options.target, el, options.placement ?? 'top')
    el.style.opacity = '1'
    showTimeout = null
  }, SHOW_DELAY)
}

export function hideTooltip(target?: HTMLElement) {
  if (target && activeTarget !== target) return

  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }

  if (hideTimeout) clearTimeout(hideTimeout)

  hideTimeout = setTimeout(() => {
    if (tooltipEl) {
      tooltipEl.style.opacity = '0'
      tooltipEl.style.visibility = 'hidden'
    }
    activeTarget = null
    hideTimeout = null
  }, 40)
}

export function parseTooltipBinding(value: unknown): Omit<TooltipOptions, 'target'> | null {
  if (value === undefined || value === null || value === false || value === '') return null

  if (typeof value === 'string') {
    return { text: value, placement: 'top', wrap: value.length > 28 }
  }

  if (typeof value === 'object') {
    const config = value as {
      text?: string
      placement?: TooltipPlacement
      wrap?: boolean
    }
    const text = config.text?.trim() ?? ''
    if (!text) return null
    return {
      text,
      placement: config.placement ?? 'top',
      wrap: config.wrap ?? text.length > 28,
    }
  }

  return null
}
