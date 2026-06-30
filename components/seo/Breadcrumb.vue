<template>
  <nav v-if="items.length" aria-label="Breadcrumb" class="text-sm text-text-secondary">
    <ol class="flex flex-wrap items-center gap-1">
      <li v-for="(item, index) in items" :key="item.href" class="flex items-center gap-1">
        <NuxtLink
          v-if="index < items.length - 1"
          :to="item.href"
          class="text-primary hover:underline"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="text-text-primary">{{ item.label }}</span>
        <span v-if="index < items.length - 1" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  href: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
