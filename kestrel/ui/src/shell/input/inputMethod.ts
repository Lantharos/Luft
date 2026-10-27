import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import type Graphene from 'gi://Graphene';
import GObject from 'gi://GObject';
import IBus from 'gi://IBus';
import Meta from 'gi://Meta';

import { logErrorUnlessCancelled } from '../runtime/errorUtils.js';
import * as IBusManager from './ibusManager.js';
import { getInputSourceManager, type InputSource } from '../status/devices/keyboard.js';
import * as Main from '../main.js';

Gio._promisify(IBus.Bus.prototype, 'create_input_context_async', 'create_input_context_async_finish');
Gio._promisify(IBus.InputContext.prototype, 'process_key_event_async', 'process_key_event_async_finish');

const HIDE_PANEL_TIME = 50;
const SUPER_MASK = Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK;

const HAVE_REQUIRE_SURROUNDING_TEXT = GObject.signal_lookup('require-surrounding-text', IBus.InputContext.$gtype);

const PREEDIT_HINTS = new Map<number, Clutter.PreeditStyleHint>([
  [IBus.AttrPreedit.DEFAULT, Clutter.PreeditStyleHint.NONE],
  [IBus.AttrPreedit.WHOLE, Clutter.PreeditStyleHint.WHOLE],
  [IBus.AttrPreedit.SELECTION, Clutter.PreeditStyleHint.SELECTION],
  [IBus.AttrPreedit.PREDICTION, Clutter.PreeditStyleHint.PREDICTION],
  [IBus.AttrPreedit.PREFIX, Clutter.PreeditStyleHint.PREFIX],
  [IBus.AttrPreedit.SUFFIX, Clutter.PreeditStyleHint.SUFFIX],
  [IBus.AttrPreedit.ERROR_SPELLING, Clutter.PreeditStyleHint.SPELLING_ERROR],
  [IBus.AttrPreedit.ERROR_COMPOSE, Clutter.PreeditStyleHint.COMPOSE_ERROR],
]);

const CONTENT_HINTS: [Clutter.InputContentHintFlags, IBus.InputHints][] = [
  [Clutter.InputContentHintFlags.COMPLETION, IBus.InputHints.WORD_COMPLETION],
  [Clutter.InputContentHintFlags.SPELLCHECK, IBus.InputHints.SPELLCHECK],
  [Clutter.InputContentHintFlags.AUTO_CAPITALIZATION, IBus.InputHints.UPPERCASE_SENTENCES],
  [Clutter.InputContentHintFlags.LOWERCASE, IBus.InputHints.LOWERCASE],
  [Clutter.InputContentHintFlags.UPPERCASE, IBus.InputHints.UPPERCASE_CHARS],
  [Clutter.InputContentHintFlags.TITLECASE, IBus.InputHints.UPPERCASE_WORDS],
  [Clutter.InputContentHintFlags.SENSITIVE_DATA, IBus.InputHints.PRIVATE],
  [Clutter.InputContentHintFlags.HIDDEN_TEXT, IBus.InputHints.HIDDEN_TEXT],
  [Clutter.InputContentHintFlags.NO_EMOJI, IBus.InputHints.NO_EMOJI],
];

const CONTENT_PURPOSES = new Map<Clutter.InputContentPurpose, IBus.InputPurpose>([
  [Clutter.InputContentPurpose.NORMAL, IBus.InputPurpose.FREE_FORM],
  [Clutter.InputContentPurpose.ALPHA, IBus.InputPurpose.ALPHA],
  [Clutter.InputContentPurpose.DIGITS, IBus.InputPurpose.DIGITS],
  [Clutter.InputContentPurpose.NUMBER, IBus.InputPurpose.NUMBER],
  [Clutter.InputContentPurpose.PHONE, IBus.InputPurpose.PHONE],
  [Clutter.InputContentPurpose.URL, IBus.InputPurpose.URL],
  [Clutter.InputContentPurpose.EMAIL, IBus.InputPurpose.EMAIL],
  [Clutter.InputContentPurpose.NAME, IBus.InputPurpose.NAME],
  [Clutter.InputContentPurpose.PASSWORD, IBus.InputPurpose.PASSWORD],
  [Clutter.InputContentPurpose.TERMINAL, IBus.InputPurpose.TERMINAL],
]);

export interface CaretRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CursorWindow {
  window: Meta.Window | null;
  x: number;
  y: number;
}

export namespace InputMethod {
  export interface Signals extends Clutter.InputMethod.SignalSignatures {
    'surrounding-text-set': () => void;
  }
}

