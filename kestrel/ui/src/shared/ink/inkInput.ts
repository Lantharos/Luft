import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { isEraserTip, sampleOf, type InkSample } from './sample.js';

export interface InkWriter {
  begin(sample: InkSample, erasing: boolean): void;
  extend(sample: InkSample): void;
  end(): void;
}

const { EventType } = Clutter;
const STARTS = [EventType.BUTTON_PRESS, EventType.TOUCH_BEGIN];
const MOVES = [EventType.MOTION, EventType.TOUCH_UPDATE];
const ENDS = [EventType.BUTTON_RELEASE, EventType.TOUCH_END, EventType.TOUCH_CANCEL];

/**
 * Turns a press, drag and release on the actor, with a pen, a finger or the
 * primary mouse button, into a stroke for the writer. Presses on buttons in
 * it stay theirs. The actor holds the input until the stroke ends, so a
 * stroke may leave it.
 */
export function followInk(actor: Clutter.Actor, writer: InkWriter): void {
  let grab: Clutter.Grab | null = null;
  let sequence: Clutter.EventSequence | null = null;

  const finish = () => {
    grab?.dismiss();
    grab = null;
    sequence = null;
    writer.end();
  };

  actor.reactive = true;
  actor.connect('event', (_actor, event: Clutter.Event) => {
    const type = event.type();
    if (!STARTS.includes(type) && !MOVES.includes(type) && !ENDS.includes(type)) return Clutter.EVENT_PROPAGATE;
    if (STARTS.includes(type)) {
      if (grab || global.stage.get_event_actor(event) instanceof St.Button || (type === EventType.BUTTON_PRESS && event.get_button() !== Clutter.BUTTON_PRIMARY))
        return Clutter.EVENT_PROPAGATE;
      sequence = event.get_event_sequence();
      grab = global.stage.grab(actor);
      writer.begin(sampleOf(event, actor), isEraserTip(event));
      return Clutter.EVENT_STOP;
    }
    if (!grab || (type !== EventType.MOTION && event.get_event_sequence() !== sequence)) return Clutter.EVENT_PROPAGATE;
    if (MOVES.includes(type)) writer.extend(sampleOf(event, actor));
    else if (ENDS.includes(type)) {
      writer.extend(sampleOf(event, actor));
      finish();
    }
    return Clutter.EVENT_STOP;
  });
  actor.connect('destroy', () => grab?.dismiss());
}
