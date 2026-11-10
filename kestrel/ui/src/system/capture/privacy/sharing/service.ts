import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { refuseSandboxed } from '../../../../shared/dbus/sandbox.js';
import { sharing, type Grant } from './authority.js';

const SHARING_XML = `<node><interface name="com.lantharos.Kestrel.Sharing">
  <method name="List"><arg type="aa{sv}" name="grants" direction="out"/></method>
  <method name="Revoke"><arg type="s" name="id" direction="in"/></method>
  <signal name="Changed"/>
</interface></node>`;

function packed({ id, app, kind, since, remembered, active }: Grant): Record<string, GLib.Variant> {
  return {
    id: new GLib.Variant('s', id),
    app: new GLib.Variant('s', app),
    kind: new GLib.Variant('s', kind),
    since: new GLib.Variant('x', since),
    remembered: new GLib.Variant('b', remembered),
    active: new GLib.Variant('b', active),
  };
}

export class SharingService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(SHARING_XML, this);
  private readonly unwatch = sharing.watch(() => this.dbus.emit_signal('Changed', null));

  constructor() {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Sharing');
  }

  async ListAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await refuseSandboxed(invocation, 'see what is shared')) return;
    invocation.return_value(new GLib.Variant('(aa{sv})', [(await sharing.list()).map(packed)]));
  }

  async RevokeAsync([id]: [string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await refuseSandboxed(invocation, 'stop what is shared')) return;
    await sharing.revoke(id);
    invocation.return_value(null);
  }

  destroy(): void {
    this.unwatch();
    this.dbus.unexport();
  }
}