function translatePreeditAttributes(ibusAttributes: IBus.AttrList): Clutter.PreeditAttribute[] {
  const clutterAttrs = [];

  for (let i = 0, ibusAttr; (ibusAttr = ibusAttributes.get(i)) != null; i++) {
    if (ibusAttr.get_attr_type() !== IBus.AttrType.HINT) continue;

    const hint = PREEDIT_HINTS.get(ibusAttr.get_value());
    if (hint === undefined) continue;

    const attribute = new Clutter.PreeditAttribute();
    attribute.hint = hint;
    attribute.start = ibusAttr.start_index;
    attribute.end = ibusAttr.end_index;
    clutterAttrs.push(attribute);
  }

  return clutterAttrs;
}

function forCompositor(event: Clutter.Event): boolean {
  return (event.get_state() & SUPER_MASK) !== 0 ||
    global.display.get_keybinding_action(event.get_key_code(), event.get_state()) !== Meta.KeyBindingAction.NONE;
}

function typedOnHardware(event: Clutter.Event): boolean {
  return event.type() === Clutter.EventType.KEY_PRESS &&
    event.get_source_device()?.get_device_node() != null &&
    Clutter.keysym_to_unicode(event.get_key_symbol()) !== 0;
}

function x11Caret(): CaretRect | null {
  const window = global.display.focus_window;
  if (window?.get_client_type() !== Meta.WindowClientType.X11) return null;
  return IBusManager.getIBusManager().caret;
}

