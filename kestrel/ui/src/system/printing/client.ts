import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

import { loadInterfaceXML } from '../../core/runtime/dbusUtils.js';

const NAME = 'com.lantharos.Settings';
const PATH = '/com/lantharos/Settings/Printing';

export const PENDING = 3;
export const PROCESSING = 5;
export const STOPPED = 6;
export const ABORTED = 8;
export const COMPLETED = 9;

export interface Job {
  id: number;
  printer: string;
  name: string;
  state: number;
  printed: number;
  pages: number;
}

export interface Marker {
  name: string;
  level: number;
  colors: string[];
}

export interface Status {
  description: string;
  markers: Marker[];
  reasons: string[];
}

export interface Finished {
  id: number;
  printer: string;
  name: string;
  state: number;
}

type Dict = Record<string, GLib.Variant>;

interface PrintingRemote {
  JobsAsync(): Promise<[Dict[]]>;
  StatusAsync(printer: string): Promise<[Dict]>;
  CancelJobAsync(printer: string, job: number): Promise<[]>;
  connectSignal(name: string, callback: (proxy: unknown, sender: string, args: unknown[]) => void): number;
  disconnectSignal(id: number): void;
}

const PrintingProxy = Gio.DBusProxy.makeProxyWrapper<PrintingRemote>(loadInterfaceXML('com.lantharos.Settings.Printing'));

const unpack = (dict: Dict) => Object.fromEntries(Object.entries(dict).map(([key, value]) => [key, value.recursiveUnpack()]));

const job = ({ id, printer, name, state, printed, pages }: Record<string, unknown>): Job =>
  ({ id, printer, name, state, printed, pages }) as Job;

function status(dict: Dict): Status {
  const { description, markers, reasons } = unpack(dict) as { description: string; markers: [string, number, string][]; reasons: string[] };
  return {
    description,
    reasons,
    markers: markers.map(([name, level, color]) => ({ name, level, colors: color.match(/#[0-9a-f]{6}/gi) ?? [] })),
  };
}

export interface Listeners {
  changed(): void;
  finished(finished: Finished): void;
}

export class PrintingClient {
  private readonly proxy: PrintingRemote & Gio.DBusProxy;
  private readonly signals: number[];
  private readonly ownerChanged: number;

  constructor(listeners: Listeners) {
    this.proxy = PrintingProxy(Gio.DBus.session, NAME, PATH, (_proxy, error) => {
      if (error) console.warn(`Can't follow printing: ${error}`);
      else listeners.changed();
    }, null, Gio.DBusProxyFlags.DO_NOT_LOAD_PROPERTIES);
    this.signals = [
      this.proxy.connectSignal('Changed', () => listeners.changed()),
      this.proxy.connectSignal('JobFinished', (_proxy, _sender, [id, printer, name, state]) =>
        listeners.finished({ id, printer, name, state } as Finished)),
    ];
    this.ownerChanged = this.proxy.connect('notify::g-name-owner', () => listeners.changed());
  }

  async jobs(): Promise<Job[]> {
    const [jobs] = await this.proxy.JobsAsync();
    return jobs.map(unpack).filter(({ mine }) => mine).map(job);
  }

  async status(printer: string): Promise<Status> {
    const [found] = await this.proxy.StatusAsync(printer);
    return status(found);
  }

  async cancel(job: Job): Promise<void> {
    await this.proxy.CancelJobAsync(job.printer, job.id);
  }

  destroy(): void {
    for (const id of this.signals) this.proxy.disconnectSignal(id);
    this.proxy.disconnect(this.ownerChanged);
  }
}
