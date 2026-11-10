import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const GREETER = 'com.lantharos.Greeter1';
const GREETER_PATH = '/com/lantharos/Greeter1';
const PROPERTIES = 'org.freedesktop.DBus.Properties';
const SWITCH = 'DeveloperTools';

type Changes = [name: string, changed: Record<string, GLib.Variant>, invalidated: string[]];

export class DeveloperTools {
  private on = false;
  private firstAnswer: Promise<void>;
  private readonly subscription: number;

  constructor() {
    this.subscription = Gio.DBus.system.signal_subscribe(GREETER, PROPERTIES, 'PropertiesChanged', GREETER_PATH, GREETER, Gio.DBusSignalFlags.NONE,
      (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, changed, invalidated] = parameters.deepUnpack<Changes>();
        if (SWITCH in changed) this.on = changed[SWITCH].get_boolean();
        else if (invalidated.includes(SWITCH)) void this.read();
      });
    this.firstAnswer = this.read();
  }

  async turnedOn(): Promise<boolean> {
    await this.firstAnswer;
    return this.on;
  }

  destroy(): void {
    Gio.DBus.system.signal_unsubscribe(this.subscription);
  }

  private async read(): Promise<void> {
    try {
      const reply = await Gio.DBus.system.call(GREETER, GREETER_PATH, PROPERTIES, 'Get', new GLib.Variant('(ss)', [GREETER, SWITCH]),
        new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null);
      this.on = reply.recursiveUnpack<[boolean]>()[0];
    } catch (error) {
      this.on = false;
      console.warn(`Couldn't tell whether developer tools are on: ${error}`);
    }
  }
}
