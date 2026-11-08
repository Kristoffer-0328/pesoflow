import type { Wallet } from '../types'

const providerColors: Record<string, string> = {
  gcash: '#007DFE',
  maya: '#00A86B',
  'gotyme bank': '#00A6A6',
  diskartech: '#FF6B00',
  tonik: '#6C3CE9',
  seabank: '#EA5F00',
  'maya bank': '#198E4F',
  maribank: '#EA5F00',
  'coins.ph': '#5428C7',
  'bdo unibank': '#003B70',
  bdo: '#003B70',
  bpi: '#D71920',
  metrobank: '#00539F',
  unionbank: '#E31837',
  landbank: '#00843D',
  pnb: '#003B71',
  'security bank': '#006B3F',
  rcbc: '#C8102E',
  'china bank': '#C8102E',
  'eastwest bank': '#00A651',
  'asia united bank (aub)': '#00529B',
}

export function getWalletProviderColor(provider: string, fallback = '#278568'): string {
  const normalizedProvider = provider.trim().toLowerCase()
  const exactColor = providerColors[normalizedProvider]
  if (exactColor) return exactColor

  const matchingProvider = Object.keys(providerColors).find(
    (knownProvider) =>
      normalizedProvider.includes(knownProvider) || knownProvider.includes(normalizedProvider),
  )
  return matchingProvider ? providerColors[matchingProvider] : fallback
}

export function getWalletCardColors(wallet: Wallet): [string, string] {
  const provider = wallet.provider || wallet.name
  const color = provider ? getWalletProviderColor(provider, wallet.color) : wallet.color || '#278568'
  return [color, color]
}
