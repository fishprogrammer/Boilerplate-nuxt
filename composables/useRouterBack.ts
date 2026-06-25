/** Browser-style history back — same behavior as the browser back button. */
export function useRouterBack() {
  const router = useRouter()

  function goBack(event?: Event) {
    if (event?.defaultPrevented) return
    router.back()
  }

  return { goBack }
}
