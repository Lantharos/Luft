import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Gst from 'gi://Gst';

import { ScreencastErrors, ScreencastError } from '../../core/runtime/dbusErrors.js';
import { loadSubInterfaceXML } from '../../core/runtime/dbusUtils.js';
import { EventEmitter } from '../../core/runtime/signals.js';
import { PipelineBlocklist } from './blocklist.js';
import { type PipelineConfig, createPipeline, pipelineConfigs } from './pipelines.js';

interface ScreenCastSessionRemote {
  RecordAreaSync(x: number, y: number, width: number, height: number, properties: Record<string, GLib.Variant>): [string];
  StartSync(): [];
  StopSync(): [];
  connectSignal(name: 'Closed', callback: () => void): number;
}

interface ScreenCastStreamRemote {
  connectSignal(name: 'PipeWireStreamAdded', callback: (proxy: Gio.DBusProxy, sender: string, args: [number]) => void): number;
}

const ScreenCastSessionProxy = Gio.DBusProxy.makeProxyWrapper<ScreenCastSessionRemote>(
  loadSubInterfaceXML('org.gnome.Mutter.ScreenCast.Session', 'org.gnome.Mutter.ScreenCast'));
const ScreenCastStreamProxy = Gio.DBusProxy.makeProxyWrapper<ScreenCastStreamRemote>(
  loadSubInterfaceXML('org.gnome.Mutter.ScreenCast.Stream', 'org.gnome.Mutter.ScreenCast'));

const DEFAULT_DRAW_CURSOR = true;
const FINISH_TIMEOUT_SECONDS = 10;

type PipelineState = 'INIT' | 'STARTING' | 'PLAYING' | 'FLUSHING' | 'STOPPED';
type SessionState = 'ACTIVE' | 'STOPPED';

export interface Area {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Request<T> {
  resolve(value: T): void;
  reject(error: GLib.Error): void;
}

interface RecorderSignals {
  'error': (error: GLib.Error) => void;
}

export class Recorder extends EventEmitter {
  declare connect: GObject.SignalMethods<this, RecorderSignals>['connect'];
  declare emit: GObject.SignalMethods<this, RecorderSignals>['emit'];

  private readonly dbusConnection: Gio.DBusConnection;
  private readonly blocklist: PipelineBlocklist;
  private readonly drawCursor: boolean;
  private readonly sessionProxy: ReturnType<typeof ScreenCastSessionProxy>;
  private streamProxy: ReturnType<typeof ScreenCastStreamProxy> | null = null;
  private nameWatchId: number;
  private pipelineState: PipelineState = 'INIT';
  private sessionState: SessionState = 'ACTIVE';
  private pipeline: Gst.Element | null = null;
  private pipelineConfigs: Generator<PipelineConfig, void> | null = null;
  private fileMonitor: Gio.FileMonitor | null = null;
  private finishTimeoutId = 0;
  private nodeId = 0;
  private filePath: string | null = null;
  private startRequest: Request<string> | null = null;
  private stopRequest: Request<void> | null = null;
  private stopping: Promise<void> | null = null;

  constructor(sessionPath: string, private readonly area: Area, private readonly filePathStem: string,
    options: Record<string, GLib.Variant>, invocation: Gio.DBusMethodInvocation) {
    super();

    this.dbusConnection = invocation.get_connection();

    try {
      Gio.File.new_for_path(filePathStem).get_parent()!.make_directory_with_parents(null);
    } catch (e) {
      if (!(e instanceof GLib.Error && e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS))) throw e;
    }

    this.blocklist = new PipelineBlocklist();
    this.drawCursor = 'draw-cursor' in options ? options['draw-cursor'].deepUnpack<boolean>() : DEFAULT_DRAW_CURSOR;
    this.nameWatchId = this.dbusConnection.watch_name(invocation.get_sender()!, Gio.BusNameWatcherFlags.NONE, null,
      () => this.bailOutOnError('Sender has vanished'));

    this.sessionProxy = ScreenCastSessionProxy(Gio.DBus.session, 'org.gnome.Mutter.ScreenCast', sessionPath);
    this.sessionProxy.connectSignal('Closed', () => this.onSessionClosed());
  }

