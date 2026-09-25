import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import St from 'gi://St';
import { MprisSource, type MprisPlayer } from 'resource:///org/gnome/shell/ui/mpris.js';

const COVER_SIZE = 48;

export class MediaCard {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-media', visible: false });
  private readonly source = new MprisSource();
  private readonly cover = new St.Bin({ style_class: 'kestrel-media-cover', width: COVER_SIZE, height: COVER_SIZE });
  private readonly title = new St.Label({ style_class: 'kestrel-media-title' });
  private readonly artist = new St.Label({ style_class: 'kestrel-media-artist' });
  private readonly previous: St.Button;
  private readonly playPause: St.Button;
  private readonly next: St.Button;
  private player: MprisPlayer | null = null;
  private coverKey: string | null = null;

  constructor(private readonly changed: () => void) {
    const details = new St.BoxLayout({ style_class: 'kestrel-media-details', x_expand: true });
    details.add_child(this.cover);
    const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    for (const label of [this.title, this.artist]) {
      label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
      text.add_child(label);
    }
    details.add_child(text);
    const open = new St.Button({ style_class: 'kestrel-media-open', child: details, x_expand: true, can_focus: true, track_hover: true });
    open.connect('clicked', () => this.player?.raise());
    this.actor.add_child(open);

    this.previous = this.control('media-skip-backward-symbolic', 'Previous track', () => this.player?.previous());
    this.playPause = this.control('media-playback-start-symbolic', 'Play', () => this.player?.playPause());
    this.next = this.control('media-skip-forward-symbolic', 'Next track', () => this.player?.next());

    this.source.connectObject('player-added', () => this.choosePlayer(), 'player-removed', () => this.choosePlayer(), this.actor);
    this.actor.connect('destroy', () => this.player?.disconnectObject(this.actor));
    this.choosePlayer();
  }

  private control(icon: string, label: string, activate: () => void): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-icon-button kestrel-media-control', accessible_name: label,
      can_focus: true, track_hover: true, y_align: Clutter.ActorAlign.CENTER,
      child: new St.Icon({ icon_name: icon, icon_size: 16 }),
    });
    button.connect('clicked', activate);
    this.actor.add_child(button);
    return button;
  }

  private choosePlayer(): void {
    const players = this.source.players;
    const player = players.find(candidate => candidate.status === 'Playing') ?? players[players.length - 1] ?? null;
    if (player !== this.player) {
      this.player?.disconnectObject(this.actor);
      this.player = player;
      player?.connectObject('changed', () => this.sync(), this.actor);
    }
    this.sync();
  }

  private sync(): void {
    const player = this.player;
    const visible = !!player;
    if (player) {
      this.title.text = player.trackTitle;
      this.artist.text = player.trackArtists.join(', ');
      const playing = player.status === 'Playing';
      (this.playPause.child as St.Icon).icon_name = playing ? 'media-playback-pause-symbolic' : 'media-playback-start-symbolic';
      this.playPause.accessible_name = playing ? 'Pause' : 'Play';
      this.previous.reactive = player.canGoPrevious;
      this.next.reactive = player.canGoNext;
      this.syncCover(player);
    }
    if (this.actor.visible !== visible) {
      this.actor.visible = visible;
      this.changed();
    }
  }

  private syncCover(player: MprisPlayer): void {
    const key = player.trackCoverUrl || player.app?.id || '';
    if (key === this.coverKey) return;
    this.coverKey = key;
    const cover = player.trackCoverUrl ? Gio.File.new_for_uri(player.trackCoverUrl) : null;
    if (cover?.is_native()) {
      this.cover.child?.destroy();
      this.cover.style = `background-image: url("${cover.get_uri()}");`;
      return;
    }
    this.cover.style = null;
    this.cover.child?.destroy();
    const icon = player.app?.get_icon();
    this.cover.child = icon
      ? new St.Icon({ gicon: icon, icon_size: 32, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER })
      : new St.Icon({ icon_name: 'audio-x-generic-symbolic', icon_size: 22, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
  }
}
