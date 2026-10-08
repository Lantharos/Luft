import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, labelled, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click} from '../lib/input.js';
import {call, portalDialog, requestHandle} from '../lib/portal.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('portal');

async function openedDialog(label) {
  await eventually(() => portalDialog(), label);
  await settled();
  return portalDialog();
}

async function checkAppChooser() {
  const ids = Gio.AppInfo.get_recommended_for_type('text/plain').map(info => info.get_id().replace(/\.desktop$/, ''));
  require(ids.length >= 2, 'the session has apps for text files to choose from');
  const handle = requestHandle();
  const chosen = call('AppChooser', 'ChooseApplication', new GLib.Variant('(ossasa{sv})', [handle, 'com.lantharos.rover', '', ids.slice(0, 1), {
    content_type: new GLib.Variant('s', 'text/plain'),
    filename: new GLib.Variant('s', 'Shopping list.txt'),
    last_choice: new GLib.Variant('s', ids[1]),
  }]), '(ua{sv})');
  const dialog = await openedDialog('opening a file asks which app to use');
  await call('AppChooser', 'UpdateChoices', new GLib.Variant('(oas)', [handle, ids.slice(0, 3)]), null);
  const rows = () => styled('kestrel-portal-row', dialog);
  await eventually(() => rows().length === Math.min(ids.length, 3) && rows()[0].checked, 'the app chooser lists new apps and starts on the last choice');
  await capture('portal-app-chooser');
  click(labelled('Open', dialog));
  const [response, results] = (await chosen).recursiveUnpack();
  require(response === 0 && results.choice === ids[1], 'the chosen app is handed back');
}

async function checkDynamicLauncher() {
  const bytes = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="14" fill="#6b8cff"/></svg>');
  const icon = new Gio.BytesIcon({bytes: new GLib.Bytes(bytes)}).serialize();
  const prepared = call('DynamicLauncher', 'PrepareInstall', new GLib.Variant('(osssva{sv})', [requestHandle(), 'org.mozilla.firefox', '', 'Weather', icon, {
    launcher_type: new GLib.Variant('u', 2),
    target: new GLib.Variant('s', 'https://weather.example.org/today'),
  }]), '(ua{sv})');
  const dialog = await openedDialog('installing a web app asks first');
  require(showsText('weather.example.org will open in its own window from Start.', dialog), 'web apps name the site they open');
  await capture('portal-web-app');
  descendants(dialog).find(actor => actor instanceof St.Entry).text = 'Forecast';
  click(labelled('Add', dialog));
  const [response, results] = (await prepared).deepUnpack();
  require(response === 0 && results.name.unpack() === 'Forecast' && results.icon.unpack().equal(icon), 'the edited name and the icon are handed back');
  const token = appId => call('DynamicLauncher', 'RequestInstallToken', new GLib.Variant('(sa{sv})', [appId, {}]), '(u)').then(reply => reply.deepUnpack()[0]);
  require(await token('com.lantharos.schelf') === 0 && await token('org.example.Random') === 2, 'only Schelf installs launchers without asking');
}

async function checkEmail() {
  const sent = scratch('kestrel-mailto.txt');
  const applications = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(applications, 0o755);
  const desktop = GLib.build_filenamev([applications, 'com.lantharos.MailCheck.desktop']);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=Mail Check\nExec=sh -c 'printf %%s "$1" > ${sent}' mail %u\nMimeType=x-scheme-handler/mailto;\nNoDisplay=true\n`);
  const previous = Gio.AppInfo.get_default_for_uri_scheme('mailto');
  const mail = () => GLib.file_test(sent, GLib.FileTest.EXISTS) ? new TextDecoder().decode(GLib.file_get_contents(sent)[1]) : null;
  try {
    Gio.DesktopAppInfo.new_from_filename(desktop).set_as_default_for_type('x-scheme-handler/mailto');
    const [response] = (await call('Email', 'ComposeEmail', new GLib.Variant('(ossa{sv})', [requestHandle(), 'org.gnome.TextEditor', '', {
      address: new GLib.Variant('s', 'ayesha@example.org'),
      cc: new GLib.Variant('as', ['sam@example.org']),
      subject: new GLib.Variant('s', 'Dinner & drinks'),
      body: new GLib.Variant('s', 'See you at seven?'),
    }]), '(ua{sv})')).deepUnpack();
    require(response === 0, 'apps can compose emails');
    await eventually(() => mail() === 'mailto:ayesha@example.org?cc=sam@example.org&subject=Dinner%20%26%20drinks&body=See%20you%20at%20seven%3F',
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

async function checkNotification() {
  const appId = 'com.lantharos.rover';
  const name = Gio.DesktopAppInfo.new(`${appId}.desktop`).get_name();
  const shows = () => Main.messageTray.getSources().some(source => source.title === name &&
    source.notifications.some(notification => notification.title === 'Pick up the parcel'));
  await call('Notification', 'AddNotification', new GLib.Variant('(ssa{sv})', [appId, 'reminder', {
    title: new GLib.Variant('s', 'Pick up the parcel'),
    body: new GLib.Variant('s', 'The shop closes at six.'),
  }]), null);
  await eventually(shows, 'apps can show notifications');
  await call('Notification', 'RemoveNotification', new GLib.Variant('(ss)', [appId, 'reminder']), null);
  await eventually(() => !shows(), 'apps can withdraw their notifications');
}

export async function run() {
  await checkAppChooser();
  await checkDynamicLauncher();
  await checkEmail();
  await checkBackground();
  await checkNotification();
}
