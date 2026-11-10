import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

type Method = (...args: unknown[]) => unknown;
type AsyncMethod = (parameters: unknown[], invocation: Gio.DBusMethodInvocation, fds: Gio.UnixFDList | null) => unknown;

const FRONTEND = 'org.freedesktop.portal.Desktop';

class Frontend {
  private owner: string | null = null;

  constructor() {
    Gio.bus_watch_name_on_connection(Gio.DBus.session, FRONTEND, Gio.BusNameWatcherFlags.NONE,
      (_connection, _name, owner) => { this.owner = owner; }, () => { this.owner = null; });
  }

  allows(sender: string | null): boolean {
    return !!sender && (sender === this.owner || sender === Gio.DBus.session.get_unique_name());
  }
}

let frontend: Frontend | null = null;

function returnFailure(invocation: Gio.DBusMethodInvocation, error: unknown): void {
  if (error instanceof GLib.Error) invocation.return_gerror(error);
  else invocation.return_dbus_error('org.freedesktop.DBus.Error.Failed', `${error}`);
}

/** Runs a method that answers by itself, and answers for it when it throws, so the app that asked isn't left waiting. */
async function answering(invocation: Gio.DBusMethodInvocation, run: () => unknown): Promise<void> {
  try {
    await run();
  } catch (error) {
    returnFailure(invocation, error);
  }
}

function returnSync(invocation: Gio.DBusMethodInvocation, method: Gio.DBusMethodInfo, run: () => unknown): void {
  let result: unknown;
  try {
    result = run();
  } catch (error) {
    returnFailure(invocation, error);
    return;
  }
  const outputs = method.out_args;
  const signature: string = `(${outputs.map(arg => arg.signature).join('')})`;
  invocation.return_value(result instanceof GLib.Variant ? result
    : new GLib.Variant(signature, outputs.length === 1 ? [result] : (result as unknown[] | undefined) ?? []));
}

export function portalObject(xml: string, implementation: object): Gio.DBusExportedObject {
  frontend ??= new Frontend();
  const allowed = frontend;
  const source = implementation as Record<string, unknown>;
  const [info] = Gio.DBusNodeInfo.new_for_xml(xml).interfaces;
  const facade: Record<string, unknown> = {};
  for (const method of info.methods) {
    const asynchronous = source[`${method.name}Async`] as AsyncMethod | undefined;
    const synchronous = source[method.name] as Method | undefined;
    facade[`${method.name}Async`] = (parameters: unknown[], invocation: Gio.DBusMethodInvocation, fds: Gio.UnixFDList | null) => {
      if (!allowed.allows(invocation.get_sender())) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', `Only the desktop portal can call ${method.name}`);
        return;
      }
      if (asynchronous) void answering(invocation, () => asynchronous.call(implementation, parameters, invocation, fds));
      else returnSync(invocation, method, () => synchronous!.call(implementation, ...parameters, fds));
    };
  }
  for (const property of info.properties)
    Object.defineProperty(facade, property.name, { get: () => source[property.name], enumerable: true });
  return Gio.DBusExportedObject.wrapJSObject(xml, facade);
}
