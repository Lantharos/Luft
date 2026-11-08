import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import type { Context } from '../../../context.js';
import { styleSurface } from '../../../appearance/kestrelGlass.js';
import { t } from '../../../shared/i18n/index.js';
import { followInk, type InkWriter } from '../../../shared/ink/inkInput.js';
import type { InkSample } from '../../../shared/ink/sample.js';
import { Stroke } from '../../../shared/ink/stroke.js';
import { StrokeActor } from '../../../shared/ink/strokeActor.js';
import type { TextInput } from '../../../shared/input/textInput.js';
import type { Box } from '../../../shared/layout/placement.js';
import { placeNear } from '../../../shared/layout/placement.js';
import { animateActor, Curve, Duration } from '../../../shared/motion/motion.js';
import { NotInstalled, recognize } from '../recognizer.js';
import { type Edit, replace, spaced, surroundingOf, type Surrounding, struckWords } from './editing.js';
import { isScratch, isStrike, isTap, overlaps } from './gestures.js';

const CORNERS = 22;
const WIDTH = 560;
const PAUSE_MS = 600;
const PEN_WIDTH = 3;
const SHOWN_BEFORE = 40;
const SHOWN_AFTER = 24;

type LayoutManager = Context['layoutManager'];

const inside = (actor: Clutter.Actor, x: number, y: number) => {
  const { origin, size } = actor.get_transformed_extents();
  return x >= origin.x && x <= origin.x + size.width && y >= origin.y && y <= origin.y + size.height;
};

/** Where strokes are drawn over the strip, without the strokes' reach changing the strip's size. */
class InkLayer extends Clutter.Actor {
  static {
    GObject.registerClass(this);
  }

  vfunc_get_preferred_width(): [number, number] {
    return [0, 0];
  }

  vfunc_get_preferred_height(): [number, number] {
    return [0, 0];
  }
}

/**
 * A strip under the text field being written in. What's written in it is read
 * after a short pause and typed into the field; the field's text shows above
 * the writing, where striking words out deletes them and tapping between
 * letters picks where the next words go.
 */
