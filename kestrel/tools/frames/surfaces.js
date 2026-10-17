import Clutter from 'gi://Clutter';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named} from '../checks/lib/actors.js';
import {press, rest, type} from '../checks/lib/input.js';
import {settled} from '../checks/lib/wait.js';
import {eachFrame, measured} from './recorder.js';

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

const QUERY = 'settings backup';

const typed = () => eachFrame(QUERY.length * 2, step => {
  if (step < QUERY.length) type(QUERY[step]);
  else press(Clutter.KEY_BackSpace);
});

async function searching() {
  await opened('start')();
  named('kestrel-start').get_first_child().grab_key_focus();
}

export const surfaceInteractions = [
  ...SURFACES.flatMap(([label, surface]) => [
    {name: `${label} open`, first: `${label} first open`, prepare: closed, act: measured(() => toggleSurface(surface))},
    {name: `${label} close`, prepare: opened(surface), act: measured(() => toggleSurface(surface))},
  ]),
  {name: 'Start typing', prepare: searching, act: measured(typed)},
];
