import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Speech1';
const PATH = '/com/lantharos/Speech1';
const NOT_INSTALLED = 'com.lantharos.Speech1.Error.NotInstalled';
const STOP_TIMEOUT_MS = 60_000;

export class NotInstalled extends Error {}

export class Speech {
  private readonly subscriptions: number[];

  constructor(partial: (text: string) => void, level: (level: number) => void) {
    const subscribe = (signal: string, handle: (parameters: GLib.Variant) => void) =>
      Gio.DBus.session.signal_subscribe(NAME, NAME, signal, PATH, null, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _interface, _signal, parameters) => handle(parameters));
    this.subscriptions = [
      subscribe('Partial', parameters => partial((parameters.deep_unpack() as [string])[0])),
      subscribe('Level', parameters => level((parameters.deep_unpack() as [number])[0])),
    ];
  }

  private async call(method: string, parameters: GLib.Variant | null, reply: string | null, timeout = -1): Promise<GLib.Variant> {
    try {
      return await Gio.DBus.session.call(NAME, PATH, NAME, method, parameters, reply ? new GLib.VariantType(reply) : null,
        Gio.DBusCallFlags.NONE, timeout, null);
    } catch (error) {
      if (error instanceof GLib.Error && Gio.DBusError.get_remote_error(error) === NOT_INSTALLED) throw new NotInstalled();
      throw error;
    }
  }

  async start(layout: string): Promise<void> {
    await this.call('Start', new GLib.Variant('(s)', [layout]), null);
  }

  async stop(): Promise<string> {
    const reply = await this.call('Stop', null, '(s)', STOP_TIMEOUT_MS);
    return (reply.deep_unpack() as [string])[0];
  }

  cancel(): void {
    this.call('Cancel', null, null).catch(error => console.warn(`Couldn't cancel dictation: ${error}`));
  }

  destroy(): void {
    for (const id of this.subscriptions) Gio.DBus.session.signal_unsubscribe(id);
  }
}