export class WritingStrip implements InkWriter {
  readonly actor = new St.Widget({ style_class: 'kestrel-handwriting', layout_manager: new Clutter.BinLayout(), visible: false });
  private readonly column = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true });
  private readonly top = new St.BoxLayout({ style_class: 'kestrel-handwriting-top' });
  private readonly context = new St.Label({ style_class: 'kestrel-handwriting-context', x_expand: true, y_align: Clutter.ActorAlign.START });
  private readonly caretMark = new St.Widget({ style_class: 'kestrel-handwriting-caret', visible: false });
  private readonly area = new St.Widget({ style_class: 'kestrel-handwriting-area', layout_manager: new Clutter.BinLayout() });
  private readonly hint = new St.Label({ style_class: 'kestrel-handwriting-hint', x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.CENTER });
  private readonly ink = new InkLayer({ x: 0, y: 0 });
  private pending: StrokeActor[] = [];
  private drawing: StrokeActor | null = null;
  private pause = 0;
  private insertAt: number | null = null;
  private surrounding: Surrounding | null = null;
  private shownFrom = 0;
  private typedBlind = false;
  private readonly surroundingChanged: number;
  private readonly focusChanged: number;
  private queued: Edit[] = [];

  constructor(private readonly input: TextInput, private readonly layoutManager: LayoutManager) {
    styleSurface(this.actor, CORNERS);
    const line = new Clutter.Actor({ x_expand: true, y_align: Clutter.ActorAlign.CENTER, layout_manager: new Clutter.BinLayout() });
    this.context.clutter_text.single_line_mode = true;
    line.add_child(this.context);
    line.add_child(this.caretMark);
    this.top.add_child(line);
    const close = new St.Button({ style_class: 'kestrel-handwriting-close', icon_name: 'window-close-symbolic', can_focus: true });
    close.accessible_name = t('handwriting-close');
    close.connect('clicked', () => this.close());
    this.top.add_child(close);
    this.column.add_child(this.top);
    this.area.add_child(this.hint);
    this.area.add_child(new St.Widget({ style_class: 'kestrel-handwriting-baseline', y_align: Clutter.ActorAlign.END, x_expand: true }));
    this.column.add_child(this.area);
    this.actor.add_child(this.column);
    this.actor.add_child(this.ink);
    followInk(this.actor, this);
    layoutManager.addTopChrome(this.actor);
    this.surroundingChanged = input.connect('surrounding-text-set', () => this.readField());
    this.focusChanged = input.connect('focus-changed', () => this.flush());
  }

  get shown(): boolean {
    return this.actor.visible;
  }

  get writing(): boolean {
    return this.drawing !== null || this.pending.length > 0;
  }

  contains(x: number, y: number): boolean {
    return this.actor.visible && inside(this.actor, x, y);
  }

  open(caret: Box): void {
    const index = global.display.get_monitor_index_for_rect(new Mtk.Rectangle({ x: caret.x, y: caret.y, width: Math.max(1, caret.width), height: Math.max(1, caret.height) }));
    const area = this.layoutManager.getWorkAreaForMonitor(index);
    const width = Math.min(WIDTH, area.width - 16);
    this.actor.set_width(width);
    const [, height] = this.actor.get_preferred_height(width);
    const { x, y } = placeNear({ box: caret, centered: false }, width, height, area);
    this.actor.set_position(x, y);
    this.insertAt = null;
    this.hint.text = t('handwriting-hint');
    this.typedBlind = false;
    this.input.request_surrounding();
    this.readField();
    if (this.actor.visible) return;
    this.actor.opacity = 0;
    this.actor.show();
    animateActor(this.actor, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
  }

  close(): void {
    this.clearPause();
    this.queued = [];
    for (const actor of this.pending) actor.destroy();
    this.pending = [];
    this.drawing?.destroy();
    this.drawing = null;
    this.actor.hide();
  }

  begin(sample: InkSample): void {
    const { red, green, blue } = this.actor.get_theme_node().get_foreground_color();
    const stroke = new Stroke({ color: [red / 255, green / 255, blue / 255], width: PEN_WIDTH, pressure: true, opacity: 1 });
    stroke.add(sample);
    this.hint.hide();
    this.drawing = new StrokeActor(stroke);
    this.ink.add_child(this.drawing);
    this.clearPause();
  }

  extend(sample: InkSample): void {
    this.drawing?.add(sample);
  }

  end(): void {
    const drawn = this.drawing;
    this.drawing = null;
    if (!drawn) return;
    if (!this.gesture(drawn)) this.pending.push(drawn);
    if (this.pending.length) this.pause = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, PAUSE_MS, () => {
      this.pause = 0;
      void this.read();
    });
  }

  destroy(): void {
    this.close();
    this.input.disconnect(this.surroundingChanged);
    this.input.disconnect(this.focusChanged);
    this.actor.destroy();
  }

  private gesture(drawn: StrokeActor): boolean {
    const { stroke } = drawn;
    const [left, top] = this.actor.get_transformed_position();
    const atX = (x: number) => left + x;
    const middleY = top + (stroke.bounds.y1 + stroke.bounds.y2) / 2;
    if (this.surrounding && inside(this.top, atX(stroke.samples[0].x), top + stroke.samples[0].y)) {
      if (isTap(stroke)) this.placeAt(this.letterAt(atX(stroke.samples[0].x), middleY));
      else if (isStrike(stroke)) this.strike(this.letterAt(atX(stroke.bounds.x1), middleY), this.letterAt(atX(stroke.bounds.x2), middleY));
      drawn.destroy();
      return true;
    }
    if (isScratch(stroke) && this.pending.some(actor => overlaps(actor.stroke, stroke))) {
      this.pending = this.pending.filter(actor => {
        if (!overlaps(actor.stroke, stroke)) return true;
        actor.destroy();
        return false;
      });
      drawn.destroy();
      return true;
    }
    return false;
  }

  private letterAt(stageX: number, stageY: number): number {
    const text = this.context.clutter_text;
    const [, x, y] = text.transform_stage_point(stageX, stageY);
    const index = text.coords_to_position(x, Math.min(Math.max(y, 0), text.height - 1));
    return this.shownFrom + (index < 0 ? Array.from(text.text).length : index);
  }

  private placeAt(index: number): void {
    this.insertAt = index === this.surrounding!.cursor ? null : index;
    this.showField();
  }

  private strike(from: number, to: number): void {
    const surrounding = this.surrounding!;
    const struck = struckWords(surrounding.letters, Math.min(from, to), Math.max(from, to) + 1);
    if (!struck) return;
    const [start, end] = struck;
    if (this.insertAt !== null && this.insertAt > start) this.insertAt = Math.max(start, this.insertAt - (end - start));
    this.apply(replace(surrounding, start, end, ''));
  }

  private async read(): Promise<void> {
    const strokes = this.pending;
    this.pending = [];
    let text = '';
    try {
      text = await recognize(strokes.map(actor => actor.stroke.samples.map(({ x, y }) => [x, y] as [number, number])));
    } catch (error) {
      if (error instanceof NotInstalled) this.hint.text = t('handwriting-downloading');
      else console.warn(`Couldn't read handwriting: ${error}`);
    }
    for (const actor of strokes) animateActor(actor, { opacity: 0, duration: Duration.quick, curve: Curve.decelerate, onComplete: () => actor.destroy() });
    if (text && this.shown) this.type(text);
  }

  private type(text: string): void {
    const surrounding = this.surrounding;
    if (!surrounding) {
      this.send({ offset: 0, length: 0, commit: this.typedBlind ? ` ${text}` : text });
      this.typedBlind = true;
      return;
    }
    const at = this.insertAt ?? surrounding.cursor;
    const words = spaced(surrounding.letters, at, text);
    if (this.insertAt !== null) this.insertAt = at + Array.from(words).length;
    this.apply(replace(surrounding, at, at, words));
  }

  private apply(edit: Edit): void {
    this.send(edit);
    const surrounding = this.surrounding!;
    const low = surrounding.cursor + edit.offset;
    const typed = Array.from(edit.commit);
    surrounding.letters.splice(low, edit.length, ...typed);
    surrounding.cursor = low + typed.length;
    this.showField();
  }

  /** Text input has no field while a pen presses on the strip, so edits made then wait until it's back. */
  private send(edit: Edit): void {
    this.queued.push(edit);
    this.flush();
  }

  private flush(): void {
    if (!this.input.currentFocus) return;
    for (const { offset, length, commit } of this.queued.splice(0)) {
      if (length) this.input.delete_surrounding(offset, length);
      if (commit) this.input.commit(commit);
    }
  }

  private readField(): void {
    this.surrounding = surroundingOf(this.input.getSurroundingText());
    if (this.insertAt !== null && (!this.surrounding || this.insertAt > this.surrounding.letters.length)) this.insertAt = null;
    this.showField();
  }

  private showField(): void {
    const surrounding = this.surrounding;
    this.hint.visible = !this.pending.length;
    if (!surrounding) {
      this.context.text = '';
      this.caretMark.hide();
      return;
    }
    const at = this.insertAt ?? surrounding.cursor;
    this.shownFrom = Math.max(0, at - SHOWN_BEFORE);
    this.context.text = surrounding.letters.slice(this.shownFrom, at + SHOWN_AFTER).join('');
    const [, x, y, height] = this.context.clutter_text.position_to_coords(at - this.shownFrom);
    this.caretMark.set_position(Math.round(x), Math.round(y));
    this.caretMark.set_height(height || this.context.height);
    this.caretMark.show();
  }

  private clearPause(): void {
    if (this.pause) GLib.source_remove(this.pause);
    this.pause = 0;
  }
}
