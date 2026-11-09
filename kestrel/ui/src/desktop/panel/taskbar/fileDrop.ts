import type Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { DragDelegate } from '../../../shared/popups/dndTargets.js';
import { sendDropped } from '../../../system/send/dropped.js';

/** Whether `picked` is the taskbar itself rather than one of its buttons, which keep what dropping on them does. */
function bare(picked: Clutter.Actor, taskbar: Clutter.Actor): boolean {
  for (let actor: Clutter.Actor | null = picked; actor && actor !== taskbar; actor = actor.get_parent())
    if (actor instanceof St.Button || actor instanceof St.Entry) return false;
  return true;
}

/** Files dropped on an empty part of the taskbar open the Send sheet, with the part they're over lit up meanwhile. */
export function takeDroppedFiles(taskbar: St.Widget, surfaceUnder: (picked: Clutter.Actor) => St.Widget): void {
  let over: St.Widget | null = null;
  let lit: St.Widget | null = null;
  (taskbar as St.Widget & { _delegate?: DragDelegate })._delegate = {
    fileDrop: {
      takes: picked => {
        if (!bare(picked, taskbar)) return false;
        over = surfaceUnder(picked);
        if (lit && lit !== over) {
          lit.remove_style_pseudo_class('dropping');
          lit = over;
          lit.add_style_pseudo_class('dropping');
        }
        return true;
      },
      hover: hovering => {
        lit?.remove_style_pseudo_class('dropping');
        lit = hovering ? over : null;
        lit?.add_style_pseudo_class('dropping');
      },
      drop: paths => sendDropped(paths),
    },
  };
}
