const IN_A_ROW_WITHIN = 2 * 60 * 1_000_000;

export interface Record {
  started: number;
  running: string[];
  crashes: { [id: string]: number };
  turnedOff: string[];
}

export function afterCrash(previous: Record, now: number): Record {
  const inARow = now - previous.started < IN_A_ROW_WITHIN;
  return {
    started: now,
    running: [],
    crashes: Object.fromEntries(previous.running.map(id => [id, (inARow ? previous.crashes[id] ?? 0 : 0) + 1])),
    turnedOff: inARow ? previous.turnedOff : [],
  };
}
