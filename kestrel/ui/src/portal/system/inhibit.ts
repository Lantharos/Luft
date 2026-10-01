import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { PortalRequest, option, type Invocation, type Options } from '../core/request.js';
import { PortalSession, findSession } from '../core/session.js';

const INHIBIT_XML = `<node><interface name="org.freedesktop.impl.portal.Inhibit">
  <method name="Inhibit">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="u" direction="in"/><arg type="a{sv}" direction="in"/>
  </method>
  <method name="CreateMonitor">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="u" direction="out"/>
  </method>
  <method name="QueryEndResponse"><arg type="o" direction="in"/></method>
  <signal name="StateChanged"><arg type="o"/><arg type="a{sv}"/></signal>
</interface></node>`;

const SESSION_MANAGER = ['org.gnome.SessionManager', '/org/gnome/SessionManager', 'org.gnome.SessionManager'] as const;
const CLIENT_INTERFACE = 'org.gnome.SessionManager.ClientPrivate';
const RUNNING = 1;
const QUERY_END = 2;
const ENDING = 3;

export interface ScreenLock {
  readonly active: boolean;
  connect(signal: 'active-changed', callback: () => void): number;
}

function callManager(method: string, parameters: GLib.Variant, replyType: string | null = null): Promise<GLib.Variant> {
  return Gio.DBus.session.call(...SESSION_MANAGER, method, parameters, replyType ? new GLib.VariantType(replyType) : null,
    Gio.DBusCallFlags.NONE, -1, null);
}

class MonitorSession extends PortalSession {
  awaitingResponse = false;

  constructor(handle: string, appId: string, private readonly onClosed: (session: MonitorSession) => void) {
    super(handle, appId);
  }

  protected closed(): void {
    this.onClosed(this);
  }
}

export class InhibitPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(INHIBIT_XML, this);
  private readonly monitors = new Set<MonitorSession>();
  private client: Promise<string> | null = null;
  private clientSignals = 0;
  private state = RUNNING;

  constructor(private readonly screenLock: ScreenLock | null) {
    screenLock?.connect('active-changed', () => this.announce());
  }

  InhibitAsync([handle, appId, , flags, options]: [string, string, string, number, Options], invocation: Invocation): void {
    const cookie = callManager('Inhibit', new GLib.Variant('(susu)', [appId, 0, option<string>(options, 'reason') ?? '', flags]), '(u)')
      .then(reply => (reply.deep_unpack() as [number])[0])
      .catch(error => {
        console.warn(`Couldn't inhibit the session for ${appId}: ${error}`);
        return 0;
      });
    const request = new PortalRequest(handle, () => {
      request.finish();
      void cookie.then(id => { if (id) void callManager('Uninhibit', new GLib.Variant('(u)', [id])); });
    });
    invocation.return_value(null);
  }

  CreateMonitorAsync([, sessionHandle, appId]: [string, string, string, string], invocation: Invocation): void {
    this.client ??= this.registerClient();
    const monitor = new MonitorSession(sessionHandle, appId, ended => {
      this.monitors.delete(ended);
      this.answerQuery();
    });
    this.monitors.add(monitor);
    invocation.return_value(new GLib.Variant('(u)', [0]));
    this.emitState(monitor);
  }

  QueryEndResponse(sessionHandle: string): void {
    const monitor = findSession(sessionHandle, MonitorSession);
    if (!monitor) return;
    monitor.awaitingResponse = false;
    this.answerQuery();
  }

  destroy(): void {
    for (const monitor of this.monitors) monitor.close();
    if (this.clientSignals) Gio.DBus.session.signal_unsubscribe(this.clientSignals);
    void this.client?.then(path => callManager('UnregisterClient', new GLib.Variant('(o)', [path])));
  }

  private async registerClient(): Promise<string> {
    const [path] = (await callManager('RegisterClient', new GLib.Variant('(ss)', ['org.freedesktop.portal', '']), '(o)')).deep_unpack() as [string];
    this.clientSignals = Gio.DBus.session.signal_subscribe(SESSION_MANAGER[0], CLIENT_INTERFACE, null, path, null, Gio.DBusSignalFlags.NONE,
      (_connection, _sender, _path, _iface, signal) => {
        if (signal === 'QueryEndSession') this.queryEnd();
        else if (signal === 'EndSession') this.end();
      });
    return path;
  }

  private queryEnd(): void {
    for (const monitor of this.monitors) monitor.awaitingResponse = true;
    this.state = QUERY_END;
    this.announce();
    this.answerQuery();
  }

  private end(): void {
    this.state = ENDING;
    this.announce();
    void this.respond();
  }

  private answerQuery(): void {
    if (this.state !== QUERY_END || [...this.monitors].some(monitor => monitor.awaitingResponse)) return;
    void this.respond();
  }

  private async respond(): Promise<void> {
    const path = await this.client!;
    await Gio.DBus.session.call(SESSION_MANAGER[0], path, CLIENT_INTERFACE, 'EndSessionResponse', new GLib.Variant('(bs)', [true, '']),
      null, Gio.DBusCallFlags.NONE, -1, null);
  }

  private announce(): void {
    for (const monitor of this.monitors) this.emitState(monitor);
  }

  private emitState(monitor: MonitorSession): void {
    this.dbus.emit_signal('StateChanged', new GLib.Variant('(oa{sv})', [monitor.handle, {
      'screensaver-active': new GLib.Variant('b', this.screenLock?.active ?? false),
      'session-state': new GLib.Variant('u', this.state),
    }]));
  }
}
