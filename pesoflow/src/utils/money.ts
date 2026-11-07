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

/** Formats a money input while preserving a typed decimal point and up to 2 decimals. */
export function formatPesoInput(input: string): string {
  const cleaned = input.replace(/[^\d.]/g, '')
  if (!cleaned) return ''

  const decimalIndex = cleaned.indexOf('.')
  const wholePart = (decimalIndex === -1 ? cleaned : cleaned.slice(0, decimalIndex)) || '0'
  const fractionPart =
    decimalIndex === -1
      ? ''
      : cleaned
          .slice(decimalIndex + 1)
          .replace(/\./g, '')
          .slice(0, 2)
  const groupedWhole = wholePart.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimalIndex === -1
    ? groupedWhole
    : `${groupedWhole}.${fractionPart}`
}