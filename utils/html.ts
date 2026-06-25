/** Strip tags and treat Quill empty states as blank. */
export function isHtmlContentEmpty(html: string): boolean {
  const normalized = htmlToPlainText(html)
  return normalized.length === 0
}

/** Convert HTML to plain text for previews and validation. */
export function htmlToPlainText(html: string): string {
  if (!html) return ''

  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Persist visual editor output as HTML; wrap plain text in a Quill-like paragraph. */
export function ensureVisualHtmlBody(body: string): string {
  const trimmed = body.trim()
  if (isHtmlContentEmpty(trimmed)) return ''

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed
  }

  const escaped = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return `<p class="ql-direction-rtl ql-align-right" dir="rtl">${escaped}</p>`
}

/** Remove Quill inline/theme colors so post body follows app light/dark tokens. */
export function prepareBlogBodyHtmlForDisplay(html: string): string {
  if (!html) return ''

  return html
    .replace(/\sstyle="([^"]*)"/gi, (_match, styles: string) => {
      const cleaned = styles
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part && !/^(color|background-color)\s*:/i.test(part))
        .join('; ')

      return cleaned ? ` style="${cleaned}"` : ''
    })
    .replace(/\sclass="([^"]*)"/gi, (_match, classes: string) => {
      const cleaned = classes
        .split(/\s+/)
        .filter((cls) => cls && !/^ql-color-/i.test(cls) && cls !== 'ql-background-black')
        .join(' ')

      return cleaned ? ` class="${cleaned}"` : ''
    })
}

/** Full Quill toolbar ordered for RTL / Persian editing. */
export const PERSIAN_QUILL_TOOLBAR = [
  [{ direction: 'rtl' }, { align: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ font: [] }],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ script: 'sub' }, { script: 'super' }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video'],
  ['clean'],
] as const

