import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SENSOR_PROXY = `<node><interface name="net.hadess.SensorProxy">
  <method name="ClaimAccelerometer"/>
  <method name="ReleaseAccelerometer"/>
  <property name="HasAccelerometer" type="b" access="read"/>
  <property name="AccelerometerOrientation" type="s" access="read"/>
</interface></node>`;

const bus = Gio.DBus.system;
Gio.DBusExportedObject.wrapJSObject(SENSOR_PROXY, {
  ClaimAccelerometer() {},
  ReleaseAccelerometer() {},
  HasAccelerometer: true,
  AccelerometerOrientation: 'normal',
}).export(bus, '/net/hadess/SensorProxy');
Gio.bus_own_name_on_connection(bus, 'net.hadess.SensorProxy', Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
