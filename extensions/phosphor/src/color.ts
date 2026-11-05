export function rgb(hex: string): [number, number, number] {
  const [red, green, blue] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
  return [red, green, blue];
}
