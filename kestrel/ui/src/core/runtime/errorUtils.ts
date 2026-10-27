import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

interface SyntaxErrorLocation {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

function formatSyntaxErrorLocation(error: SyntaxError & SyntaxErrorLocation): string {
  const { fileName = '<unknown>', lineNumber = 0, columnNumber = 0 } = error;
  return ` @ ${fileName}:${lineNumber}:${columnNumber}`;
}

function formatExceptionStack(error: { stack?: string }): string {
  const { stack } = error;
  if (!stack)
    return '\n\n(No stack trace)';

  const indentedStack = stack.split('\n').map(line => `  ${line}`).join('\n');
  return `\n\nStack trace:\n${indentedStack}`;
}

function formatExceptionWithCause(error: { stack?: string; cause?: unknown }, seenCauses: Set<unknown>, showStack?: boolean): string {
  let fmt = showStack ? formatExceptionStack(error) : '';

  const { cause } = error;
  if (!cause)
    return fmt;

  fmt += `\nCaused by: ${cause}`;

  if (cause !== null && typeof cause === 'object') {
    if (seenCauses.has(cause))
      return fmt;
    seenCauses.add(cause);

    fmt += formatExceptionWithCause(cause, seenCauses);
  }

  return fmt;
}

export function formatError(error: unknown, { showStack = true } = {}): string {
  try {
    let fmt = `${error}`;
    if (error === null || typeof error !== 'object')
      return fmt;

    if (error instanceof SyntaxError) {
      fmt += formatSyntaxErrorLocation(error);
      if (showStack)
        fmt += formatExceptionStack(error);
      return fmt;
    }

    const seenCauses = new Set<unknown>([error]);
    fmt += formatExceptionWithCause(error, seenCauses, showStack);
    return fmt;
  } catch (e) {
    return `(could not display error: ${e})`;
  }
}

export function logErrorUnlessCancelled(error: unknown, prefix?: string): boolean {
  let glibError = error as GLib.Error;
  if (glibError instanceof GLib.Error && Gio.DBusError.is_remote_error(glibError)) {
    const errorName = Gio.DBusError.get_remote_error(glibError);
    Gio.DBusError.strip_remote_error(glibError);
    glibError = Gio.DBusError.new_for_dbus_error(errorName!, glibError.message);
  }

  if (glibError.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
    return false;

  logError(glibError, prefix);
  return true;
}
