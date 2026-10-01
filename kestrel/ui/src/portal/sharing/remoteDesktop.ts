import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { ENDED, SUCCESS, option, respond, type Invocation, type Options, type Outcome } from '../core/request.js';
import { findSession } from '../core/session.js';
import { ClipboardBridge } from './clipboardBridge.js';
import { chooseControl, type ControlChoice } from './dialogs/remoteDesktopDialog.js';
import { ALL_DEVICES, failed, forwardFd, mutterCall, mutterCallWithFd, mutterObject, mutterProperty, mutterSignals, type MutterObject } from './mutter.js';
import { PeerSession } from './peerSession.js';
import { Recording } from './recording.js';
import { DONT_PERSIST, persistMode, persisted, storedChoice, type StoredChoice } from './restore.js';
import { restoredSources, storedSources, type Selection, type StoredSource } from './sources.js';

const REMOTE_DESKTOP_XML = `<node><interface name="org.freedesktop.impl.portal.RemoteDesktop">
  <method name="CreateSession">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="SelectDevices">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="Start">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="NotifyPointerMotion"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="d" direction="in"/><arg type="d" direction="in"/></method>
  <method name="NotifyPointerMotionAbsolute"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="in"/><arg type="d" direction="in"/><arg type="d" direction="in"/></method>
  <method name="NotifyPointerButton"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="i" direction="in"/><arg type="u" direction="in"/></method>
  <method name="NotifyPointerAxis"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="d" direction="in"/><arg type="d" direction="in"/></method>
  <method name="NotifyPointerAxisDiscrete"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="in"/><arg type="i" direction="in"/></method>
  <method name="NotifyKeyboardKeycode"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="i" direction="in"/><arg type="u" direction="in"/></method>
  <method name="NotifyKeyboardKeysym"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="i" direction="in"/><arg type="u" direction="in"/></method>
  <method name="NotifyTouchDown"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="in"/><arg type="u" direction="in"/><arg type="d" direction="in"/><arg type="d" direction="in"/></method>
  <method name="NotifyTouchMotion"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="in"/><arg type="u" direction="in"/><arg type="d" direction="in"/><arg type="d" direction="in"/></method>
  <method name="NotifyTouchUp"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="in"/></method>
  <method name="ConnectToEIS">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="h" direction="out"/>
  </method>
  <property name="AvailableDeviceTypes" type="u" access="read"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const NAME = 'org.gnome.Mutter.RemoteDesktop';
const REMOTE_DESKTOP = mutterObject(NAME, '/org/gnome/Mutter/RemoteDesktop', NAME);
const STORED_CONTROL = 'uba(uuv)';
const FINISH_SCROLL = 1;

export class RemoteDesktopSession extends PeerSession {
  clipboardRequested = false;
  clipboard: ClipboardBridge | null = null;
  private selection: Selection | null = null;
  private devices = ALL_DEVICES;
  private persistMode = DONT_PERSIST;
  private stored: StoredChoice<[number, boolean, StoredSource[]]> | null = null;
  private recording: Recording | null = null;
  private shared = 0;
  private starting = false;
  private started = false;
  private readonly unsubscribe: () => void;

  constructor(handle: string, appId: string, peer: string, private readonly mutter: MutterObject, private readonly id: string) {
    super(handle, appId, peer);
    this.unsubscribe = mutterSignals(mutter, { Closed: () => this.close() });
  }

  static async create(handle: string, appId: string, peer: string): Promise<RemoteDesktopSession> {
    const [path] = (await mutterCall(REMOTE_DESKTOP, 'CreateSession', null, '(o)')).deep_unpack() as [string];
    const mutter = mutterObject(NAME, path, `${NAME}.Session`);
    return new RemoteDesktopSession(handle, appId, peer, mutter, await mutterProperty<string>(mutter, 'SessionId'));
  }

  selectDevices(options: Options): void {
    this.devices = (option<number>(options, 'types') ?? ALL_DEVICES) & ALL_DEVICES;
    this.persistMode = persistMode(options);
    this.stored = storedChoice(options, STORED_CONTROL);
  }

  selectSources(selection: Selection): void {
    this.selection = selection;
  }

  async start(handle: string): Promise<Outcome> {
    if (this.starting || this.started) return [ENDED, {}];
    this.starting = true;
    try {
      const [response, choice, persist] = await this.choose(handle);
      if (!choice) return [response, {}];
      return this.active ? await this.control(choice, persist) : [ENDED, {}];
    } finally {
      this.starting = false;
    }
  }

  notify(method: string, signature: string, values: unknown[]): void {
    if (!this.started) return;
    mutterCall(this.mutter, method, new GLib.Variant(signature, values))
      .catch(error => console.warn(`Couldn't pass input from ${this.appId || 'an app'}: ${error.message}`));
  }

  notifyOnStream(method: string, signature: string, node: number, values: unknown[]): void {
    const path = this.recording?.streamPath(node);
    if (path) this.notify(method, signature, [path, ...values]);
  }

  connectToEis(): Promise<[GLib.Variant, Gio.UnixFDList | null]> {
    return mutterCallWithFd(this.mutter, 'ConnectToEIS', new GLib.Variant('(a{sv})', [{ 'device-types': new GLib.Variant('u', this.shared) }]));
  }

  private restored(): ControlChoice | null {
    if (!this.stored) return null;
    const [devices, clipboard, stored] = this.stored.values;
    const sources = this.selection && restoredSources(stored, this.selection.types);
    if (this.selection && !sources) return null;
    return { devices: devices & this.devices, sources, clipboard: clipboard && this.clipboardRequested, remember: true };
  }

  private async choose(handle: string): Promise<[number, ControlChoice | null, number]> {
    const restored = this.restored();
    if (restored) return [SUCCESS, restored, this.persistMode];
    const request = { devices: this.devices, selection: this.selection, clipboard: this.clipboardRequested, persistMode: this.persistMode };
    const [response, choice] = await chooseControl(handle, this.appId, request, this.track);
    this.track(null);
    return [response, choice, choice?.remember ? this.persistMode : DONT_PERSIST];
  }

  private async control(choice: ControlChoice, persist: number): Promise<Outcome> {
    try {
      if (choice.sources && this.selection) {
        this.recording = await Recording.forRemoteDesktop(this.id);
        if (!this.active) throw new Error('The app stopped the session');
        await this.recording.record(choice.sources, this.selection);
      }
      await mutterCall(this.mutter, 'Start');
      await this.recording?.ready();
      if (choice.clipboard) this.clipboard = await ClipboardBridge.enable(NAME, this.mutter.path, this);
    } catch (error) {
      console.warn(`Couldn't let ${this.appId || 'an app'} control the computer: ${(error as Error).message}`);
      this.recording?.stop();
      this.recording = null;
      return [ENDED, {}];
    }
    this.shared = choice.devices;
    this.started = true;
    const results: Options = { devices: new GLib.Variant('u', this.shared) };
    if (this.clipboardRequested) results.clipboard_enabled = new GLib.Variant('b', !!this.clipboard);
    if (this.recording) results.streams = this.recording.results;
    return [SUCCESS, { ...results, ...persisted(persist, STORED_CONTROL, this.stored?.created, [this.shared, !!this.clipboard, storedSources(choice.sources ?? [])]) }];
  }

  protected stopped(): void {
    this.unsubscribe();
    this.clipboard?.disable();
    this.recording?.stop();
    mutterCall(this.mutter, 'Stop').catch(() => {});
  }
}

