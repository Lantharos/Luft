import Shell from 'gi://Shell';

export enum MixerHeadset {
  HEADPHONES = 1 << 0,
  HEADSET = 1 << 1,
  MICROPHONE = 1 << 2,
}

export interface MixerStream {
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

export interface Mixer {
  readonly output: MixerStream | null;
  readonly input: MixerStream | null;
  readonly recording: boolean;
  choose_headset(choice: MixerHeadset): void;
  connect(signal: 'headset-changed', callback: (mixer: Mixer, choices: MixerHeadset | 0) => void): number;
  connect(signal: 'notify::recording', callback: () => void): number;
  disconnect(id: number): void;
}

const { Mixer } = Shell as unknown as { Mixer: { get_default(): Mixer; get_max_amplified(): number } };

export const mixer = (): Mixer => Mixer.get_default();
export const maxAmplified = (): number => Mixer.get_max_amplified();
