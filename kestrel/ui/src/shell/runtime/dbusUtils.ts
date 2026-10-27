import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Config from '../config.js';

let ifaceResource: Gio.Resource | null = null;

function ensureIfaceResource(): void {
  if (ifaceResource) return;

  const dir = GLib.getenv('KESTREL_DATADIR') || Config.PKGDATADIR;
  ifaceResource = Gio.Resource.load(`${dir}/kestrel-dbus-interfaces.gresource`);
  Gio.resources_register(ifaceResource);
}

export function loadInterfaceXML(iface: string): string | null {
  ensureIfaceResource();

  const uri = `resource:///com/lantharos/kestrel/dbus-interfaces/${iface}.xml`;
  const f = Gio.File.new_for_uri(uri);

  try {
    const [, bytes] = f.load_contents(null);
    return new TextDecoder().decode(bytes);
  } catch {
    log(`Failed to load D-Bus interface ${iface}`);
  }

  return null;
}

export function loadSubInterfaceXML(iface: string, ifaceFile: string): string | null {
  const xml = loadInterfaceXML(ifaceFile);
  if (!xml) return null;

  const ifaceStartTag = `<interface name="${iface}">`;
  const ifaceStopTag = '</interface>';
  const ifaceStartIndex = xml.indexOf(ifaceStartTag);
  const ifaceEndIndex = xml.indexOf(ifaceStopTag, ifaceStartIndex + 1) + ifaceStopTag.length;

  const xmlHeader = '<!DOCTYPE node PUBLIC\n' +
    '\'-//freedesktop//DTD D-BUS Object Introspection 1.0//EN\'\n' +
    '\'http://www.freedesktop.org/standards/dbus/1.0/introspect.dtd\'>\n' +
    '<node>\n';
  const xmlFooter = '</node>';

  return xmlHeader + xml.substring(ifaceStartIndex, ifaceEndIndex) + xmlFooter;
}

export function emitSignalToDestination(dbusImpl: Gio.DBusExportedObject, destination: string | null, signalName: string, params: GLib.Variant | null): void {
  const connection = dbusImpl.get_connection();
  const info = dbusImpl.get_info();
  connection!.emit_signal(destination, dbusImpl.get_object_path()!, info.name, signalName, params);
}
