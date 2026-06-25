<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg" role="menu" aria-label="منوی کاربر">
    <div class="border-b border-border/60 px-4 py-3">
      <p class="text-xs text-text-muted">حساب کاربری</p>
      <p class="mt-0.5 truncate text-sm font-semibold text-text-primary">{{ displayName }}</p>
    </div>

    <ul class="py-1.5">
      <li>
        <button
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-surface-hover"
          @click="emit('navigate', '/wallet')"
        >
          <svg class="size-5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          <span class="flex-1 text-right font-medium">کیف پول</span>
          <span v-if="walletActive" class="text-xs text-text-muted">{{ walletBalance }} ریال</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-surface-hover"
          @click="emit('navigate', '/profile')"
        >
          <svg class="size-5 shrink-0 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="flex-1 text-right font-medium">پروفایل</span>
        </button>
      </li>
      <li class="border-t border-border/60">
        <button
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          @click="emit('logout')"
        >
          <svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="flex-1 text-right font-medium">خروج</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  displayName: string
  walletBalance: string
  walletActive: boolean
}>()

const emit = defineEmits<{
  navigate: [path: string]
  logout: []
}>()
</script>

