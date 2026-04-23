import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export const EXCHANGE_RATES: Record<string, number> = {
  'USD': 312.50,
  'GBP': 395.20,
  'CAD': 228.40,
  'AUD': 205.15,
  'EUR': 338.10,
  'LKR': 1
};

export const RATE_UPDATED_AT = "March 29, 2026";

/**
 * Formats an amount into LKR.
 * If the amount is in a different currency, it converts it first.
 * If the final LKR amount exceeds 13,500,000, it displays in millions (M).
 */
export function formatLKR(amount: number | string, fromCurrency: string = 'USD') {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'LKR 0';

  const lkrAmount = numericAmount * (EXCHANGE_RATES[fromCurrency] || EXCHANGE_RATES['USD']);
  
  if (lkrAmount >= 13500000) {
    return `LKR ${(lkrAmount / 1000000).toFixed(2)}M`;
  }
  
  return `LKR ${lkrAmount.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
}

/**
 * Utility to format a value that is ALREADY in LKR.
 */
export function formatRawLKR(lkrAmount: number) {
  if (lkrAmount >= 13500000) {
    return `LKR ${(lkrAmount / 1000000).toFixed(2)}M`;
  }
  
  return `LKR ${lkrAmount.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
