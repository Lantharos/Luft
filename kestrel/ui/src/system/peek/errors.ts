import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';

type Code = 'Denied' | 'NotFound' | 'Busy' | 'Failed' | 'InvalidArgs' | 'TimedOut';

export class PeekError extends Error {
  constructor(readonly code: Code, message: string) {
    super(message);
  }
}

export function returnError(invocation: Gio.DBusMethodInvocation, error: unknown): void {
  const { code, message } = error instanceof PeekError ? error : new PeekError('Failed', error instanceof Error ? error.message : String(error));
  invocation.return_dbus_error(`com.lantharos.Kestrel.Peek.Error.${code}`, message);
}

export function within<T>(work: Promise<T>, milliseconds: number, message: string): Promise<T> {
  let timer = 0;
  const expired = new Promise<never>((_resolve, reject) => {
    timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
      timer = 0;
      reject(new PeekError('TimedOut', message));
      return GLib.SOURCE_REMOVE;
    });
  });
  return Promise.race([work, expired]).finally(() => {
    if (timer) GLib.source_remove(timer);
  });
}
