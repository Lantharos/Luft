const RealDate = Date;
let offset = 0;

class ShiftedDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length) super(...args as [number]);
    else super(RealDate.now() + offset);
  }

  static override now() {
    return RealDate.now() + offset;
  }
}

/**
 * Makes what JavaScript in Kestrel calls now read `at`, and tick on from there. Timers don't follow, the same way they
 * don't count time the computer spends asleep, so a jump looks like one: only something that hears about it can notice.
 */
export function setClock(at: number) {
  offset = at - RealDate.now();
  globalThis.Date = ShiftedDate as DateConstructor;
}

export const moveClock = (milliseconds: number) => setClock(Date.now() + milliseconds);

export function realClock() {
  offset = 0;
  globalThis.Date = RealDate;
}
