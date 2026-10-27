import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import {QuickSlider, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, existing, labelled, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input/input.js';
import {spawn, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';

const {require, eventually} = checks('sound');

export async function run() {
  const mixer = Shell.Mixer.get_default();
  const device = (name: string) => mixer.get_devices(true).find(candidate => candidate.get_description() === name);

  const output = await eventually(() => mixer.output?.description === 'Speakers' && mixer.input?.description === 'Microphone' && mixer.output,
    'the default speakers and microphone are found');
  require(device('Speakers')?.get_active() && device('Headphones')?.get_active() === false,
    'every output is offered with the current one marked');

  toggleSurface('quick');
  const quick = existing('kestrel-quick-settings');
  await eventually(() => shown(quick), 'Quick Settings opens');
  const volume = require(descendants(quick).find((actor): actor is QuickSlider =>
    actor instanceof QuickSlider && actor.menu.actor.has_style_class_name('kestrel-inline-menu') && !!labelled('Headphones', actor.menu.actor)),
  'the volume slider lists the outputs');
  const outputs = volume.menu.actor;
  volume.menuButton.emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => shown(labelled('Headphones', outputs)) && outputs.height > 0, 'the outputs open beneath the volume slider');
  await capture('sound-outputs');
  volume.menu.close();
  toggleSurface('quick');
  await eventually(() => !quick.visible, 'Quick Settings closes');

  const level = output.volume;
  try {
    output.set_volume(0.5);
    press(Clutter.KEY_AudioRaiseVolume);
    await eventually(() => Math.abs(output.volume - 0.56) < 0.01, 'the volume key raises the volume by a step');
    press(Clutter.KEY_AudioMute);
    await eventually(() => output.muted, 'the mute key mutes the speakers');
    press(Clutter.KEY_AudioMute);
    await eventually(() => !output.muted, 'and unmutes them again');
  } finally {
    output.set_volume(level);
  }

  mixer.activate_device(require(device('Headphones'), 'the headphones can be chosen'));
  await eventually(() => mixer.output?.description === 'Headphones' && device('Headphones')?.get_active(), 'choosing the headphones moves sound there');
  mixer.activate_device(require(device('Speakers'), 'the speakers can be chosen'));
  await eventually(() => mixer.output?.description === 'Speakers', 'and back to the speakers');

  const recorder = spawn(['parecord', '--device=microphone', '/dev/null']);
  await eventually(() => mixer.recording, 'an app recording from the microphone shows');
  await stop(recorder);
  await eventually(() => !mixer.recording, 'and stops showing once it stops');
}
