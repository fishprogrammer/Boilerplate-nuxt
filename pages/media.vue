<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">رسانه‌ها</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        آپلود، مرور و مدیریت فایل‌های رسانه
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <input
                        ref="fileInputRef"
                        type="file"
                        class="sr-only"
                        multiple
                        @change="onFilesSelected"
                    />
                    <button
                        v-if="hasPermission(PERMISSIONS.MEDIA.ADD)"
                        type="button"
                        class="btn-action-sm gap-1.5"
                        :disabled="isUploading || isFetching"
                        @click="openFilePicker"
                    >
                        <svg v-if="!isUploading" class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <svg v-else class="size-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {{ isUploading ? 'در حال آپلود...' : 'افزودن فایل' }}
                    </button>
                </div>
            </div>

            <div
                class="mb-5 rounded-xl border-2 border-dashed border-border bg-surface-muted/60 px-4 py-8 text-center"
                :class="isDragOver ? 'border-secondary bg-secondary-muted/40' : ''"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onDropFiles"
            >
                <svg class="mx-auto mb-2 size-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm font-medium text-text-primary">فایل را اینجا رها کنید</p>
                <p class="mt-1 text-xs text-text-secondary">یا از دکمه «افزودن فایل» استفاده کنید</p>
            </div>

            <div
                v-if="isUploading"
                class="mb-4 rounded-xl border border-secondary/30 bg-secondary-muted/40 px-4 py-3 dark:bg-secondary/10"
                role="status"
                aria-live="polite"
            >
                <div class="mb-2 flex items-center justify-between gap-3">
                    <p class="min-w-0 truncate text-sm font-medium text-text-primary">
                        {{ uploadLabel }}
                    </p>
                    <span class="shrink-0 text-xs font-semibold text-secondary">
                        {{ uploadIndeterminate ? '...' : `${uploadPercent}%` }}
                    </span>
                </div>
                <div
                    class="h-2 overflow-hidden rounded-full bg-border"
                    role="progressbar"
                    :aria-valuenow="uploadIndeterminate ? undefined : uploadPercent"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-label="uploadLabel"
                >
                    <div
                        class="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
                        :class="uploadIndeterminate ? 'w-1/3 animate-pulse' : ''"
                        :style="uploadIndeterminate ? undefined : { width: `${uploadPercent}%` }"
                    />
                </div>
            </div>

            <div
                v-if="uploadError"
                class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ uploadError }}
            </div>

            <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:gap-2">
                <div class="min-w-0 md:flex-1">
                    <label for="media-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <input
                        id="media-search"
                        v-model="searchQuery"
                        type="search"
                        placeholder="نام فایل..."
                        class="box-border h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        @keydown.enter.prevent="applyFilters"
                    />
                </div>
                <div class="grid grid-cols-3 items-end gap-2 md:contents">
                    <div class="min-w-0 md:flex-1">
                        <label for="media-type" class="mb-1 block whitespace-nowrap text-xs font-medium text-text-primary">نوع فایل</label>
                        <select
                            id="media-type"
                            v-model="fileTypeFilter"
                            class="box-border h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option value="">همه</option>
                            <option v-for="option in fileTypeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                    <div class="min-w-0 md:flex-1">
                        <label for="media-ordering" class="mb-1 block whitespace-nowrap text-xs font-medium text-text-primary">مرتب‌سازی</label>
                        <select
                            id="media-ordering"
                            v-model="ordering"
                            class="box-border h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option v-for="option in orderingOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                    <div class="min-w-0 md:flex-1">
                        <label for="media-extension" class="mb-1 block whitespace-nowrap text-xs font-medium text-text-primary">پسوند</label>
                        <input
                            id="media-extension"
                            v-model="extensionFilter"
                            type="text"
                            placeholder="jpg, pdf..."
                            class="box-border h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus dir-ltr text-right"
                            @keydown.enter.prevent="applyFilters"
                        />
                    </div>
                </div>
            </div>

            <div v-if="hasActiveFilters && !isInitialLoading && !loadError" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedFileType" class="brand-chip">نوع: {{ formatMediaFileType(appliedFileType) }}</span>
                <span v-if="appliedExtension" class="brand-chip">پسوند: {{ appliedExtension }}</span>
                <button
                    type="button"
                    class="text-xs text-text-secondary underline hover:text-text-primary"
                    :disabled="isFetching"
                    @click="resetFilters"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            <div v-if="isInitialLoading">
                <MediaGridSkeleton :count="12" />
            </div>

            <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ loadError }}
            </div>

            <template v-else>
                <div v-if="isFetching">
                    <MediaGridSkeleton :count="12" />
                </div>

                <template v-else>
                    <div class="relative mb-4 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                        {{ pagination.total_items }} فایل
                    </div>

                    <div v-if="items.length === 0" class="rounded-xl border border-dashed border-border px-4 py-16 text-center">
                        <svg class="mx-auto mb-3 size-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-sm text-text-secondary">فایلی یافت نشد.</p>
                    </div>

                    <div
                        v-else
                        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    >
                        <article
                            v-for="item in items"
                            :key="item.id"
                            class="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:border-secondary/40 hover:shadow-md"
                        >
                        <div class="relative aspect-square overflow-hidden bg-surface-muted">
                            <button
                                v-if="getMediaPreviewUrl(item)"
                                type="button"
                                class="block size-full cursor-zoom-in"
                                :aria-label="`مشاهده ${item.original_name}`"
                                @click="openLightbox(item)"
                            >
                                <img
                                    :src="getMediaPreviewUrl(item)!"
                                    :alt="item.original_name"
                                    class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    loading="lazy"
                                />
                            </button>
                            <button
                                v-else-if="getMediaVideoUrl(item)"
                                type="button"
                                class="relative block size-full cursor-zoom-in"
                                :aria-label="`مشاهده ${item.original_name}`"
                                @click="openLightbox(item)"
                            >
                                <video
                                    :src="getMediaVideoPreviewSrc(item)!"
                                    :poster="item.thumbnail_url || undefined"
                                    class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    preload="metadata"
                                    muted
                                    playsinline
                                    disablepictureinpicture
                                    aria-hidden="true"
                                />
                                <span
                                    class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10"
                                    aria-hidden="true"
                                >
                                    <span class="rounded-full bg-black/55 p-2.5 text-white shadow-lg backdrop-blur-sm">
                                        <svg class="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </span>
                                </span>
                            </button>
                            <div
                                v-else
                                class="flex size-full flex-col items-center justify-center gap-2 px-2 text-center"
                            >
                                <svg class="size-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="getMediaFileTypeIconPath(item.file_type)" />
                                </svg>
                                <span class="text-[0.625rem] font-medium uppercase text-text-muted">
                                    {{ getMediaExtension(item.original_name) || item.mime_type }}
                                </span>
                            </div>

                            <div
                                class="pointer-events-none absolute inset-x-0 bottom-0 z-5 bg-linear-to-t from-black/70 via-black/25 to-transparent p-2 pt-10"
                                aria-hidden="true"
                            />

                            <div class="absolute inset-x-0 bottom-0 z-6 p-2">
                                <div class="rounded-lg border border-white/15 bg-black/55 px-2.5 py-2 shadow-lg backdrop-blur-md">
                                    <div class="mb-1.5 flex items-start justify-between gap-2">
                                        <p
                                            class="min-w-0 flex-1 truncate text-xs font-semibold text-white"
                                            v-tooltip="item.original_name"
                                        >
                                            {{ item.original_name }}
                                        </p>
                                        <span class="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[0.625rem] font-medium text-white backdrop-blur-sm">
                                            {{ formatMediaFileType(item.file_type) }}
                                        </span>
                                    </div>
                                    <p class="meta-ltr truncate text-right text-[0.625rem] text-white/90">
                                        {{ formatMediaFileMeta(item) }}
                                    </p>
                                    <p class="meta-ltr mt-0.5 truncate text-right text-[0.625rem] text-white/75">
                                        {{ formatMediaUploadMeta(item) }}
                                    </p>
                                </div>
                            </div>

                            <button
                                v-if="hasPermission(PERMISSIONS.MEDIA.DELETE)"
                                type="button"
                                class="absolute top-2 left-2 z-10 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-600/90 group-hover:opacity-100"
                                aria-label="حذف فایل"
                                v-tooltip="'حذف'"
                                @click.stop="openDeleteModal(item)"
                            >
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </article>
                    </div>
                </template>

                <AppPagination
                    :page="pagination.page"
                    :total-pages="pagination.total_pages"
                    :disabled="isFetching"
                    @update:page="goToPage"
                />
            </template>
        </div>

        <MediaLightbox
            v-model="lightboxOpen"
            v-model:index="lightboxIndex"
            :items="lightboxItems"
            @delete="openDeleteModal"
        />

        <ConfirmModal
            v-model="showDeleteModal"
            title="حذف فایل"
            :message="deleteModalMessage"
            confirm-label="بله، حذف"
            cancel-label="انصراف"
            variant="danger"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'media',
  layout: 'dashboard'
})


