/**
 * Formats a number to a fixed decimal string or localized format
 */
export function formatNumber(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null) return '0.0';
  return value.toFixed(decimals);
}

/**
 * Formats energy in kcal
 */
export function formatKcal(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0 kcal';
  return `${Math.round(value)} kcal`;
}

/**
 * Formats weight in grams or kilograms
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${Math.round(grams)}g`;
}
