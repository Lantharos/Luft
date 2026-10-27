import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import { SwitcherList } from './switcherList.js';
import { SwitcherPopup } from './switcherPopup.js';

const POPUP_APPICON_SIZE = 96;

const SortGroup = {
  TOP: 0,
  MIDDLE: 1,
} as const;
type SortGroup = typeof SortGroup[keyof typeof SortGroup];

interface FocusGroup {
  root: Clutter.Actor;
  nameId: string;
  iconName: string;
  sortGroup: SortGroup;
  focus(timestamp: number): void;
}

interface FocusItem {
  name: string;
  proxy: Clutter.Actor;
  sortGroup: SortGroup;
  iconName: string | null;
  iconActor: St.Widget | null;
  focus(timestamp: number): void;
}

function compareItems(a: FocusItem, b: FocusItem): number {
  if (a.sortGroup !== b.sortGroup) return a.sortGroup - b.sortGroup;

  const [ax] = a.proxy.get_transformed_position();
  const [bx] = b.proxy.get_transformed_position();
  return ax - bx;
}

function windowItems(): FocusItem[] {
  const windowTracker = Shell.WindowTracker.get_default();
  const windows = global.display.get_tab_list(Meta.TabList.DOCKS, global.workspace_manager.get_active_workspace());
  return windows.map(window => {
    const desktop = window.get_window_type() === Meta.WindowType.DESKTOP;
    return {
      name: window.title,
      proxy: window.get_compositor_private(),
      sortGroup: SortGroup.MIDDLE,
      iconName: desktop ? 'shell-focus-desktop-symbolic' : null,
      iconActor: desktop ? null : KestrelUi.appIcon(windowTracker.get_window_app(window), POPUP_APPICON_SIZE),
      focus: (timestamp: number) => Main.activateWindow(window, timestamp),
    };
  });
}

export class CtrlAltTabManager {
  private readonly groups: FocusGroup[] = [{
    root: global.window_group,
    nameId: 'ctrl-alt-tab-windows',
    iconName: 'shell-focus-windows-symbolic',
    sortGroup: SortGroup.TOP,
    focus: timestamp => global.display.focus_default_window(timestamp),
  }];

  private switcher: CtrlAltTabPopup | null = null;

  addGroup(root: St.Widget, nameId: string, iconName: string): void {
    this.groups.push({
      root,
      nameId,
      iconName,
      sortGroup: SortGroup.MIDDLE,
      focus: () => root.navigate_focus(null, St.DirectionType.TAB_FORWARD, false),
    });
    root.connect('destroy', () => this.removeGroup(root));
    global.focus_manager.add_group(root);
  }

  private removeGroup(root: St.Widget): void {
    global.focus_manager.remove_group(root);
    const index = this.groups.findIndex(group => group.root === root);
    if (index !== -1) this.groups.splice(index, 1);
  }

  popup(backward: boolean, binding: string, mask: number): void {
    const items: FocusItem[] = this.groups
      .filter(group => group.root.mapped)
      .map(({ root, nameId, iconName, sortGroup, focus }) => ({ name: KestrelUi.t(nameId), proxy: root, iconName, iconActor: null, sortGroup, focus }));

    if (Main.sessionMode.hasWindows) items.push(...windowItems());

    if (!items.length) return;

    items.sort(compareItems);

    if (this.switcher) return;

    this.switcher = new CtrlAltTabPopup(items);
    this.switcher.open(backward, binding, mask);
    this.switcher.connect('destroy', () => (this.switcher = null));
  }
}

class CtrlAltTabSwitcher extends SwitcherList {
  static {
    GObject.registerClass(this);
  }

  constructor(items: FocusItem[]) {
    super(true);

    for (const item of items) this.addIcon(item);
  }

  private addIcon(item: FocusItem): void {
    const box = new St.BoxLayout({ style_class: 'alt-tab-app', orientation: Clutter.Orientation.VERTICAL });

    box.add_child(item.iconActor ?? new St.Icon({ icon_name: item.iconName, icon_size: POPUP_APPICON_SIZE }));

    const text = new St.Label({ text: item.name, x_align: Clutter.ActorAlign.CENTER });
    box.add_child(text);

    this.addItem(box, text);
  }
}

class CtrlAltTabPopup extends SwitcherPopup<FocusItem> {
  static {
    GObject.registerClass(this);
  }

  constructor(items: FocusItem[]) {
    super(items, new CtrlAltTabSwitcher(items));
  }

  protected keyPressHandler(keysym: number, action: number): boolean {
    if (action === Meta.KeyBindingAction.SWITCH_PANELS) this.select(this.next());
    else if (action === Meta.KeyBindingAction.SWITCH_PANELS_BACKWARD) this.select(this.previous());
    else if (keysym === Clutter.KEY_Left) this.select(this.previous());
    else if (keysym === Clutter.KEY_Right) this.select(this.next());
    else return Clutter.EVENT_PROPAGATE;

    return Clutter.EVENT_STOP;
  }

  protected finish(timestamp: number): void {
    super.finish(timestamp);
    this.items[this.selectedIndex].focus(timestamp);
  }
}
