<template>
  <section v-if="licenses.length" class="rounded-xl border border-border bg-surface p-4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-text-primary">لایسنس‌های صادرشده</h2>
      <NuxtLink :to="{ name: 'panel-downloads' }" class="text-xs text-primary hover:underline">
        مرکز دانلود
      </NuxtLink>
    </div>
    <ul class="space-y-3">
      <li
        v-for="license in licenses"
        :key="license.id"
        class="flex flex-col gap-2 rounded-lg border border-border/70 bg-surface-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="font-medium text-text-primary">{{ license.product_name }}</p>
          <p class="mt-1 font-mono text-xs text-text-secondary dir-ltr">{{ license.license_key_masked }}</p>
        </div>
        <NuxtLink :to="{ name: 'panel-license-view', params: { id: license.id } }" class="btn-action-sm w-fit">
          مشاهده لایسنس
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { CommerceOrderLicense } from '~/types/commerce'

defineProps<{
  licenses: CommerceOrderLicense[]
}>()
</script>
