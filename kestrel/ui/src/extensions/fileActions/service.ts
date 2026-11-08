import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { identifyProcess } from '../../shared/apps/identity.js';
import { luftAppPrograms, runsProgram } from '../../shared/apps/luftApps.js';
import { callerProcess } from '../../shared/dbus/processes.js';
import { type FileActionChoiceShape, type FileActionEntry, type FileActionShape, fileActions } from './actions.js';

const PATH = '/com/lantharos/Kestrel/FileActions';
const INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.FileActions">
    <method name="List"><arg type="aa{sv}" name="actions" direction="out"/></method>
    <method name="Opened"><arg type="s" name="id" direction="in"/></method>
    <method name="Activate">
      <arg type="s" name="id" direction="in"/>
      <arg type="s" name="choice" direction="in"/>
      <arg type="as" name="paths" direction="in"/>
    </method>
    <signal name="Changed"/>
  </interface>
</node>`;
const FILE_MANAGER = luftAppPrograms('com.lantharos.rover');
const CHANGED_DELAY = 50;

type Fields = Record<string, GLib.Variant>;

const text = (value: string) => GLib.Variant.new_string(value);
const flag = (value: boolean) => GLib.Variant.new_boolean(value);

function choiceFields(choice: FileActionChoiceShape): Fields {
  return {
    key: text(choice.key), label: text(choice.label), icon: text(choice.icon), disabled: flag(choice.disabled),
    stays: flag(choice.keepsMenuOpen), separator: flag(choice.separator),
  };
}

function actionFields(id: string, shape: FileActionShape): Fields {
  const fields: Fields = {
    id: text(id), label: text(shape.label), icon: text(shape.icon), kind: text(shape.kind),
    types: GLib.Variant.new_strv([...shape.types]), extensions: GLib.Variant.new_strv([...shape.extensions]), multiple: flag(shape.multiple),
  };
  if (shape.items) fields.items = new GLib.Variant('aa{sv}', shape.items.map(choiceFields));
  return fields;
}

/** Whether a call comes from Luft's file manager, which is the only program that shows these actions and runs them on files. */
async function fromFileManager(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
  const caller = await callerProcess(invocation).catch(() => null);
  if (!caller) return false;
  try {
    const pid = caller.pid;
    const identity = pid ? identifyProcess(pid) : null;
    return !!identity && 'program' in identity && runsProgram(identity.program, FILE_MANAGER) && caller.pid === pid;
  } finally {
    caller.close();
  }
}

/**
 * Hands Rover the actions extensions added to the menu of files and folders, tells it when they change, and runs the
 * one people chose. Only Rover may call it: the actions get the paths it sends, and sandboxed apps must not choose them.
 */
export class FileActionsService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(INTERFACE, this);
  private readonly unwatched = new Map<FileActionEntry, () => void>();
  private readonly unwatch: () => void;
  private changedSource = 0;

  constructor() {
    this.dbus.export(Gio.DBus.session, PATH);
    for (const entry of fileActions.items) this.follow(entry);
    this.unwatch = fileActions.watch((entry, added) => {
      if (added) this.follow(entry);
      else {
        this.unwatched.get(entry)?.();
        this.unwatched.delete(entry);
      }
      this.queueChanged();
    });
  }

  ListAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, () => {
      const listed = fileActions.items.flatMap(entry => {
        const shape = entry.shape();
        return shape ? [actionFields(entry.id, shape)] : [];
      });
      return new GLib.Variant('(aa{sv})', [listed]);
    });
  }

  OpenedAsync([id]: [string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, () => this.entry(id).opened());
  }

  ActivateAsync([id, choice, paths]: [string, string, string[]], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, () => this.entry(id).activate(paths, choice));
  }

  private entry(id: string): FileActionEntry {
    const entry = fileActions.items.find(action => action.id === id);
    if (!entry) throw new Error(`There's no file action ${id}`);
    return entry;
  }

  private follow(entry: FileActionEntry): void {
    this.unwatched.set(entry, entry.watch(() => this.queueChanged()));
  }

  private answer(invocation: Gio.DBusMethodInvocation, act: () => GLib.Variant | void): void {
    void fromFileManager(invocation).then(allowed => {
      if (!allowed) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'Only Rover can use file actions');
        return;
      }
      try {
        invocation.return_value(act() ?? null);
      } catch (error) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', (error as Error).message);
      }
    });
  }

  private queueChanged(): void {
    if (this.changedSource) return;
    this.changedSource = GLib.timeout_add(GLib.PRIORITY_DEFAULT, CHANGED_DELAY, () => {
      this.changedSource = 0;
      this.dbus.emit_signal('Changed', null);
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    if (this.changedSource) GLib.source_remove(this.changedSource);
    this.unwatch();
    for (const unwatch of this.unwatched.values()) unwatch();
    this.dbus.unexport();
  }
}
