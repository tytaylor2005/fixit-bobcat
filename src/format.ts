/** Whole-dollar US currency, e.g. $1,500. */
export const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
