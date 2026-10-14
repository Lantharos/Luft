import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const [images, state] = ARGV;

const require = (condition, label) => {
  if (!condition) throw new Error(`Kestrel login screen check failed: ${label}`);
  console.log(`Kestrel login screen check: ${label}`);
};

function call(method, parameters, fds = null) {
  return Gio.DBus.system.call_with_unix_fd_list_sync('com.lantharos.Greeter1', '/com/lantharos/Greeter1',
    'com.lantharos.Greeter1', method, parameters, null, Gio.DBusCallFlags.NONE, -1, fds, null);
}

const wallpaper = Gio.File.new_for_path(`${images}/kristof-wallpaper.png`).read(null);
const fds = new Gio.UnixFDList();
fds.append(wallpaper.get_fd());
call('SetAppearance', new GLib.Variant('(h(dd))', [0, [0.5, 0.75]]), fds);
const folder = `${state}/users/${new Gio.Credentials().get_unix_user()}`;
const [, header] = Gio.File.new_for_path(`${folder}/wallpaper.jpg`).load_contents(null);
require(header[0] === 0xff && header[1] === 0xd8, 'the desktop wallpaper is stored for the login screen as a still');
const details = JSON.parse(new TextDecoder().decode(Gio.File.new_for_path(`${folder}/wallpaper.json`).load_contents(null)[1]));
require(details.focus[0] === 0.5 && details.focus[1] === 0.75, 'the part of the wallpaper kept on screen goes with it');

call('SetHiddenUsers', new GLib.Variant('(as)', [['kristof']]));
const config = JSON.parse(new TextDecoder().decode(Gio.File.new_for_path(`${state}/config.json`).load_contents(null)[1]));
require(config.hiddenUsers.includes('kristof') && config.showUsers, 'hidden people are saved for the login screen');
