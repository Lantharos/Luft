import Shell from 'gi://Shell';
import type GObject from 'gi://GObject';

export enum MixerHeadset {
  HEADPHONES = 1 << 0,
  HEADSET = 1 << 1,
  MICROPHONE = 1 << 2,
}

export interface MixerStream extends Pick<GObject.Object, 'connectObject' | 'disconnectObject'> {
  readonly description: string | null;
  readonly port: string | null;
  readonly port_description: string | null;
  readonly form_factor: string | null;
  readonly volume: number;
  readonly muted: boolean;
  readonly running: boolean;
  set_volume(volume: number): void;
  set_muted(muted: boolean): void;
}

export interface MixerDevice {
  get_description(): string;
  get_origin(): string | null;
  get_icon_name(): string;
  get_active(): boolean;
}

export interface Mixer extends Pick<GObject.Object, 'connectObject' | 'disconnectObject'> {
  readonly output: MixerStream | null;
  readonly input: MixerStream | null;
  readonly recording: boolean;
  readonly dictating: boolean;
  choose_headset(choice: MixerHeadset): void;
  get_devices(output: boolean): MixerDevice[];
  activate_device(device: MixerDevice): void;
  connect(signal: 'headset-changed', callback: (mixer: Mixer, choices: MixerHeadset | 0) => void): number;
  connect(signal: 'notify::recording' | 'notify::dictating', callback: () => void): number;
  connect(
    signal: 'playback-started',
    callback: (mixer: Mixer, pid: number, appId: string | null, binary: string | null, name: string | null) => void,
  ): number;
  disconnect(id: number): void;
}

const { Mixer } = Shell as unknown as { Mixer: { get_default(): Mixer; get_max_amplified(): number } };

export const mixer = (): Mixer => Mixer.get_default();
export const maxAmplified = (): number => Mixer.get_max_amplified();
