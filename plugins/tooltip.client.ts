import type { Directive, DirectiveBinding } from 'vue'
import { hideTooltip, parseTooltipBinding, showTooltip } from '~/utils/tooltip'

type TooltipBinding = DirectiveBinding<string | { text: string; placement?: 'top' | 'bottom'; wrap?: boolean } | undefined>

type TooltipHost = HTMLElement & {
  _tooltipBinding?: TooltipBinding
}

const cleanupMap = new WeakMap<HTMLElement, () => void>()

function stripNativeTitle(el: HTMLElement) {
  if (el.hasAttribute('title')) {
    el.removeAttribute('title')
  }
}

function onEnter(el: TooltipHost) {
  const config = parseTooltipBinding(el._tooltipBinding?.value)
  if (!config) return
  showTooltip({ target: el, ...config })
}

function onLeave(el: TooltipHost) {
  hideTooltip(el)
}

function attachTooltip(el: TooltipHost, binding: TooltipBinding) {
  el._tooltipBinding = binding
  stripNativeTitle(el)

  const enter = () => onEnter(el)
  const leave = () => onLeave(el)

  el.addEventListener('mouseenter', enter)
  el.addEventListener('mouseleave', leave)
  el.addEventListener('focus', enter, true)
  el.addEventListener('blur', leave, true)

  cleanupMap.set(el, () => {
    el.removeEventListener('mouseenter', enter)
    el.removeEventListener('mouseleave', leave)
    el.removeEventListener('focus', enter, true)
    el.removeEventListener('blur', leave, true)
    hideTooltip(el)
  })
}

function detachTooltip(el: TooltipHost) {
  cleanupMap.get(el)?.()
  cleanupMap.delete(el)
  delete el._tooltipBinding
}

const vTooltip: Directive<TooltipHost> = {
  mounted(el, binding) {
    attachTooltip(el, binding)
  },
  updated(el, binding) {
    el._tooltipBinding = binding
    stripNativeTitle(el)
  },
  unmounted(el) {
    detachTooltip(el)
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', vTooltip)
})
