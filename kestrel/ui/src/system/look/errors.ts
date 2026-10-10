import type Gio from 'gi://Gio';

type Code = 'Denied' | 'NotFound' | 'Busy' | 'Failed' | 'InvalidArgs' | 'TimedOut';

export class LookError extends Error {
  constructor(readonly code: Code, message: string) {
    super(message);
  }
}

export function returnError(invocation: Gio.DBusMethodInvocation, error: unknown): void {
  const { code, message } = error instanceof LookError ? error : new LookError('Failed', error instanceof Error ? error.message : String(error));
  invocation.return_dbus_error(`com.lantharos.Kestrel.Look.Error.${code}`, message);
}
