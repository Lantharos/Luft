import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Keybindings } from '../../context.js';
import { ENDED, SUCCESS, respond, type Invocation, type Options } from '../core/request.js';
import { PortalSession, findSession } from '../core/session.js';
import { canonical, label, reservedAccelerators, typesText } from './accelerators.js';
import { recordShortcuts } from './recordDialog.js';
import { ShortcutStore, type AppShortcuts } from './store.js';

const GLOBAL_SHORTCUTS_XML = `<node><interface name="org.freedesktop.impl.portal.GlobalShortcuts">
  <method name="CreateSession">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="BindShortcuts">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="a(sa{sv})" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="ListShortcuts">
    <arg type="o" direction="in"/><arg type="o" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="ConfigureShortcuts"><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/></method>
  <signal name="Activated"><arg type="o"/><arg type="s"/><arg type="t"/><arg type="a{sv}"/></signal>
  <signal name="Deactivated"><arg type="o"/><arg type="s"/><arg type="t"/><arg type="a{sv}"/></signal>
  <signal name="ShortcutsChanged"><arg type="o"/><arg type="a(sa{sv})"/></signal>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const TRIGGER_MODIFIERS: Record<string, string> = { CTRL: '<Control>', SHIFT: '<Shift>', ALT: '<Alt>', LOGO: '<Super>', NUM: '<Mod2>' };

type Requested = [id: string, options: Options][];

const display = () => (global as unknown as Shell.Global).display;

function fromTrigger(trigger: string): string {
  const parts = trigger.split('+');
  const key = parts.pop()!;
  return parts.map(part => TRIGGER_MODIFIERS[part.toUpperCase()] ?? `<${part}>`).join('') + key;
}

function preferred(options: Options): string[] {
  return [options.preferred_trigger?.recursiveUnpack() as string | string[] | undefined].flat()
    .filter((trigger): trigger is string => !!trigger).map(fromTrigger);
}

class ShortcutSession extends PortalSession {
  ids: string[] = [];
  readonly grabs = new Map<number, string>();

  constructor(handle: string, appId: string, private readonly onClosed: (session: ShortcutSession) => void) {
    super(handle, appId);
  }

  release(): void {
    for (const action of this.grabs.keys()) display().ungrab_accelerator(action);
    this.grabs.clear();
  }

  protected closed(): void {
    this.release();
    this.onClosed(this);
  }
}

export class GlobalShortcutsPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(GLOBAL_SHORTCUTS_XML, this);
  readonly version = 2;
  private readonly store = new ShortcutStore();
  private readonly sessions = new Set<ShortcutSession>();
  private readonly signals: number[];

  constructor(private readonly keybindings: Keybindings) {
    this.signals = [
      display().connect('accelerator-activated', (_display, action: number, _device, timestamp: number) => this.trigger('Activated', action, timestamp)),
      display().connect('accelerator-deactivated', (_display, action: number, _device, timestamp: number) => this.trigger('Deactivated', action, timestamp)),
    ];
  }

  CreateSessionAsync([, sessionHandle, appId]: [string, string, string, Options], invocation: Invocation): void {
    this.sessions.add(new ShortcutSession(sessionHandle, appId, session => this.sessions.delete(session)));
    respond(invocation, [SUCCESS, {}]);
  }

  BindShortcutsAsync([, sessionHandle, requested]: [string, string, Requested, string, Options], invocation: Invocation): void {
    const session = findSession(sessionHandle, ShortcutSession);
    if (!session) {
      respond(invocation, [ENDED, {}]);
      return;
    }
    const shortcuts = this.bind(session.appId, requested);
    this.store.save(session.appId, shortcuts);
    session.ids = requested.map(([id]) => id);
    this.grab(session, shortcuts);
    respond(invocation, [SUCCESS, { shortcuts: this.describe(session, shortcuts) }]);
  }

  ListShortcutsAsync([, sessionHandle]: [string, string], invocation: Invocation): void {
    const session = findSession(sessionHandle, ShortcutSession);
    if (session) respond(invocation, [SUCCESS, { shortcuts: this.describe(session, this.store.app(session.appId)) }]);
    else respond(invocation, [ENDED, {}]);
  }

  ConfigureShortcutsAsync([sessionHandle]: [string, string, Options], invocation: Invocation): void {
    const session = findSession(sessionHandle, ShortcutSession);
    if (!session) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', `${sessionHandle} is not a shortcuts session`);
      return;
    }
    invocation.return_value(null);
    const unavailable = new Set([...reservedAccelerators(), ...this.store.takenByOthers(session.appId)]);
    void recordShortcuts(session.appId, this.store.app(session.appId), unavailable).then(edited => {
      if (!edited) return;
      this.store.save(session.appId, edited);
      for (const other of this.sessions) {
        if (other.appId !== session.appId) continue;
        this.grab(other, edited);
        this.dbus.emit_signal('ShortcutsChanged', new GLib.Variant('(oa(sa{sv}))', [other.handle, this.describe(other, edited).deepUnpack() as [string, Options][]]));
      }
    });
  }

  destroy(): void {
    for (const session of this.sessions) session.close();
    for (const id of this.signals) display().disconnect(id);
  }

  private bind(appId: string, requested: Requested): AppShortcuts {
    const stored = this.store.app(appId);
    const unavailable = new Set([...reservedAccelerators(), ...this.store.takenByOthers(appId),
      ...Object.values(stored).flatMap(shortcut => shortcut.shortcuts.map(canonical))]);
    const bound: AppShortcuts = { ...stored };
    for (const [id, options] of requested) {
      const description = (options.description?.deepUnpack() as string | undefined) ?? stored[id]?.description ?? id;
      if (stored[id]) {
        bound[id] = { ...stored[id], description };
        continue;
      }
      const accepted = preferred(options).filter(accelerator => !typesText(accelerator) && !unavailable.has(canonical(accelerator)));
      accepted.forEach(accelerator => unavailable.add(canonical(accelerator)));
      bound[id] = { description, shortcuts: accepted };
    }
    return bound;
  }

  private grab(session: ShortcutSession, shortcuts: AppShortcuts): void {
    session.release();
    for (const id of session.ids) {
      for (const accelerator of shortcuts[id]?.shortcuts ?? []) {
        const action = display().grab_accelerator(accelerator, Meta.KeyBindingFlags.TRIGGER_RELEASE);
        if (action === Meta.KeyBindingAction.NONE) continue;
        this.keybindings.allow(Meta.external_binding_name_for_action(action), Shell.ActionMode.NORMAL);
        session.grabs.set(action, id);
      }
    }
  }

  private describe(session: ShortcutSession, shortcuts: AppShortcuts): GLib.Variant {
    return new GLib.Variant('a(sa{sv})', session.ids.filter(id => shortcuts[id]).map((id): [string, Options] => {
      const { description, shortcuts: accelerators } = shortcuts[id];
      const options: Options = { description: new GLib.Variant('s', description) };
      if (accelerators.length) options.trigger_description = new GLib.Variant('s', accelerators.map(label).join(' or '));
      return [id, options];
    }));
  }

  private trigger(signal: 'Activated' | 'Deactivated', action: number, timestamp: number): void {
    for (const session of this.sessions) {
      const id = session.grabs.get(action);
      if (id) this.dbus.emit_signal(signal, new GLib.Variant('(osta{sv})', [session.handle, id, timestamp, {}]));
    }
  }
}
