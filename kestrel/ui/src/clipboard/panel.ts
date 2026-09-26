import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import type { ContextMenus } from '../contextMenus.js';
import { blurSurface } from '../surface.js';
import { ClipboardHistory } from './history.js';

const PASTE_DELAY_MS = 120;

export class ClipboardPanel {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-clipboard', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-clipboard', visible: false, reactive: true,
  });
  private readonly list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-clipboard-list' });
  private readonly scroll = new St.ScrollView({
    hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC, height: 0, y_expand: true, child: this.list,
  });
  private readonly history: ClipboardHistory;
  private dirty = true;
  private keyboard: Clutter.VirtualInputDevice | null = null;

  constructor(private readonly menus: ContextMenus, private readonly close: () => void, private readonly layoutChanged: () => void) {
    blurSurface(this.actor);
    this.history = new ClipboardHistory(() => {
      this.dirty = true;
      if (this.actor.visible) this.refresh();
    });
    this.actor.add_child(this.scroll);
    const footer = new St.BoxLayout({ style_class: 'kestrel-clipboard-footer' });
    const clear = new St.Button({ style_class: 'kestrel-text-button', label: 'Clear all', can_focus: true, track_hover: true, x_expand: true, x_align: Clutter.ActorAlign.END });
    clear.connect('clicked', () => {
      this.history.clear();
      this.close();
    });
    footer.add_child(clear);
    this.actor.add_child(footer);
    this.actor.connect('destroy', () => this.history.destroy());
  }

  get empty(): boolean {
    return this.history.entries.length === 0;
  }

  prepareOpen(): void {
    this.refresh();
  }

  focus(): void {
    this.list.get_first_child()?.grab_key_focus();
  }

  preferredHeight(width: number, limit: number): number {
    const theme = this.actor.get_theme_node();
    const contentWidth = width - theme.get_horizontal_padding();
    const footer = this.actor.get_last_child()!.get_preferred_height(contentWidth)[1];
    const list = this.list.get_preferred_height(contentWidth)[1];
    return Math.min(limit, list + footer + theme.get_length('spacing') + theme.get_vertical_padding());
  }

  private refresh(): void {
    if (!this.dirty) return;
    this.dirty = false;
    this.list.destroy_all_children();
    for (const text of this.history.entries) this.list.add_child(this.row(text));
    if (this.actor.visible) this.layoutChanged();
  }

  private row(text: string): St.Button {
    const label = new St.Label({ text: text.trim().replace(/\s+/g, ' '), style_class: 'kestrel-clipboard-text', x_expand: true, x_align: Clutter.ActorAlign.FILL });
    label.clutter_text.line_wrap = true;
    label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
    label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
    label.clutter_text.line_alignment = Pango.Alignment.LEFT;
    const row = new St.Button({
      style_class: 'kestrel-clipboard-row', child: label, x_expand: true,
      can_focus: true, track_hover: true, accessible_name: label.text,
    });
    row.connect('clicked', () => this.paste(text));
    row.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Delete) return Clutter.EVENT_PROPAGATE;
      this.history.remove(text);
      this.focus();
      return Clutter.EVENT_STOP;
    });
    row.connect('key-focus-in', () => {
      const [, y] = row.get_transformed_position();
      const [, top] = this.scroll.get_transformed_position();
      if (y < top) this.scroll.vadjustment.value += y - top;
      else if (y + row.height > top + this.scroll.height) this.scroll.vadjustment.value += y + row.height - top - this.scroll.height;
    });
    this.menus.bind(row, () => [
      { label: 'Paste', run: () => this.paste(text) },
      { label: 'Copy', run: () => { this.copy(text); this.close(); } },
      { label: 'Remove', run: () => this.history.remove(text) },
    ]);
    return row;
  }

  private copy(text: string): void {
    St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, text);
  }

  private paste(text: string): void {
    this.copy(text);
    this.close();
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, PASTE_DELAY_MS, () => {
      const shellGlobal = global as unknown as Shell.Global;
      const app = Shell.WindowTracker.get_default().focus_app;
      const terminal = app?.get_app_info()?.get_categories()?.split(';').includes('TerminalEmulator') ?? false;
      this.keyboard ??= shellGlobal.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
      const keyboard = this.keyboard;
      const keys = terminal ? [Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_v] : [Clutter.KEY_Control_L, Clutter.KEY_v];
      const time = GLib.get_monotonic_time();
      for (const key of keys) keyboard.notify_keyval(time, key, Clutter.KeyState.PRESSED);
      for (const key of keys.reverse()) keyboard.notify_keyval(time, key, Clutter.KeyState.RELEASED);
      return GLib.SOURCE_REMOVE;
    });
  }
}
