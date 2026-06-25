<template>
    <div class="html-editor" :class="{ 'html-editor--invalid': invalid }">
        <div class="html-editor__mode-bar">
            <div class="html-editor__tabs" role="tablist" aria-label="حالت ویرایش">
                <button
                    type="button"
                    role="tab"
                    class="html-editor__tab"
                    :class="{ 'html-editor__tab--active': mode === 'visual' }"
                    :aria-selected="mode === 'visual'"
                    @click="setMode('visual')"
                >
                    دیداری
                </button>
                <button
                    type="button"
                    role="tab"
                    class="html-editor__tab"
                    :class="{ 'html-editor__tab--active': mode === 'code' }"
                    :aria-selected="mode === 'code'"
                    @click="setMode('code')"
                >
                    کد
                </button>
            </div>
        </div>

        <div v-if="mode === 'visual'" class="html-editor__visual">
            <QuillEditor
                :key="visualEditorKey"
                :content="modelValue"
                content-type="html"
                theme="snow"
                :toolbar="(PERSIAN_QUILL_TOOLBAR as any)"
                :placeholder="placeholder"
                @ready="onEditorReady"
                @update:content="onContentUpdate"
            />
        </div>

        <textarea
            v-else
            v-model="codeDraft"
            class="html-editor__code"
            :class="{ 'html-editor__code--invalid': invalid }"
            :placeholder="codePlaceholder"
            spellcheck="false"
            @input="onCodeInput"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import type Quill from 'quill'
import { ensureVisualHtmlBody, isHtmlContentEmpty, PERSIAN_QUILL_TOOLBAR } from '~/utils/html'

type EditorMode = 'visual' | 'code'

const props = withDefaults(
    defineProps<{
        modelValue: string
        placeholder?: string
        invalid?: boolean
    }>(),
    {
        placeholder: 'متن را بنویسید...',
        invalid: false,
    },
)

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const mode = ref<EditorMode>('visual')
const codeDraft = ref('')
const visualEditorKey = ref(0)
const codePlaceholder = 'HTML را مستقیماً ویرایش کنید...'

watch(
    () => props.modelValue,
    (value) => {
        if (mode.value === 'code') {
            codeDraft.value = value
        }
    },
)

function applyRtlDefaults(quill: Quill) {
    quill.root.setAttribute('dir', 'rtl')
    quill.format('direction', 'rtl', 'silent')
    quill.format('align', 'right', 'silent')
}

function preventToolbarFormSubmit(quill: Quill) {
    const toolbar = quill.getModule('toolbar') as { container?: HTMLElement } | undefined
    toolbar?.container?.querySelectorAll('button').forEach((button) => {
        button.setAttribute('type', 'button')
    })
}

function onEditorReady(quill: Quill) {
    quill.root.setAttribute('dir', 'rtl')
    preventToolbarFormSubmit(quill)

    if (isHtmlContentEmpty(quill.root.innerHTML)) {
        applyRtlDefaults(quill)
    }

    quill.on('selection-change', (range) => {
        if (!range || range.length > 0) return

        const format = quill.getFormat(range)
        if (!format.direction) {
            quill.format('direction', 'rtl', 'silent')
        }
        if (!format.align) {
            quill.format('align', 'right', 'silent')
        }
    })
}

function normalizeEditorHtml(value: string): string {
    return ensureVisualHtmlBody(value)
}

function onContentUpdate(value: string) {
    emit('update:modelValue', normalizeEditorHtml(value))
}

function onCodeInput() {
    emit('update:modelValue', codeDraft.value)
}

function setMode(next: EditorMode) {
    if (next === mode.value) return

    if (next === 'code') {
        codeDraft.value = props.modelValue
        mode.value = 'code'
        return
    }

    emit('update:modelValue', codeDraft.value)
    visualEditorKey.value += 1
    mode.value = 'visual'
}
</script>

<style scoped>
.html-editor__mode-bar {
    display: flex;
    justify-content: flex-start;
    border: 1px solid var(--color-border);
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    background: var(--color-surface-muted);
    padding: 0.375rem 0.5rem 0;
}

.html-editor__tabs {
    display: inline-flex;
    gap: 0.125rem;
}

.html-editor__tab {
    cursor: pointer;
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 0.375rem 0.375rem 0 0;
    background: transparent;
    padding: 0.375rem 0.875rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
}

.html-editor__tab:hover {
    color: var(--color-text-primary);
}

.html-editor__tab--active {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-primary);
}

.html-editor__code {
    display: block;
    width: 100%;
    min-height: 20rem;
    resize: vertical;
    border: 1px solid var(--color-border);
    border-radius: 0 0 0.5rem 0.5rem;
    background: var(--color-surface);
    padding: 0.875rem 1rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.8125rem;
    line-height: 1.65;
    color: var(--color-text-primary);
    direction: ltr;
    text-align: left;
    outline: none;
    box-sizing: border-box;
}

.html-editor__code:focus {
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-secondary) 20%, transparent);
}

.html-editor__code--invalid {
    border-color: rgb(248 113 113);
}

.html-editor__code--invalid:focus {
    border-color: rgb(248 113 113);
    box-shadow: 0 0 0 2px rgb(248 113 113 / 20%);
}

/* Toolbar: LTR layout for Quill; row-reverse for RTL page flow */
.html-editor :deep(.ql-toolbar.ql-snow) {
    border: 1px solid var(--color-border);
    border-top: none;
    border-bottom: none;
    border-radius: 0;
    background: var(--color-surface-muted);
    font-family: inherit;
    direction: ltr;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: flex-start;
    gap: 0.375rem;
    padding: 0.375rem;
}

