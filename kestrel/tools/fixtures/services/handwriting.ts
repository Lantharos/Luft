import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Handwriting1';
const PATH = '/com/lantharos/Handwriting1';
const INTERFACE = `<node><interface name="${NAME}">
  <method name="Recognize"><arg name="strokes" type="aa(dd)" direction="in"/><arg name="text" type="s" direction="out"/></method>
</interface></node>`;
const ANSWERS = ['Vidimo se', 'sutra', 'u šest', 'Grüße', 'nesër'];

let answered = 0;

const service = Gio.DBusExportedObject.wrapJSObject(INTERFACE, {
  Recognize(strokes: [number, number][][]) {
    if (!strokes.length) return '';
    return ANSWERS[answered++ % ANSWERS.length];
  },
});

service.export(Gio.DBus.session, PATH);
Gio.bus_own_name_on_connection(Gio.DBus.session, NAME, Gio.BusNameOwnerFlags.NONE, null, () => {
  throw new Error(`Couldn't own ${NAME}`);
});
new GLib.MainLoop(null, false).run();
