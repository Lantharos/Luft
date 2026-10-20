import Gio from 'gi://Gio';

import { refuseSandboxed } from '../../shared/sandbox.js';
import { soundPlayer } from './player.js';
import { onlyErrors } from './situation.js';
import { playNamedSound } from './sounds.js';

const SOUNDS_XML = `<node><interface name="com.lantharos.Kestrel.Sounds">
  <method name="Play"><arg type="s" name="name" direction="in"/></method>
  <method name="Preview"><arg type="s" name="name" direction="in"/></method>
</interface></node>`;

export class SoundService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(SOUNDS_XML, this);

  constructor() {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Sounds');
  }

  PlayAsync([name]: [string], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'play system sounds').then(refused => {
      if (refused) return;
      playNamedSound(name);
      invocation.return_value(null);
    });
  }

  PreviewAsync([name]: [string], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'play system sounds').then(refused => {
      if (refused) return;
      if (!onlyErrors()) soundPlayer().play(name);
      invocation.return_value(null);
    });
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
