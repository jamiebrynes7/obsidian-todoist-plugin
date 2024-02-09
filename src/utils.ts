export function isPositiveInteger(str: string): boolean {
  const num = toInt(str);
  return num != Infinity && String(num) === str && num > 0;
}

export function toInt(str: string): number {
  return Math.floor(Number(str));
}
