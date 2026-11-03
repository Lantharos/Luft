import Shell from 'gi://Shell';

import type { ApiContext } from '../context.js';
import type { AudioOutput, OutputDevice } from '../types.js';

const idOf = (device: Shell.MixerDevice) => `${device.get_origin() ?? ''}/${device.get_description()}`;

export function outputApi({ scope }: ApiContext): AudioOutput {
  const mixer = Shell.Mixer.get_default();
  const devices = () => mixer.get_devices(true);
  return {
    get volume() {
      return Math.min(1, mixer.output?.volume ?? 0);
    },
    set volume(volume: number) {
      mixer.output?.set_volume(Math.min(1, Math.max(0, volume)));
    },
    get muted() {
      return mixer.output?.muted ?? true;
    },
    set muted(muted: boolean) {
      mixer.output?.set_muted(muted);
    },
    get devices(): OutputDevice[] {
      return devices().map(device => ({ id: idOf(device), name: device.get_description(), detail: device.get_origin(), active: device.get_active() }));
    },
    choose: id => {
      const device = devices().find(candidate => idOf(candidate) === id);
      if (device && !device.get_active()) mixer.activate_device(device);
    },
    onChanged: changed => {
      const guarded = scope.guard(changed);
      let stream: Shell.MixerStream | null = null;
      let streamSignals: number[] = [];
      const follow = () => {
        streamSignals.forEach(id => stream?.disconnect(id));
        stream = mixer.output;
        streamSignals = stream ? [stream.connect('notify::volume', guarded), stream.connect('notify::muted', guarded)] : [];
      };
      const ids = [mixer.connect('notify::output', () => {
        follow();
        guarded();
      }), mixer.connect('devices-changed', guarded)];
      follow();
      return scope.disposable(() => {
        ids.forEach(id => mixer.disconnect(id));
        streamSignals.forEach(id => stream?.disconnect(id));
      });
    },
  };
}
