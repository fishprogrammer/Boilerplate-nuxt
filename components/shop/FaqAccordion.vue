<template>
  <div class="space-y-3">
    <details
      v-for="faq in faqs"
      :key="faq.question"
      class="rounded-xl border border-border bg-surface p-4"
    >
      <summary class="cursor-pointer font-medium">{{ faq.question }}</summary>
      <p class="mt-2 text-sm text-text-secondary">{{ faq.answer }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  faqs: { question: string; answer: string }[]
}>()
</script>
