import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {NetworkManagerHost} from './wifi.js';

const MANAGER = '/org/freedesktop/NetworkManager';
const DEVICE = `${MANAGER}/Devices/3`;
const CONNECTION = `${MANAGER}/Settings/3`;
const ACTIVE = `${MANAGER}/ActiveConnection/3`;
const NAME = 'Wired connection 2';
const UUID = '9d3a1c52-6f0b-4e8a-b1d7-2c5e8f4a6b10';
const ETHERNET = 1;
const DISCONNECTED = 30;
const DEVICE_ACTIVATED = 100;
const ACTIVATED = 2;

const variant = (signature: string, value: unknown) => new GLib.Variant(signature, value);

export class Phone {
  private state = DISCONNECTED;
  private device: Gio.DBusExportedObject | null = null;

  constructor(private readonly host: NetworkManagerHost) {}

  add() {
    this.host.object(CONNECTION, [['.Settings.Connection', {
      Unsaved: false,
      GetSettings: () => ({
        'connection': {id: variant('s', NAME), uuid: variant('s', UUID), type: variant('s', '802-3-ethernet')},
        '802-3-ethernet': {},
        'ipv4': {method: variant('s', 'auto')},
        'ipv6': {method: variant('s', 'auto')},
      }),
    }]]);
    this.host.addConnection(CONNECTION);
    this.host.object(ACTIVE, [['.Connection.Active', {
      Connection: CONNECTION, SpecificObject: '/', Id: NAME, Uuid: UUID, Type: '802-3-ethernet', Devices: [DEVICE], State: ACTIVATED, Default: false,
    }]]);
    const phone = this;
    [this.device] = this.host.object(DEVICE, [
      ['.Device', {
        Interface: 'enx5e6a3c91b2f4', DeviceType: ETHERNET, Managed: true, Real: true, Driver: 'ipheth', AvailableConnections: [CONNECTION],
        get State() {
          return phone.state;
        },
        get StateReason() {
          return [phone.state, 0];
        },
        get ActiveConnection() {
          return phone.state === DEVICE_ACTIVATED ? ACTIVE : '/';
        },
        Disconnect: () => this.settle(DISCONNECTED),
      }],
      ['.Device.Wired', {HwAddress: '5E:6A:3C:91:B2:F4', Speed: 0, Carrier: true}],
    ]);
    this.host.addDevice(DEVICE);
    this.settle(DEVICE_ACTIVATED);
  }

  remove() {
    this.host.removeDevice(DEVICE);
    this.host.removeConnection(CONNECTION);
    for (const path of [DEVICE, CONNECTION, ACTIVE]) this.host.remove(path);
    this.device = null;
    this.state = DISCONNECTED;
  }

  owns(connection: string) {
    return connection === CONNECTION;
  }

  activate() {
    this.settle(DEVICE_ACTIVATED);
    return ACTIVE;
  }

  private settle(state: number) {
    this.state = state;
    this.device!.emit_property_changed('State', variant('u', state));
    this.device!.emit_property_changed('StateReason', variant('(uu)', [state, 0]));
    this.device!.emit_property_changed('ActiveConnection', variant('o', state === DEVICE_ACTIVATED ? ACTIVE : '/'));
  }
}
