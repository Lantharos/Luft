import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { ENDED, SUCCESS, option, respond, type Invocation, type Options, type Outcome } from '../core/request.js';
import { findSession } from '../core/session.js';
import { ClipboardBridge } from './clipboardBridge.js';
import { chooseCapture, type CaptureChoice } from './dialogs/inputCaptureDialog.js';
import { ALL_DEVICES, failed, forwardFd, mutterCall, mutterCallWithFd, mutterObject, mutterSignals, type MutterObject } from './mutter.js';
import { PeerSession } from './peerSession.js';
import { DONT_PERSIST, persistMode, persisted, storedChoice } from './restore.js';

const INPUT_CAPTURE_XML = `<node><interface name="org.freedesktop.impl.portal.InputCapture">
  <method name="CreateSession2">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="a{sv}" direction="out"/>
  </method>
  <method name="Start">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="GetZones">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="SetPointerBarriers">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/><arg type="aa{sv}" direction="in"/><arg type="u" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="Enable"><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="out"/><arg type="a{sv}" direction="out"/></method>
  <method name="Disable"><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="out"/><arg type="a{sv}" direction="out"/></method>
  <method name="Release"><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="out"/><arg type="a{sv}" direction="out"/></method>
  <method name="ConnectToEIS"><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/><arg type="h" direction="out"/></method>
  <signal name="Disabled"><arg type="o"/><arg type="a{sv}"/></signal>
  <signal name="Activated"><arg type="o"/><arg type="a{sv}"/></signal>
  <signal name="Deactivated"><arg type="o"/><arg type="a{sv}"/></signal>
  <signal name="ZonesChanged"><arg type="o"/><arg type="a{sv}"/></signal>
  <property name="SupportedCapabilities" type="u" access="read"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const INPUT_CAPTURE = 'org.freedesktop.impl.portal.InputCapture';
const NAME = 'org.gnome.Mutter.InputCapture';
const MUTTER_INPUT_CAPTURE = mutterObject(NAME, '/org/gnome/Mutter/InputCapture', NAME);
const STORED_CAPTURE = 'ub';

type Position = [number, number, number, number];
type Barrier = { id: number; position: Position };

export class InputCaptureSession extends PeerSession {
  clipboardRequested = false;
  clipboard: ClipboardBridge | null = null;
  private capture: MutterObject | null = null;
  private unsubscribe: (() => void) | null = null;
  private readonly barriers = new Map<number, number>();
  private zoneSet: number | null = null;
  private starting = false;

  async start(handle: string, options: Options): Promise<Outcome> {
    if (this.starting || this.capture) return [ENDED, {}];
    this.starting = true;
    try {
      const capabilities = (option<number>(options, 'capabilities') ?? 0) & ALL_DEVICES;
      const persist = persistMode(options);
      const stored = storedChoice<[number, boolean]>(options, STORED_CAPTURE);
      const [response, choice] = stored
        ? [SUCCESS, { clipboard: stored.values[1] && this.clipboardRequested, remember: true }]
        : await this.ask(handle, persist);
      if (!choice) return [response, {}];
      if (!this.active) return [ENDED, {}];
      const granted = stored ? capabilities & stored.values[0] : capabilities;
      await this.open(granted, choice.clipboard);
      const results: Options = { capabilities: new GLib.Variant('u', granted) };
      if (this.clipboardRequested) results.clipboard_enabled = new GLib.Variant('b', !!this.clipboard);
      return [SUCCESS, { ...results, ...persisted(choice.remember ? persist : DONT_PERSIST, STORED_CAPTURE, stored?.created, [granted, !!this.clipboard]) }];
    } catch (error) {
      console.warn(`Couldn't let ${this.appId || 'an app'} capture input: ${(error as Error).message}`);
      return [ENDED, {}];
    } finally {
      this.starting = false;
    }
  }

  async zones(): Promise<Options> {
    const [serial, zones] = (await mutterCall(this.session, 'GetZones', null, '(ua(uuii))')).deep_unpack() as [number, [number, number, number, number][]];
    this.zoneSet = serial;
    return { zones: new GLib.Variant('a(uuii)', zones), zone_set: new GLib.Variant('u', serial) };
  }

  async setBarriers(barriers: Barrier[], zoneSet: number): Promise<Options> {
    await mutterCall(this.session, 'ClearBarriers');
    this.barriers.clear();
    const failures: number[] = [];
    for (const { id, position } of barriers) {
      try {
        const [mutterId] = (await mutterCall(this.session, 'AddBarrier', new GLib.Variant('(u(iiii))', [zoneSet, position]), '(u)')).deep_unpack() as [number];
        this.barriers.set(mutterId, id);
      } catch {
        failures.push(id);
      }
    }
    return { failed_barriers: new GLib.Variant('au', failures) };
  }

  async call(method: string, parameters: GLib.Variant | null = null): Promise<Options> {
    await mutterCall(this.session, method, parameters);
    return {};
  }

  connectToEis(): Promise<[GLib.Variant, Gio.UnixFDList | null]> {
    return mutterCallWithFd(this.session, 'ConnectToEIS');
  }

  private get session(): MutterObject {
    if (!this.capture) throw new Error('Input capture hasn\'t started');
    return this.capture;
  }

  private async ask(handle: string, persist: number): Promise<[number, CaptureChoice | null]> {
    const outcome = await chooseCapture(handle, this.appId, this.clipboardRequested, persist, this.track);
    this.track(null);
    return outcome;
  }

  private async open(capabilities: number, clipboard: boolean): Promise<void> {
    const [path] = (await mutterCall(MUTTER_INPUT_CAPTURE, 'CreateSession', new GLib.Variant('(u)', [capabilities]), '(o)')).deep_unpack() as [string];
    const capture = mutterObject(NAME, path, `${NAME}.Session`);
    const emit = (signal: string, options: Options) => this.emit(INPUT_CAPTURE, signal, new GLib.Variant('(oa{sv})', [this.handle, options]));
    this.capture = capture;
    this.unsubscribe = mutterSignals(capture, {
      Activated: activated => {
        const [barrier, activation, position] = activated.deep_unpack() as [number, number, [number, number]];
        emit('Activated', {
          activation_id: new GLib.Variant('u', activation),
          cursor_position: new GLib.Variant('(dd)', position),
          barrier_id: new GLib.Variant('u', this.barriers.get(barrier) ?? 0),
        });
      },
      Deactivated: deactivated => emit('Deactivated', { activation_id: deactivated.get_child_value(0) }),
      ZonesChanged: () => emit('ZonesChanged', this.zoneSet === null ? {} : { zone_set: new GLib.Variant('u', this.zoneSet) }),
      Disabled: () => emit('Disabled', {}),
      Closed: () => this.close(),
    });
    if (!this.active) {
      this.stopped();
      throw new Error('The app stopped the session');
    }
    if (clipboard) this.clipboard = await ClipboardBridge.enable(NAME, path, this);
  }

  protected stopped(): void {
    this.unsubscribe?.();
    this.clipboard?.disable();
    if (this.capture) mutterCall(this.capture, 'Close').catch(() => {});
  }
}

