import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../../kestrelUi.js';
import * as MessageList from './messageList.js';

import { loadInterfaceXML } from '../../../core/runtime/fileUtils.js';

interface DBusRemote {
  ListNamesAsync(): Promise<[string[]]>;
  connectSignal(name: 'NameOwnerChanged', callback: (proxy: Gio.DBusProxy, sender: string, args: [string, string, string]) => void): number;
}

interface MprisRemote {
  readonly CanRaise: boolean;
  readonly DesktopEntry: string;
  readonly Identity: string;
  RaiseAsync(): Promise<[]>;
}

interface MprisPlayerRemote {
  readonly PlaybackStatus: string;
  readonly Metadata: Record<string, GLib.Variant>;
  readonly CanPlay: boolean;
  readonly CanGoNext: boolean;
  readonly CanGoPrevious: boolean;
  PlayPauseAsync(): Promise<[]>;
  NextAsync(): Promise<[]>;
  PreviousAsync(): Promise<[]>;
}

type MprisProxy = MprisRemote & Gio.DBusProxy;
type MprisPlayerProxy = MprisPlayerRemote & Gio.DBusProxy;

const DBusProxy = Gio.DBusProxy.makeProxyWrapper<DBusRemote>(loadInterfaceXML('org.freedesktop.DBus'));
const MprisProxy = Gio.DBusProxy.makeProxyWrapper<MprisRemote>(loadInterfaceXML('org.mpris.MediaPlayer2'));
const MprisPlayerProxy = Gio.DBusProxy.makeProxyWrapper<MprisPlayerRemote>(loadInterfaceXML('org.mpris.MediaPlayer2.Player'));

const MPRIS_PLAYER_PREFIX = 'org.mpris.MediaPlayer2.';
const MPRIS_PATH = '/org/mpris/MediaPlayer2';

export namespace MprisPlayer {
  export interface Signals extends GObject.Object.SignalSignatures {
    'changed': () => void;
  }
}

export const MprisPlayer = GObject.registerClass({
  Properties: {
    'can-play': GObject.ParamSpec.boolean('can-play', null, null, GObject.ParamFlags.READABLE, false),
  },
  Signals: {
    'changed': {},
  },
}, class MprisPlayer extends GObject.Object {
  declare connect: GObject.SignalMethods<this, MprisPlayer.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, MprisPlayer.Signals>['emit'];

  readonly source = new MessageList.Source();
  private mprisProxy: MprisProxy | null;
  private playerProxy: MprisPlayerProxy | null;
  private canPlayValue = false;
  private artists: string[] = [];
  private title = '';
  private coverUrl = '';
  private appValue: Shell.App | null = null;

  constructor(private readonly busName: string) {
    super();
    this.mprisProxy = MprisProxy(Gio.DBus.session, busName, MPRIS_PATH, () => this.onMprisProxyReady());
    this.playerProxy = MprisPlayerProxy(Gio.DBus.session, busName, MPRIS_PATH, () => this.onPlayerProxyReady());
  }

  get canPlay(): boolean {
    return this.canPlayValue;
  }

  get status(): string {
    return this.playerProxy!.PlaybackStatus;
  }

  get trackArtists(): string[] {
    return this.artists;
  }

  get trackTitle(): string {
    return this.title;
  }

  get trackCoverUrl(): string {
    return this.coverUrl;
  }

  get app(): Shell.App | null {
    return this.appValue;
  }

  playPause(): void {
    this.playerProxy!.PlayPauseAsync().catch(logError);
  }

  get canGoNext(): boolean {
    return this.playerProxy!.CanGoNext;
  }

  next(): void {
    this.playerProxy!.NextAsync().catch(logError);
  }

  get canGoPrevious(): boolean {
    return this.playerProxy!.CanGoPrevious;
  }

  previous(): void {
    this.playerProxy!.PreviousAsync().catch(logError);
  }

  raise(): void {
    if (this.appValue)
      this.appValue.activate();
    else if (this.mprisProxy!.CanRaise)
      this.mprisProxy!.RaiseAsync().catch(logError);
  }

  private close(): void {
    this.mprisProxy!.disconnectObject(this);
    this.mprisProxy = null;
    this.playerProxy!.disconnectObject(this);
    this.playerProxy = null;
  }

  private onMprisProxyReady(): void {
    const proxy = this.mprisProxy!;
    proxy.connectObject('notify::g-name-owner', () => {
      if (!proxy.g_name_owner)
        this.close();
    }, this);
    if (!proxy.g_name_owner)
      this.close();
  }

  private onPlayerProxyReady(): void {
    this.playerProxy!.connectObject('g-properties-changed', () => this.updateState(), this);
    this.updateState();
  }

  private faulty(field: string, expected: string, value: unknown): void {
    if (typeof value === 'undefined') return;
    log(`Received faulty track ${field} metadata from ${this.busName}; expected ${expected}, got ${value} (${typeof value})`);
  }

  private updateState(): void {
    const mprisProxy = this.mprisProxy!;
    const playerProxy = this.playerProxy!;
    const metadata: Record<string, unknown> = {};
    for (const prop in playerProxy.Metadata)
      metadata[prop] = playerProxy.Metadata[prop].deepUnpack();

    const artists = metadata['xesam:artist'];
    if (Array.isArray(artists) && artists.every(artist => typeof artist === 'string')) {
      this.artists = artists;
    } else {
      this.faulty('artist', 'an array of strings', artists);
      this.artists = [KestrelUi.t('mpris-unknown-artist')];
    }

    const title = metadata['xesam:title'];
    if (typeof title === 'string') {
      this.title = title;
    } else {
      this.faulty('title', 'a string', title);
      this.title = KestrelUi.t('mpris-unknown-title');
    }

    const coverUrl = metadata['mpris:artUrl'];
    if (typeof coverUrl === 'string') {
      this.coverUrl = coverUrl;
    } else {
      this.faulty('cover art', 'a string', coverUrl);
      this.coverUrl = '';
    }

    this.appValue = mprisProxy.DesktopEntry
      ? Shell.AppSystem.get_default().lookup_app(`${mprisProxy.DesktopEntry}.desktop`)
      : null;

    this.source.set({
      title: this.appValue?.get_name() ?? mprisProxy.Identity,
      icon: this.appValue?.get_icon() ?? null,
    });

    const canPlay = !!playerProxy.CanPlay;
    if (this.canPlayValue !== canPlay) {
      this.canPlayValue = canPlay;
      this.notify('can-play');
    }
    this.emit('changed');
  }
});
export type MprisPlayer = InstanceType<typeof MprisPlayer>;

