import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAMESPACE = 'org.mpris.MediaPlayer2';
const PREFIX = `${NAMESPACE}.`;
const PATH = '/org/mpris/MediaPlayer2';
const PLAYER = 'org.mpris.MediaPlayer2.Player';
const REWIND_MICROSECONDS = -10_000_000;
const FORWARD_MICROSECONDS = 45_000_000;

export type PlayerKey = 'play' | 'pause' | 'stop' | 'previous' | 'next' | 'rewind' | 'forward' | 'repeat' | 'shuffle';

interface Player {
  name: string;
  playing: boolean;
  subscription: number;
}

export class Players {
  private readonly players: Player[] = [];
  private readonly ownerSubscription: number;

  constructor() {
    this.ownerSubscription = Gio.DBus.session.signal_subscribe('org.freedesktop.DBus', 'org.freedesktop.DBus', 'NameOwnerChanged',
      '/org/freedesktop/DBus', NAMESPACE, Gio.DBusSignalFlags.MATCH_ARG0_NAMESPACE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [name, , owner] = parameters.deep_unpack() as [string, string, string];
        this.forget(name);
        if (owner) void this.track(name);
      });
    void this.discover();
  }

  private async discover(): Promise<void> {
    const reply = await Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'ListNames',
      null, new GLib.VariantType('(as)'), Gio.DBusCallFlags.NONE, -1, null);
    const [names] = reply.deep_unpack() as [string[]];
    for (const name of names.filter(name => name.startsWith(PREFIX))) await this.track(name);
  }

  private async track(name: string): Promise<void> {
    const player: Player = { name, playing: false, subscription: 0 };
    player.subscription = Gio.DBus.session.signal_subscribe(name, 'org.freedesktop.DBus.Properties', 'PropertiesChanged', PATH, PLAYER,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        const status = changed.PlaybackStatus?.deep_unpack();
        if (status !== undefined) this.statusChanged(player, status === 'Playing');
      });
    const status = await this.property(name, 'PlaybackStatus').catch(() => null);
    if (this.players.some(known => known.name === name)) {
      Gio.DBus.session.signal_unsubscribe(player.subscription);
      return;
    }
    player.playing = status?.deep_unpack() === 'Playing';
    const current = this.players[0];
    if (current?.playing) this.players.splice(1, 0, player);
    else this.players.unshift(player);
  }

  private statusChanged(player: Player, playing: boolean): void {
    player.playing = playing;
    const current = this.players[0];
    if (!playing || current === player || current?.playing) return;
    this.players.splice(this.players.indexOf(player), 1);
    this.players.unshift(player);
  }

  private forget(name: string): void {
    const index = this.players.findIndex(player => player.name === name);
    if (index < 0) return;
    Gio.DBus.session.signal_unsubscribe(this.players[index].subscription);
    this.players.splice(index, 1);
  }

  private property(name: string, property: string): Promise<GLib.Variant> {
    return Gio.DBus.session.call(name, PATH, 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', [PLAYER, property]),
      new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null).then(reply => reply.get_child_value(0).get_variant());
  }

  private call(name: string, method: string, parameters: GLib.Variant | null = null): Promise<unknown> {
    return Gio.DBus.session.call(name, PATH, PLAYER, method, parameters, null, Gio.DBusCallFlags.NONE, -1, null);
  }

  private set(name: string, property: string, value: GLib.Variant): Promise<unknown> {
    return Gio.DBus.session.call(name, PATH, 'org.freedesktop.DBus.Properties', 'Set', new GLib.Variant('(ssv)', [PLAYER, property, value]),
      null, Gio.DBusCallFlags.NONE, -1, null);
  }

  press(key: PlayerKey): boolean {
    const player = this.players[0];
    if (!player) return false;
    void this.send(player.name, key).catch(error => console.warn(`The media player didn't take the key: ${error}`));
    return true;
  }

  private async send(name: string, key: PlayerKey): Promise<unknown> {
    switch (key) {
    case 'play': return this.call(name, 'PlayPause');
    case 'pause': return this.call(name, 'Pause');
    case 'stop': return this.call(name, 'Stop');
    case 'previous': return this.call(name, 'Previous');
    case 'next': return this.call(name, 'Next');
    case 'rewind': return this.call(name, 'Seek', new GLib.Variant('(x)', [REWIND_MICROSECONDS]));
    case 'forward': return this.call(name, 'Seek', new GLib.Variant('(x)', [FORWARD_MICROSECONDS]));
    case 'repeat': {
      const loop = (await this.property(name, 'LoopStatus')).deep_unpack();
      return this.set(name, 'LoopStatus', new GLib.Variant('s', loop === 'Playlist' ? 'None' : 'Playlist'));
    }
    case 'shuffle': {
      const shuffle = (await this.property(name, 'Shuffle')).deep_unpack();
      return this.set(name, 'Shuffle', new GLib.Variant('b', !shuffle));
    }
    }
  }

  destroy(): void {
    Gio.DBus.session.signal_unsubscribe(this.ownerSubscription);
    for (const player of this.players) Gio.DBus.session.signal_unsubscribe(player.subscription);
    this.players.length = 0;
  }
}
