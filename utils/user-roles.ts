type RoleDisplaySource = {
  display_name?: string | null
  name?: string | null
  slug?: string | null
  id?: number | null
}

/** UI label for Role (auth/roles), UserRole (auth/me), or RoleDetail (settings). */
export function formatRoleDisplayName(
  role: RoleDisplaySource | null | undefined,
  emptyLabel = '—',
): string {
  if (!role) return emptyLabel
  if (role.display_name?.trim()) return role.display_name.trim()
  if (role.name?.trim()) return role.name.trim()
  if (role.slug?.trim()) return role.slug.trim()
  if (role.id != null) return `نقش #${role.id}`
  return emptyLabel
}
