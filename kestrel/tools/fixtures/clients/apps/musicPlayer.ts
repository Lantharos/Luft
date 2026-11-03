import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const [name, identity, title, artist, cover] = ARGV;

const ROOT_INTERFACE = `<node><interface name="org.mpris.MediaPlayer2">
  <property name="Identity" type="s" access="read"/>
  <property name="DesktopEntry" type="s" access="read"/>
  <property name="CanRaise" type="b" access="read"/>
  <method name="Raise"/>
</interface></node>`;

const PLAYER_INTERFACE = `<node><interface name="org.mpris.MediaPlayer2.Player">
  <property name="PlaybackStatus" type="s" access="read"/>
  <property name="Metadata" type="a{sv}" access="read"/>
  <property name="CanPlay" type="b" access="read"/>
  <property name="CanGoNext" type="b" access="read"/>
  <property name="CanGoPrevious" type="b" access="read"/>
  <property name="CanSeek" type="b" access="read"/>
  <property name="Position" type="x" access="read"/>
  <method name="PlayPause"/>
  <method name="Next"/>
  <method name="Previous"/>
  <method name="SetPosition"><arg type="o" direction="in"/><arg type="x" direction="in"/></method>
  <signal name="Seeked"><arg type="x"/></signal>
</interface></node>`;

const LENGTH_US = 214_000_000;
const TRACK = '/com/lantharos/KestrelCheck/track/1';
const now = () => GLib.get_monotonic_time();

let started = now() - 47_000_000;
let pausedAt: number | null = null;
let track = 0;

const metadata = () => ({
  'mpris:trackid': new GLib.Variant('o', TRACK),
  'mpris:length': new GLib.Variant('x', LENGTH_US),
  'mpris:artUrl': new GLib.Variant('s', GLib.filename_to_uri(cover, null)),
  'xesam:title': new GLib.Variant('s', track ? `${title} (${track + 1})` : title),
  'xesam:artist': new GLib.Variant('as', [artist]),
  'xesam:album': new GLib.Variant('s', 'Check Sessions'),
});

const root = {Identity: identity, DesktopEntry: '', CanRaise: false, Raise() {}};
const player = {
  PlaybackStatus: 'Playing',
  get Metadata() {
    return metadata();
  },
  CanPlay: true,
  CanGoNext: true,
  CanGoPrevious: true,
  CanSeek: true,
  get Position() {
    return (pausedAt ?? now()) - started;
  },
  PlayPause() {
    if (pausedAt === null) pausedAt = now();
    else {
      started += now() - pausedAt;
      pausedAt = null;
    }
    this.PlaybackStatus = pausedAt === null ? 'Playing' : 'Paused';
    playerObject.emit_property_changed('PlaybackStatus', new GLib.Variant('s', this.PlaybackStatus));
  },
  Next() {
    track++;
    started = pausedAt ?? now();
    playerObject.emit_property_changed('Metadata', new GLib.Variant('a{sv}', metadata()));
  },
  Previous() {
    started = pausedAt ?? now();
    playerObject.emit_signal('Seeked', new GLib.Variant('(x)', [0]));
  },
  SetPosition(_track: string, position: number) {
    started = (pausedAt ?? now()) - position;
    playerObject.emit_signal('Seeked', new GLib.Variant('(x)', [position]));
  },
};

const rootObject = Gio.DBusExportedObject.wrapJSObject(ROOT_INTERFACE, root);
const playerObject = Gio.DBusExportedObject.wrapJSObject(PLAYER_INTERFACE, player);
rootObject.export(Gio.DBus.session, '/org/mpris/MediaPlayer2');
playerObject.export(Gio.DBus.session, '/org/mpris/MediaPlayer2');
Gio.bus_own_name_on_connection(Gio.DBus.session, `org.mpris.MediaPlayer2.${name}`, Gio.BusNameOwnerFlags.NONE, null, null);

new GLib.MainLoop(null, false).run();
