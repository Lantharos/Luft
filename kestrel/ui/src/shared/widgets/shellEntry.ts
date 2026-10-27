import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import * as PopupMenu from '../popups/popupMenu.js';

type MenuItem = InstanceType<typeof PopupMenu.PopupMenuItem>;

export class EntryMenu extends PopupMenu.PopupMenu {
  private readonly clipboard = St.Clipboard.get_default();
  private readonly copyItem: MenuItem;
  private readonly pasteItem: MenuItem;
  private readonly passwordItem: MenuItem | null = null;

  constructor(private readonly entry: St.Entry) {
    super(entry, 0, St.Side.TOP);

    this.copyItem = new PopupMenu.PopupMenuItem('');
    KestrelUi.bindText(this.copyItem.label, 'entry-menu-copy');
    this.copyItem.connect('activate', () => this.onCopyActivated());
    this.addMenuItem(this.copyItem);

    this.pasteItem = new PopupMenu.PopupMenuItem('');
    KestrelUi.bindText(this.pasteItem.label, 'entry-menu-paste');
    this.pasteItem.connect('activate', () => this.onPasteActivated());
    this.addMenuItem(this.pasteItem);

    if (entry instanceof St.PasswordEntry) this.passwordItem = this.makePasswordItem(entry);

    Main.uiGroup.add_child(this.actor);
    this.actor.hide();
  }

  private makePasswordItem(entry: St.PasswordEntry): MenuItem {
    const item = new PopupMenu.PopupMenuItem('');
    item.connect('activate', () => (entry.password_visible = !entry.password_visible));
    this.addMenuItem(item);
    entry.bind_property('show-peek-icon', item, 'visible', GObject.BindingFlags.SYNC_CREATE);
    return item;
  }

  open(params = {}): boolean {
    if (!super.open(params)) return false;

    this.updatePasteItem();
    this.updateCopyItem();
    if (this.passwordItem) this.updatePasswordItem(this.passwordItem);

    this.entry.add_style_pseudo_class('focus');

    if (!this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false)) this.actor.grab_key_focus();
    return true;
  }

  private updateCopyItem(): void {
    const selection = this.entry.clutter_text.get_selection();
    this.copyItem.setSensitive(!this.entry.clutter_text.password_char && !!selection && selection !== '');
  }

  private updatePasteItem(): void {
    this.clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
      this.pasteItem.setSensitive(!!text && text !== '');
    });
  }

  private updatePasswordItem(item: MenuItem): void {
    const visible = (this.entry as St.PasswordEntry).password_visible;
    item.label.text = KestrelUi.t(visible ? 'entry-menu-hide-text' : 'entry-menu-show-text');
  }

  private onCopyActivated(): void {
    const selection = this.entry.clutter_text.get_selection();
    this.clipboard.set_text(St.ClipboardType.CLIPBOARD, selection);
  }

  private onPasteActivated(): void {
    this.clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
      if (!text) return;
      this.entry.clutter_text.delete_selection();
      const pos = this.entry.clutter_text.get_cursor_position();
      this.entry.clutter_text.insert_text(text, pos);
    });
  }
}

type MenuEntry = St.Entry & { menu: EntryMenu | null };

function setMenuAlignment(entry: MenuEntry, menu: EntryMenu, stageX: number): void {
  const [success, entryX] = entry.transform_stage_point(stageX, 0);
  if (success) menu.setSourceAlignment(entryX / entry.width);
}

function onMenuClickGesture(gesture: Clutter.ClickGesture, entry: MenuEntry, menu: EntryMenu): void {
  if (menu.isOpen) {
    menu.close();
  } else if (gesture.get_button() === Clutter.BUTTON_SECONDARY) {
    setMenuAlignment(entry, menu, gesture.get_coords_abs().x);
    menu.open();
  }
}

function onPopup(entry: MenuEntry, menu: EntryMenu): void {
  const [success, textX] = entry.clutter_text.position_to_coords(entry.clutter_text.get_cursor_position());
  if (success) menu.setSourceAlignment(textX / entry.width);
  menu.open();
}

export function addContextMenu(target: St.Entry, { actionMode = Shell.ActionMode.POPUP }: { actionMode?: Shell.ActionMode } = {}): void {
  const entry = target as MenuEntry;
  if (entry.menu) return;

  const menu = new EntryMenu(entry);
  entry.menu = menu;
  new PopupMenu.PopupMenuManager({ actionMode }).addMenu(menu);

  const clickGesture = new Clutter.ClickGesture();
  clickGesture.set_recognize_on_press(true);
  clickGesture.set_required_button(Clutter.BUTTON_SECONDARY);
  clickGesture.connect('recognize', () => onMenuClickGesture(clickGesture, entry, menu));
  entry.add_action_full('menu-click-gesture', Clutter.EventPhase.CAPTURE, clickGesture);

  entry.connect('popup-menu', () => onPopup(entry, menu));

  entry.connect('destroy', () => {
    menu.destroy();
    entry.menu = null;
  });
}

export const CapsLockWarning = GObject.registerClass(class CapsLockWarning extends St.Label {
  private readonly keymap: Clutter.Keymap;

  constructor(params: Partial<St.Label.ConstructorProps> = {}) {
    super({ style_class: 'caps-lock-warning-label', ...params });

    KestrelUi.bindText(this, 'entry-caps-lock-on');

    this.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    this.clutter_text.line_wrap = true;

    this.keymap = this.get_context().get_backend().get_default_seat().get_keymap();

    this.connect('notify::mapped', () => {
      if (this.is_mapped()) this.keymap.connectObject('state-changed', () => this.sync(true), this);
      else this.keymap.disconnectObject(this);

      this.sync(false);
    });
  }

  private sync(animate: boolean): void {
    const capsLockOn = this.keymap.get_caps_lock_state();

    this.remove_all_transitions();

    const naturalHeightSet = this.natural_height_set;
    this.natural_height_set = false;
    const [, height] = this.get_preferred_height(-1);
    this.natural_height_set = naturalHeightSet;

    if (capsLockOn) {
      this.add_accessible_state(Atk.StateType.SHOWING);
      this.add_accessible_state(Atk.StateType.VISIBLE);
    } else {
      this.remove_accessible_state(Atk.StateType.SHOWING);
      this.remove_accessible_state(Atk.StateType.VISIBLE);
    }

    this.ease({
      height: capsLockOn ? height : 0,
      opacity: capsLockOn ? 255 : 0,
      duration: animate ? 200 : 0,
      onComplete: () => {
        if (capsLockOn) this.height = -1;
      },
    });
  }
});
export type CapsLockWarning = InstanceType<typeof CapsLockWarning>;