function sessionCall(handle: string, invocation: Invocation, work: (session: InputCaptureSession) => Promise<Options>): void {
  const session = findSession(handle, InputCaptureSession);
  if (!session) return respond(invocation, [ENDED, {}]);
  work(session).then(results => respond(invocation, [SUCCESS, results])).catch(error => {
    console.warn(`Input capture for ${session.appId || 'an app'} failed: ${error.message}`);
    respond(invocation, [ENDED, {}]);
  });
}

export class InputCapturePortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(INPUT_CAPTURE_XML, this);
  readonly version = 2;
  readonly SupportedCapabilities = ALL_DEVICES;

  CreateSession2Async([sessionHandle, appId]: [string, string, Options], invocation: Invocation): void {
    new InputCaptureSession(sessionHandle, appId, invocation.get_sender()!);
    invocation.return_value(new GLib.Variant('(a{sv})', [{}]));
  }

  async StartAsync([handle, sessionHandle, , , options]: [string, string, string, string, Options], invocation: Invocation): Promise<void> {
    const session = findSession(sessionHandle, InputCaptureSession);
    respond(invocation, session ? await session.start(handle, options) : [ENDED, {}]);
  }

  GetZonesAsync([, sessionHandle]: [string, string, string, Options], invocation: Invocation): void {
    sessionCall(sessionHandle, invocation, session => session.zones());
  }

  SetPointerBarriersAsync([, sessionHandle, , , barriers, zoneSet]: [string, string, string, Options, Options[], number], invocation: Invocation): void {
    const unpacked = barriers.map(barrier => ({ id: option<number>(barrier, 'barrier_id') ?? 0, position: option<Position>(barrier, 'position') ?? [0, 0, 0, 0] }));
    sessionCall(sessionHandle, invocation, session => session.setBarriers(unpacked, zoneSet));
  }

  EnableAsync([sessionHandle]: [string, string, Options], invocation: Invocation): void {
    sessionCall(sessionHandle, invocation, session => session.call('Enable'));
  }

  DisableAsync([sessionHandle]: [string, string, Options], invocation: Invocation): void {
    sessionCall(sessionHandle, invocation, session => session.call('Disable'));
  }

  ReleaseAsync([sessionHandle, , options]: [string, string, Options], invocation: Invocation): void {
    const release: Options = options.cursor_position ? { cursor_position: options.cursor_position } : {};
    sessionCall(sessionHandle, invocation, session => session.call('Release', new GLib.Variant('(a{sv})', [release])));
  }

  ConnectToEISAsync([sessionHandle]: [string, string, Options], invocation: Invocation): void {
    const session = findSession(sessionHandle, InputCaptureSession);
    if (!session) return invocation.return_dbus_error('org.freedesktop.portal.Error.NotFound', 'No such session');
    session.connectToEis().then(reply => forwardFd(invocation, reply)).catch(error => failed(invocation, error));
  }
}