.html-editor :deep(.ql-toolbar.ql-snow .ql-formats) {
    display: inline-flex;
    align-items: center;
    gap: 0.0625rem;
    float: none;
    margin: 0;
    padding: 0.125rem;
    border-radius: 0.375rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
}

.html-editor :deep(.ql-toolbar.ql-snow button) {
    float: none;
    width: 1.625rem;
    height: 1.625rem;
    padding: 0.125rem;
    border-radius: 0.25rem;
}

.html-editor :deep(.ql-snow .ql-picker) {
    float: none;
    display: inline-flex;
    align-items: center;
    height: 1.625rem;
    color: var(--color-text-primary);
}

.html-editor :deep(.ql-snow .ql-picker-label) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding-left: 0.375rem;
    padding-right: 1.125rem;
    border-radius: 0.25rem;
}

.html-editor :deep(.ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg) {
    position: absolute;
    top: 50%;
    right: 0.125rem;
    left: auto;
    margin-top: -0.5rem;
    width: 1rem;
}

.html-editor :deep(.ql-snow .ql-picker.ql-font) {
    width: 5.75rem;
}

.html-editor :deep(.ql-snow .ql-picker.ql-header) {
    width: 5.25rem;
}

.html-editor :deep(.ql-snow .ql-picker.ql-size) {
    width: 4.25rem;
}

.html-editor :deep(.ql-snow .ql-picker.ql-align),
.html-editor :deep(.ql-snow .ql-picker.ql-direction) {
    width: 1.625rem;
}

.html-editor :deep(.ql-snow .ql-icon-picker .ql-picker-label),
.html-editor :deep(.ql-snow .ql-color-picker .ql-picker-label) {
    padding: 0.125rem;
    width: 100%;
    justify-content: center;
}

.html-editor :deep(.ql-snow .ql-icon-picker .ql-picker-label svg),
.html-editor :deep(.ql-snow .ql-align .ql-picker-label svg) {
    position: static;
    margin: 0;
    width: 1.125rem;
    height: 1.125rem;
}

.html-editor :deep(.ql-snow .ql-picker-options) {
    right: 0;
    left: auto;
    background: var(--color-surface);
    border-color: var(--color-border);
    text-align: left;
}

.html-editor :deep(.ql-container.ql-snow) {
    border: 1px solid var(--color-border);
    border-radius: 0 0 0.5rem 0.5rem;
    background: var(--color-surface);
    font-family: inherit;
    font-size: 0.875rem;
}

.html-editor :deep(.ql-editor) {
    min-height: 20rem;
    direction: rtl;
    text-align: right;
    color: var(--color-text-primary);
    line-height: 1.9;
}

.html-editor :deep(.ql-editor.ql-blank::before) {
    right: 15px;
    left: auto;
    text-align: right;
    color: var(--color-text-muted);
    font-style: normal;
}

.html-editor :deep(.ql-editor ol),
.html-editor :deep(.ql-editor ul) {
    padding-right: 1.5em;
    padding-left: 0;
}

.html-editor :deep(.ql-editor blockquote) {
    border-right: 4px solid var(--color-border);
    border-left: none;
    margin-right: 0;
    margin-left: 0;
    padding-right: 1rem;
    padding-left: 0;
}

.html-editor :deep(.ql-editor pre.ql-syntax) {
    direction: ltr;
    text-align: left;
}

.html-editor :deep(.ql-editor .ql-direction-ltr) {
    direction: ltr;
    text-align: left;
}

.html-editor :deep(.ql-editor .ql-direction-rtl) {
    direction: rtl;
    text-align: right;
}

.html-editor :deep(.ql-editor code) {
    direction: ltr;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.85em;
    background: var(--color-surface-muted);
    border-radius: 0.25rem;
    padding: 0.125rem 0.375rem;
}

/* Icon visibility — align / direction / toolbar buttons */
.html-editor :deep(.ql-snow .ql-stroke) {
    stroke: var(--color-text-primary);
}

.html-editor :deep(.ql-snow .ql-fill) {
    fill: var(--color-text-primary);
}

.html-editor :deep(.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke),
.html-editor :deep(.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill) {
    stroke: var(--color-secondary);
    fill: var(--color-secondary);
}

.html-editor :deep(.ql-snow .ql-picker-item:hover),
.html-editor :deep(.ql-snow .ql-picker-label:hover) {
    color: var(--color-secondary);
}

.html-editor :deep(.ql-snow .ql-picker-item:hover .ql-stroke),
.html-editor :deep(.ql-snow .ql-picker-label:hover .ql-stroke) {
    stroke: var(--color-secondary);
}

.html-editor :deep(.ql-snow .ql-picker-item:hover .ql-fill),
.html-editor :deep(.ql-snow .ql-picker-label:hover .ql-fill) {
    fill: var(--color-secondary);
}

.html-editor :deep(.ql-snow.ql-toolbar button:hover),
.html-editor :deep(.ql-snow.ql-toolbar button.ql-active) {
    color: var(--color-secondary);
    background: var(--color-secondary-muted);
}

.html-editor :deep(.ql-snow.ql-toolbar button:hover .ql-stroke),
.html-editor :deep(.ql-snow.ql-toolbar button.ql-active .ql-stroke) {
    stroke: var(--color-secondary);
}

.html-editor :deep(.ql-snow.ql-toolbar button:hover .ql-fill),
.html-editor :deep(.ql-snow.ql-toolbar button.ql-active .ql-fill) {
    fill: var(--color-secondary);
}

.html-editor--invalid :deep(.ql-toolbar.ql-snow),
.html-editor--invalid :deep(.ql-container.ql-snow),
.html-editor--invalid .html-editor__code {
    border-color: rgb(248 113 113);
}
</style>

