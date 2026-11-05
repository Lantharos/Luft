import GLib from 'gi://GLib';

import {spawn, stop, type Process} from '../processes.js';
import {intoSpeakers, speakersIntoLevels} from './routing.js';

export const RATE = 48000;
const BEAT_S = 0.5;
const CHORDS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66], [164.81, 207.65, 246.94]];
const BASS = [55, 43.65, 49, 41.2];

/** A 16-bit mono WAV file. */
export function wav(samples: Float32Array): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, RATE, true);
  view.setUint32(28, RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32000), true));
  return bytes;
}

/** A few bars of drums, bass and chords, so things that follow music have something to follow. */
function song(seconds: number): Float32Array {
  const samples = new Float32Array(RATE * seconds);
  let noise = 0;
  for (let index = 0; index < samples.length; index++) {
    const time = index / RATE;
    const beat = time / BEAT_S;
    const sinceBeat = (beat % 1) * BEAT_S;
    const sinceEighth = ((beat * 2) % 1) * BEAT_S / 2;
    const bar = Math.floor(beat / 4) % CHORDS.length;
    const kick = Math.sin(2 * Math.PI * (45 + 70 * Math.exp(-sinceBeat * 30)) * sinceBeat) * Math.exp(-sinceBeat * 9);
    noise = 0.6 * noise + 0.4 * (Math.random() * 2 - 1);
    const hat = (Math.random() * 2 - 1 - noise) * Math.exp(-sinceEighth * 60) * 0.35;
    const snare = Math.floor(beat) % 2 === 1 ? (Math.random() * 2 - 1) * Math.exp(-sinceBeat * 18) * 0.45 : 0;
    const bass = Math.sin(2 * Math.PI * BASS[bar] * time) * 0.35 * (0.6 + 0.4 * Math.exp(-sinceBeat * 4));
    const pad = CHORDS[bar].reduce((sum, hertz) => sum + Math.sin(2 * Math.PI * hertz * time), 0) * 0.08 * (0.8 + 0.2 * Math.sin(time * 1.7));
    samples[index] = 0.55 * (kick * 0.8 + hat + snare + bass + pad);
  }
  return samples;
}

/** Plays music into the session's speakers and lets Kestrel hear it. */
export async function playMusic(seconds: number, until: (condition: () => Promise<boolean>, label: string) => Promise<unknown>): Promise<Process> {
  const path = GLib.build_filenamev([GLib.get_user_cache_dir(), 'music.wav']);
  GLib.file_set_contents(path, wav(song(seconds)));
  const player = spawn(['pw-play', '-P', '{ node.name = check-music }', path]);
  try {
    await until(() => intoSpeakers({'node.name': 'check-music'}, 'check-music:output', 1), 'the music reaches the speakers');
    await until(() => speakersIntoLevels(), 'and Kestrel hears it');
  } catch (error) {
    await stop(player);
    throw error;
  }
  return player;
}
