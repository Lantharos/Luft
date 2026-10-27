import {Timeout, truthy, waitUntil, type Truthy} from './wait.js';

export type Eventually = <T>(condition: () => T | Promise<T>, label: string, timeout?: number) => Promise<Truthy<T>>;

export function checks(area: string) {
  const failure = (label: string) => new Error(`Kestrel ${area} check failed: ${label}`);
  const passed = (label: string) => console.log(`Kestrel ${area} check: ${label}`);
  return {
    require<T>(condition: T, label: string): Truthy<T> {
      if (!truthy(condition)) throw failure(label);
      passed(label);
      return condition;
    },
    async eventually<T>(condition: () => T | Promise<T>, label: string, timeout = 5000): Promise<Truthy<T>> {
      try {
        const value = await waitUntil(condition, label, timeout);
        passed(label);
        return value;
      } catch (error) {
        if (error instanceof Timeout) throw failure(`${label} (not within ${timeout / 1000} s)`);
        throw error;
      }
    },
  };
}
