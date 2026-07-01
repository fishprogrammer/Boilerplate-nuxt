export default defineNuxtPlugin(async () => {
  const { loadMeasurementId, trackPageView } = useGa4()
  await loadMeasurementId()

  const router = useRouter()
  router.afterEach(() => {
    trackPageView()
  })

  if (import.meta.client) {
    trackPageView()
  }
})
