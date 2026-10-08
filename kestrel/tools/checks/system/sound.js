import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {spawn, stop} from '../lib/processes.js';

const {require, eventually} = checks('sound');

export async function run() {
  const mixer = Shell.Mixer.get_default();
  const device = name => mixer.get_devices(true).find(candidate => candidate.get_description() === name);

  await eventually(() => mixer.output?.description === 'Speakers' && mixer.input?.description === 'Microphone',
    'the default speakers and microphone are found');
  require(device('Speakers')?.get_active() && device('Headphones') && !device('Headphones').get_active(),
    'every output is offered with the current one marked');

  const {output} = mixer;
  const volume = output.volume;
  try {
    output.set_volume(0.5);
    press(Clutter.KEY_AudioRaiseVolume);
    await eventually(() => Math.abs(output.volume - 0.56) < 0.01, 'the volume key raises the volume by a step');
    press(Clutter.KEY_AudioMute);
    await eventually(() => output.muted, 'the mute key mutes the speakers');
    press(Clutter.KEY_AudioMute);
    await eventually(() => !output.muted, 'and unmutes them again');
  } finally {
    output.set_volume(volume);
  }

  mixer.activate_device(device('Headphones'));
  await eventually(() => mixer.output?.description === 'Headphones' && device('Headphones')?.get_active(), 'choosing the headphones moves sound there');
  mixer.activate_device(device('Speakers'));
  await eventually(() => mixer.output?.description === 'Speakers', 'and back to the speakers');

  const recorder = spawn(['parecord', '--device=microphone', '/dev/null']);
  await eventually(() => mixer.recording, 'an app recording from the microphone shows');
  await stop(recorder);
  await eventually(() => !mixer.recording, 'and stops showing once it stops');
}
