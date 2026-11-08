import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { type Pen, pens } from './pens.js';

const PENS_XML = `<node><interface name="com.lantharos.Kestrel.Pens">
  <property name="Devices" type="a(sss)" access="read"/>
</interface></node>`;

const rows = (devices: Pen[]): [string, string, string][] => devices.map(({ id, name, kind }) => [id, name, kind]);

export class PenService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(PENS_XML, this);
  private devices: Pen[] = [];
  private readonly unwatch: () => void;

  constructor() {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Pens');
    this.unwatch = pens.watch(({ pens: current }) => {
      if (JSON.stringify(current) === JSON.stringify(this.devices)) return;
      this.devices = current;
      this.dbus.emit_property_changed('Devices', new GLib.Variant('a(sss)', rows(current)));
    });
  }

  get Devices(): [string, string, string][] {
    return rows(this.devices);
  }

  destroy(): void {
    this.unwatch();
    this.dbus.unexport();
  }
}
