import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Kestrel.Post';
const PATH = '/com/lantharos/Kestrel/Post';

export type Visibility = 'no-one' | 'your-devices' | 'everyone';

export interface Peer {
  id: string;
  alias: string;
  kind: string;
  model: string;
  /** Whether its certificate proved who it is, which trusting it needs. */
  verified: boolean;
}

interface Offered {
  name: string;
  size: number;
  type: string;
}

export type Direction = 'in' | 'out';
export type Stage = 'waiting' | 'pin' | 'wrong-pin' | 'moving';
export type Outcome = 'done' | 'declined' | 'cancelled' | 'cancelled-there' | 'busy' | 'unreachable' | 'failed';

export interface Transfer {
  id: string;
  direction: Direction;
  device: string;
  stage: Stage;
  done: number;
  size: number;
  files: number;
  /** Whether it's text rather than files. */
  text: boolean;
}

export interface Finished {
  id: string;
  direction: Direction;
  device: string;
  outcome: Outcome;
  saved: string[];
}

export interface Offer {
  id: string;
  from: Peer;
  files: Offered[];
  size: number;
}

interface YourDevice {
  id: string;
  alias: string;
}

interface Listeners {
  text(from: Peer, text: string, trusted: boolean): void;
  offer(offer: Offer): void;
  transfer(transfer: Transfer): void;
  /** `last` is how the transfer last stood, when it got that far. */
  finished(finished: Finished, last: Transfer | undefined): void;
}

type PeerTuple = [string, string, string, string, boolean];

const peer = ([id, alias, kind, model, verified]: PeerTuple): Peer => ({ id, alias, kind, model, verified });

/**
 * Kestrel's side of Post: `kestrel-post` speaks to devices nearby, and this tells it what people chose in Settings,
 * keeps what it last said, and passes on what happens to transfers.
 */
export class PostClient {
  readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.post' });
  readonly transfers = new Map<string, Transfer>();
  private readonly texts = new Set<string>();
  private readonly changes = new Set<() => void>();
  private readonly cancellable = new Gio.Cancellable();
  private proxy: Gio.DBusProxy | null = null;
  private readonly settingsChanged: number;

