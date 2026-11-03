import GLib from 'gi://GLib';

const RESTARTED = 'KESTREL_RESTARTED';

/** Whether kestrel-wrapper started this Kestrel again after the one before crashed. Apps started later don't inherit it. */
export const restartedAfterCrash = GLib.getenv(RESTARTED) !== null;
GLib.unsetenv(RESTARTED);
