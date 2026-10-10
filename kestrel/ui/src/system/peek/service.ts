import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { stealFd } from '../../auth/keyring/prompter.js';
import { callerProcess, type Caller } from './access/callers.js';
import type { Level } from './access/prompt.js';
import { PidFd } from './access/processes.js';
import { captureScreen, captureWindow } from './control/capture.js';
import { requireOpenScreen, screenGuarded, type Screen } from './control/guard.js';
import { Injector } from './control/input.js';
import { parseCombo, textKeys } from './control/keys.js';
import { bringForward, type Point } from './control/targets.js';
import { describe, listedWindows, windowById } from './control/windows.js';
import { PeekError, returnError } from './errors.js';
import type { Policy } from './policy.js';

const BUS_NAME = 'com.lantharos.Kestrel.Peek';
const OBJECT_PATH = '/com/lantharos/Kestrel/Peek';
const PEEK_XML = `<node><interface name="${BUS_NAME}">
  <method name="List"><arg type="s" name="handle" direction="in"/><arg type="aa{sv}" name="windows" direction="out"/></method>
  <method name="HandleWindow"><arg type="s" name="handle" direction="in"/><arg type="a{sv}" name="window" direction="out"/></method>
  <method name="CaptureWindow"><arg type="t" name="window" direction="in"/><arg type="h" name="output" direction="in"/></method>
  <method name="CaptureScreen"><arg type="h" name="output" direction="in"/></method>
  <method name="Launch"><arg type="h" name="process" direction="in"/><arg type="s" name="handle" direction="out"/></method>
  <method name="WaitForWindow">
    <arg type="s" name="handle" direction="in"/><arg type="u" name="timeout" direction="in"/><arg type="a{sv}" name="window" direction="out"/>
  </method>
  <method name="Move"><arg type="t" name="window" direction="in"/><arg type="d" name="x" direction="in"/><arg type="d" name="y" direction="in"/></method>
  <method name="Click">
    <arg type="t" name="window" direction="in"/><arg type="d" name="x" direction="in"/><arg type="d" name="y" direction="in"/>
    <arg type="u" name="button" direction="in"/><arg type="u" name="count" direction="in"/>
  </method>
  <method name="Drag">
    <arg type="t" name="window" direction="in"/><arg type="d" name="x" direction="in"/><arg type="d" name="y" direction="in"/>
    <arg type="d" name="to_x" direction="in"/><arg type="d" name="to_y" direction="in"/><arg type="u" name="button" direction="in"/>
  </method>
  <method name="Scroll">
    <arg type="t" name="window" direction="in"/><arg type="d" name="x" direction="in"/><arg type="d" name="y" direction="in"/>
    <arg type="i" name="dx" direction="in"/><arg type="i" name="dy" direction="in"/>
  </method>
  <method name="Type"><arg type="t" name="window" direction="in"/><arg type="s" name="text" direction="in"/></method>
  <method name="Key"><arg type="t" name="window" direction="in"/><arg type="s" name="combo" direction="in"/></method>
  <method name="Stop"><arg type="s" name="handle" direction="in"/></method>
</interface></node>`;

const BUTTONS = new Set([1, 2, 3]);

function mouseButton(button: number): number {
  if (!BUTTONS.has(button)) throw new PeekError('InvalidArgs', 'The mouse button is 1 (left), 2 (middle) or 3 (right)');
  return button;
}

type Invocation = Gio.DBusMethodInvocation;
type Handler = (caller: Caller, process: PidFd) => Promise<GLib.Variant | null>;