  constructor(private readonly listeners: Listeners) {
    this.settingsChanged = this.settings.connect('changed', () => {
      this.configure();
      this.changed();
    });
    Gio.DBusProxy.new_for_bus(Gio.BusType.SESSION, Gio.DBusProxyFlags.NONE, null, NAME, PATH, NAME, this.cancellable, (_source, result) => {
      try {
        this.proxy = Gio.DBusProxy.new_for_bus_finish(result);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))) console.warn(`Can't reach Post: ${error}`);
        return;
      }
      this.proxy.connect('g-properties-changed', () => this.changed());
      this.proxy.connect('g-signal', (_proxy, _sender, signal: string, parameters: GLib.Variant) => this.hear(signal, parameters));
      this.proxy.connect('notify::g-name-owner', () => {
        if (this.proxy?.g_name_owner) this.configure();
        else this.lost();
      });
      this.configure();
    });
  }

  destroy(): void {
    this.cancellable.cancel();
    this.settings.disconnect(this.settingsChanged);
    this.changes.clear();
  }

  onChanged(changed: () => void): () => void {
    this.changes.add(changed);
    return () => this.changes.delete(changed);
  }

  get visibility(): Visibility {
    return this.settings.get_string('visibility') as Visibility;
  }

  set visibility(visibility: Visibility) {
    this.settings.set_string('visibility', visibility);
  }

  get open(): boolean {
    return this.visibility !== 'no-one';
  }

  get alias(): string {
    return this.property<string>('Alias') ?? '';
  }

  get folder(): string {
    return this.property<string>('Folder') ?? '';
  }

  get devices(): Peer[] {
    return (this.property<PeerTuple[]>('Devices') ?? []).map(peer);
  }

  get scanning(): boolean {
    return this.property<boolean>('Scanning') ?? false;
  }

  get listening(): boolean {
    return this.property<boolean>('Listening') ?? true;
  }

  get yours(): YourDevice[] {
    return (this.settings.get_value('devices').deepUnpack() as [string, string][]).map(([id, alias]) => ({ id, alias }));
  }

  trust(device: Pick<Peer, 'id' | 'alias'>): void {
    const others = this.yours.filter(known => known.id !== device.id);
    this.keepYours([...others, { id: device.id, alias: device.alias }]);
  }

  forget(id: string): void {
    this.keepYours(this.yours.filter(device => device.id !== id));
  }

  scan(): void {
    this.call('Scan', null);
  }

  send(device: string, paths: string[]): void {
    this.call('Send', new GLib.Variant('(sas)', [device, paths]));
  }

  sendText(device: string, text: string): void {
    this.call('SendText', new GLib.Variant('(ss)', [device, text]), id => this.texts.add(id));
  }

  accept(id: string): void {
    this.call('Accept', new GLib.Variant('(s)', [id]));
  }

  decline(id: string): void {
    this.call('Decline', new GLib.Variant('(s)', [id]));
  }

  cancel(id: string): void {
    this.call('Cancel', new GLib.Variant('(s)', [id]));
  }

  answerPin(id: string, pin: string): void {
    this.call('AnswerPin', new GLib.Variant('(ss)', [id, pin]));
  }

  private keepYours(devices: YourDevice[]): void {
    this.settings.set_value('devices', new GLib.Variant('a(ss)', devices.map(({ id, alias }): [string, string] => [id, alias])));
  }

  private configure(): void {
    const { settings } = this;
    this.call('Configure', new GLib.Variant('(sssas)', [
      settings.get_string('visibility'), settings.get_string('name'), settings.get_string('folder'), this.yours.map(device => device.id),
    ]));
  }

  private property<T>(name: string): T | null {
    return (this.proxy?.get_cached_property(name)?.deepUnpack() as T | undefined) ?? null;
  }

  private call(method: string, parameters: GLib.Variant | null, answered?: (id: string) => void): void {
    this.proxy?.call(method, parameters, Gio.DBusCallFlags.NONE, -1, this.cancellable, (proxy, result) => {
      try {
        const reply = proxy!.call_finish(result);
        if (answered) answered((reply.deepUnpack() as [string])[0]);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))) console.warn(`Post couldn't ${method}: ${error}`);
      }
    });
  }

  private lost(): void {
    this.transfers.clear();
    this.texts.clear();
    this.changed();
  }

  private hear(signal: string, parameters: GLib.Variant): void {
    switch (signal) {
      case 'Text': {
        const [from, text, trusted] = parameters.deepUnpack() as [PeerTuple, string, boolean];
        this.listeners.text(peer(from), text, trusted);
        return;
      }
      case 'Offer': {
        const [id, from, files, size] = parameters.deepUnpack() as [string, PeerTuple, [string, number, string][], number];
        this.listeners.offer({ id, from: peer(from), files: files.map(([name, bytes, type]) => ({ name, size: bytes, type })), size });
        return;
      }
      case 'Transfer': {
        const [id, direction, device, stage, [done, size, files]] = parameters.deepUnpack() as [string, Direction, string, Stage, [number, number, number]];
        const transfer = { id, direction, device, stage, done, size, files, text: this.texts.has(id) };
        this.transfers.set(id, transfer);
        this.listeners.transfer(transfer);
        break;
      }
      case 'Finished': {
        const [id, direction, device, outcome, saved] = parameters.deepUnpack() as [string, Direction, string, Outcome, string[]];
        const last = this.transfers.get(id);
        this.transfers.delete(id);
        this.texts.delete(id);
        this.listeners.finished({ id, direction, device, outcome, saved }, last);
        break;
      }
      case 'Paired': {
        const [[id, alias]] = parameters.deepUnpack() as [PeerTuple];
        this.trust({ id, alias });
        return;
      }
    }
    this.changed();
  }

  /** Tells everyone showing Post that what they show may have changed. */
  changed(): void {
    for (const changed of [...this.changes]) changed();
  }
}
