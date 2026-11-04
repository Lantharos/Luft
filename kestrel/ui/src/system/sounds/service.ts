import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { refuseSandboxed } from '../../shared/dbus/sandbox.js';
import { onlyErrors } from './situation.js';
import { playNamedSound } from './sounds.js';

const SOUNDS_XML = `<node><interface name="com.lantharos.Kestrel.Sounds">
  <method name="Play"><arg type="s" name="name" direction="in"/></method>
  <method name="Preview"><arg type="s" name="name" direction="in"/></method>
  <method name="Check">
    <arg type="s" name="path" direction="in"/>
    <arg type="s" name="verdict" direction="out"/>
  </method>
</interface></node>`;

type Verdict = 'playable' | 'too-long' | 'unplayable';

function verdictOf(player: Shell.SoundPlayer, result: Gio.AsyncResult): Verdict {
  try {
    player.check_file_finish(result);
    return 'playable';
  } catch (error) {
    return error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.MESSAGE_TOO_LARGE) ? 'too-long' : 'unplayable';
  }
}

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
      if (!onlyErrors()) Shell.SoundPlayer.get_default().play(name);
      invocation.return_value(null);
    });
  }

  CheckAsync([path]: [string], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'check system sounds').then(refused => {
      if (refused) return;
      const player = Shell.SoundPlayer.get_default();
      player.check_file(Gio.File.new_for_path(path), null, (_source, result) =>
        invocation.return_value(new GLib.Variant('(s)', [verdictOf(player, result)])));
    });
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
