import St from 'gi://St';

import {existing} from '../actors.js';

export const clipboardPanel = () => existing('kestrel-clipboard');

export function clipboardRows(panel = clipboardPanel()): St.Button[] {
  const scroll = panel.get_first_child();
  const list = scroll instanceof St.ScrollView ? scroll.child : null;
  return list instanceof St.BoxLayout ? list.get_children().filter(row => row instanceof St.Button) : [];
}
