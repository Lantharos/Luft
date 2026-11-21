import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing} from '../checks/lib/actors.js';
import {press, rest, type} from '../checks/lib/input/input.js';
import {settled} from '../checks/lib/wait.js';
import {eachFrame, measured, type Interaction} from './recorder.js';

type Surface = Parameters<typeof toggleSurface>[0];

const SURFACES = [
  ['Gust panel', 'gust', 'panel'], ['Gust palette', 'gust', 'palette'], ['Quick settings', 'quick'], ['Notification center', 'notifications'], ['Overview', 'tasks'],
] satisfies [string, Surface, string?][];
const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const closed = (look = 'panel') => async () => {
  if (shell.get_string('gust-look') !== look) shell.set_string('gust-look', look);
  dismissImmediately();
  rest();
  await settled();
};

const opened = (surface: Surface, look?: string) => async () => {
  await closed(look)();
  toggleSurface(surface);
  await settled();
};

const QUERY = 'settings backup';

const typed = () => eachFrame(QUERY.length * 2, step => {
  if (step < QUERY.length) type(QUERY[step]);
  else press(Clutter.KEY_BackSpace);
});

const searching = (look: string, name: string) => async () => {
  await opened('gust', look)();
  existing(name).get_first_child()?.grab_key_focus();
};

export const surfaceInteractions: Interaction[] = [
  ...SURFACES.flatMap(([label, surface, look]) => [
    {name: `${label} open`, first: `${label} first open`, prepare: closed(look), act: measured(() => toggleSurface(surface))},
    {name: `${label} close`, prepare: opened(surface, look), act: measured(() => toggleSurface(surface))},
  ]),
  {name: 'Gust panel typing', prepare: searching('panel', 'kestrel-gust-panel'), act: measured(typed)},
  {name: 'Gust palette typing', prepare: searching('palette', 'kestrel-gust-palette'), act: measured(typed)},
];