  startRecording(): Promise<string> {
    console.debug('Start recording');
    return new Promise((resolve, reject) => {
      this.startRequest = { resolve, reject };

      try {
        const { x, y, width, height } = this.area;
        const [streamPath] = this.sessionProxy.RecordAreaSync(x, y, width, height, {
          'is-recording': GLib.Variant.new('b', true),
          'cursor-mode': GLib.Variant.new('u', this.drawCursor ? 1 : 0),
        });

        this.streamProxy = ScreenCastStreamProxy(Gio.DBus.session, 'org.gnome.Mutter.ScreenCast', streamPath);
        this.streamProxy.connectSignal('PipeWireStreamAdded', (_proxy, _sender, [nodeId]) => {
          this.nodeId = nodeId;
          this.pipelineState = 'STARTING';
          this.pipelineConfigs = pipelineConfigs();
          this.tryNextPipeline();
        });
        this.sessionProxy.StartSync();
      } catch (e) {
        this.bailOutOnError((e as Error).message);
      }
    });
  }

  stopRecording(): Promise<void> {
    console.debug('Stop recording');
    this.stopping ??= new Promise((resolve, reject) => {
      this.stopRequest = { resolve, reject };
      if (this.pipelineState === 'PLAYING') this.finish();
      else this.cancel();
    });
    return this.stopping;
  }

