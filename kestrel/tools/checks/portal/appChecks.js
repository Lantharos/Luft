import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import { call, checker, clicker, descendants, labelled, portalDialog, requestHandle } from './backend.js';

const require = checker('portal');

async function checkAppChooser({pause, capture, output, click}) {
  const ids = Gio.AppInfo.get_recommended_for_type('text/plain').map(info => info.get_id().replace(/\.desktop$/, ''));
  require(ids.length >= 2, 'the session has apps for text files to choose from');
  const handle = requestHandle();
  const chosen = call('AppChooser', 'ChooseApplication', new GLib.Variant('(ossasa{sv})', [handle, 'com.lantharos.rover', '', ids.slice(0, 1), {
    content_type: new GLib.Variant('s', 'text/plain'),
    filename: new GLib.Variant('s', 'Shopping list.txt'),
    last_choice: new GLib.Variant('s', ids[1]),
  }]), '(ua{sv})');
  await pause(500);
  await call('AppChooser', 'UpdateChoices', new GLib.Variant('(oas)', [handle, ids.slice(0, 3)]), null);
  await pause(300);
  const dialog = portalDialog();
  const rows = descendants(dialog).filter(actor => actor.has_style_class_name?.('kestrel-portal-row'));
  require(rows.length === Math.min(ids.length, 3) && rows[0].checked, 'the app chooser lists new apps and starts on the last choice');
  await capture(`${output}/portal-app-chooser.png`);
  await click(labelled(dialog, 'Open'));
  const [response, results] = (await chosen).recursiveUnpack();
  require(response === 0 && results.choice === ids[1], 'the chosen app is handed back');
}

async function checkDynamicLauncher({pause, capture, output, click}) {
  const bytes = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="14" fill="#6b8cff"/></svg>');
  const icon = new Gio.BytesIcon({bytes: new GLib.Bytes(bytes)}).serialize();
  const prepared = call('DynamicLauncher', 'PrepareInstall', new GLib.Variant('(osssva{sv})', [requestHandle(), 'org.mozilla.firefox', '', 'Weather', icon, {
    launcher_type: new GLib.Variant('u', 2),
    target: new GLib.Variant('s', 'https://weather.example.org/today'),
  }]), '(ua{sv})');
  await pause(600);
  const dialog = portalDialog();
  require(descendants(dialog).some(actor => actor.text === 'weather.example.org will open in its own window from Start.'), 'web apps name the site they open');
  await capture(`${output}/portal-web-app.png`);
  const entry = descendants(dialog).find(actor => actor instanceof St.Entry);
  entry.text = 'Forecast';
  await click(labelled(dialog, 'Add'));
  const [response, results] = (await prepared).deepUnpack();
  require(response === 0 && results.name.unpack() === 'Forecast' && results.icon.unpack().equal(icon), 'the edited name and the icon are handed back');
  const token = appId => call('DynamicLauncher', 'RequestInstallToken', new GLib.Variant('(sa{sv})', [appId, {}]), '(u)').then(reply => reply.deepUnpack()[0]);
  require(await token('com.lantharos.schelf') === 0 && await token('org.example.Random') === 2, 'only Schelf installs launchers without asking');
}

async function checkEmail({pause}) {
  const sent = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel-mailto.txt']);
  const applications = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(applications, 0o755);
  const desktop = GLib.build_filenamev([applications, 'com.lantharos.MailCheck.desktop']);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=Mail Check\nExec=sh -c 'printf %%s "$1" > ${sent}' mail %u\nMimeType=x-scheme-handler/mailto;\nNoDisplay=true\n`);
  const previous = Gio.AppInfo.get_default_for_uri_scheme('mailto');
  try {
    Gio.DesktopAppInfo.new_from_filename(desktop).set_as_default_for_type('x-scheme-handler/mailto');
    const [response] = (await call('Email', 'ComposeEmail', new GLib.Variant('(ossa{sv})', [requestHandle(), 'org.gnome.TextEditor', '', {
      address: new GLib.Variant('s', 'ayesha@example.org'),
      cc: new GLib.Variant('as', ['sam@example.org']),
      subject: new GLib.Variant('s', 'Dinner & drinks'),
      body: new GLib.Variant('s', 'See you at seven?'),
    }]), '(ua{sv})')).deepUnpack();
    await pause(500);
    const [, contents] = GLib.file_get_contents(sent);
    require(response === 0 && new TextDecoder().decode(contents) === 'mailto:ayesha@example.org?cc=sam@example.org&subject=Dinner%20%26%20drinks&body=See%20you%20at%20seven%3F',
      'emails open in the mail app with their recipients, subject and text');
  } finally {
    if (previous) previous.set_as_default_for_type('x-scheme-handler/mailto');
    else Gio.AppInfo.reset_type_associations('x-scheme-handler/mailto');
    GLib.unlink(desktop);
    GLib.unlink(sent);
  }
}

async function checkBackground() {
  const [states] = (await call('Background', 'GetAppState', null, '(a{sv})')).deepUnpack();
  require(typeof states === 'object', 'apps running in the background can be listed');
  const [response, results] = (await call('Background', 'NotifyBackground', new GLib.Variant('(oss)', [requestHandle(), 'org.example.Player', 'Player']), '(ua{sv})')).recursiveUnpack();
  require(response === 0 && results.result === 1, 'apps may keep running in the background');
}

async function checkNotification({pause}) {
  const appId = 'com.lantharos.rover';
  const sources = () => Main.messageTray.getSources().filter(source => source.title === Gio.DesktopAppInfo.new(`${appId}.desktop`).get_name());
  await call('Notification', 'AddNotification', new GLib.Variant('(ssa{sv})', [appId, 'reminder', {
    title: new GLib.Variant('s', 'Pick up the parcel'),
    body: new GLib.Variant('s', 'The shop closes at six.'),
  }]), null);
  await pause(300);
  require(sources().some(source => source.notifications.some(notification => notification.title === 'Pick up the parcel')), 'apps can show notifications');
  await call('Notification', 'RemoveNotification', new GLib.Variant('(ss)', [appId, 'reminder']), null);
  await pause(300);
  require(!sources().some(source => source.notifications.some(notification => notification.title === 'Pick up the parcel')), 'apps can withdraw their notifications');
}

export async function checkAppPortals({pause, capture, output, pointer}) {
  const click = clicker(pointer, pause);
  await checkAppChooser({pause, capture, output, click});
  await checkDynamicLauncher({pause, capture, output, click});
  await checkEmail({pause});
  await checkBackground();
  await checkNotification({pause});
}
