export {}

declare module '#app' {
  interface PageMeta {
    public?: boolean
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
  }
}
