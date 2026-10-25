export type Intensity = 'drizzle' | 'rain' | 'storm';

export const WEATHER: Record<Intensity, { density: number; wind: number }> = {
  drizzle: { density: 0.25, wind: 0.05 },
  rain: { density: 0.6, wind: 0.1 },
  storm: { density: 1, wind: 0.22 },
};
