import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import { openSettings } from '../settings/pages.js';

Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');
Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_async');

const INCIDENTS = Gio.File.new_for_path('/var/lib/kestrel-watchdog/incidents');
const LAST_NOTIFIED = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'last-incident']));
const BATCH = 32;

interface Incident {
  id: string;
  time: number;
}

async function text(file: Gio.File): Promise<string | null> {
  try {
    const [contents] = await file.load_contents_async(null);
    return new TextDecoder().decode(contents);
  } catch {
    return null;
  }
}

async function newestIncident(): Promise<Incident | null> {
  let newest: Incident | null = null;
  try {
    const children = await INCIDENTS.enumerate_children_async(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_LOW, null);
    for (let batch = await children.next_files_async(BATCH, GLib.PRIORITY_LOW, null); batch.length; batch = await children.next_files_async(BATCH, GLib.PRIORITY_LOW, null)) {
      for (const info of batch) {
        if (!info.get_name().endsWith('.json')) continue;
        const contents = await text(INCIDENTS.get_child(info.get_name()));
        const incident = contents ? JSON.parse(contents) as Incident : null;
        if (incident && (!newest || incident.time > newest.time)) newest = incident;
      }
    }
  } catch {
    return null;
  }
  return newest;
}

function when(time: number): string {
  const happened = GLib.DateTime.new_from_unix_local(time);
  const today = GLib.DateTime.new_now_local();
  if (happened.get_ymd().join() === today.get_ymd().join()) return `today at ${happened.format('%H:%M')}`;
  return `on ${happened.format('%-d %B')} at ${happened.format('%H:%M')}`;
}

export async function notifyAboutIncidents(): Promise<void> {
  const incident = await newestIncident();
  if (!incident || (await text(LAST_NOTIFIED))?.trim() === incident.id) return;
  GLib.mkdir_with_parents(LAST_NOTIFIED.get_parent()!.get_path()!, 0o700);
  await LAST_NOTIFIED.replace_contents_async(new TextEncoder().encode(`${incident.id}\n`), null, false, Gio.FileCreateFlags.NONE, null);
  const source = MessageTray.getSystemSource();
  const notification = new MessageTray.Notification({
    source,
    title: 'The graphics driver stopped responding',
    body: `Your computer restarted itself ${when(incident.time)}. Settings shows what can keep it from happening again.`,
    gicon: new Gio.ThemedIcon({ name: 'video-display-symbolic' }),
    privacyScope: MessageTray.PrivacyScope.SYSTEM,
  });
  notification.addAction('Details', () => openSettings('about'));
  source.addNotification(notification);
}
