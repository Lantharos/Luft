import GLib from 'gi://GLib';

const RESTARTED = 'KESTREL_RESTARTED';

export const restartedAfterCrash = GLib.getenv(RESTARTED) !== null;
GLib.unsetenv(RESTARTED);
