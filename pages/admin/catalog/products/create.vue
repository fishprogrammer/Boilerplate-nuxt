<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">محصول جدید</h1>
          <p class="mt-1 text-sm text-text-secondary">ثبت محصول در کاتالوگ فروشگاه (پیش‌نویس)</p>
        </div>
        <BackIconButton />
      </div>

      <div v-if="categoriesPending" class="text-sm text-text-secondary">در حال بارگذاری دسته‌ها...</div>
      <div
        v-else-if="categoriesError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ categoriesError }}
      </div>

      <form v-else class="space-y-6" @submit.prevent="submitCreate">
        <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label for="product-name" class="mb-1 block text-xs font-medium text-text-primary">نام محصول</label>
            <input
              id="product-name"
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
              @blur="syncSlugFromName"
            />
          </div>

          <div>
            <label for="product-slug" class="mb-1 block text-xs font-medium text-text-primary">slug</label>
            <input
              id="product-slug"
              v-model="form.slug"
              type="text"
              required
              dir="ltr"
              pattern="[-a-zA-Z0-9_]+"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            />
          </div>

          <div>
            <label for="product-locale" class="mb-1 block text-xs font-medium text-text-primary">زبان</label>
            <select
              id="product-locale"
              v-model="form.locale"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
              @change="loadCategories"
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label for="product-category" class="mb-1 block text-xs font-medium text-text-primary">دسته</label>
            <select
              id="product-category"
              v-model="form.category"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            >
              <option value="">انتخاب دسته</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }} ({{ category.slug }})
              </option>
            </select>
            <p v-if="categories.length === 0" class="mt-1 text-xs text-amber-600">
              ابتدا در بخش دسته‌های کاتالوگ یک دسته بسازید.
            </p>
          </div>

          <div>
            <label for="product-type" class="mb-1 block text-xs font-medium text-text-primary">نوع محصول</label>
            <select
              id="product-type"
              v-model="form.product_type"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            >
              <option value="wordpress_plugin">افزونه وردپرس</option>
              <option value="docker_app">اپ Docker</option>
              <option value="desktop">دسکتاپ</option>
              <option value="other">سایر</option>
            </select>
          </div>

          <div class="flex items-end">
            <label class="flex items-center gap-2 text-sm text-text-primary">
              <input v-model="form.is_featured" type="checkbox" class="rounded border-border" />
              محصول ویژه
            </label>
          </div>

          <div class="md:col-span-2">
            <label for="product-short-desc" class="mb-1 block text-xs font-medium text-text-primary">توضیح کوتاه</label>
            <textarea
              id="product-short-desc"
              v-model="form.short_description"
              rows="2"
              required
              maxlength="500"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            />
          </div>

          <div class="md:col-span-2">
            <label for="product-desc" class="mb-1 block text-xs font-medium text-text-primary">توضیحات (HTML)</label>
            <textarea
              id="product-desc"
              v-model="form.description_html"
              rows="5"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            />
          </div>
        </section>

        <section class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">پلن پیش‌فرض</h2>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-text-primary">نام پلن</label>
              <input v-model="plan.name" type="text" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-text-primary">مدل قیمت</label>
              <select v-model="plan.pricing_model" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
                <option value="free">رایگان</option>
                <option value="one_time">یک‌بار</option>
                <option value="subscription">اشتراک</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-text-primary">نوع لایسنس</label>
              <select v-model="plan.license_type" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
                <option value="per_domain">دامنه</option>
                <option value="per_server">سرور</option>
                <option value="per_user">کاربر</option>
                <option value="lifetime">مادام‌العمر</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-text-primary">قیمت (ریال)</label>
              <AmountInput
                v-model="planPrice"
                :disabled="plan.pricing_model === 'free'"
                input-class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm outline-none input-focus"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-text-primary">حداکثر فعال‌سازی</label>
              <input v-model.number="plan.max_activations" type="number" min="1" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
            </div>
          </div>
        </section>

        <p v-if="saveError" class="text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>

        <div class="flex flex-wrap gap-2">
          <button type="submit" class="btn-action" :disabled="isSaving || categories.length === 0">
            {{ isSaving ? 'در حال ثبت...' : 'ایجاد محصول' }}
          </button>
          <RouterLink :to="{ name: 'catalog-products' }" class="btn-muted-sm">انصراف</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CatalogCategory,
  CreateAdminCatalogProductPlanInput,
  CreateAdminCatalogProductRequest,
  LicenseType,
  PricingModel,
  ProductType,
} from '~/types/catalog'
import type { AppLocale } from '~/utils/locale'
import { getApiErrorMessage } from '~/utils/api-error'
import { showToast } from '~/composables/useToast'

