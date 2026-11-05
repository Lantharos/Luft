/** How much strays get up to. */
export interface Pace {
  /** How long they rest, against lively. */
  rests: number;
  /** How likely they are to doze off, against what suits them. */
  naps: number;
  /** How likely they are to get up and go. */
  eagerness: number;
  /** How long they keep to themselves after being with another, against lively. */
  solitude: number;
}

const LIVELY: Pace = { rests: 1, naps: 0.5, eagerness: 1, solitude: 1 };

export const PACES: Record<string, Pace> = {
  sleepy: { rests: 3, naps: 1.5, eagerness: 0.45, solitude: 2 },
  lively: LIVELY,
  restless: { rests: 0.45, naps: 0.2, eagerness: 1.4, solitude: 0.5 },
};
