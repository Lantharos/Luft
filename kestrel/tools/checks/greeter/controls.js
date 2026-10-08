import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';

import {named, shown} from '../lib/actors.js';
import {click} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {eventually, events, require} from './prompt.js';

function brightnessAtCenter() {
  const screenshot = new Shell.Screenshot();
  return new Promise((resolve, reject) => screenshot.pick_color(global.stage.width / 2, global.stage.height / 2, (source, result) => {
    try {
      const [, color] = source.pick_color_finish(result);
      resolve(Math.max(color.red, color.green, color.blue));
    } catch (error) {
      reject(error);
    }
  }));
}

const happened = (type, action) => events().some(event => event.type === type && event.action === action);

export async function checkControls() {
  const menu = named('kestrel-context-menu');
  const session = named('kestrel-greeter-session');
  const checked = label => named(label, menu)?.get_child().get_children().some(child => child.icon_name === 'object-select-symbolic');
  const choose = async (opener, item) => {
    click(named(opener));
    await eventually(() => shown(menu) && shown(named(item, menu)), `the menu offers ${item}`);
    click(named(item, menu));
  };

  require(shown(session) && session.get_child().text === 'Sway', 'the session picker starts with the person’s last session');
  click(session);
  await eventually(() => shown(menu) && named('Kestrel', menu) && checked('Sway'), 'the session picker lists every session');
  await capture('login-session-picker');
  click(named('Kestrel', menu));
  await eventually(() => !shown(menu) && session.get_child().text === 'Kestrel', 'choosing a session shows it');

  const layout = named('kestrel-input-source');
  require(shown(layout) && layout.get_child().text === 'EN', 'the keyboard layout can be switched');

  const label = session.get_child();
  require(Pango.FontDescription.from_string(label.clutter_text.font_name).get_family() === 'Open Runde', 'the login screen draws its text in Open Runde');
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const height = label.height;
  await choose('kestrel-greeter-accessibility', 'Larger text');
  await eventually(() => settings.get_double('text-scaling-factor') > 1 && label.height > height, 'larger text can be turned on');
  await eventually(() => !shown(menu), 'the accessibility menu closes');
  await choose('kestrel-greeter-accessibility', 'Larger text');
  await eventually(() => settings.get_double('text-scaling-factor') === 1, 'and off again');
  await eventually(() => !shown(menu), 'the accessibility menu closes again');

  click(named('kestrel-greeter-power'));
  await eventually(() => shown(menu) && ['Suspend', 'Restart', 'Power off'].every(item => named(item, menu)),
    'the power menu offers suspend, restart and power off');
  await capture('login-power-menu');
  click(named('Suspend', menu));
  await eventually(() => happened('power', 'suspend'), 'suspend asks the system to suspend');
  await eventually(() => !shown(menu), 'the power menu closes');

  await choose('kestrel-greeter-power', 'Power off');
  await eventually(async () => happened('power', 'power-off') && await brightnessAtCenter() < 4,
    'powering off fades the login screen to black before asking the system');
  await eventually(async () => await brightnessAtCenter() > 20, 'the login screen comes back when the system refuses to power off');
}