export namespace MprisSource {
  export interface Signals extends GObject.Object.SignalSignatures {
    'player-added': (player: MprisPlayer) => void;
    'player-removed': (player: MprisPlayer) => void;
  }
}

export const MprisSource = GObject.registerClass({
  Signals: {
    'player-added': { param_types: [MprisPlayer] },
    'player-removed': { param_types: [MprisPlayer] },
  },
}, class MprisSource extends GObject.Object {
  declare connect: GObject.SignalMethods<this, MprisSource.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, MprisSource.Signals>['emit'];

  private readonly playerMap = new Map<string, MprisPlayer>();
  private readonly proxy = DBusProxy(Gio.DBus.session, 'org.freedesktop.DBus', '/org/freedesktop/DBus', () => void this.onProxyReady());

  get players(): MprisPlayer[] {
    return [...this.playerMap.values()].filter(player => player.canPlay);
  }

  private addPlayer(busName: string): void {
    if (this.playerMap.has(busName)) return;

    const player = new MprisPlayer(busName);
    this.playerMap.set(busName, player);
    player.connectObject('notify::can-play', () => {
      if (player.canPlay)
        this.emit('player-added', player);
      else
        this.emit('player-removed', player);
    }, this);
  }

  private async onProxyReady(): Promise<void> {
    const [names] = await this.proxy.ListNamesAsync();
    for (const name of names) {
      if (name.startsWith(MPRIS_PLAYER_PREFIX))
        this.addPlayer(name);
    }
    this.proxy.connectSignal('NameOwnerChanged', (_proxy, _sender, [name, oldOwner, newOwner]) => this.onNameOwnerChanged(name, oldOwner, newOwner));
  }

  private onNameOwnerChanged(name: string, oldOwner: string, newOwner: string): void {
    if (!name.startsWith(MPRIS_PLAYER_PREFIX)) return;

    const player = oldOwner ? this.playerMap.get(name) : undefined;
    if (player) {
      this.playerMap.delete(name);
      player.disconnectObject(this);
      if (player.canPlay)
        this.emit('player-removed', player);
    }

    if (newOwner)
      this.addPlayer(name);
  }
});
export type MprisSource = InstanceType<typeof MprisSource>;
