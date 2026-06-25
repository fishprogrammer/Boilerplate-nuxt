<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="visible"
      class="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-sm min-[1124px]:mb-7 min-[1124px]:flex-row min-[1124px]:items-center min-[1124px]:justify-between min-[1124px]:p-5"
      role="region"
      aria-label="نصب اپلیکیشن"
    >
      <div class="flex min-w-0 items-start gap-3 min-[1124px]:items-center">
        <div class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface shadow-sm">
          <img src="/logo.png" alt="" class="size-9 object-contain" />
        </div>
        <div class="min-w-0">
          <p class="m-0 text-sm font-semibold text-text-primary min-[1124px]:text-base">
            نصب {{ appName }} روی دستگاه
          </p>
          <p class="m-0 mt-1 text-xs leading-relaxed text-text-secondary min-[1124px]:text-sm">
            برای دسترسی سریع‌تر، اپ را نصب کنید.
          </p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 self-end min-[1124px]:self-auto">
        <button
          type="button"
          class="cursor-pointer rounded-xl border-0 bg-transparent px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          @click="handleDismiss"
        >
          بعداً
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-xl border-0 bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="installing"
          @click="handleInstall"
        >
          {{ installing ? 'در حال نصب…' : 'نصب اپلیکیشن' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { appConfig } from '~/config/app'
import { dismissInstallPrompt, isPwaInstalled, promptInstall, usePwaInstall } from '~/composables/usePwaInstall'

const { canInstall } = usePwaInstall()
const appName = appConfig.name
const installing = ref(false)

const visible = computed(() => canInstall.value && !isPwaInstalled())

async function handleInstall() {
  if (installing.value) return
  installing.value = true
  try {
    await promptInstall()
  } finally {
    installing.value = false
  }
}

function handleDismiss() {
  dismissInstallPrompt()
}
</script>

