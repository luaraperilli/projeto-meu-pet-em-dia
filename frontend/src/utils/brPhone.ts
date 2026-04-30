export function maskBrPhone(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11); // DDD + 9 + 4
  const ddd = digits.slice(0, 2);
  const first = digits.slice(2, 7);
  const last = digits.slice(7, 11);
  if (digits.length <= 2) return digits ? `(${ddd}` : '';
  if (digits.length <= 7) return `(${ddd}) ${first}`;
  return `(${ddd}) ${first}-${last}`;
}

export function isCompleteBrPhone(masked: string): boolean {
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(masked);
}
