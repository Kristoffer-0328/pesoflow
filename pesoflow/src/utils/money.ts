const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

/** Converts integer centavos to a display string, e.g. 150000 -> ₱1,500.00 */
export function formatPeso(centavos: number): string {
  return formatter.format(centavos / 100)
}

/**
 * Converts typed input like "1,234.5" or "₱99" to integer centavos.
 * Returns null if the input isn't a valid amount (max 2 decimal places).
 */
export function parsePesoToCentavos(input: string): number | null {
  const cleaned = input.replace(/[₱,\s]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null

  const [whole, fraction = ''] = cleaned.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}