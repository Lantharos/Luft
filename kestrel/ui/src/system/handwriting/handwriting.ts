import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Context } from '../../context.js';
import { isPen } from '../../shared/ink/sample.js';
import { WritingStrip } from './strip/writingStrip.js';

const SETTLE_MS = 150;
const FOCUS_GONE_MS = 300;
const NEAR_LINE = 64;
const NEAR_CARET = 480;

/**
 * Opens the writing strip when a pen touches a text field: the field takes
 * the tap and moves its cursor, then the strip opens under the cursor.
 */
export class Handwriting {
  private readonly preferences = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.handwriting' });
  readonly strip: WritingStrip;
  private filter = 0;
  private settle = 0;
  private focusGone = 0;
  private readonly focusChanged: number;

  constructor(private readonly context: Context) {
    this.strip = new WritingStrip(context.inputMethod, context.layoutManager);
    this.preferences.connect('changed::enabled', () => this.sync());
    this.focusChanged = context.inputMethod.connect('focus-changed', () => this.followFocus());
    this.sync();
  }

  /** Opens the strip under the cursor of the field being typed in, if there's one to write into. */
  offer(x: number, y: number): void {
    const caret = this.context.inputMethod.caret;
    if (!caret || !this.writable()) {
      this.strip.close();
      return;
    }
    const nearLine = Math.abs(y - (caret.y + caret.height / 2)) <= NEAR_LINE;
    const nearCaret = Math.abs(x - caret.x) <= NEAR_CARET;
    if (nearLine && nearCaret) this.strip.open(caret);
    else this.strip.close();
  }

  destroy(): void {
    this.stopFollowing();
    this.context.inputMethod.disconnect(this.focusChanged);
    this.strip.destroy();
  }

  /** Text input loses its field while a pen presses on the strip, so the strip only closes once the field stays gone while nobody writes. */
  private followFocus(): void {
    if (this.focusGone) GLib.source_remove(this.focusGone);
    this.focusGone = 0;
    if (this.writable()) return;
    this.focusGone = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FOCUS_GONE_MS, () => {
      if (this.strip.writing) return GLib.SOURCE_CONTINUE;
      this.focusGone = 0;
      if (!this.writable()) this.strip.close();
      return GLib.SOURCE_REMOVE;
    });
  }

  private writable(): boolean {
    const input = this.context.inputMethod;
    return input.currentFocus !== null && !input.hidesTyping;
  }

  private sync(): void {
    if (this.preferences.get_boolean('enabled')) {
      if (!this.filter) this.filter = Clutter.Event.prepend_filter(null, event => this.onEvent(event));
    } else {
      this.stopFollowing();
      this.strip.close();
    }
  }

  private stopFollowing(): void {
    if (this.filter) Clutter.Event.remove_filter(this.filter);
    this.filter = 0;
    if (this.settle) GLib.source_remove(this.settle);
    this.settle = 0;
    if (this.focusGone) GLib.source_remove(this.focusGone);
    this.focusGone = 0;
  }

  private onEvent(event: Clutter.Event): boolean {
    if (event.type() !== Clutter.EventType.BUTTON_PRESS || !isPen(event)) return Clutter.EVENT_PROPAGATE;
    const [x, y] = event.get_coords();
    if (this.strip.contains(x, y)) return Clutter.EVENT_PROPAGATE;
    if (this.settle) GLib.source_remove(this.settle);
    this.settle = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, SETTLE_MS, () => {
      this.settle = 0;
      this.offer(x, y);
    });
    return Clutter.EVENT_PROPAGATE;
  }
}
