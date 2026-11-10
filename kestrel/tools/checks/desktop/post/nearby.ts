import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call, subscribe} from '../../lib/dbus.js';
import {repository, spawn, stop, type Process} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

const POST = 'com.lantharos.Kestrel.Post';
const PATH = '/com/lantharos/Kestrel/Post';
const NETWORK = GLib.getenv('KESTREL_POST_NETWORK')!;
const STARTS_WITHIN = 10000;

export type Peer = [id: string, alias: string, kind: string, model: string, verified: boolean];

export interface Finished {
  id: string;
  direction: string;
  device: string;
  outcome: string;
  saved: string[];
}

export function inNetwork(side: 'this' | 'nearby', argv: string[], env: Record<string, string> = {}): Process {
  return spawn([repository('kestrel', 'tools', 'session', 'postNetwork.sh'), 'run', NETWORK, side, ...argv], {env});
}

export class Nearby {
  readonly offers: {id: string; from: Peer}[] = [];
  readonly finished: Finished[] = [];
  readonly stages: Record<string, string> = {};
  private readonly unsubscribe: () => void;

  private constructor(private readonly home: string, private readonly bus: Process, private readonly post: Process,
    private readonly connection: Gio.DBusConnection, readonly folder: string) {
    this.unsubscribe = subscribe<unknown[]>({connection, sender: POST, path: PATH}, (signal, parameters) => {
      if (signal === 'Offer') this.offers.push({id: parameters[0] as string, from: parameters[1] as Peer});
      if (signal === 'Transfer') this.stages[parameters[0] as string] = parameters[3] as string;
      if (signal === 'Finished') {
        const [id, direction, device, outcome, saved] = parameters as [string, string, string, string, string[]];
        this.finished.push({id, direction, device, outcome, saved});
      }
    });
  }

  static async start(name: string, folder: string): Promise<Nearby> {
    const home = GLib.dir_make_tmp('kestrel-post-XXXXXX');
    const address = `unix:path=${home}/bus`;
    const bus = spawn(['dbus-daemon', '--session', '--nofork', `--address=${address}`]);
    await waitUntil(() => GLib.file_test(`${home}/bus`, GLib.FileTest.EXISTS), 'the nearby computer\'s bus starts', STARTS_WITHIN);
    const post = inNetwork('nearby', [repository('target', 'release', 'kestrel-post')], {
      DBUS_SESSION_BUS_ADDRESS: address, DBUS_SYSTEM_BUS_ADDRESS: `unix:path=${home}/no-system-bus`, XDG_DATA_HOME: `${home}/data`,
    });
    const connection = Gio.DBusConnection.new_for_address_sync(address,
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
    const nearby = new Nearby(home, bus, post, connection, folder);
    await waitUntil(async () => !!(await nearby.owner()), 'Post starts on the nearby computer', STARTS_WITHIN);
    await nearby.configure('everyone', name, []);
    return nearby;
  }

  private async owner(): Promise<string | null> {
    const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
      new GLib.Variant('(s)', [POST]), '(b)', {connection: this.connection});
    return reply.deepUnpack()[0] ? POST : null;
  }

  private method<S extends string>(method: string, parameters: GLib.Variant | null = null, reply: S | null = null) {
    return call(POST, PATH, POST, method, parameters, reply, {connection: this.connection});
  }

  configure(visibility: string, name: string, trusted: string[]) {
    return this.method('Configure', new GLib.Variant('(sssas)', [visibility, name, this.folder, trusted]));
  }

  async devices(): Promise<Peer[]> {
    const reply = await call(POST, PATH, 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', [POST, 'Devices']), '(v)',
      {connection: this.connection});
    return reply.recursiveUnpack<[Peer[]]>()[0];
  }

  scan() {
    return this.method('Scan');
  }

  async send(device: string, paths: string[]): Promise<string> {
    return (await this.method('Send', new GLib.Variant('(sas)', [device, paths]), '(s)')).deepUnpack<[string]>()[0];
  }

  async sendText(device: string, text: string): Promise<string> {
    return (await this.method('SendText', new GLib.Variant('(ss)', [device, text]), '(s)')).deepUnpack<[string]>()[0];
  }

  accept(id: string) {
    return this.method('Accept', new GLib.Variant('(s)', [id]));
  }

  decline(id: string) {
    return this.method('Decline', new GLib.Variant('(s)', [id]));
  }

  answerPin(id: string, pin: string) {
    return this.method('AnswerPin', new GLib.Variant('(ss)', [id, pin]));
  }

  async startPairing(): Promise<string> {
    return (await this.method('StartPairing', null, '(s)')).deepUnpack<[string]>()[0];
  }

  ended(id: string): Finished | null {
    return this.finished.find(finished => finished.id === id) ?? null;
  }

  async stop() {
    this.unsubscribe();
    await stop(this.post);
    await stop(this.bus);
    await spawn(['rm', '-rf', this.home]).exited;
  }
}
