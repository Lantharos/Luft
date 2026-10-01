import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gvc from 'gi://Gvc';
import Shell from 'gi://Shell';
import { getMixerControl } from 'resource:///org/gnome/shell/ui/status/volume.js';

import type { Context } from '../context.js';

type ShowOsd = Context['showOsd'];

const STEP = 6;
const PRECISE_STEP = 2;
const BUILT_IN_PORTS = new Set(['[OUT] Speaker', '[OUT] Handset', 'analog-output-speaker', 'analog-output']);
const OUTPUT_ICONS = ['audio-volume-muted', 'audio-volume-low', 'audio-volume-medium', 'audio-volume-high', 'audio-volume-overamplified'];
const INPUT_ICONS = ['microphone-sensitivity-muted', 'microphone-sensitivity-low', 'microphone-sensitivity-medium', 'microphone-sensitivity-high'];
const SELECTION = 'org.gnome.Shell.AudioDeviceSelection';
const SELECTION_PATH = '/org/gnome/Shell/AudioDeviceSelection';
const HEADSET_CHOICES: [string, Gvc.HeadsetPortChoice][] = [
  ['headphones', Gvc.HeadsetPortChoice.HEADPHONES],
  ['headset', Gvc.HeadsetPortChoice.HEADSET],
  ['microphone', Gvc.HeadsetPortChoice.MIC],
];

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

export class VolumeKeys {
  private readonly control = getMixerControl() as unknown as Gvc.MixerControl;
  private readonly sound = new Gio.Settings({ schema_id: 'org.gnome.desktop.sound' });
  private readonly selectionId: number;
  private readonly choiceId: number;
  private selectingFor: number | null = null;

  constructor(private readonly showOsd: ShowOsd) {
    this.selectionId = this.control.connect('audio-device-selection-needed',
      (_control: Gvc.MixerControl, id: number, show: boolean, choices: number) => this.askForDevice(id, show, choices));
    this.choiceId = Gio.DBus.session.signal_subscribe(SELECTION, SELECTION, 'DeviceSelected', SELECTION_PATH, null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [choice] = parameters.deep_unpack() as [string];
        const port = HEADSET_CHOICES.find(([name]) => name === choice)?.[1];
        if (this.selectingFor !== null && port !== undefined) this.control.set_headset_port(this.selectingFor, port);
        this.selectingFor = null;
      });
  }

  change(change: VolumeChange, { output, quiet = false, precise = false }: VolumeOptions): void {
    const stream = output ? this.control.get_default_sink() : this.control.get_default_source();
    if (!stream) return;
    const norm = this.control.get_vol_max_norm();
    const max = output && this.sound.get_boolean('allow-volume-above-100-percent') ? this.control.get_vol_max_amplified() : norm;
    const step = norm * (precise ? PRECISE_STEP : STEP) / 100;
    const [oldVolume, oldMuted] = [stream.volume, stream.is_muted];
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
    let changed = false;
    if (muted !== oldMuted) {
      stream.change_is_muted(muted);
      changed = true;
    }
    if (volume !== oldVolume) {
      stream.volume = volume;
      stream.push_volume();
      changed = true;
    }
    const level = muted ? 0 : Math.min(volume / norm, max / norm);
    this.showOsd(Gio.ThemedIcon.new(icon(output, muted, level)), this.deviceLabel(stream), level, max / norm);
    if (output && changed && !quiet && !muted && stream.get_state() !== Gvc.MixerStreamState.RUNNING)
      (global as unknown as Shell.Global).display.get_sound_player().play_from_theme('audio-volume-change', 'Volume changed', null);
  }

  private deviceLabel(stream: Gvc.MixerStream): string | null {
    const port = stream.get_port()?.port;
    if (stream.get_form_factor() === 'internal' && (!port || BUILT_IN_PORTS.has(port))) return null;
    return this.control.lookup_device_from_stream(stream)?.get_description() ?? null;
  }

  private askForDevice(id: number, show: boolean, choices: number): void {
    if (this.selectingFor !== null) void this.callSelection('Close', null);
    this.selectingFor = null;
    if (!show) return;
    this.selectingFor = id;
    const offered = HEADSET_CHOICES.filter(([, choice]) => choices & choice).map(([name]) => name);
    void this.callSelection('Open', new GLib.Variant('(as)', [offered]));
  }

  private async callSelection(method: string, parameters: GLib.Variant | null): Promise<void> {
    try {
      await Gio.DBus.session.call(SELECTION, SELECTION_PATH, SELECTION, method, parameters, null, Gio.DBusCallFlags.NONE, -1, null);
    } catch (error) {
      console.warn(`The audio device question failed: ${error}`);
    }
  }

  destroy(): void {
    this.control.disconnect(this.selectionId);
    Gio.DBus.session.signal_unsubscribe(this.choiceId);
  }
}