definePageMeta({
  name: 'catalog-product-create',
  middleware: ['noindex', 'staff'],
  layout: 'dashboard',
})

const router = useRouter()
const { adminCreateProduct, adminListCategories } = useCatalog()

const categories = ref<CatalogCategory[]>([])
const categoriesPending = ref(true)
const categoriesError = ref('')
const isSaving = ref(false)
const saveError = ref('')
const slugTouched = ref(false)

const form = reactive({
  name: '',
  slug: '',
  category: '',
  locale: 'fa' as AppLocale,
  product_type: 'wordpress_plugin' as ProductType,
  short_description: '',
  description_html: '',
  is_featured: false,
})

const plan = reactive<CreateAdminCatalogProductPlanInput>({
  name: 'پیش‌فرض',
  pricing_model: 'one_time',
  license_type: 'per_domain',
  price: 0,
  max_activations: 1,
  features: [],
  is_default: true,
  is_active: true,
  sort_order: 0,
})

const planPrice = computed({
  get: () => (plan.pricing_model === 'free' ? 0 : plan.price),
  set: (value: number | null) => {
    plan.price = value ?? 0
  },
})

watch(
  () => plan.pricing_model,
  (model: PricingModel) => {
    if (model === 'free') plan.price = 0
  },
)

function slugifyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function syncSlugFromName() {
  if (slugTouched.value || !form.name.trim()) return
  form.slug = slugifyName(form.name)
}

watch(
  () => form.slug,
  () => {
    slugTouched.value = true
  },
)

async function loadCategories() {
  categoriesError.value = ''
  try {
    const result = await adminListCategories({ locale: form.locale, page_size: 100 })
    categories.value = result?.categories ?? []
    if (!form.category && categories.value.length === 1) {
      form.category = categories.value[0].id
    }
  } catch (error) {
    categoriesError.value = getApiErrorMessage(error, 'بارگذاری دسته‌ها ناموفق بود')
    categories.value = []
  }
}

function buildPayload(): CreateAdminCatalogProductRequest {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    category: form.category,
    locale: form.locale,
    product_type: form.product_type,
    short_description: form.short_description.trim(),
    description_html: form.description_html.trim() || undefined,
    status: 'draft',
    is_featured: form.is_featured,
    plans: [
      {
        ...plan,
        price: plan.pricing_model === 'free' ? 0 : plan.price,
        license_type: plan.license_type as LicenseType,
      },
    ],
  }
}

async function submitCreate() {
  if (isSaving.value) return
  if (!form.category) {
    saveError.value = 'دسته محصول را انتخاب کنید.'
    return
  }

  isSaving.value = true
  saveError.value = ''

  try {
    const created = await adminCreateProduct(buildPayload())
    if (!created?.id) {
      saveError.value = 'محصول ایجاد شد اما شناسه دریافت نشد.'
      return
    }
    showToast({ message: 'محصول با موفقیت ایجاد شد.', variant: 'success' })
    await router.push({ name: 'catalog-product-view', params: { id: created.id } })
  } catch (error) {
    saveError.value = getApiErrorMessage(error, 'ایجاد محصول ناموفق بود')
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  categoriesPending.value = true
  await loadCategories()
  categoriesPending.value = false
})
</script>