import { computed, onMounted, ref } from 'vue'
import { mediaService } from '~/api/services/media.service'
import type { MediaFile, MediaFileType } from '~/api/types/media.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import { parseMediaFileResponse, parseMediaListResponse } from '~/api/utils/api-response'
import AppPagination from '~/components/AppPagination.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import MediaLightbox from '~/components/MediaLightbox.vue'
import MediaGridSkeleton from '~/components/skeleton/MediaGridSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import { handleMediaUploadFailure } from '~/utils/media-upload'
import {
    formatMediaFileMeta,
    formatMediaFileType,
    formatMediaUploadMeta,
    getMediaExtension,
    getMediaFileTypeIconPath,
    getMediaPreviewUrl,
    getMediaVideoUrl,
    getMediaVideoPreviewSrc,
    isMediaLightboxItem,
} from '~/utils/media'

const PAGE_SIZE = 24
const { hasPermission, PERMISSIONS } = usePermissions()

const fileTypeOptions: { value: MediaFileType; label: string }[] = [
    { value: 'image', label: 'تصویر' },
    { value: 'document', label: 'سند' },
    { value: 'video', label: 'ویدیو' },
    { value: 'audio', label: 'صوت' },
    { value: 'other', label: 'سایر' },
]

const orderingOptions = [
    { value: '-created_at', label: 'جدیدترین' },
    { value: 'created_at', label: 'قدیمی‌ترین' },
    { value: 'original_name', label: 'نام (الف-ی)' },
    { value: '-original_name', label: 'نام (ی-الف)' },
    { value: '-size', label: 'بزرگ‌ترین' },
    { value: 'size', label: 'کوچک‌ترین' },
]

