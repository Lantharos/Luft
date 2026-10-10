import type Gio from 'gi://Gio';

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
