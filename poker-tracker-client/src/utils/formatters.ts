/**
 * Format a date string or Date object to a readable format
 * @param date Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a number as currency
 * @param amount Number to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a number as a percentage
 * @param value Number to format as percentage
 * @param fractionDigits Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, fractionDigits = 1): string => {
  return `${(value * 100).toFixed(fractionDigits)}%`;
};
