import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { appName } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { SUCCESS, respond, type Invocation, type Options } from '../core/request.js';
import { list, row } from '../core/rows.js';

const USB_XML = `<node><interface name="org.freedesktop.impl.portal.Usb">
  <method name="AcquireDevices">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a(sa{sv}a{sv})" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <property name="version" type="u" access="read"/>
</interface></node>`;

type Device = [id: string, info: Options, access: Options];

function udev(text: string | undefined): string | undefined {
  return text?.replace(/\\x([0-9a-f]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16))).trim();
}

function describe([, info]: Device): { title: string; subtitle: string } {
  const properties = (info.properties?.recursiveUnpack() ?? {}) as Record<string, string>;
  const pick = (...keys: string[]) => udev(keys.map(key => properties[key]).find(value => value));
  const vendor = pick('ID_VENDOR_FROM_DATABASE', 'ID_VENDOR_ENC', 'ID_VENDOR_ID') ?? 'Unknown maker';
  const serial = pick('ID_SERIAL_SHORT');
  return { title: pick('ID_MODEL_FROM_DATABASE', 'ID_MODEL_ENC', 'ID_MODEL_ID') ?? 'Unknown device', subtitle: serial ? `${vendor} · ${serial}` : vendor };
}

export class UsbPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(USB_XML, this);
  readonly version = 1;

  async AcquireDevicesAsync([handle, , appId, devices]: [string, string, string, Device[], Options], invocation: Invocation): Promise<void> {
    const app = appName(appId);
    respond(invocation, await openDialog(handle, {
      title: devices.length > 1 ? `Let ${app} use these devices?` : `Let ${app} use this device?`,
      description: `${app} will be able to talk to the device directly while it's plugged in.`,
      icon: 'media-removable-symbolic',
    }, dialog => {
      const rows = devices.map(device => row({ icon: 'media-removable-symbolic', ...describe(device), checked: true }));
      dialog.content.add_child(list(rows, rows.length > 5));
      const [, allow] = dialog.buttons([
        { label: 'Cancel', action: dialog.cancel },
        {
          label: 'Allow', default: true, action: () => dialog.finish(SUCCESS, {
            devices: new GLib.Variant('a(sa{sv})', devices.filter((_, index) => rows[index].checked).map(([id, , access]): [string, Options] => [id, access])),
          }),
        },
      ]);
      for (const button of rows) button.connect('notify::checked', () => { allow.reactive = allow.can_focus = rows.some(other => other.checked); });
    }));
  }
}
