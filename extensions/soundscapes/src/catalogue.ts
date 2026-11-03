export const SOUNDS = ['forest', 'cafe', 'fire', 'waves', 'wind', 'thunder', 'rain', 'white-noise', 'brown-noise'] as const;

export type SoundName = (typeof SOUNDS)[number];

export type Levels = Partial<Record<SoundName, number>>;

export const ICONS: Record<SoundName, string> = {
  forest: 'icons/forest-symbolic.svg',
  cafe: 'icons/cafe-symbolic.svg',
  fire: 'icons/fire-symbolic.svg',
  waves: 'icons/waves-symbolic.svg',
  wind: 'weather-windy-symbolic',
  thunder: 'weather-storm-symbolic',
  rain: 'weather-showers-symbolic',
  'white-noise': 'icons/white-noise-symbolic.svg',
  'brown-noise': 'icons/brown-noise-symbolic.svg',
};

export const loopFile = (sound: SoundName) => `sounds/${sound}.oga`;

export const THUNDER_STRIKES = ['sounds/thunder/strike-1.oga', 'sounds/thunder/strike-2.oga', 'sounds/thunder/strike-3.oga'];

/** The levels people hear: every sound, with the ones a mix leaves out at 0. */
export const complete = (levels: Levels): Record<SoundName, number> =>
  Object.fromEntries(SOUNDS.map(sound => [sound, levels[sound] ?? 0])) as Record<SoundName, number>;
