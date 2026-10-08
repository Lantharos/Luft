import {Timeout, waitUntil} from './wait.js';

export function checks(area) {
  const failure = label => new Error(`Kestrel ${area} check failed: ${label}`);
  const passed = label => console.log(`Kestrel ${area} check: ${label}`);
  return {
    require(condition, label) {
      if (!condition) throw failure(label);
      passed(label);
    },
    async eventually(condition, label, timeout = 5000) {
      try {
        await waitUntil(condition, label, timeout);
      } catch (error) {
        if (error instanceof Timeout) throw failure(`${label} (not within ${timeout / 1000} s)`);
        throw error;
      }
      passed(label);
    },
  };
}
