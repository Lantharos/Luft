import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const MANAGER = '/org/freedesktop/NetworkManager';
const DEVICE = `${MANAGER}/Devices/2`;
const SECURITY = '802-11-wireless-security';
const WIFI = 2;
const DISCONNECTED = 30;
const INFRA = 2;
const PRIVACY = 1;
const PSK = 0x100 | 0x8 | 0x80;
const CAPABILITIES = 0x8 | 0x10 | 0x20;
const ACTIVATING = 1;
const ACTIVATED = 2;
const DEACTIVATED = 4;
const ALLOW_INTERACTION = 0x1;
const REQUEST_NEW = 0x2;
const USER_REQUESTED = 0x4;
const FIRST_CONNECTION = 100;

export type Network = [name: string, saved: boolean, psk: string];

interface SecretRequest {
  id: number;
  path: string;
  saved: Saved;
  flags: number;
  settle(joined: boolean): void;
}

export interface NetworkManagerHost {
  object(path: string, interfaces: [string, object][]): Gio.DBusExportedObject[];
  remove(path: string): void;
  addDevice(path: string): void;
  removeDevice(path: string): void;
  addConnection(path: string): void;
  removeConnection(path: string): void;
}

interface Saved {
  name: string;
  uuid: string;
  psk: string;
}

const variant = (signature: string, value: unknown) => new GLib.Variant(signature, value);
const ssid = (name: string) => variant('ay', new TextEncoder().encode(name));

function settings({name, uuid, psk}: Saved, withSecrets: boolean) {
  return {
    'connection': {id: variant('s', name), uuid: variant('s', uuid), type: variant('s', '802-11-wireless')},
    '802-11-wireless': {ssid: ssid(name), mode: variant('s', 'infrastructure')},
    [SECURITY]: {'key-mgmt': variant('s', 'wpa-psk'), ...withSecrets && psk ? {psk: variant('s', psk)} : {}},
  };
}

export class Wifi {
  readonly forgotten: string[] = [];
  private readonly points = new Map<string, string>();
  private readonly connections = new Map<string, Saved>();
  private readonly actives: string[] = [];
  private readonly pending: SecretRequest[] = [];
  private readonly asked = new Map<number, SecretRequest>();
  private device: Gio.DBusExportedObject[] = [];
  private nextId = FIRST_CONNECTION;
  private lastScan = 0;

  constructor(private readonly host: NetworkManagerHost) {}

  add(networks: Network[]) {
    networks.forEach(([name, saved, psk], index) => {
      const path = `${MANAGER}/AccessPoint/${index + 1}`;
      this.points.set(path, name);
      this.host.object(path, [['.AccessPoint', {
        Flags: PRIVACY, WpaFlags: 0, RsnFlags: PSK, Ssid: new TextEncoder().encode(name), Frequency: 2437,
        HwAddress: `52:54:00:57:46:0${index + 1}`, Mode: INFRA, MaxBitrate: 270000, Strength: 90 - index * 10, LastSeen: -1,
      }]]);
      if (saved) this.save({name, uuid: GLib.uuid_string_random(), psk});
    });
    const wifi = this;
    this.device = this.host.object(DEVICE, [
      ['.Device', {
        Interface: 'wlp2s0', DeviceType: WIFI, Managed: true, Real: true, State: DISCONNECTED, StateReason: [DISCONNECTED, 0], ActiveConnection: '/',
        get AvailableConnections() {
          return [...wifi.connections.keys()];
        },
      }],
      ['.Device.Wireless', {
        HwAddress: '52:54:00:57:46:00', PermHwAddress: '52:54:00:57:46:00', Mode: INFRA, Bitrate: 0, ActiveAccessPoint: '/',
        WirelessCapabilities: CAPABILITIES,
        get AccessPoints() {
          return [...wifi.points.keys()];
        },
        get LastScan() {
          return wifi.lastScan;
        },
        GetAccessPoints: () => [...this.points.keys()],
        GetAllAccessPoints: () => [...this.points.keys()],
        RequestScan: () => this.scanned(),
      }],
    ]);
    this.host.addDevice(DEVICE);
  }

  remove() {
    this.host.removeDevice(DEVICE);
    for (const path of [DEVICE, ...this.points.keys(), ...this.actives]) this.host.remove(path);
    for (const path of this.connections.keys()) this.forget(path);
    this.points.clear();
    this.actives.length = 0;
    this.pending.length = 0;
    this.asked.clear();
    this.device = [];
  }

  activate(path: string) {
    const saved = this.connections.get(path)!;
    const active = this.activeConnection(path, saved);
    this.ask(path, saved, ALLOW_INTERACTION | USER_REQUESTED | (saved.psk ? REQUEST_NEW : 0), active.settle);
    return active.path;
  }

  addAndActivate(accessPoint: string) {
    const path = this.save({name: this.points.get(accessPoint)!, uuid: GLib.uuid_string_random(), psk: ''});
    const saved = this.connections.get(path)!;
    const active = this.activeConnection(path, saved);
    this.ask(path, saved, ALLOW_INTERACTION | USER_REQUESTED, active.settle);
    return [path, active.path];
  }

  askOnItsOwn(name: string) {
    const [path, saved] = [...this.connections].find(([, candidate]) => candidate.name === name)!;
    this.ask(path, saved, ALLOW_INTERACTION | REQUEST_NEW, () => {});
  }

  takeSecretRequests() {
    const taken = this.pending.splice(0);
    for (const request of taken) this.asked.set(request.id, request);
    return taken.map(({id, path, saved, flags}) => [id, settings(saved, true), path, flags]);
  }

  answerSecrets(id: number, joined: boolean) {
    this.asked.get(id)!.settle(joined);
    this.asked.delete(id);
  }

  private scanned() {
    this.lastScan = Math.floor(GLib.get_monotonic_time() / 1000);
    this.device[1].emit_property_changed('LastScan', variant('x', this.lastScan));
  }

  private save(saved: Saved) {
    const path = `${MANAGER}/Settings/${this.nextId++}`;
    this.connections.set(path, saved);
    this.host.object(path, [['.Settings.Connection', {
      Unsaved: false,
      GetSettings: () => settings(saved, false),
      Delete: () => {
        this.forgotten.push(saved.name);
        this.forget(path);
      },
    }]]);
    this.host.addConnection(path);
    this.device[0]?.emit_property_changed('AvailableConnections', variant('ao', [...this.connections.keys()]));
    return path;
  }

  private forget(path: string) {
    this.connections.delete(path);
    this.host.removeConnection(path);
    this.host.remove(path);
    this.device[0]?.emit_property_changed('AvailableConnections', variant('ao', [...this.connections.keys()]));
  }

  private activeConnection(connection: string, {name, uuid}: Saved) {
    const path = `${MANAGER}/ActiveConnection/${this.nextId++}`;
    let state = ACTIVATING;
    const [exported] = this.host.object(path, [['.Connection.Active', {
      Connection: connection, SpecificObject: '/', Id: name, Uuid: uuid, Type: '802-11-wireless', Devices: [DEVICE], Default: false,
      get State() {
        return state;
      },
    }]]);
    this.actives.push(path);
    return {
      path,
      settle(joined: boolean) {
        state = joined ? ACTIVATED : DEACTIVATED;
        exported.emit_property_changed('State', variant('u', state));
        exported.emit_signal('StateChanged', variant('(uu)', [state, 0]));
      },
    };
  }

  private ask(path: string, saved: Saved, flags: number, settle: (joined: boolean) => void) {
    this.pending.push({id: this.nextId++, path, saved, flags, settle});
  }
}