export class PeekService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(PEEK_XML, this);
  private readonly injector: Injector;
  private readonly nameId: number;

  constructor(private readonly screen: Screen, private readonly activateWindow: (window: Meta.Window) => void,
    private readonly policy: Policy, named: () => void = () => {}) {
    this.injector = new Injector(() => screenGuarded(screen), policy.ownsTheSeat);
    this.dbus.export(Gio.DBus.session, OBJECT_PATH);
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, named, null);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    this.dbus.unexport();
    this.injector.destroy();
    this.policy.reset();
  }

  ListAsync([handle]: [string], invocation: Invocation): void {
    void this.answer(invocation, async caller => {
      requireOpenScreen(this.screen);
      const windows = handle ? this.policy.windowsOf(handle, caller) : listedWindows();
      return new GLib.Variant('(aa{sv})', [windows.map(window => this.describe(window, caller))]);
    });
  }

  HandleWindowAsync([handle]: [string], invocation: Invocation): void {
    void this.answer(invocation, async caller => {
      requireOpenScreen(this.screen);
      const windows = this.policy.windowsOf(handle, caller);
      const window = windows.find(candidate => candidate.has_focus())
        ?? windows.reduce<Meta.Window | null>((newest, candidate) => !newest || candidate.get_id() > newest.get_id() ? candidate : newest, null);
      if (!window) throw new PeekError('NotFound', `The program started as ${handle} has no window open`);
      return new GLib.Variant('(a{sv})', [this.describe(window, caller)]);
    });
  }

  CaptureWindowAsync([id, index]: [number, number], invocation: Invocation, fds: Gio.UnixFDList | null): void {
    this.capture(invocation, stealFd(fds, index), async (caller, output) => {
      const window = await this.permitted(caller, id, 'see');
      await captureWindow(window, output);
    });
  }

  CaptureScreenAsync([index]: [number], invocation: Invocation, fds: Gio.UnixFDList | null): void {
    this.capture(invocation, stealFd(fds, index), async (caller, output) => {
      requireOpenScreen(this.screen);
      await this.policy.require(caller, null, 'see');
      requireOpenScreen(this.screen);
      await captureScreen(output);
    });
  }

  LaunchAsync([index]: [number], invocation: Invocation, fds: Gio.UnixFDList | null): void {
    const fd = stealFd(fds, index);
    const program = fd === null ? null : new PidFd(fd);
    this.answer(invocation, async (caller, process) => {
      if (!program) throw new PeekError('InvalidArgs', 'Launch needs the process to adopt');
      return new GLib.Variant('(s)', [await this.policy.launch(caller, process, program)]);
    }).finally(() => program?.close());
  }

  WaitForWindowAsync([handle, timeout]: [string, number], invocation: Invocation): void {
    void this.answer(invocation, async caller => {
      const window = await this.policy.waitForWindow(handle, caller, timeout);
      return new GLib.Variant('(a{sv})', [this.describe(window, caller)]);
    });
  }

  MoveAsync([id, x, y]: [number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y]], (window, [point]) => this.injector.move(window, point));
  }

  ClickAsync([id, x, y, button, count]: [number, number, number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y]], (window, [point]) => {
      if (count < 1 || count > 3) throw new PeekError('InvalidArgs', 'A click can be single, double or triple');
      return this.injector.click(window, point, mouseButton(button), count);
    });
  }

  DragAsync([id, x, y, toX, toY, button]: [number, number, number, number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y], [toX, toY]], (window, [from, to]) => this.injector.drag(window, from, to, mouseButton(button)));
  }

  ScrollAsync([id, x, y, dx, dy]: [number, number, number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y]], (window, [point]) => this.injector.scroll(window, point, dx, dy));
  }

  TypeAsync([id, text]: [number, string], invocation: Invocation): void {
    this.control(invocation, id, [], window => this.injector.type(window, textKeys(text)));
  }

  KeyAsync([id, combo]: [number, string], invocation: Invocation): void {
    this.control(invocation, id, [], window => this.injector.press(window, parseCombo(combo)));
  }

  StopAsync([handle]: [string], invocation: Invocation): void {
    void this.answer(invocation, async caller => {
      await this.policy.stop(handle, caller);
      return null;
    });
  }

  private control(invocation: Invocation, id: number, points: Point[], act: (window: Meta.Window, points: Point[]) => Promise<void>): void {
    void this.answer(invocation, async caller => {
      const window = await this.permitted(caller, id, 'use');
      const targets = await bringForward(window, this.activateWindow, points);
      requireOpenScreen(this.screen);
      await act(window, targets);
      return null;
    });
  }

  private describe(window: Meta.Window, caller: Caller): Record<string, GLib.Variant> {
    return describe(window, this.policy.held(caller, window), this.policy.handleOf(caller, window));
  }

  private async permitted(caller: Caller, id: number, level: Level): Promise<Meta.Window> {
    requireOpenScreen(this.screen);
    const window = windowById(id);
    await this.policy.require(caller, window, level);
    requireOpenScreen(this.screen);
    return windowById(id);
  }

  private capture(invocation: Invocation, fd: number | null, shoot: (caller: Caller, output: Gio.OutputStream) => Promise<void>): void {
    const output = fd === null ? null : new GioUnix.OutputStream({ fd, close_fd: true });
    this.answer(invocation, async caller => {
      if (!output) throw new PeekError('InvalidArgs', 'A file to write the picture to is needed');
      await shoot(caller, output);
      return null;
    }).finally(() => output?.close(null));
  }

  private async answer(invocation: Invocation, handle: Handler): Promise<void> {
    let process: PidFd | null = null;
    try {
      process = await callerProcess(invocation);
      const pid = process.pid;
      const caller = pid ? this.policy.identify(pid) : null;
      if (!caller || process.pid !== pid) throw new PeekError('Denied', 'The program asking ended or could not be recognized');
      this.policy.admit(caller);
      const reply = await handle(caller, process);
      invocation.return_value(reply);
    } catch (error) {
      returnError(invocation, error);
    } finally {
      process?.close();
    }
  }
}
