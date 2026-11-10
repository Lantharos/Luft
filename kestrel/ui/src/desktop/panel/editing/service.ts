import Gio from 'gi://Gio';

import { refuseSandboxed } from '../../../shared/dbus/sandbox.js';

const TASKBAR_XML = `<node><interface name="com.lantharos.Kestrel.Taskbar">
  <method name="Arrange"/>
</interface></node>`;

export class TaskbarService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(TASKBAR_XML, this);

  constructor(private readonly arrange: () => void) {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Taskbar');
  }

  ArrangeAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'arrange the taskbar').then(refused => {
      if (refused) return;
      this.arrange();
      invocation.return_value(null);
    });
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
