import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';

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

export async function checkControls({pause, capture, events, find, visible, require, click, output}) {
  const menu = find('kestrel-context-menu');
  const session = find('kestrel-greeter-session');
  const checked = label => find(label, menu)?.get_child().get_children().some(child => child.icon_name === 'object-select-symbolic');

  require(visible(session) && session.get_child().text === 'Sway', 'the session picker starts with the person’s last session');
  await click(session);
  require(visible(menu) && find('Kestrel', menu) && checked('Sway'), 'the session picker lists every session');
  await capture(`${output}/login-session-picker.png`);
  await click(find('Kestrel', menu));
  require(!visible(menu) && session.get_child().text === 'Kestrel', 'choosing a session shows it');

  const layout = find('kestrel-input-source');
  require(visible(layout) && layout.get_child().text === 'EN', 'the keyboard layout can be switched');

  const label = session.get_child();
  require(Pango.FontDescription.from_string(label.clutter_text.font_name).get_family() === 'Open Runde', 'the login screen draws its text in Open Runde');
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const height = label.height;
  await click(find('kestrel-greeter-accessibility'));
  await click(find('Larger text', menu));
  require(settings.get_double('text-scaling-factor') > 1 && label.height > height, 'larger text can be turned on');
  await click(find('kestrel-greeter-accessibility'));
  await click(find('Larger text', menu));
  require(settings.get_double('text-scaling-factor') === 1, 'and off again');

  await click(find('kestrel-greeter-power'));
  require(['Suspend', 'Restart', 'Power off'].every(label => find(label, menu)), 'the power menu offers suspend, restart and power off');
  await capture(`${output}/login-power-menu.png`);
  await click(find('Suspend', menu));
  require(events().some(event => event.type === 'power' && event.action === 'suspend'), 'suspend asks the system to suspend');
  await pause(300);

  await click(find('kestrel-greeter-power'));
  await click(find('Power off', menu), 450);
  require(events().some(event => event.type === 'power' && event.action === 'power-off') && await brightnessAtCenter() < 4,
    'powering off fades the login screen to black before asking the system');
  await pause(700);
  require(await brightnessAtCenter() > 20, 'the login screen comes back when the system refuses to power off');
}
