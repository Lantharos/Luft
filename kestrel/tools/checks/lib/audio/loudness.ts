import Shell from 'gi://Shell';

import type {Eventually} from '../check.js';
import {pause} from '../wait.js';
import {speakersIntoLevels} from './routing.js';

const LISTENING_MS = 500;
const READINGS = 20;
const READING_MS = 50;

export const LEVEL_FLOOR_DB = -48;

export async function loudness(eventually: Eventually): Promise<number> {
  const monitor = Shell.AudioMonitor.get_default();
  monitor.set_listening(false);
  monitor.set_listening(true);
  await eventually(() => speakersIntoLevels(), 'Kestrel hears the speakers');
  await pause(LISTENING_MS);
  let sum = 0;
  for (let reading = 0; reading < READINGS; reading++) {
    sum += monitor.read(1)[1];
    await pause(READING_MS);
  }
  return (1 - sum / READINGS) * LEVEL_FLOOR_DB;
}
