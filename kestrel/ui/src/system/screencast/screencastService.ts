import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gst from 'gi://Gst';
import Gtk from 'gi://Gtk';

import { ServiceImplementation } from '../../shared/dbus/dbusService.js';

import { ScreencastErrors, ScreencastError } from '../../core/runtime/dbusErrors.js';
import { loadInterfaceXML, loadSubInterfaceXML } from '../../core/runtime/dbusUtils.js';
import { filePathStem } from './filePath.js';
import { canScreencast } from './pipelines.js';
import { type Area, Recorder } from './recorder.js';

interface ScreenCastRemote {
  CreateSessionSync(properties: Record<string, GLib.Variant>): [string];
}

interface IntrospectRemote {
  readonly ScreenSize: [number, number];
}

type Options = Record<string, GLib.Variant>;

const ScreencastIface = loadInterfaceXML('com.lantharos.Kestrel.Screencast')!;
const IntrospectProxy = Gio.DBusProxy.makeProxyWrapper<IntrospectRemote>(loadInterfaceXML('com.lantharos.Kestrel.Introspect'));
const ScreenCastProxy = Gio.DBusProxy.makeProxyWrapper<ScreenCastRemote>(
  loadSubInterfaceXML('org.gnome.Mutter.ScreenCast', 'org.gnome.Mutter.ScreenCast'));

export class ScreencastService extends ServiceImplementation {
  private readonly canScreencast: boolean;
  private readonly recorders = new Map<string, Recorder>();
  private readonly lockdownSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.lockdown' });
  private readonly proxy = ScreenCastProxy(Gio.DBus.session, 'org.gnome.Mutter.ScreenCast', '/org/gnome/Mutter/ScreenCast');
  private readonly introspectProxy = IntrospectProxy(Gio.DBus.session, 'com.lantharos.Kestrel.Introspect', '/com/lantharos/Kestrel/Introspect');

  constructor() {
    super(ScreencastIface, '/com/lantharos/Kestrel/Screencast');

    this.hold();
    this.canScreencast = canScreencast();
    Gst.init([]);
    Gtk.init();
    this.release();
  }

  get ScreencastSupported(): boolean {
    return this.canScreencast;
  }

  async ScreencastAsync([fileTemplate, options]: [string, Options], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const [width, height] = this.introspectProxy.ScreenSize;
    await this.record(invocation, { x: 0, y: 0, width, height }, fileTemplate, options);
  }

  async ScreencastAreaAsync([x, y, width, height, fileTemplate, options]: [number, number, number, number, string, Options],
    invocation: Gio.DBusMethodInvocation): Promise<void> {
    await this.record(invocation, { x, y, width, height }, fileTemplate, options);
  }

  async StopScreencastAsync(_params: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const sender = invocation.get_sender()!;

    const recorder = this.recorders.get(sender);
    if (!recorder) {
      invocation.return_value(GLib.Variant.new('(b)', [false]));
      return;
    }

    try {
      await recorder.stopRecording();
    } catch (error) {
      console.error(`${sender}: Error while stopping recorder: ${(error as Error).message}`);
    } finally {
      this.removeRecorder(sender);
      invocation.return_value(GLib.Variant.new('(b)', [true]));
    }
  }

  private async record(invocation: Gio.DBusMethodInvocation, area: Area, fileTemplate: string, options: Options): Promise<void> {
    if (this.lockdownSettings.get_boolean('disable-save-to-disk')) {
      invocation.return_error_literal(ScreencastErrors, ScreencastError.SAVE_TO_DISK_DISABLED, 'Saving to disk is disabled');
      return;
    }

    const sender = invocation.get_sender()!;
    if (this.recorders.get(sender)) {
      invocation.return_error_literal(ScreencastErrors, ScreencastError.ALREADY_RECORDING, 'Service is already recording');
      return;
    }

    const [sessionPath] = this.proxy.CreateSessionSync({});

    let recorder: Recorder;
    try {
      recorder = new Recorder(sessionPath, area, filePathStem(fileTemplate), options, invocation);
    } catch (error) {
      console.error(`Failed to create recorder: ${(error as Error).message}`);
      invocation.return_error_literal(ScreencastErrors, ScreencastError.RECORDER_ERROR, (error as Error).message);
      return;
    }

    this.addRecorder(sender, recorder);

    try {
      const pathWithExtension = await recorder.startRecording();
      invocation.return_value(GLib.Variant.new('(bs)', [true, pathWithExtension]));
    } catch (error) {
      console.error(`Failed to start recorder: ${(error as Error).message}`);
      this.removeRecorder(sender);
      if (error instanceof GLib.Error) invocation.return_gerror(error);
      else invocation.return_error_literal(ScreencastErrors, ScreencastError.RECORDER_ERROR, (error as Error).message);
      return;
    }

    recorder.connect('error', (_recorder, error) => {
      console.error(`Fatal error while recording: ${error.message}`);
      this.removeRecorder(sender);
      this.dbusImpl.emit_signal('Error', new GLib.Variant('(ss)', [Gio.DBusError.encode_gerror(error), error.message]));
    });
  }

  private removeRecorder(sender: string): void {
    if (!this.recorders.delete(sender)) return;
    if (this.recorders.size === 0) this.release();
  }

  private addRecorder(sender: string, recorder: Recorder): void {
    this.recorders.set(sender, recorder);
    if (this.recorders.size === 1) this.hold();
  }
}
