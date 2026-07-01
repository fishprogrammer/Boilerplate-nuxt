<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="updateAvailable"
        class="fixed inset-x-2 bottom-2 z-10001 rounded-2xl border border-primary/30 bg-surface p-2 shadow-lg min-[1124px]:inset-x-auto min-[1124px]:bottom-6 min-[1124px]:left-6 min-[1124px]:max-w-md min-[1124px]:p-3"
        role="alertdialog"
        aria-labelledby="pwa-update-title"
        aria-describedby="pwa-update-desc"
      >
        <div class="flex flex-col gap-2 min-[1124px]:flex-row min-[1124px]:items-center min-[1124px]:justify-between min-[1124px]:gap-3">
          <div class="min-w-0">
            <p id="pwa-update-title" class="m-0 text-sm font-semibold text-text-primary">
              نسخه جدید آماده است
            </p>
            <p id="pwa-update-desc" class="m-0 mt-0.5 text-xs leading-relaxed text-text-secondary">
              <template v-if="applying">در حال اعمال بروزرسانی...</template>
              <template v-else-if="remoteVersion">نسخه {{ remoteVersion }} آماده است. برای دریافت تغییرات، بروزرسانی کنید.</template>
              <template v-else>نسخه جدید آماده است. برای دریافت تغییرات، بروزرسانی کنید.</template>
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-2 self-end min-[1124px]:self-auto">
            <button
              type="button"
              class="cursor-pointer rounded-xl border-0 bg-transparent px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              @click="dismissPwaUpdate"
            >
              بعداً
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-xl border-0 bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="applying"
              @click="handleApply"
            >
              {{ applying ? 'در حال بروزرسانی…' : 'بروزرسانی' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { applyPwaUpdate, dismissPwaUpdate, usePwaUpdate } from '~/composables/usePwaUpdate'
import { fetchDeployedAppVersion } from '~/utils/app-version'

const { updateAvailable } = usePwaUpdate()
const applying = ref(false)
const remoteVersion = ref<string | null>(null)

watch(updateAvailable, (visible) => {
  if (!visible) {
    remoteVersion.value = null
    return
  }

  void fetchDeployedAppVersion().then((version) => {
    remoteVersion.value = version
  })
})

async function handleApply() {
  if (applying.value) return
  applying.value = true
  try {
    await applyPwaUpdate()
  } finally {
    applying.value = false
  }
}
</script>
