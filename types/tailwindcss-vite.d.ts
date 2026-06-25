declare module '@tailwindcss/vite' {
  import type { Plugin } from 'vite'

  type PluginOptions = {
    optimize?: boolean | { minify?: boolean }
  }

  const tailwindcss: (opts?: PluginOptions) => Plugin[]
  export default tailwindcss
}
