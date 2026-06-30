<template>
  <div class="page-shell home-dashboard overflow-x-clip">
    <PwaInstallBanner />

    <div class="mb-4 grid w-full grid-cols-2 gap-2 min-[1124px]:mb-7 min-[1124px]:grid-cols-4 min-[1124px]:gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex min-w-0 flex-col items-start gap-1.5 rounded-xl bg-surface p-2 shadow-sm min-[1124px]:flex-row min-[1124px]:gap-4 min-[1124px]:rounded-2xl min-[1124px]:p-6 min-[1124px]:shadow min-[1124px]:hover:-translate-y-1 min-[1124px]:hover:shadow-md"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg min-[1124px]:h-12 min-[1124px]:w-12 min-[1124px]:rounded-xl"
          :class="stat.iconClass"
        >
          <svg class="h-4 w-4 min-[1124px]:h-6 min-[1124px]:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="m-0 mb-0.5 text-base leading-tight font-bold text-text-primary min-[1124px]:mb-1 min-[1124px]:text-2xl">
            {{ stat.value }}
          </h3>
          <p class="m-0 line-clamp-2 text-[0.625rem] leading-snug text-text-secondary min-[1124px]:line-clamp-none min-[1124px]:text-sm">
            {{ stat.label }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid w-full grid-cols-1 gap-6 min-[1124px]:grid-cols-2">
      <div class="overflow-hidden rounded-2xl bg-surface shadow-sm">
        <div class="flex items-center justify-between border-b border-border px-6 py-6">
          <h2 class="m-0 text-xl font-semibold text-text-primary">فعالیت‌های اخیر</h2>
          <button class="cursor-pointer border-0 bg-transparent text-sm font-medium text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300">
            مشاهده همه
          </button>
        </div>
        <div class="px-4 py-4 min-[1124px]:px-6">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-4 border-b border-border-muted py-4 last:border-b-0"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-sm font-semibold text-white">
              U{{ i }}
            </div>
            <div class="flex-1">
              <p class="m-0 mb-1 text-sm text-text-primary">کاربر جدید ثبت‌نام کرد</p>
              <p class="m-0 text-xs text-text-muted">{{ i }} دقیقه پیش</p>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl bg-surface shadow-sm">
        <div class="flex items-center justify-between border-b border-border px-6 py-6">
          <h2 class="m-0 text-xl font-semibold text-text-primary">ثبت نام جدید</h2>
          <button class="cursor-pointer border-0 bg-transparent text-sm font-medium text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300">
            مشاهده همه
          </button>
        </div>
        <div class="px-4 py-4 min-[1124px]:px-6">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-4 border-b border-border-muted py-4 last:border-b-0"
          >
            <div class="flex-1">
              <p class="m-0 mb-1 text-sm font-semibold text-text-primary">سفارش #{{ 1000 + i }}</p>
              <p class="m-0 text-xs text-text-secondary">۱۴۰۳/۰۱/{{ i }}</p>
            </div>
            <span class="rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              تکمیل شده
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'Index',
  layout: 'dashboard',
  public: true,
})

import PwaInstallBanner from '~/components/PwaInstallBanner.vue'

const isAuthenticated = await hasAuthenticatedSession()
if (!isAuthenticated) {
  await navigateTo('/fa/')
}

const stats = [
  {
    value: '۱,۲۴۵',
    label: 'کاربران فعال',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    iconClass: 'bg-blue-100 text-blue-500 dark:bg-blue-950 dark:text-blue-400',
  },
  {
    value: '۸۵۶',
    label: 'ثبت نام جدید',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconClass: 'bg-emerald-100 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    value: '۴۵.۶M',
    label: 'درآمد کل',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconClass: 'bg-secondary-muted text-secondary-foreground dark:bg-secondary/20 dark:text-secondary',
  },
  {
    value: '۹۸.۵٪',
    label: 'رضایت مشتریان',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    iconClass: 'bg-orange-100 text-amber-500 dark:bg-orange-950 dark:text-amber-400',
  },
]
</script>

<style scoped>
.home-dashboard {
  position: relative;
}

.home-dashboard::before {
  content: '';
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 100% 0%, rgb(59 130 246 / 0.06), transparent 55%),
    radial-gradient(ellipse 60% 40% at 0% 100%, rgb(16 185 129 / 0.05), transparent 50%);
}
</style>
