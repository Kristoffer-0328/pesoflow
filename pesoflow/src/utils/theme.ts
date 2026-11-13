export const pinkThemeUsers = new Set([
  'rhonea0007@gmail.com',
  'johnmiranda3985@gmail.com',
])

export const pinkThemeStorageKey = 'pesoflow-pink-theme'

export function canUsePinkTheme(email: string | null | undefined): boolean {
  return Boolean(email && pinkThemeUsers.has(email.toLowerCase()))
}
