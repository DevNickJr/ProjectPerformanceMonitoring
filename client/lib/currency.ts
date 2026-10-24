export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', country: 'Ghana' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
];

export const DEFAULT_CURRENCY = 'NGN';

export function getCurrencySymbol(code?: string): string {
  if (!code) return '₦';
  const match = CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase());
  return match ? match.symbol : (code === 'USD' ? '$' : code);
}

export function formatCurrency(amount: number | string | undefined | null, currencyCode?: string): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return `${getCurrencySymbol(currencyCode)}0`;
  const num = Number(amount);
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
