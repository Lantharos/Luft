import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {rest} from '../checks/lib/input.js';
import {settled} from '../checks/lib/wait.js';
import {measured} from './recorder.js';

const SURFACES = [['Start', 'start'], ['Quick settings', 'quick'], ['Notification center', 'notifications'], ['Overview', 'tasks']];

async function closed() {
  dismissImmediately();
  rest();
  await settled();
}

const opened = surface => async () => {
  await closed();
  toggleSurface(surface);
  await settled();
};

export const surfaceInteractions = SURFACES.flatMap(([label, surface]) => [
  {name: `${label} open`, prepare: closed, act: measured(() => toggleSurface(surface))},
  {name: `${label} close`, prepare: opened(surface), act: measured(() => toggleSurface(surface))},
]);
