export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}

export const clampUnit = (value: number) => clamp(value, 0, 1);

export function softKnee(value: number, knee: number, ceiling: number): number {
  if (value <= knee) return value;
  const room = ceiling - knee;
  return knee + room * (1 - Math.exp((knee - value) / room));
}
