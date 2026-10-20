import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';

import { family } from './family.js';

const FIRST_FRAME = 1000;
const QUIET = 100;
const LONGEST = 2000;

export function redrawn(target: Meta.Window): Promise<void> {
  const actors = family(target).map(window => window.get_compositor_private() as Meta.WindowActor);
  return new Promise(resolve => {
    let quiet = 0;
    let longest = 0;
    const done = () => {
      for (const [actor, id] of damage) {
        if (GObject.signal_handler_is_connected(actor, id)) actor.disconnect(id);
      }
      if (quiet) GLib.source_remove(quiet);
      if (longest) GLib.source_remove(longest);
      resolve();
    };
    const settleAfter = (milliseconds: number) => {
      if (quiet) GLib.source_remove(quiet);
      quiet = GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
        quiet = 0;
        done();
        return GLib.SOURCE_REMOVE;
      });
    };
    const damage = actors.map(actor => [actor, actor.connect('damaged', () => settleAfter(QUIET))] as const);
    longest = GLib.timeout_add(GLib.PRIORITY_DEFAULT, LONGEST, () => {
      longest = 0;
      done();
      return GLib.SOURCE_REMOVE;
    });
    settleAfter(FIRST_FRAME);
  });
}
