import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'
import { appConfig } from '~/config/app'
import { migrateLegacyAuthStorage } from '~/utils/auth-storage'
import { initTheme } from '~/composables/useTheme'
import { initPwaInstallListener } from '~/composables/usePwaInstall'

export default defineNuxtPlugin((nuxtApp) => {
  migrateLegacyAuthStorage()
  initTheme()

  nuxtApp.vueApp.use(Vue3PersianDatetimePicker, {
    name: 'DatePicker',
    props: {
      format: 'YYYY-MM-DD HH:mm',
      displayFormat: 'jYYYY-jMM-jDD HH:mm',
      editable: false,
      inputClass: 'form-control my-custom-class-name',
      placeholder: 'لطفا یک تاریخ انتخاب کنید',
      altFormat: 'YYYY-MM-DD HH:mm',
      color: appConfig.themeColor,
      autoSubmit: true,
      compactTime: true,
    },
  })

  if (import.meta.env.PROD) {
    initPwaInstallListener()
  }
})
