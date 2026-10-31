import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import St from 'gi://St';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import { t } from '../../shared/i18n/index.js';
import { SwitcherList } from './switcherList.js';
import { SwitcherPopup } from './switcherPopup.js';

const PREVIEW_WIDTH = 224;
const PREVIEW_HEIGHT = 140;
const TITLE_ICON_SIZE = 16;

export function switchableWindows(focusedAppOnly: boolean): Meta.Window[] {
  const settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.window-switcher' });
  const workspace = settings.get_boolean('current-workspace-only') ? global.workspace_manager.get_active_workspace() : null;
  const windows = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, workspace)
    .map(window => window.is_attached_dialog() ? window.get_transient_for()! : window)
    .filter((window, index, all) => !window.skip_taskbar && all.indexOf(window) === index);
  if (!focusedAppOnly) return windows;

  const tracker = Shell.WindowTracker.get_default();
  const app = tracker.focus_app;
  return windows.filter(window => tracker.get_window_app(window) === app);
}

class WindowCard extends St.BoxLayout {
  static {
    GObject.registerClass(this);
  }

  readonly titleLabel: St.Label;
  private readonly close: St.Button;

  constructor(readonly window: Meta.Window) {
    super({ style_class: 'kestrel-switcher-window', orientation: Clutter.Orientation.VERTICAL });

    const app = Shell.WindowTracker.get_default().get_window_app(window);

    const header = new St.BoxLayout({ style_class: 'kestrel-switcher-header', width: PREVIEW_WIDTH });
    const icon = app
      ? KestrelUi.windowIcon(app, window, TITLE_ICON_SIZE)
      : new St.Icon({ icon_name: 'application-x-executable', icon_size: TITLE_ICON_SIZE });
    icon.y_align = Clutter.ActorAlign.CENTER;
    header.add_child(icon);
    this.titleLabel = new St.Label({
      text: window.get_title() ?? app?.get_name() ?? '',
      style_class: 'kestrel-switcher-title',
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.titleLabel.clutter_text.ellipsize = Pango.EllipsizeMode.END;
    header.add_child(this.titleLabel);
    this.close = new St.Button({
      style_class: 'kestrel-switcher-close',
      opacity: 0,
      reactive: false,
      child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: TITLE_ICON_SIZE }),
    });
    this.close.connect('clicked', () => window.delete(global.get_current_time()));
    header.add_child(this.close);
    this.add_child(header);

    const preview = new St.Widget({
      style_class: 'kestrel-switcher-preview',
      layout_manager: new Clutter.BinLayout(),
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
    });
    const actor = window.get_compositor_private<Meta.WindowActor>()!;
    const [width, height] = actor.get_size();
    const scale = Math.min(1, PREVIEW_WIDTH / width, PREVIEW_HEIGHT / height);
    preview.add_child(new Clutter.Clone({
      source: actor,
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
      y_expand: true,
    }));
    this.add_child(preview);

    this.nameClose();
    window.connectObject('notify::title', () => {
      this.titleLabel.text = window.get_title() ?? '';
      this.nameClose();
    }, this);
  }

  showClose(shown: boolean): void {
    this.close.opacity = shown ? 255 : 0;
    this.close.reactive = shown;
  }

  private nameClose(): void {
    this.close.accessible_name = t('previews-close-window', { title: this.titleLabel.text });
  }
}

class WindowSwitcher extends SwitcherList {
  static {
    GObject.registerClass(this);
  }

  readonly cards: WindowCard[];

  constructor(windows: Meta.Window[]) {
    super(false);

    this.cards = windows.map(window => {
      const card = new WindowCard(window);
      this.addItem(card, card.titleLabel);
      window.connectObject('unmanaged', () => this.removeWindow(window), this);
      return card;
    });

    this.connect('destroy', () => {
      for (const card of this.cards) card.window.disconnectObject(this);
    });
  }

  highlight(index: number, justOutline = false): void {
    super.highlight(index, justOutline);
    this.cards.forEach((card, cardIndex) => card.showClose(cardIndex === index));
  }

  private removeWindow(window: Meta.Window): void {
    const index = this.cards.findIndex(card => card.window === window);
    if (index === -1) return;

    this.cards.splice(index, 1);
    this.removeItem(index);
  }
}

export class WindowSwitcherPopup extends SwitcherPopup<WindowCard> {
  static {
    GObject.registerClass(this);
  }

  constructor(bindingName: string) {
    const switcher = new WindowSwitcher(switchableWindows(bindingName.startsWith('switch-group')));
    super(switcher.cards, switcher);
  }

  protected keyPressHandler(keysym: number, action: number): boolean {
    const rtl = Clutter.get_default_text_direction() === Clutter.TextDirection.RTL;
    switch (action) {
      case Meta.KeyBindingAction.SWITCH_APPLICATIONS:
      case Meta.KeyBindingAction.SWITCH_WINDOWS:
      case Meta.KeyBindingAction.SWITCH_GROUP:
        this.select(this.next());
        return Clutter.EVENT_STOP;
      case Meta.KeyBindingAction.SWITCH_APPLICATIONS_BACKWARD:
      case Meta.KeyBindingAction.SWITCH_WINDOWS_BACKWARD:
      case Meta.KeyBindingAction.SWITCH_GROUP_BACKWARD:
        this.select(this.previous());
        return Clutter.EVENT_STOP;
    }

    if (keysym === Clutter.KEY_Left) this.select(rtl ? this.next() : this.previous());
    else if (keysym === Clutter.KEY_Right) this.select(rtl ? this.previous() : this.next());
    else if (keysym === Clutter.KEY_w || keysym === Clutter.KEY_W || keysym === Clutter.KEY_F4) this.items[this.selectedIndex]?.window.delete(global.get_current_time());
    else return Clutter.EVENT_PROPAGATE;

    return Clutter.EVENT_STOP;
  }

  protected finish(timestamp: number): void {
    const { window } = this.items[this.selectedIndex];
    if (window.minimized) {
      Main.wm.skipNextEffect(window.get_compositor_private());
      window.unminimize();
    }
    Main.activateWindow(window);
    KestrelUi.enterBoardWindow(window);

    super.finish(timestamp);
  }
}
