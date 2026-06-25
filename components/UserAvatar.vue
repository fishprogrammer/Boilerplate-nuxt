<template>
  <div
    class="shrink-0 rounded-full bg-[url('/user-placeholder.png')] bg-cover bg-center"
    :class="avatarClass"
    role="img"
    :aria-label="ariaLabel"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    avatarClass?: string
    ariaLabel?: string
  }>(),
  {
    avatarClass: 'size-10',
    ariaLabel: 'تصویر کاربر',
  },
)
</script>
