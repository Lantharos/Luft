import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { developmentPath } from '../../shared/apps/development.js';
import { promptGate } from '../../shared/dialogs/promptGate.js';
import { callerProcess } from '../../shared/dbus/processes.js';
import { callerRuns, refuseSandboxed } from '../../shared/dbus/sandbox.js';
import { apply, serviceValues, systemValues } from './apply.js';
import { ReviewDialog } from './dialog.js';
import { currentOf, describe, Invalid, requested } from './items.js';
import { requester } from './requester.js';

const PATH = '/com/lantharos/Kestrel/Changes';
const ERROR = 'com.lantharos.Kestrel.Changes1.Error';
const LUFT = '/usr/bin/luft';
const WINDOW = 60_000;
const PER_WINDOW = 5;

const SERVICE_XML = `<node>
  <interface name="com.lantharos.Kestrel.Changes1">
    <method name="Review">
      <arg type="a(sv)" name="changes" direction="in"/>
      <arg type="b" name="approved" direction="out"/>
      <arg type="aa{sv}" name="restore" direction="out"/>
      <arg type="s" name="requester" direction="out"/>
      <arg type="s" name="error" direction="out"/>
    </method>
  </interface>
</node>`;

type Invocation = Gio.DBusMethodInvocation;

function luftPrograms(): string[] {
  const built = developmentPath('KESTREL_LUFT_APPS');
  return built ? [LUFT, `${built}/luft`] : [LUFT];
}

const refuse = (invocation: Invocation, kind: string, message: string) => invocation.return_dbus_error(`${ERROR}.${kind}`, message);

/**
 * Shows a set of changes luft was asked to make, all in one review, and makes
 * them once someone at the screen approves. It only answers luft from the
 * system image, reads every current value itself and makes exactly what it
 * showed, so neither what luft sends nor anything it runs for can change a
 * setting without that review.
 */
export class ChangesService {
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(SERVICE_XML, this);
  private readonly asked: number[] = [];
  private open: ReviewDialog | null = null;

  constructor() {
    this.exported.export(Gio.DBus.session, PATH);
  }

  async ReviewAsync([changes]: [[string, GLib.Variant][]], invocation: Invocation): Promise<void> {
    if (await refuseSandboxed(invocation, 'ask for changes')) return;
    if (!await callerRuns(invocation, luftPrograms())) {
      refuse(invocation, 'NotLuft', 'Only luft from the system image can ask for a review of changes');
      return;
    }
    if (promptGate.locked) {
      refuse(invocation, 'Locked', 'The screen is locked. Unlock it and ask again.');
      return;
    }
    if (this.open) {
      refuse(invocation, 'Busy', 'Another set of changes is waiting for review.');
      return;
    }
    const now = GLib.get_monotonic_time() / 1000;
    while (this.asked.length && now - this.asked[0] > WINDOW) this.asked.shift();
    if (this.asked.length >= PER_WINDOW) {
      refuse(invocation, 'TooMany', 'Too many reviews were asked for in the last minute. Wait a little and ask again.');
      return;
    }
    this.asked.push(now);
    try {
      await this.review(changes, invocation);
    } catch (error) {
      if (error instanceof Invalid) refuse(invocation, 'Invalid', error.message);
      else invocation.return_dbus_error(`${ERROR}.Failed`, String(error));
    }
  }

  private async review(changes: [string, GLib.Variant][], invocation: Invocation): Promise<void> {
    const { catalogue, changes: checked } = await requested(changes);
    const settings = checked.map(change => change.setting);
    const system = await systemValues(settings.flatMap(setting => (setting.system ? [setting.system] : [])));
    const service = await serviceValues(settings.flatMap(setting => (setting.service ? [setting.service] : [])));
    const current = settings.map(setting => currentOf(setting, catalogue.matches, system, service));
    const items = checked.map((change, index) => describe(change, current[index]));
    const process = await callerProcess(invocation);
    const asking = process?.pid ? requester(process.pid) : null;
    process?.close();
    const administrator = settings.some(setting => setting.system);
    let finished = false;
    let watch = 0;
    const finish = (reply: [boolean, Record<string, GLib.Variant>[], string] | null) => {
      if (finished) return;
      finished = true;
      this.open = null;
      Gio.bus_unwatch_name(watch);
      if (reply) invocation.return_value(new GLib.Variant('(baa{sv}ss)', [reply[0], reply[1], asking ?? '', reply[2]]));
    };
    const dialog = new ReviewDialog(items, asking, administrator, {
      approve: () => {
        finished = true;
        Gio.bus_unwatch_name(watch);
        void apply(checked, current).then(({ made, restore, error }) => {
          this.open = null;
          invocation.return_value(new GLib.Variant('(baa{sv}ss)', [made, restore, asking ?? '', error]));
        });
      },
      decline: () => finish([false, [], '']),
    });
    this.open = dialog;
    watch = Gio.bus_watch_name_on_connection(Gio.DBus.session, invocation.get_sender()!, Gio.BusNameWatcherFlags.NONE, null, () => {
      finish(null);
      dialog.close();
    });
    if (!dialog.open()) {
      finish(null);
      refuse(invocation, 'Locked', 'The review couldn’t be shown. Unlock the screen and ask again.');
    }
  }

  destroy(): void {
    this.open?.close();
    this.exported.unexport();
  }
}
