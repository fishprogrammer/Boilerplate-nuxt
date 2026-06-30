/// <reference types="@vite-pwa/nuxt" />
/// <reference types="nuxt" />
/// <reference path="../.nuxt/nuxt.d.ts" />
/// <reference path="./tailwindcss-vite.d.ts" />
/// <reference path="./page-meta.d.ts" />

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisteredSW?: (
      swScriptUrl: string,
      registration: ServiceWorkerRegistration | undefined,
    ) => void
    onRegisterError?: (error: unknown) => void
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

declare module 'moment-jalaali' {
  import moment from 'moment'
  export = moment
}

declare module 'vue3-persian-datetime-picker' {
  import type { Plugin } from 'vue'
  const plugin: Plugin
  export default plugin
}
