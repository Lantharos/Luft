import type { Extension, HelperProcess } from '@luft/extension-api';

export type Granted = 'helper' | 'quick-settings' | 'taskbar' | 'popups' | 'notifications' | 'clipboard' | 'file-actions';

export interface Peer {
  id: string;
  alias: string;
  kind: string;
  model?: string;
  /** Whether its certificate proved who it is, which trusting it needs. */
  verified: boolean;
}

export interface Offered {
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

export type Trusted = { id: string; alias: string };

type HelperEvent =
  | { event: 'ready'; fingerprint: string; alias: string; folder: string }
  | { event: 'listening'; listening: boolean }
  | { event: 'devices'; devices: Peer[] }
  | { event: 'scanning'; scanning: boolean }
  | { event: 'text'; from: Peer; text: string; trusted: boolean }
  | ({ event: 'offer' } & Offer)
  | ({ event: 'transfer' } & Transfer)
  | ({ event: 'finished' } & Finished);

export interface Listeners {
  text(from: Peer, text: string, trusted: boolean): void;
  offer(offer: Offer): void;
  transfer(transfer: Transfer): void;
  /** `last` is how the transfer last stood, when it got that far. */
  finished(finished: Finished, last: Transfer | undefined): void;
}

const RESTART_AFTER_MS = 2000;

/** The helper that speaks LocalSend's protocol, and what it last said: who's nearby and what's on the way. */
export class Pigeon {
  alias = '';
  folder = '';
  devices: Peer[] = [];
  scanning = false;
  listening = true;
  readonly transfers = new Map<string, Transfer>();
  private process: HelperProcess | null = null;
  private readonly changes = new Set<() => void>();

  constructor(readonly extension: Extension<Granted>, private readonly listeners: Listeners) {
    extension.settings.onChanged(key => key === 'receive' && this.configure());
    this.start();
  }

  get trusted(): Trusted[] {
    return this.extension.storage.get<Trusted[]>('trusted') ?? [];
  }

  get pin(): string {
    return this.extension.storage.get<string>('pin') ?? '';
  }

  get name(): string {
    return this.extension.storage.get<string>('name') ?? '';
  }

  get chosenFolder(): string | null {
    return this.extension.storage.get<string>('folder') ?? null;
  }

  trusts(id: string): boolean {
    return this.trusted.some(device => device.id === id);
  }

  trust(peer: Peer): void {
    const others = this.trusted.filter(device => device.id !== peer.id);
    this.extension.storage.set('trusted', [...others, { id: peer.id, alias: peer.alias }]);
    this.chosen();
  }

  forget(id: string): void {
    this.extension.storage.set('trusted', this.trusted.filter(device => device.id !== id));
    this.chosen();
  }

  keep(key: 'name' | 'pin' | 'folder', value: string | null): void {
    if (value) this.extension.storage.set(key, value);
    else this.extension.storage.delete(key);
    this.chosen();
  }

  private chosen(): void {
    this.configure();
    this.extension.settingsPage.refresh();
  }

  onChanged(changed: () => void): void {
    this.changes.add(changed);
  }

  scan(): void {
    this.tell({ command: 'scan' });
  }

  send(device: string, paths: string[]): void {
    this.tell({ command: 'send', device, paths });
  }

  sendText(device: string, text: string): void {
    this.tell({ command: 'send-text', device, text });
  }

  accept(id: string): void {
    this.tell({ command: 'accept', id });
  }

  decline(id: string): void {
    this.tell({ command: 'decline', id });
  }

  cancel(id: string): void {
    this.tell({ command: 'cancel', id });
  }

  answerPin(id: string, pin: string): void {
    this.tell({ command: 'pin', id, pin });
  }

  private start(): void {
    const process = this.extension.helper.start([this.extension.dataPath]);
    this.process = process;
    process.onLine(line => this.hear(JSON.parse(line) as HelperEvent));
    process.onExit(() => {
      this.process = null;
      this.transfers.clear();
      this.devices = [];
      this.changed();
      this.extension.timers.timeout(RESTART_AFTER_MS, () => this.start());
    });
    this.configure();
  }

  private configure(): void {
    this.tell({
      command: 'configure',
      alias: this.name || null,
      folder: this.chosenFolder,
      receive: this.extension.settings.get<boolean>('receive'),
      pin: this.pin || null,
      trusted: this.trusted.map(device => device.id),
    });
  }

  private tell(command: Record<string, unknown>): void {
    void this.process?.write(JSON.stringify(command));
  }

  private hear(event: HelperEvent): void {
    switch (event.event) {
      case 'ready':
        this.alias = event.alias;
        this.folder = event.folder;
        this.extension.settingsPage.refresh();
        break;
      case 'listening':
        this.listening = event.listening;
        break;
      case 'devices':
        this.devices = event.devices;
        break;
      case 'scanning':
        this.scanning = event.scanning;
        break;
      case 'text':
        this.listeners.text(event.from, event.text, event.trusted);
        return;
      case 'offer':
        this.listeners.offer(event);
        return;
      case 'transfer':
        this.transfers.set(event.id, event);
        this.listeners.transfer(event);
        break;
      case 'finished': {
        const last = this.transfers.get(event.id);
        this.transfers.delete(event.id);
        this.listeners.finished(event, last);
        break;
      }
    }
    this.changed();
  }

  private changed(): void {
    for (const changed of this.changes) changed();
  }
}