export class RemoteDesktopPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(REMOTE_DESKTOP_XML, this);
  readonly version = 2;
  readonly AvailableDeviceTypes = ALL_DEVICES;

  async CreateSessionAsync([, sessionHandle, appId]: [string, string, string, Options], invocation: Invocation): Promise<void> {
    try {
      await RemoteDesktopSession.create(sessionHandle, appId, invocation.get_sender()!);
      respond(invocation, [SUCCESS, {}]);
    } catch (error) {
      console.warn(`Couldn't start remote control for ${appId || 'an app'}: ${(error as Error).message}`);
      respond(invocation, [ENDED, {}]);
    }
  }

  SelectDevicesAsync([, sessionHandle, , options]: [string, string, string, Options], invocation: Invocation): void {
    const session = findSession(sessionHandle, RemoteDesktopSession);
    session?.selectDevices(options);
    respond(invocation, [session ? SUCCESS : ENDED, {}]);
  }

  async StartAsync([handle, sessionHandle]: [string, string, string, string, Options], invocation: Invocation): Promise<void> {
    const session = findSession(sessionHandle, RemoteDesktopSession);
    respond(invocation, session ? await session.start(handle) : [ENDED, {}]);
  }

  NotifyPointerMotion(handle: string, _options: Options, dx: number, dy: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyPointerMotionRelative', '(dd)', [dx, dy]);
  }

  NotifyPointerMotionAbsolute(handle: string, _options: Options, stream: number, x: number, y: number): void {
    findSession(handle, RemoteDesktopSession)?.notifyOnStream('NotifyPointerMotionAbsolute', '(sdd)', stream, [x, y]);
  }

  NotifyPointerButton(handle: string, _options: Options, button: number, state: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyPointerButton', '(ib)', [button, state !== 0]);
  }

  NotifyPointerAxis(handle: string, options: Options, dx: number, dy: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyPointerAxis', '(ddu)', [dx, dy, option<boolean>(options, 'finish') ? FINISH_SCROLL : 0]);
  }

  NotifyPointerAxisDiscrete(handle: string, _options: Options, axis: number, steps: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyPointerAxisDiscrete', '(ui)', [axis, steps]);
  }

  NotifyKeyboardKeycode(handle: string, _options: Options, keycode: number, state: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyKeyboardKeycode', '(ub)', [keycode, state !== 0]);
  }

  NotifyKeyboardKeysym(handle: string, _options: Options, keysym: number, state: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyKeyboardKeysym', '(ub)', [keysym, state !== 0]);
  }

  NotifyTouchDown(handle: string, _options: Options, stream: number, slot: number, x: number, y: number): void {
    findSession(handle, RemoteDesktopSession)?.notifyOnStream('NotifyTouchDown', '(sudd)', stream, [slot, x, y]);
  }

  NotifyTouchMotion(handle: string, _options: Options, stream: number, slot: number, x: number, y: number): void {
    findSession(handle, RemoteDesktopSession)?.notifyOnStream('NotifyTouchMotion', '(sudd)', stream, [slot, x, y]);
  }

  NotifyTouchUp(handle: string, _options: Options, slot: number): void {
    findSession(handle, RemoteDesktopSession)?.notify('NotifyTouchUp', '(u)', [slot]);
  }

  ConnectToEISAsync([handle]: [string, string, Options], invocation: Invocation): void {
    const session = findSession(handle, RemoteDesktopSession);
    if (!session) return invocation.return_dbus_error('org.freedesktop.portal.Error.NotFound', 'No such session');
    session.connectToEis().then(reply => forwardFd(invocation, reply)).catch(error => failed(invocation, error));
  }
}