export const InputMethod = GObject.registerClass({
  Signals: {
    'surrounding-text-set': {},
  },
}, class InputMethod extends Clutter.InputMethod {
  declare connect: GObject.SignalMethods<this, InputMethod.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, InputMethod.Signals>['emit'];

  private hints = 0;
  private purpose = 0;
  private focus: Clutter.InputFocus | null = null;
  private cursorRect: CaretRect | null = null;
  private cursorWindow: CursorWindow = { window: null, x: 0, y: 0 };
  private preeditStr: string | null = '';
  private preeditPos = 0;
  private preeditAnchor = 0;
  private preeditVisible = false;
  private preeditCommitMode = Clutter.PreeditResetMode.CLEAR;
  private preeditHints: Clutter.PreeditAttribute[] | null = null;
  private hidePanelId = 0;
  private surroundingText: string | null = null;
  private surroundingTextCursor = 0;
  private surroundingTextAnchor = 0;
  private keyInterceptor: ((event: Clutter.Event) => boolean) | null = null;
  private readonly interceptedKeys = new Set<number>();
  private readonly ibus = IBus.Bus.new_async();
  private context: IBus.InputContext | null = null;
  private cancellable: Gio.Cancellable | null = null;
  private readonly inputSourceManager = getInputSourceManager();
  private currentSource: InputSource | null;

  constructor() {
    super();

    this.ibus.connect('connected', () => this.onConnected());
    this.ibus.connect('disconnected', () => this.clear());
    this.connect('notify::can-show-preedit', () => this.updateCapabilities());

    this.inputSourceManager.connect('current-source-changed', () => {
      this.currentSource = this.inputSourceManager.currentSource;
    });
    this.currentSource = this.inputSourceManager.currentSource;

    if (this.ibus.is_connected()) this.onConnected();
  }

  get currentFocus(): Clutter.InputFocus | null {
    return this.focus;
  }

  get caret(): CaretRect | null {
    if (!this.focus || !this.cursorRect) return x11Caret();
    const { window, x, y } = this.cursorWindow;
    const frame = window?.get_frame_rect() ?? { x, y };
    return { ...this.cursorRect, x: this.cursorRect.x + frame.x - x, y: this.cursorRect.y + frame.y - y };
  }

  interceptKeys(interceptor: ((event: Clutter.Event) => boolean) | null): void {
    this.keyInterceptor = interceptor;
  }

  showPreedit(text: string | null): void {
    const end = text ? [...text].length : 0;
    this.set_preedit_text(text || null, end, end, Clutter.PreeditResetMode.CLEAR);
  }

  getSurroundingText(): [string | null, number, number] {
    return [this.surroundingText, this.surroundingTextCursor, this.surroundingTextAnchor];
  }

  hasPreedit(): boolean {
    return this.preeditVisible && this.preeditStr !== '' && this.preeditStr !== null;
  }

  async handleVirtualKey(keyval: number): Promise<boolean> {
    try {
      if (!await this.context!.process_key_event_async(keyval, 0, 0, -1, null)) return false;

      await this.context!.process_key_event_async(keyval, 0, IBus.ModifierType.RELEASE_MASK, -1, null);
      return true;
    } catch {
      return false;
    }
  }

  update(): void {
    if (!this.context) return;
    this.updateCapabilities();
    this.context.set_content_type(this.purpose, this.hints);
    if (this.cursorRect) this.context.set_cursor_location(this.cursorRect.x, this.cursorRect.y, this.cursorRect.width, this.cursorRect.height);
    this.emitRequestSurrounding();
  }

  vfunc_focus_in(focus: Clutter.InputFocus): void {
    this.focus = focus;
    if (this.context) {
      this.update();
      this.context.focus_in();
      this.emitRequestSurrounding();
    }

    if (this.hidePanelId) {
      GLib.source_remove(this.hidePanelId);
      this.hidePanelId = 0;
    }
  }

  vfunc_focus_out(): void {
    this.focus = null;
    this.cursorRect = null;
    if (this.context) {
      this.fullReset(this.context);
      this.context.focus_out();
    }

    if (this.preeditStr && this.preeditVisible) {
      this.set_preedit_text(null, 0, 0, this.preeditCommitMode);
      this.preeditStr = null;
    }

    this.hidePanelId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, HIDE_PANEL_TIME, () => {
      this.set_input_panel_state(Clutter.InputPanelState.OFF);
      this.hidePanelId = 0;
    });
  }

  vfunc_reset(): void {
    if (this.context) {
      this.context.reset();
      this.emitRequestSurrounding();
    }

    this.surroundingText = null;
    this.surroundingTextCursor = 0;
    this.surroundingTextAnchor = 0;
    this.preeditStr = null;
  }

  vfunc_set_cursor_location(rect: Graphene.Rect): void {
    this.cursorRect = { x: rect.get_x(), y: rect.get_y(), width: rect.get_width(), height: rect.get_height() };
    const window = global.display.focus_window;
    const { x, y } = window?.get_frame_rect() ?? { x: 0, y: 0 };
    this.cursorWindow = { window, x, y };
    if (this.context) {
      this.context.set_cursor_location(this.cursorRect.x, this.cursorRect.y, this.cursorRect.width, this.cursorRect.height);
      this.emitRequestSurrounding();
    }
  }

  vfunc_set_surrounding(text: string | null, cursor: number, anchor: number): void {
    const updateCapabilities = (this.surroundingText !== null) !== (text !== null);

    this.surroundingText = text;
    this.surroundingTextCursor = cursor;
    this.surroundingTextAnchor = anchor;
    this.emit('surrounding-text-set');

    if (!this.context || (!text && text !== '')) return;

    const ibusText = IBus.Text.new_from_string(text);

    if (updateCapabilities) this.updateCapabilities();

    this.context.set_surrounding_text(ibusText, cursor, anchor);
  }

  vfunc_update_content_hints(hints: Clutter.InputContentHintFlags): void {
    let ibusHints = 0;
    for (const [hint, ibusHint] of CONTENT_HINTS) {
      if (hints & hint) ibusHints |= ibusHint;
    }

    this.hints = ibusHints;
    this.context?.set_content_type(this.purpose, this.hints);
  }

  vfunc_update_content_purpose(purpose: Clutter.InputContentPurpose): void {
    this.purpose = CONTENT_PURPOSES.get(purpose) ?? 0;
    this.context?.set_content_type(this.purpose, this.hints);
  }

  vfunc_filter_key_event(event: Clutter.Event): boolean {
    if (forCompositor(event)) return false;
    if (typedOnHardware(event)) Main.keyboard.close();
    if (this.interceptKey(event)) return true;
    if (!this.context) return false;
    if (!this.currentSource) return false;

    let state = event.get_state();
    if (state & IBus.ModifierType.IGNORED_MASK) return false;

    if (event.type() === Clutter.EventType.KEY_RELEASE) state |= IBus.ModifierType.RELEASE_MASK;

    this.context.process_key_event_async(
      event.get_key_symbol(),
      event.get_key_code() - 8,
      state, -1, this.cancellable,
      (context, res) => {
        if (context !== this.context) return;

        try {
          const retval = context!.process_key_event_async_finish(res);
          this.notify_key_event(event, retval);
        } catch (e) {
          if (!(e as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
            log(`Error processing key on IM: ${(e as GLib.Error).message}`);
        }
      });
    return true;
  }

  private interceptKey(event: Clutter.Event): boolean {
    const keycode = event.get_key_code();
    if (event.type() === Clutter.EventType.KEY_RELEASE) return this.interceptedKeys.delete(keycode);
    if (!this.keyInterceptor?.(event)) return false;
    this.interceptedKeys.add(keycode);
    return true;
  }

  private updateCapabilities(): void {
    let caps = IBus.Capabilite.PREEDIT_TEXT | IBus.Capabilite.FOCUS;

    if (this.surroundingText !== null) caps |= IBus.Capabilite.SURROUNDING_TEXT;

    if (Main.keyboard.visible) caps |= IBus.Capabilite.OSK;

    this.context?.set_capabilities(caps);
  }

  private async onConnected(): Promise<void> {
    this.cancellable = new Gio.Cancellable();
    let context: IBus.InputContext;
    try {
      context = await this.ibus.create_input_context_async('gnome-shell', -1, this.cancellable);
    } catch (e) {
      if (logErrorUnlessCancelled(e)) this.clear();
      return;
    }
    this.context = context;

    context.set_client_commit_preedit(true);
    context.set_preedit_format(IBus.PreeditFormat.HINT);
    context.connect('commit-text', (_context, text) => this.commit(text.get_text()));
    context.connect('delete-surrounding-text', (_context, offset, nchars) => this.onDeleteSurroundingText(offset, nchars));
    context.connect('update-preedit-text-with-mode', (_context, text, pos, visible, mode) => this.onUpdatePreeditText(text, pos, visible, mode));
    context.connect('show-preedit-text', () => this.onShowPreeditText());
    context.connect('hide-preedit-text', () => this.onHidePreeditText());
    context.connect('forward-key-event', (_context, keyval, keycode, state) => this.onForwardKeyEvent(keyval, keycode, state));
    context.connect('destroy', () => this.clear());

    if (HAVE_REQUIRE_SURROUNDING_TEXT) context.connect('require-surrounding-text', () => this.request_surrounding());

    Main.keyboard.connectObject('visibility-changed', () => this.updateCapabilities(), this);

    this.updateCapabilities();
  }

  private clear(): void {
    Main.keyboard.disconnectObject(this);

    this.cancellable?.cancel();
    this.cancellable = null;

    this.context = null;
    this.hints = 0;
    this.purpose = 0;
    this.preeditStr = '';
    this.preeditPos = 0;
    this.preeditAnchor = 0;
    this.preeditVisible = false;
  }

  private emitRequestSurrounding(): void {
    if (this.context!.needs_surrounding_text()) this.emit('request-surrounding');
  }

  private onDeleteSurroundingText(offset: number, nchars: number): void {
    if (this.surroundingText === null) {
      log('input-method engines should not call the delete-surrounding-text API in case the input context has no SURROUNDING_TEXT capability.');
      return;
    }
    try {
      this.delete_surrounding(offset, nchars);
    } catch {
      this.delete_surrounding(0, nchars + offset);
    }
  }

  private onUpdatePreeditText(text: IBus.Text | null, pos: number, visible: boolean, mode: Clutter.PreeditResetMode): void {
    if (text == null) return;

    const preedit = text.get_text() || null;
    const preeditHints = translatePreeditAttributes(text.get_attributes());
    const anchor = pos;

    if (visible) {
      try {
        this.set_preedit_text_with_attrs(preedit, pos, anchor, mode, preeditHints);
      } catch {
        this.set_preedit_text(null, pos, anchor, mode);
      }
    } else if (this.preeditVisible) {
      this.set_preedit_text(null, pos, anchor, mode);
    }

    this.preeditStr = preedit;
    this.preeditPos = pos;
    this.preeditAnchor = anchor;
    this.preeditVisible = visible;
    this.preeditCommitMode = mode;
    this.preeditHints = preeditHints;
  }

  private onShowPreeditText(): void {
    this.preeditVisible = true;

    try {
      this.set_preedit_text_with_attrs(this.preeditStr, this.preeditPos, this.preeditAnchor, this.preeditCommitMode, this.preeditHints);
    } catch {
      this.set_preedit_text(this.preeditStr, this.preeditPos, this.preeditAnchor, this.preeditCommitMode);
    }
  }

  private onHidePreeditText(): void {
    this.set_preedit_text(null, this.preeditPos, this.preeditAnchor, this.preeditCommitMode);
    this.preeditVisible = false;
  }

  private onForwardKeyEvent(keyval: number, keycode: number, state: number): void {
    const press = (state & IBus.ModifierType.RELEASE_MASK) === 0;
    state &= ~IBus.ModifierType.RELEASE_MASK;

    const time = Clutter.get_current_event()?.get_time() ?? global.display.get_current_time_roundtrip();
    this.forward_key(keyval, keycode + 8, state & Clutter.ModifierType.MODIFIER_MASK, time, press);
  }

  private fullReset(context: IBus.InputContext): void {
    context.set_content_type(0, 0);
    context.set_cursor_location(0, 0, 0, 0);
    context.reset();
  }
});

export type InputMethod = InstanceType<typeof InputMethod>;
