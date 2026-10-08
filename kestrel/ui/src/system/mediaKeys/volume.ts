import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';
import { askForAudioDevice } from 'resource:///com/lantharos/kestrel/ui/audioDeviceSelection.js';

import type { Context } from '../../context.js';
import { maxAmplified, mixer, type MixerHeadset, type MixerStream } from './mixer.js';

type ShowOsd = Context['showOsd'];

const STEP = 0.06;
const PRECISE_STEP = 0.02;
const BUILT_IN_PORTS = new Set(['[OUT] Speaker', '[OUT] Handset', 'analog-output-speaker', 'analog-output']);
const OUTPUT_ICONS = ['audio-volume-muted', 'audio-volume-low', 'audio-volume-medium', 'audio-volume-high', 'audio-volume-overamplified'];
const INPUT_ICONS = ['microphone-sensitivity-muted', 'microphone-sensitivity-low', 'microphone-sensitivity-medium', 'microphone-sensitivity-high'];

export type VolumeChange = 'mute' | 'down' | 'up';

export interface VolumeOptions {
  output: boolean;
  quiet?: boolean;
  precise?: boolean;
}

function icon(output: boolean, muted: boolean, level: number): string {
  const names = output ? OUTPUT_ICONS : INPUT_ICONS;
  const index = muted ? 0 : Math.min(Math.max(Math.ceil(3 * level), 1), names.length - 1);
  return `${names[index]}-symbolic`;
}

function deviceLabel(stream: MixerStream): string | null {
  const { port } = stream;
  if (stream.form_factor === 'internal' && (!port || BUILT_IN_PORTS.has(port))) return null;
  return stream.port_description ?? stream.description;
}

export class VolumeKeys {
  private readonly mixer = mixer();
  private readonly sound = new Gio.Settings({ schema_id: 'org.gnome.desktop.sound' });
  private readonly headsetId: number;
  private question: ReturnType<typeof askForAudioDevice> = null;

  constructor(private readonly showOsd: ShowOsd) {
    this.headsetId = this.mixer.connect('headset-changed', (_mixer, choices) => this.askForDevice(choices));
  }

  change(change: VolumeChange, { output, quiet = false, precise = false }: VolumeOptions): void {
    const stream = output ? this.mixer.output : this.mixer.input;
    if (!stream) return;
    const max = output && this.sound.get_boolean('allow-volume-above-100-percent') ? maxAmplified() : 1;
    const step = precise ? PRECISE_STEP : STEP;
    const [oldVolume, oldMuted] = [stream.volume, stream.muted];
    let [volume, muted] = [oldVolume, oldMuted];
    if (change === 'mute') {
      muted = !oldMuted;
    } else if (change === 'down') {
      volume = oldVolume <= step ? 0 : oldVolume - step;
      muted = oldVolume <= step || oldMuted;
    } else {
      muted = false;
      if (!oldMuted || oldVolume === 0) volume = Math.min(oldVolume + step, max);
    }
    if (muted !== oldMuted) stream.set_muted(muted);
    if (volume !== oldVolume) stream.set_volume(volume);
    const changed = muted !== oldMuted || volume !== oldVolume;
    const level = muted ? 0 : Math.min(volume, max);
    this.showOsd(Gio.ThemedIcon.new(icon(output, muted, level)), deviceLabel(stream), level, max);
    if (output && changed && !quiet && !muted && !stream.running)
      (global as unknown as Shell.Global).display.get_sound_player().play_from_theme('audio-volume-change', 'Volume changed', null);
  }

  private askForDevice(choices: MixerHeadset | 0): void {
    this.question?.close();
    const question = choices ? askForAudioDevice(choices, choice => this.mixer.choose_headset(choice)) : null;
    question?.connect('closed', () => {
      if (this.question === question) this.question = null;
    });
    this.question = question;
  }

  destroy(): void {
    this.mixer.disconnect(this.headsetId);
    this.question?.close();
  }
}
