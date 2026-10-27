import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {existing, named, ofType, shown} from '../lib/actors.js';
import {click} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {eventually, events, require} from './lib/prompt.js';

function brightnessAtCenter() {
  const screenshot = new Shell.Screenshot();
  return new Promise<number>((resolve, reject) => screenshot.pick_color(global.stage.width / 2, global.stage.height / 2, (_source, result) => {
    try {
      const [, color] = screenshot.pick_color_finish(result);
      resolve(Math.max(color.red, color.green, color.blue));
    } catch (error) {
      reject(error);
    }
  }));
}

const happened = (type: string, action: string) => events().some(event => event.type === type && event.action === action);

export async function checkControls() {
  const menu = existing('kestrel-context-menu');
  const session = ofType(named('kestrel-greeter-session'), St.Button);
  const label = ofType(session.get_child(), St.Label);
  const checked = (item: string) => {
    const button = named(item, menu);
    return button instanceof St.Button && button.get_first_child()?.get_children()
      .some(child => child instanceof St.Icon && child.icon_name === 'object-select-symbolic');
  };
  const choose = async (opener: string, item: string) => {
    click(existing(opener));
    await eventually(() => shown(menu) && shown(named(item, menu)), `the menu offers ${item}`);
    click(existing(item, menu));
  };

  require(shown(session) && label.text === 'Sway', 'the session picker starts with the person’s last session');
  click(session);
  await eventually(() => shown(menu) && named('Kestrel', menu) && checked('Sway'), 'the session picker lists every session');
  await capture('login-session-picker');
  click(existing('Kestrel', menu));
  await eventually(() => !shown(menu) && label.text === 'Kestrel', 'choosing a session shows it');

  const layout = ofType(named('kestrel-input-source'), St.Button);
  require(shown(layout) && ofType(layout.get_child(), St.Label).text === 'EN', 'the keyboard layout can be switched');

  require(Pango.FontDescription.from_string(label.clutter_text.font_name).get_family() === 'Open Runde', 'the login screen draws its text in Open Runde');
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const height = label.height;
  await choose('kestrel-greeter-accessibility', 'Larger text');
  await eventually(() => settings.get_double('text-scaling-factor') > 1 && label.height > height, 'larger text can be turned on');
  await eventually(() => !shown(menu), 'the accessibility menu closes');
  await choose('kestrel-greeter-accessibility', 'Larger text');
  await eventually(() => settings.get_double('text-scaling-factor') === 1, 'and off again');
  await eventually(() => !shown(menu), 'the accessibility menu closes again');

  click(existing('kestrel-greeter-power'));
  await eventually(() => shown(menu) && ['Suspend', 'Restart', 'Power off'].every(item => named(item, menu)),
    'the power menu offers suspend, restart and power off');
  await capture('login-power-menu');
  click(existing('Suspend', menu));
  await eventually(() => happened('power', 'suspend'), 'suspend asks the system to suspend');
  await eventually(() => !shown(menu), 'the power menu closes');

  await choose('kestrel-greeter-power', 'Power off');
  await eventually(async () => happened('power', 'power-off') && await brightnessAtCenter() < 4,
    'powering off fades the login screen to black before asking the system');
  await eventually(async () => await brightnessAtCenter() > 20, 'the login screen comes back when the system refuses to power off');
}
