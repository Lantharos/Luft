import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { stealFd } from '../../auth/keyring/prompter.js';
import type { Context } from '../../context.js';
import { callerProcess, identify, type Caller } from './access/callers.js';
import { windowAccess, type Level } from './access/grants.js';
import { PidFd, unitName } from './access/processes.js';
import { captureScreen, captureWindow } from './control/capture.js';
import { requireOpenScreen } from './control/guard.js';
import { Injector } from './control/input.js';
import { parseCombo, textKeys } from './control/keys.js';
import { bringForward, type Point } from './control/targets.js';
import { describe, listedWindows, waitForWindow, windowById } from './control/windows.js';
import { LookError, returnError } from './errors.js';

const BUS_NAME = 'com.lantharos.Kestrel.Look';
const OBJECT_PATH = '/com/lantharos/Kestrel/Look';
const LOOK_XML = `<node><interface name="${BUS_NAME}">
  <method name="List"><arg type="aa{sv}" name="windows" direction="out"/></method>
  <method name="CaptureWindow"><arg type="t" name="window" direction="in"/><arg type="h" name="output" direction="in"/></method>
  <method name="CaptureScreen"><arg type="h" name="output" direction="in"/></method>
  <method name="Launch"><arg type="h" name="process" direction="in"/><arg type="s" name="unit" direction="out"/></method>
  <method name="WaitForWindow">
    <arg type="s" name="unit" direction="in"/><arg type="u" name="timeout" direction="in"/><arg type="a{sv}" name="window" direction="out"/>
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
</interface></node>`;

const BUTTONS = new Set([1, 2, 3]);

function mouseButton(button: number): number {
  if (!BUTTONS.has(button)) throw new LookError('InvalidArgs', 'The mouse button is 1 (left), 2 (middle) or 3 (right)');
  return button;
}

type Invocation = Gio.DBusMethodInvocation;
type Handler = (caller: Caller, process: PidFd) => Promise<GLib.Variant | null>;

export class LookService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(LOOK_XML, this);
  private readonly injector = new Injector();
  private readonly nameId: number;

  constructor(private readonly context: Context) {
    this.dbus.export(Gio.DBus.session, OBJECT_PATH);
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, null, null);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    this.dbus.unexport();
    this.injector.destroy();
    windowAccess.reset();
  }

  ListAsync(_parameters: [], invocation: Invocation): void {
    void this.answer(invocation, async caller => {
      requireOpenScreen(this.context);
      const windows = listedWindows().map(window => {
        const launched = windowAccess.launches.owner(window)?.unit === caller.unit;
        return describe(window, windowAccess.held(caller, window), launched);
      });
      return new GLib.Variant('(aa{sv})', [windows]);
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
      requireOpenScreen(this.context);
      await windowAccess.require(caller, null, 'see');
      requireOpenScreen(this.context);
      await captureScreen(output);
    });
  }

  LaunchAsync([index]: [number], invocation: Invocation, fds: Gio.UnixFDList | null): void {
    const fd = stealFd(fds, index);
    const program = fd === null ? null : new PidFd(fd);
    this.answer(invocation, async (caller, process) => {
      if (!program) throw new LookError('InvalidArgs', 'Launch needs the process to adopt');
      const unit = await windowAccess.launches.launch(caller, process, program);
      return new GLib.Variant('(s)', [unitName(unit)]);
    }).finally(() => program?.close());
  }

  WaitForWindowAsync([name, timeout]: [string, number], invocation: Invocation): void {
    void this.answer(invocation, async caller => {
      const launch = windowAccess.launches.started(name, caller);
      const window = await waitForWindow(launch, candidate => windowAccess.launches.launchOf(candidate) === launch, timeout);
      return new GLib.Variant('(a{sv})', [describe(window, 'use', true)]);
    });
  }

  MoveAsync([id, x, y]: [number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y]], ([point]) => this.injector.move(point));
  }

  ClickAsync([id, x, y, button, count]: [number, number, number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y]], ([point]) => {
      if (count < 1 || count > 3) throw new LookError('InvalidArgs', 'A click can be single, double or triple');
      return this.injector.click(point, mouseButton(button), count);
    });
  }

  DragAsync([id, x, y, toX, toY, button]: [number, number, number, number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y], [toX, toY]], ([from, to]) => this.injector.drag(from, to, mouseButton(button)));
  }

  ScrollAsync([id, x, y, dx, dy]: [number, number, number, number, number], invocation: Invocation): void {
    this.control(invocation, id, [[x, y]], ([point]) => this.injector.scroll(point, dx, dy));
  }

  TypeAsync([id, text]: [number, string], invocation: Invocation): void {
    this.control(invocation, id, [], () => this.injector.type(textKeys(text)));
  }

  KeyAsync([id, combo]: [number, string], invocation: Invocation): void {
    this.control(invocation, id, [], () => this.injector.press(parseCombo(combo)));
  }

  private control(invocation: Invocation, id: number, points: Point[], act: (points: Point[]) => Promise<void>): void {
    void this.answer(invocation, async caller => {
      const window = await this.permitted(caller, id, 'use');
      const targets = await bringForward(window, this.context.activateWindow, points);
      requireOpenScreen(this.context);
      await act(targets);
      return null;
    });
  }

  private async permitted(caller: Caller, id: number, level: Level): Promise<Meta.Window> {
    requireOpenScreen(this.context);
    const window = windowById(id);
    await windowAccess.require(caller, window, level);
    requireOpenScreen(this.context);
    return windowById(id);
  }

  private capture(invocation: Invocation, fd: number | null, shoot: (caller: Caller, output: Gio.OutputStream) => Promise<void>): void {
    const output = fd === null ? null : new GioUnix.OutputStream({ fd, close_fd: true });
    this.answer(invocation, async caller => {
      if (!output) throw new LookError('InvalidArgs', 'A file to write the picture to is needed');
      await shoot(caller, output);
      return null;
    }).finally(() => output?.close(null));
  }

  private async answer(invocation: Invocation, handle: Handler): Promise<void> {
    let process: PidFd | null = null;
    try {
      process = await callerProcess(invocation);
      const pid = process.pid;
      const caller = pid ? identify(pid, unit => windowAccess.launches.ownerOf(unit)) : null;
      if (!caller || process.pid !== pid) throw new LookError('Denied', 'The program asking ended or could not be recognized');
      const reply = await handle(caller, process);
      invocation.return_value(reply);
    } catch (error) {
      returnError(invocation, error);
    } finally {
      process?.close();
    }
  }
}
