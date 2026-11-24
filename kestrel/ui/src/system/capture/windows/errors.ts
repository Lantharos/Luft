import type Gio from 'gi://Gio';

type Code = 'Denied' | 'Failed';

export class CaptureError extends Error {
  constructor(readonly code: Code, message: string) {
    super(message);
  }
}

export function returnError(invocation: Gio.DBusMethodInvocation, error: unknown): void {
  const { code, message } = error instanceof CaptureError ? error : new CaptureError('Failed', error instanceof Error ? error.message : String(error));
  invocation.return_dbus_error(`com.lantharos.Kestrel.WindowCapture.Error.${code}`, message);
}
