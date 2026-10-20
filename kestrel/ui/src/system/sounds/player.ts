import type Gio from 'gi://Gio';
import Shell from 'gi://Shell';

export interface SoundPlayer {
  prepare(): void;
  play(name: string): void;
  play_file(file: Gio.File): void;
  play_fd(fd: number): void;
  get_cached_bytes(): number;
  connect(signal: 'played', callback: (player: SoundPlayer, name: string) => void): number;
  connect(signal: 'started', callback: (player: SoundPlayer, name: string, latency: number) => void): number;
  disconnect(id: number): void;
}

const { SoundPlayer } = Shell as unknown as { SoundPlayer: { get_default(): SoundPlayer } };

export const soundPlayer = (): SoundPlayer => SoundPlayer.get_default();
