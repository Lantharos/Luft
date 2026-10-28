import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

const [images, state] = ARGV;

interface LoginConfig {
  hiddenUsers: string[];
  showUsers: boolean;
  numLock: boolean;
  shownUser: number;
}

const require = (condition: boolean, label: string) => {
  if (!condition) throw new Error(`Kestrel login screen check failed: ${label}`);
  console.log(`Kestrel login screen check: ${label}`);
};

function call(method: string, parameters: GLib.Variant, fds: Gio.UnixFDList | null = null) {
  return Gio.DBus.system.call_with_unix_fd_list_sync('com.lantharos.Greeter1', '/com/lantharos/Greeter1',
    'com.lantharos.Greeter1', method, parameters, null, Gio.DBusCallFlags.NONE, -1, fds, null);
}

function descriptorOf(stream: Gio.InputStream) {
  if (!(stream instanceof GioUnix.FileDescriptorBased)) throw new Error('Kestrel login screen check needs local files');
  return stream.get_fd();
}

const wallpaper = Gio.File.new_for_path(`${images}/sam-wallpaper.png`).read(null);
const fds = new Gio.UnixFDList();
fds.append(descriptorOf(wallpaper));
call('SetAppearance', new GLib.Variant('(h(dd))', [0, [0.5, 0.75]]), fds);
const folder = `${state}/users/${new Gio.Credentials().get_unix_user()}`;
const [, header] = Gio.File.new_for_path(`${folder}/wallpaper.jpg`).load_contents(null);
require(header[0] === 0xff && header[1] === 0xd8, 'the desktop wallpaper is stored for the login screen as a still');
const details: {focus: [number, number]} = JSON.parse(new TextDecoder().decode(Gio.File.new_for_path(`${folder}/wallpaper.json`).load_contents(null)[1]));
require(details.focus[0] === 0.5 && details.focus[1] === 0.75, 'the part of the wallpaper kept on screen goes with it');

const user = GLib.get_user_name();
call('SetHiddenUsers', new GLib.Variant('(as)', [[user]]));
const config: LoginConfig = JSON.parse(new TextDecoder().decode(Gio.File.new_for_path(`${state}/config.json`).load_contents(null)[1]));
require(config.hiddenUsers.includes(user) && config.showUsers, 'hidden people are saved for the login screen');

const readJson = (path: string): LoginConfig => JSON.parse(new TextDecoder().decode(Gio.File.new_for_path(path).load_contents(null)[1]));
const shownDisplays = Gio.File.new_for_path(`${state}/display/monitors.xml`);
const arrangementPath = `${state}/../monitors.xml`;
GLib.file_set_contents(arrangementPath, '<monitors version="2"></monitors>');
const arrangement = Gio.File.new_for_path(arrangementPath).read(null);
const displayFds = new Gio.UnixFDList();
displayFds.append(descriptorOf(arrangement));
call('SetDisplays', new GLib.Variant('(h)', [0]), displayFds);
call('SetNumLock', new GLib.Variant('(b)', [false]));
call('SetSignInMethod', new GLib.Variant('(s)', ['fingerprint']));
const signInMethod = () => new TextDecoder().decode(Gio.File.new_for_path(`${folder}/sign-in-method`).load_contents(null)[1]);
require(signInMethod() === 'fingerprint', 'the way someone last unlocked is kept for the login screen');
require(Gio.File.new_for_path(`${folder}/monitors.xml`).query_exists(null) && !shownDisplays.query_exists(null)
  && readJson(`${state}/config.json`).numLock, 'displays and keyboard state wait for their owner to sign in');

const [sessionId] = Gio.DBus.system.call_sync('com.lantharos.Greeter1', '/com/lantharos/Greeter1', 'org.freedesktop.DBus.Properties',
  'Get', new GLib.Variant('(ss)', ['com.lantharos.Greeter1', 'Sessions']), null, Gio.DBusCallFlags.NONE, -1, null).recursiveUnpack<[[string, string][]]>()[0][0];
try {
  call('RememberSession', new GLib.Variant('(sss)', [user, sessionId, 'password']));
} catch {}
const shown = readJson(`${state}/config.json`);
require(shown.shownUser === new Gio.Credentials().get_unix_user() && !shown.numLock && shownDisplays.query_exists(null),
  'the login screen follows the last person who signed in');
require(signInMethod() === 'password', 'signing in on the login screen remembers how');
call('SetNumLock', new GLib.Variant('(b)', [true]));
