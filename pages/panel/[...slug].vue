<script setup lang="ts">
definePageMeta({
  middleware: ['noindex'],
})

const route = useRoute()

const PANEL_REDIRECTS: Record<string, string> = {
  wallet: '/wallet',
  tickets: '/tickets',
  inbox: '/notifications',
  notifications: '/notifications',
  profile: '/profile',
  orders: '/finance/my-invoices',
  licenses: '/finance/my-invoices',
  downloads: '/finance/my-invoices',
  checkout: '/panel/checkout',
}

const slugParts = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug : slug ? [slug] : []
})

const target = computed(() => {
  const key = slugParts.value.join('/')
  return PANEL_REDIRECTS[key] ?? '/panel'
})

await navigateTo({ path: target.value, query: route.query })
</script>

<template>
  <div />
</template>
