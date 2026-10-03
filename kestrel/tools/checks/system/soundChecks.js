import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {checker} from '../portal/backend.js';

const require = checker('sound');

export async function checkSound({pause, keyboard}) {
  const mixer = Shell.Mixer.get_default();
  const until = async condition => {
    for (let tries = 0; tries < 60 && !condition(); tries++)
      await pause(50);
    return condition();
  };
  const press = key => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), key, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), key, Clutter.KeyState.RELEASED);
  };
  const device = name => mixer.get_devices(true).find(candidate => candidate.get_description() === name);

  require(await until(() => mixer.output?.description === 'Speakers' && mixer.input?.description === 'Microphone'),
    'the default speakers and microphone are found');
  require(device('Speakers')?.get_active() && device('Headphones') && !device('Headphones').get_active(),
    'every output is offered with the current one marked');

  const {output} = mixer;
  const volume = output.volume;
  try {
    output.set_volume(0.5);
    press(Clutter.KEY_AudioRaiseVolume);
    require(await until(() => Math.abs(output.volume - 0.56) < 0.01), 'the volume key raises the volume by a step');
    press(Clutter.KEY_AudioMute);
    require(await until(() => output.muted), 'the mute key mutes the speakers');
    press(Clutter.KEY_AudioMute);
    require(await until(() => !output.muted), 'and unmutes them again');
  } finally {
    output.set_volume(volume);
  }

  mixer.activate_device(device('Headphones'));
  require(await until(() => mixer.output?.description === 'Headphones' && device('Headphones')?.get_active()),
    'choosing the headphones moves sound there');
  mixer.activate_device(device('Speakers'));
  require(await until(() => mixer.output?.description === 'Speakers'), 'and back to the speakers');

  const recorder = Gio.Subprocess.new(['parecord', '--device=microphone', '/dev/null'], Gio.SubprocessFlags.NONE);
  try {
    require(await until(() => mixer.recording), 'an app recording from the microphone shows');
  } finally {
    recorder.force_exit();
  }
  require(await until(() => !mixer.recording), 'and stops showing once it stops');
}
