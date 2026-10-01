import GLib from 'gi://GLib';

import type { Options } from '../core/request.js';
import { mutterCall, mutterObject, mutterProperty, mutterSignals, type MutterObject } from './mutter.js';
import { MONITOR, WINDOW, type Selection, type Source } from './sources.js';

const NAME = 'org.gnome.Mutter.ScreenCast';
const SCREEN_CAST = mutterObject(NAME, '/org/gnome/Mutter/ScreenCast', NAME);
const MUTTER_CURSOR_MODES: Record<number, number> = { 1: 0, 2: 1, 4: 2 };

interface StreamParameters {
  position?: [number, number];
  size?: [number, number];
  'mapping-id'?: string;
}

interface Stream {
  readonly source: Source;
  readonly path: string;
  readonly parameters: StreamParameters;
  readonly node: Promise<number>;
}

function recordCall(source: Source, properties: Options): [string, GLib.Variant] {
  if (source.type === MONITOR) return ['RecordMonitor', new GLib.Variant('(sa{sv})', [source.connector, properties])];
  if (source.type === WINDOW) return ['RecordWindow', new GLib.Variant('(a{sv})', [{ ...properties, 'window-id': new GLib.Variant('t', source.window.get_id()) }])];
  return ['RecordVirtual', new GLib.Variant('(a{sv})', [properties])];
}

function streamProperties(index: number, { source, parameters }: Stream): Options {
  const properties: Options = { id: new GLib.Variant('s', `${index}`), source_type: new GLib.Variant('u', source.type) };
  if (parameters.position && source.type === MONITOR) properties.position = new GLib.Variant('(ii)', parameters.position);
  if (parameters.size) properties.size = new GLib.Variant('(ii)', parameters.size);
  if (parameters['mapping-id']) properties.mapping_id = new GLib.Variant('s', parameters['mapping-id']);
  return properties;
}

export class Recording {
  private readonly streams: Stream[] = [];
  private readonly unsubscribers: (() => void)[] = [];
  private readonly ended: Promise<never>;
  private end!: (error: Error) => void;
  private nodes: number[] = [];

  private constructor(private readonly session: MutterObject, private readonly closed: (() => void) | null) {
    this.ended = new Promise((_resolve, reject) => { this.end = reject; });
    this.ended.catch(() => {});
    if (closed) this.unsubscribers.push(mutterSignals(session, { Closed: closed }));
  }

  private static async open(properties: Options, closed: (() => void) | null): Promise<Recording> {
    const [path] = (await mutterCall(SCREEN_CAST, 'CreateSession', new GLib.Variant('(a{sv})', [properties]), '(o)')).deep_unpack() as [string];
    return new Recording(mutterObject(NAME, path, `${NAME}.Session`), closed);
  }

  static create(closed: () => void): Promise<Recording> {
    return Recording.open({}, closed);
  }

  static forRemoteDesktop(sessionId: string): Promise<Recording> {
    return Recording.open({ 'remote-desktop-session-id': new GLib.Variant('s', sessionId) }, null);
  }

  async record(sources: Source[], { cursorMode }: Selection): Promise<void> {
    const properties = { 'cursor-mode': new GLib.Variant('u', MUTTER_CURSOR_MODES[cursorMode]) };
    for (const source of sources) {
      const [method, parameters] = recordCall(source, properties);
      const [path] = (await mutterCall(this.session, method, parameters, '(o)')).deep_unpack() as [string];
      const stream = mutterObject(NAME, path, `${NAME}.Stream`);
      const node = new Promise<number>(resolve => this.unsubscribers.push(mutterSignals(stream, {
        PipeWireStreamAdded: added => resolve(added.get_child_value(0).get_uint32()),
      })));
      this.streams.push({ source, path, node, parameters: await mutterProperty<StreamParameters>(stream, 'Parameters') });
    }
  }

  async start(): Promise<void> {
    await mutterCall(this.session, 'Start');
    await this.ready();
  }

  async ready(): Promise<void> {
    this.nodes = await Promise.race([Promise.all(this.streams.map(stream => stream.node)), this.ended]);
  }

  get results(): GLib.Variant {
    return new GLib.Variant('a(ua{sv})', this.streams.map((stream, index): [number, Options] => [this.nodes[index], streamProperties(index, stream)]));
  }

  streamPath(node: number): string | undefined {
    return this.streams[this.nodes.indexOf(node)]?.path;
  }

  stop(): void {
    this.end(new Error('The session ended'));
    for (const unsubscribe of this.unsubscribers.splice(0)) unsubscribe();
    if (this.standalone) mutterCall(this.session, 'Stop').catch(() => {});
  }

  private get standalone(): boolean {
    return this.closed !== null;
  }
}
