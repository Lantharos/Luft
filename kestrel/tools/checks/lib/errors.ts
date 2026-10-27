import GLib from 'gi://GLib';

export const failureOf = (error: unknown): Error | GLib.Error =>
  error instanceof Error || error instanceof GLib.Error ? error : new Error(String(error));
