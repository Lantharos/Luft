import GLib from 'gi://GLib';

const POLL = 16;
const QUIET = 120;

export function pause(milliseconds) {
  return new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
    resolve();
    return GLib.SOURCE_REMOVE;
  }));
}

export class Timeout extends Error {}

export async function waitUntil(condition, label, timeout = 5000) {
  const deadline = GLib.get_monotonic_time() + timeout * 1000;
  for (;;) {
    const value = await condition();
    if (value) return value;
    if (GLib.get_monotonic_time() > deadline) throw new Timeout(`Timed out after ${timeout / 1000} s waiting until ${label}`);
    await pause(POLL);
  }
}

export function nextFrame() {
  return new Promise(resolve => {
    const id = global.stage.connect_after('after-paint', () => {
      global.stage.disconnect(id);
      resolve();
    });
    global.stage.queue_redraw();
  });
}

export async function settled(timeout = 3000) {
  let painted = GLib.get_monotonic_time();
  const id = global.stage.connect_after('after-paint', () => (painted = GLib.get_monotonic_time()));
  const deadline = painted + timeout * 1000;
  try {
    await nextFrame();
    while (GLib.get_monotonic_time() - painted < QUIET * 1000 && GLib.get_monotonic_time() < deadline) await pause(POLL);
  } finally {
    global.stage.disconnect(id);
  }
}

export function within(promise, timeout, label) {
  let timer = 0;
  const expired = new Promise((_, reject) => {
    timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
      timer = 0;
      reject(new Error(`Timed out after ${timeout / 1000} s waiting until ${label}`));
      return GLib.SOURCE_REMOVE;
    });
  });
  return Promise.race([promise, expired]).finally(() => timer && GLib.source_remove(timer));
}
