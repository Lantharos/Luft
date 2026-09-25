import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const ROOT_INTERFACE = `<node><interface name="org.mpris.MediaPlayer2">
  <property name="Identity" type="s" access="read"/>
  <property name="CanRaise" type="b" access="read"/>
  <method name="Raise"/>
</interface></node>`;

const PLAYER_INTERFACE = `<node><interface name="org.mpris.MediaPlayer2.Player">
  <property name="PlaybackStatus" type="s" access="read"/>
  <property name="Metadata" type="a{sv}" access="read"/>
  <property name="CanPlay" type="b" access="read"/>
  <property name="CanGoNext" type="b" access="read"/>
  <property name="CanGoPrevious" type="b" access="read"/>
  <method name="PlayPause"/>
  <method name="Next"/>
  <method name="Previous"/>
</interface></node>`;

const root = {Identity: 'Kestrel Player', CanRaise: false, Raise() {}};
const player = {
  PlaybackStatus: 'Playing',
  Metadata: {
    'xesam:title': new GLib.Variant('s', 'Low Tide'),
    'xesam:artist': new GLib.Variant('as', ['Ocean Glass']),
  },
  CanPlay: true,
  CanGoNext: true,
  CanGoPrevious: false,
  PlayPause() {
    this.PlaybackStatus = this.PlaybackStatus === 'Playing' ? 'Paused' : 'Playing';
    playerObject.emit_property_changed('PlaybackStatus', new GLib.Variant('s', this.PlaybackStatus));
  },
  Next() {},
  Previous() {},
};

const rootObject = Gio.DBusExportedObject.wrapJSObject(ROOT_INTERFACE, root);
const playerObject = Gio.DBusExportedObject.wrapJSObject(PLAYER_INTERFACE, player);
rootObject.export(Gio.DBus.session, '/org/mpris/MediaPlayer2');
playerObject.export(Gio.DBus.session, '/org/mpris/MediaPlayer2');
Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.mpris.MediaPlayer2.KestrelCheck', Gio.BusNameOwnerFlags.NONE, null, null);

new GLib.MainLoop(null, false).run();
