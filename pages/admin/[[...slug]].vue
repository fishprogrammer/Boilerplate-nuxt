<script setup lang="ts">
definePageMeta({
  middleware: ['noindex', 'staff'],
})

const route = useRoute()

const ADMIN_REDIRECTS: Record<string, string> = {
  '': '/',
  users: '/users',
  settings: '/system-settings',
  gateways: '/payments/admin/gateways',
  tickets: '/tickets/admin/departments',
  products: '/users',
  coupons: '/users',
  orders: '/finance/my-invoices',
  licenses: '/finance/my-invoices',
  finance: '/finance/my-invoices',
  seo: '/system-health',
}

const slugParts = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug : slug ? [slug] : []
})

const target = computed(() => {
  const key = slugParts.value.join('/')
  return ADMIN_REDIRECTS[key] ?? '/'
})

await navigateTo(target.value)
</script>

<template>
  <div />
</template>
