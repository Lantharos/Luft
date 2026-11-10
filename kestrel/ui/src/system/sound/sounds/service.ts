import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { refuseSandboxed } from '../../../shared/dbus/sandbox.js';
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

const SOUND_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const PLAYS_PER_SECOND = 4;

class SenderPace {
  private readonly recent = new Map<string, number[]>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  admit(sender: string): boolean {
    const now = GLib.get_monotonic_time() / 1000;
    for (const [other, times] of this.recent)
      if (times.at(-1)! <= now - this.windowMs) this.recent.delete(other);
    const times = (this.recent.get(sender) ?? []).filter(time => time > now - this.windowMs);
    if (times.length >= this.limit) return false;
    this.recent.set(sender, [...times, now]);
    return true;
  }
}

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
  private readonly plays = new SenderPace(PLAYS_PER_SECOND, 1000);

  constructor() {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Sounds');
  }

  PlayAsync([name]: [string], invocation: Gio.DBusMethodInvocation): void {
    if (!SOUND_NAME.test(name)) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', 'Sounds are played by name');
      return;
    }
    if (this.plays.admit(invocation.get_sender()!)) playNamedSound(name);
    invocation.return_value(null);
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
