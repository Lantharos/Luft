import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named} from '../checks/lib/actors.js';
import {press, rest, type} from '../checks/lib/input/input.js';
import {settled} from '../checks/lib/wait.js';
import {eachFrame, measured} from './recorder.js';

const SURFACES = [
  ['Start', 'start', 'menu'], ['Gust', 'start', 'palette'], ['Quick settings', 'quick'], ['Notification center', 'notifications'], ['Overview', 'tasks'],
];
const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const closed = (style = 'menu') => async () => {
  if (shell.get_string('start-style') !== style) shell.set_string('start-style', style);
  dismissImmediately();
  rest();
  await settled();
};

const opened = (surface, style) => async () => {
  await closed(style)();
  toggleSurface(surface);
  await settled();
};

const QUERY = 'settings backup';

const typed = () => eachFrame(QUERY.length * 2, step => {
  if (step < QUERY.length) type(QUERY[step]);
  else press(Clutter.KEY_BackSpace);
});

const searching = (style, name) => async () => {
  await opened('start', style)();
  named(name).get_first_child().grab_key_focus();
};

export const surfaceInteractions = [
  ...SURFACES.flatMap(([label, surface, style]) => [
    {name: `${label} open`, first: `${label} first open`, prepare: closed(style), act: measured(() => toggleSurface(surface))},
    {name: `${label} close`, prepare: opened(surface, style), act: measured(() => toggleSurface(surface))},
  ]),
  {name: 'Start typing', prepare: searching('menu', 'kestrel-start'), act: measured(typed)},
  {name: 'Gust typing', prepare: searching('palette', 'kestrel-palette'), act: measured(typed)},
];
