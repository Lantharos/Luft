import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

const SCHEME = 'x-scheme-handler/kestrel-settings';
const LINKS = new Map([
  ['Sound Settings', 'kestrel-settings:sound'],
  ['Power Settings', 'kestrel-settings:power'],
  ['All Networks', 'kestrel-settings:network'],
]);

function recordingHandler(opened) {
  const applications = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(applications, 0o755);
  const desktop = GLib.build_filenamev([applications, 'com.lantharos.SettingsLinkCheck.desktop']);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=Settings Link Check\nExec=sh -c 'printf "%%s\\n" "$1" >> ${opened}' settings %u\nMimeType=${SCHEME};\nNoDisplay=true\n`);
  return desktop;
}

export async function checkSettingsLinks({pause, actorNamed}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel settings link check failed: ${label}`);
    console.log(`Kestrel settings link check: ${label}`);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const opened = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel-settings-links.txt']);
  const desktop = recordingHandler(opened);
  const previous = Gio.AppInfo.get_default_for_type(SCHEME, false);
  const quick = actorNamed(global.stage, 'kestrel-quick-settings');
  try {
    Gio.DesktopAppInfo.new_from_filename(desktop).set_as_default_for_type(SCHEME);
    toggleSurface('quick');
    await pause(450);
    const items = descendants(quick).filter(actor => LINKS.has(actor.label?.text));
    require([...LINKS.keys()].every(title => items.some(item => item.label.text === title)),
      'quick settings menus offer their Settings pages');
    for (const item of items) {
      item.activate(null);
      await pause(150);
    }
    await pause(500);
    const [, contents] = GLib.file_get_contents(opened);
    const links = new TextDecoder().decode(contents).trim().split('\n').sort();
    const expected = items.map(item => LINKS.get(item.label.text)).sort();
    require(links.join() === expected.join(), 'each menu opens its own Settings page');
  } finally {
    if (quick.visible) toggleSurface('quick');
    if (previous) previous.set_as_default_for_type(SCHEME);
    else Gio.AppInfo.reset_type_associations(SCHEME);
    GLib.unlink(desktop);
    GLib.unlink(opened);
  }
}