  private finish(): void {
    this.pipelineState = 'FLUSHING';
    this.finishTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, FINISH_TIMEOUT_SECONDS, () => {
      this.finishTimeoutId = 0;
      this.bailOutOnError('Timed out finishing the recording');
      return GLib.SOURCE_REMOVE;
    });
    this.pipeline!.send_event(Gst.Event.new_eos());
  }

  private cancel(): void {
    this.blocklist.restore();
    this.shutDown();

    this.startRequest?.reject(GLib.Error.new_literal(ScreencastErrors, ScreencastError.RECORDER_ERROR, 'Stopped before recording started'));
    this.startRequest = null;

    this.stopRequest!.resolve();
    this.stopRequest = null;
  }

  private shutDown(): void {
    if (this.finishTimeoutId) GLib.source_remove(this.finishTimeoutId);
    this.finishTimeoutId = 0;
    this.fileMonitor?.cancel();
    this.fileMonitor = null;
    this.disposePipeline();
    this.pipelineState = 'STOPPED';
    this.unwatchSender();
    this.stopSession();
  }

  private unwatchSender(): void {
    if (this.nameWatchId === 0) return;

    this.dbusConnection.unwatch_name(this.nameWatchId);
    this.nameWatchId = 0;
  }

  private disposePipeline(): void {
    if (!this.pipeline) return;

    this.pipeline.get_bus()!.remove_watch();
    if (this.pipeline.set_state(Gst.State.NULL) !== Gst.StateChangeReturn.SUCCESS) console.warn('Failed to set pipeline state to NULL');
    this.pipeline = null;
  }

  private stopSession(): void {
    if (this.sessionState !== 'ACTIVE') return;

    this.sessionState = 'STOPPED';
    try {
      this.sessionProxy.StopSync();
    } catch (e) {
      console.warn(`Failed to stop the screen cast session: ${(e as Error).message}`);
    }
  }

  private bailOutOnError(message: string, errorCode: number = ScreencastError.RECORDER_ERROR): void {
    const error = GLib.Error.new_literal(ScreencastErrors, errorCode, message);
    console.debug(`Bailing out with error ${error}`);

    if (errorCode !== ScreencastError.PIPELINE_ERROR) this.blocklist.restore();

    this.shutDown();

    const request = this.startRequest ?? this.stopRequest;
    this.startRequest = null;
    this.stopRequest = null;

    if (request) request.reject(error);
    else this.emit('error', error);
  }

  private onSessionClosed(): void {
    if (this.sessionState === 'STOPPED') return;

    this.sessionState = 'STOPPED';
    this.bailOutOnError('Session closed unexpectedly');
  }

  private watchFile(): void {
    this.fileMonitor = Gio.File.new_for_path(this.filePath!).monitor_file(Gio.FileMonitorFlags.WATCH_MOVES, null);
    this.fileMonitor.connect('changed', (_monitor, _file, _otherFile, event) => {
      if (event === Gio.FileMonitorEvent.DELETED || event === Gio.FileMonitorEvent.MOVED_OUT)
        this.bailOutOnError('The recording was deleted or moved', ScreencastError.FILE_REMOVED);
    });
  }

  private tryNextPipeline(): void {
    if (this.filePath) {
      GLib.unlink(this.filePath);
      this.filePath = null;
    }

    const { done, value: pipelineConfig } = this.pipelineConfigs!.next();
    if (done) {
      this.bailOutOnError('All pipelines failed to start', ScreencastError.ALL_PIPELINES_FAILED);
      return;
    }

    if (this.blocklist.crashedBefore(pipelineConfig.id)) {
      console.info(`Skipping pipeline '${pipelineConfig.id}' due to pipeline blocklist`);
      this.tryNextPipeline();
      return;
    }

    this.disposePipeline();

    let pipeline: Gst.Element;
    try {
      console.debug(`Creating pipeline for config ${pipelineConfig.id}`);
      this.filePath = `${this.filePathStem}.${pipelineConfig.fileExtension}`;
      pipeline = this.pipeline = createPipeline(this.nodeId, pipelineConfig, this.filePath);
      console.debug('Pipeline created successfully');

      this.blocklist.suspect(pipelineConfig.id);
    } catch (e) {
      console.debug(`Failed to create pipeline: ${(e as Error).message}`);
      this.tryNextPipeline();
      return;
    }

    pipeline.get_bus()!.add_watch(GLib.PRIORITY_DEFAULT, (_bus, message) => this.onBusMessage(message));

    const retval = pipeline.set_state(Gst.State.PLAYING);
    if (retval === Gst.StateChangeReturn.SUCCESS || retval === Gst.StateChangeReturn.ASYNC) return;

    console.debug(`Setting PLAYING state on pipeline returned ${Gst.state_change_return_get_name(retval)}`);
    this.tryNextPipeline();
  }

  private onBusMessage(message: Gst.Message): boolean {
    switch (message.type) {
      case Gst.MessageType.STATE_CHANGED:
        this.onStateChanged(message);
        break;
      case Gst.MessageType.EOS:
        this.onEos();
        break;
      case Gst.MessageType.ERROR:
        this.onError(message.parse_error()[0]!);
        break;
    }
    return true;
  }

  private onStateChanged(message: Gst.Message): void {
    const [, newState] = message.parse_state_changed();
    if (this.pipelineState !== 'STARTING' || message.src !== this.pipeline || newState !== Gst.State.PLAYING) return;

    this.pipelineState = 'PLAYING';
    this.watchFile();
    this.startRequest!.resolve(this.filePath!);
    this.startRequest = null;
  }

  private onEos(): void {
    switch (this.pipelineState) {
      case 'STARTING':
        console.debug('Received EOS message while trying to start pipeline');
        this.tryNextPipeline();
        break;
      case 'PLAYING':
        this.bailOutOnError('Unexpected EOS message', ScreencastError.PIPELINE_ERROR);
        break;
      case 'FLUSHING':
        this.onFinished();
        break;
    }
  }

  private onFinished(): void {
    if (!GLib.file_test(this.filePath!, GLib.FileTest.EXISTS)) {
      this.bailOutOnError('The recording was deleted or moved', ScreencastError.FILE_REMOVED);
      return;
    }

    this.blocklist.restore();
    this.shutDown();
    this.stopRequest!.resolve();
    this.stopRequest = null;
  }

  private onError(error: GLib.Error): void {
    switch (this.pipelineState) {
      case 'STARTING':
        console.debug(`Received ERROR message while trying to start pipeline: ${error.message}`);
        this.tryNextPipeline();
        break;
      case 'PLAYING':
      case 'FLUSHING':
        this.bailOutOnError(`GStreamer error while in state ${this.pipelineState}: ${error.message}`, errorCodeOf(error));
        break;
    }
  }
}

function errorCodeOf(error: GLib.Error): number {
  if (error.matches(Gst.ResourceError, Gst.ResourceError.NO_SPACE_LEFT)) return ScreencastError.OUT_OF_DISK_SPACE;
  if (error.matches(Gst.ResourceError, Gst.ResourceError.WRITE)) return ScreencastError.WRITE_FAILED;
  return ScreencastError.PIPELINE_ERROR;
}
