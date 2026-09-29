export const moneyFormatter = new Intl.NumberFormat('th-TH', {
  maximumFractionDigits: 0,
});

export const moneyWithDecimalsFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const decimalFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const percentFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export const compactFormatter = new Intl.NumberFormat('th-TH', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export function formatCompactMoney(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return compactFormatter.format(value);
}

// แปลงจำนวนเดือนเป็นข้อความ เช่น 30 → "2 ปี 6 เดือน"
export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} เดือน`;
  if (months === 0) return `${years} ปี`;
  return `${years} ปี ${months} เดือน`;
}

export function parseNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = value.toString().replace(/,/g, '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return moneyFormatter.format(Math.round(value));
}

export function formatMoneyWithDecimals(value: number): string {
  if (!Number.isFinite(value)) return '0.00';
  return moneyWithDecimalsFormatter.format(value);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return decimalFormatter.format(value);
}

export function formatNumberInput(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? moneyFormatter.format(Number(digits)) : '';
}

export function formatDecimalInput(value: string, maxDecimals = 2): string {
  const normalized = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = normalized.split('.');
  if (decimalParts.length > 0) {
    const decimal = decimalParts.join('').slice(0, maxDecimals);
    return `${whole}.${decimal}`;
  }
  return whole;
}