const items = ref<MediaFile[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const searchQuery = ref('')
const fileTypeFilter = ref<MediaFileType | ''>('')
const extensionFilter = ref('')
const ordering = ref('-created_at')

const appliedSearch = ref('')
const appliedFileType = ref<MediaFileType | ''>('')
const appliedExtension = ref('')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const isUploading = ref(false)
const isDragOver = ref(false)
const loadError = ref<string | null>(null)
const uploadError = ref<string | null>(null)
const uploadLabel = ref('')
const uploadPercent = ref(0)
const uploadIndeterminate = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const showDeleteModal = ref(false)
const itemToDelete = ref<MediaFile | null>(null)
const isDeleting = ref(false)

const lightboxItems = computed(() =>
    items.value.filter((item) => isMediaLightboxItem(item)),
)

const deleteModalMessage = computed(() => {
    if (!itemToDelete.value) return ''
    return `آیا از حذف «${itemToDelete.value.original_name}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`
})

const hasActiveFilters = computed(
    () => Boolean(appliedSearch.value || appliedFileType.value || appliedExtension.value),
)

async function fetchMedia(page = 1) {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    try {
        const params: Record<string, string | number> = {
            page,
            page_size: PAGE_SIZE,
            ordering: ordering.value,
        }
        if (appliedSearch.value) params.search = appliedSearch.value
        if (appliedFileType.value) params.file_type = appliedFileType.value
        if (appliedExtension.value) params.extension = appliedExtension.value.replace(/^\./, '')

        const response = await mediaService.listMedia(params)
        const parsed = parseMediaListResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت لیست رسانه‌ها با خطا مواجه شد.'
            items.value = []
            return
        }

        items.value = parsed.items
        pagination.value = parsed.pagination
        loadError.value = null
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست رسانه‌ها')
        if (isFirstLoad) items.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedFileType.value = fileTypeFilter.value
    appliedExtension.value = extensionFilter.value.trim().replace(/^\./, '')
    fetchMedia(1)
}

function resetFilters() {
    searchQuery.value = ''
    fileTypeFilter.value = ''
    extensionFilter.value = ''
    appliedSearch.value = ''
    appliedFileType.value = ''
    appliedExtension.value = ''
    fetchMedia(1)
}

function goToPage(page: number) {
    if (page < 1 || page > pagination.value.total_pages) return
    fetchMedia(page)
}

function openFilePicker() {
    fileInputRef.value?.click()
}

function openLightbox(item: MediaFile) {
    if (!isMediaLightboxItem(item)) return

    const index = lightboxItems.value.findIndex((entry) => entry.id === item.id)
    if (index === -1) return

    lightboxIndex.value = index
    lightboxOpen.value = true
}

function openDeleteModal(item: MediaFile) {
    itemToDelete.value = item
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!itemToDelete.value || isDeleting.value) return

    const deletedId = itemToDelete.value.id
    const previousLightboxIndex = lightboxIndex.value
    const deletingCurrentLightboxItem =
        lightboxOpen.value && lightboxItems.value[lightboxIndex.value]?.id === deletedId
    const currentPage = pagination.value.page

    isDeleting.value = true
    try {
        await mediaService.deleteMedia(deletedId)
        showDeleteModal.value = false
        itemToDelete.value = null
        showToast({ message: 'فایل با موفقیت حذف شد.', variant: 'success' })

        await fetchMedia(currentPage)

        if (items.value.length === 0 && currentPage > 1) {
            await fetchMedia(currentPage - 1)
        }

        if (lightboxOpen.value) {
            if (lightboxItems.value.length === 0) {
                lightboxOpen.value = false
            } else if (deletingCurrentLightboxItem) {
                lightboxIndex.value = Math.min(previousLightboxIndex, lightboxItems.value.length - 1)
            }
        }
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف فایل'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (!list.length || isUploading.value) return

    isUploading.value = true
    uploadError.value = null
    uploadLabel.value = ''
    uploadPercent.value = 0
    uploadIndeterminate.value = false

    let successCount = 0

    try {
        for (let index = 0; index < list.length; index += 1) {
            const file = list[index]
            uploadLabel.value =
                list.length === 1
                    ? `در حال آپلود: ${file.name}`
                    : `در حال آپلود ${index + 1} از ${list.length}: ${file.name}`
            uploadPercent.value = Math.round((index / list.length) * 100)
            uploadIndeterminate.value = false

            try {
                const response = await mediaService.uploadMedia(file, (filePercent) => {
                    if (filePercent === 0) {
                        uploadIndeterminate.value = true
                        return
                    }

                    uploadIndeterminate.value = false
                    uploadPercent.value = Math.round(
                        ((index + filePercent / 100) / list.length) * 100,
                    )
                })
                const parsed = parseMediaFileResponse(response)

                if (!parsed) {
                    uploadError.value = 'پاسخ آپلود نامعتبر بود.'
                    break
                }

                successCount += 1
                uploadPercent.value = Math.round(((index + 1) / list.length) * 100)
            } catch (err: unknown) {
                uploadError.value = handleMediaUploadFailure(err, { toast: true })
                break
            }
        }

        if (successCount > 0) {
            showToast({
                message:
                    successCount === 1
                        ? 'فایل با موفقیت آپلود شد.'
                        : `${successCount} فایل با موفقیت آپلود شد.`,
                variant: 'success',
            })
            await fetchMedia(1)
        }
    } finally {
        isUploading.value = false
        isDragOver.value = false
        uploadLabel.value = ''
        uploadPercent.value = 0
        uploadIndeterminate.value = false
        if (fileInputRef.value) fileInputRef.value.value = ''
    }
}

function onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
        void uploadFiles(input.files)
    }
}

function onDropFiles(event: DragEvent) {
    isDragOver.value = false
    if (event.dataTransfer?.files?.length) {
        void uploadFiles(event.dataTransfer.files)
    }
}

onMounted(() => {
    fetchMedia()
})
</script>
