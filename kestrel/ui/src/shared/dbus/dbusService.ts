import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';

import { setConsoleLogDomain } from 'console';

import '../../core/runtime/dbusErrors.js';
import { EventEmitter } from '../../core/runtime/signals.js';

const IDLE_SHUTDOWN_TIME = 2;

const TRACKED_REPLIES = [
  'return_dbus_error',
  'return_error_literal',
  'return_gerror',
  'return_value',
  'return_value_with_unix_fd_list',
] as const;

type Reply = (this: Gio.DBusMethodInvocation, ...args: unknown[]) => void;

interface ServiceSignals {
  'shutdown': () => void;
}

export class ServiceImplementation extends EventEmitter {
  declare connect: GObject.SignalMethods<this, ServiceSignals>['connect'];
  declare emit: GObject.SignalMethods<this, ServiceSignals>['emit'];

  protected readonly dbusImpl: Gio.DBusExportedObject;
  private readonly senders = new Map<string, number>();
  private readonly hasSignals: boolean;
  private holdCount = 0;
  private shellName: string | null = null;
  private shutdownTimeoutId = 0;

  constructor(info: string, private readonly objectPath: string, private readonly autoShutdown = true) {
    super();
    this.dbusImpl = Gio.DBusExportedObject.wrapJSObject(info, this);

    for (const reply of TRACKED_REPLIES) this.trackReplies(reply);

    Gio.DBus.watch_name(Gio.BusType.SESSION, 'org.gnome.Shell', Gio.BusNameWatcherFlags.NONE,
      (_connection, _name, owner) => (this.shellName = owner),
      () => {
        this.shellName = null;
        if (this.autoShutdown) this.queueShutdownCheck();
        else this.emit('shutdown');
      });

    this.hasSignals = this.dbusImpl.get_info().signals.length > 0;
    this.queueShutdownCheck();
  }

  register(): void {}

  export(): void {
    this.dbusImpl.export(Gio.DBus.session, this.objectPath);
  }

  hold(): void {
    this.holdCount++;
  }

  release(): void {
    if (this.holdCount === 0) {
      logError(new Error('Unmatched call to release()'));
      return;
    }

    this.holdCount--;
    if (this.holdCount === 0) this.queueShutdownCheck();
  }

  protected handleError(invocation: Gio.DBusMethodInvocation, error: unknown): void {
    if (error instanceof GLib.Error) {
      Gio.DBusError.strip_remote_error(error);
      invocation.return_gerror(error);
      return;
    }

    const { name, message } = error as Error;
    invocation.return_dbus_error(name.includes('.') ? name : `org.gnome.gjs.JSError.${name}`, message);
  }

  protected untrackSender(sender: string): void {
    const id = this.senders.get(sender);
    if (id) this.dbusImpl.get_connection()!.unwatch_name(id);

    if (this.senders.delete(sender)) this.release();
  }

  private maybeShutdown(): void {
    if (!this.autoShutdown) return;
    if (this.shellName && this.holdCount > 0) return;

    this.emit('shutdown');
  }

  private queueShutdownCheck(): void {
    if (this.shutdownTimeoutId) GLib.source_remove(this.shutdownTimeoutId);

    this.shutdownTimeoutId = GLib.timeout_add_seconds_once(GLib.PRIORITY_DEFAULT, IDLE_SHUTDOWN_TIME, () => {
      this.shutdownTimeoutId = 0;
      this.maybeShutdown();
    });
  }

  private trackSender(sender: string): void {
    if (this.senders.has(sender)) return;
    if (sender === this.shellName) return;

    this.hold();
    this.senders.set(sender, this.dbusImpl.get_connection()!.watch_name(sender, Gio.BusNameWatcherFlags.NONE, null,
      () => this.untrackSender(sender)));
  }

  private trackReplies(name: typeof TRACKED_REPLIES[number]): void {
    const prototype = Gio.DBusMethodInvocation.prototype as unknown as Record<typeof name, Reply>;
    const original = prototype[name];
    const replied = (invocation: Gio.DBusMethodInvocation) => {
      if (this.hasSignals) this.trackSender(invocation.get_sender()!);
      this.queueShutdownCheck();
    };

    prototype[name] = function (...args) {
      original.apply(this, args);
      replied(this);
    };
  }
}

export class DBusService {
  private readonly loop = new GLib.MainLoop(null, false);

  constructor(private readonly name: string, private readonly service: ServiceImplementation) {
    setConsoleLogDomain(name);
    this.service.connect('shutdown', () => this.loop.quit());
  }

  async runAsync(): Promise<void> {
    this.service.register();

    Gio.DBus.own_name(Gio.BusType.SESSION, this.name, Gio.BusNameOwnerFlags.ALLOW_REPLACEMENT,
      () => this.service.export(), null, () => this.loop.quit());

    await this.loop.runAsync();
  }
}
