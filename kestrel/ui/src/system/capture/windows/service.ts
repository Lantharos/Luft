import Gio from 'gi://Gio';

import { answerOf, watchStore, WINDOW_CAPTURE } from '../../../shared/dbus/permissionStore.js';
import { WindowCaptureAccess } from './access.js';
import { windowCaptures } from './captures.js';
import { returnError } from './errors.js';
import { requester } from './requester.js';

const WINDOW_CAPTURE_XML = `<node><interface name="com.lantharos.Kestrel.WindowCapture">
  <method name="RequestAccess"/>
</interface></node>`;

export class WindowCaptureService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(WINDOW_CAPTURE_XML, this);
  private readonly access = new WindowCaptureAccess();
  private readonly unwatchStore = watchStore([WINDOW_CAPTURE], (_permission, apps) => windowCaptures.stopUnless(app => answerOf(apps, app) === 'yes'));

  constructor() {
    windowCaptures.follow();
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/WindowCapture');
  }

  destroy(): void {
    this.dbus.unexport();
    this.unwatchStore();
    this.access.destroy();
    windowCaptures.unfollow();
  }

  async RequestAccessAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    try {
      const caller = await requester(invocation);
      if (caller) await this.access.require(caller);
      invocation.return_value(null);
    } catch (error) {
      returnError(invocation, error);
    }
  }
}
