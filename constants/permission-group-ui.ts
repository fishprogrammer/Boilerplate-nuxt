/** Shared Tailwind classes for collapsible permission group pickers (users + roles). */
export const permissionGroupUi = {
    sectionSelected:
        'border-primary/40 bg-primary/5 dark:border-primary/35 dark:bg-primary/10',
    sectionDefault: 'border-border bg-surface',
    headerSelected:
        'border-primary/25 bg-primary/10 dark:border-primary/20 dark:bg-primary/15',
    headerDefault: 'border-border/60 bg-surface-muted/60',
    chevronSelected: 'text-primary dark:text-emerald-400',
    titleSelected: 'text-primary dark:text-emerald-400',
    countBadgeSelected:
        'bg-primary/15 font-medium text-primary dark:bg-primary/25 dark:text-emerald-300',
    countBadgeDefault: 'bg-surface text-text-muted',
    selectGroupBtn:
        'shrink-0 cursor-pointer text-xs font-medium text-primary hover:text-primary-dark dark:text-emerald-400 dark:hover:text-emerald-300',
} as const
