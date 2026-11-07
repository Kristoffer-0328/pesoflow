import type { Wallet } from '../types'

export function getWalletCardColors(wallet: Wallet): [string, string] {
  const name = (wallet.provider || wallet.name).toLowerCase()
  if (name.includes('bdo')) return ['#06316d', '#074b9b']
  if (name.includes('bpi')) return ['#9b1c31', '#d03a45']
  if (name.includes('metro')) return ['#087a3c', '#0b9a52']
  if (name.includes('union')) return ['#0c4b8e', '#2678c9']
  if (name.includes('gcash')) return ['#0078c8', '#00a2e8']
  if (name.includes('maya')) return ['#092d61', '#13a6a0']
  return [wallet.color || '#278568', '#0f766e']
}
