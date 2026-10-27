import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import { ItemList } from './switcherList.js';
import { SwitcherPopup } from './switcherPopup.js';
import { switchableWindows } from './altTab.js';

class CyclerHighlight extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private window: Meta.Window | null = null;
  private readonly clone = new Clutter.Clone();
  private readonly frame = new St.Widget({ style_class: 'cycler-highlight' });

  constructor() {
    super({ layout_manager: new Clutter.BinLayout() });

    this.add_child(this.clone);
    this.add_child(this.frame);

    const constraint = new Clutter.BindConstraint({ coordinate: Clutter.BindCoordinate.ALL });
    this.clone.bind_property('source', constraint, 'source', 0);
    this.add_constraint(constraint);

    this.connect('destroy', () => this.setWindow(null));
  }

  setWindow(window: Meta.Window | null): void {
    if (this.window === window) return;

    this.window?.disconnectObject(this);

    this.window = window;

    (this.clone.source as Meta.WindowActor | null)?.sync_visibility();

    const windowActor = window?.get_compositor_private<Meta.WindowActor>() ?? null;
    windowActor?.hide();

    this.clone.set_source(windowActor);

    if (window) {
      this.onSizeChanged(window);
      window.connectObject('size-changed', () => this.onSizeChanged(window), this);
    } else {
      this.frame.set_size(0, 0);
      this.frame.hide();
    }
  }

  private onSizeChanged(window: Meta.Window): void {
    const bufferRect = window.get_buffer_rect();
    const rect = window.get_frame_rect();
    this.frame.set_size(rect.width, rect.height);
    this.frame.set_position(rect.x - bufferRect.x, rect.y - bufferRect.y);
    this.frame.show();
  }
}

namespace CyclerList {
  export interface Signals extends ItemList.Signals {
    'item-highlighted': (index: number) => void;
  }
}

class CyclerList extends ItemList {
  static {
    GObject.registerClass({
      Signals: { 'item-highlighted': { param_types: [GObject.TYPE_INT] } },
    }, this);
  }

  declare connect: GObject.SignalMethods<this, CyclerList.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, CyclerList.Signals>['emit'];

  highlight(index: number): void {
    this.emit('item-highlighted', index);
  }
}

abstract class CyclerPopup extends SwitcherPopup<Meta.Window> {
  static {
    GObject.registerClass({ GTypeFlags: GObject.TypeFlags.ABSTRACT }, this as unknown as typeof St.Widget);
  }

  private readonly cyclerHighlight = new CyclerHighlight();

  constructor(windows: Meta.Window[]) {
    const list = new CyclerList();
    super(windows, list);

    global.window_group.add_child(this.cyclerHighlight);

    list.connect('item-highlighted', (_list, index) => {
      this.cyclerHighlight.setWindow(this.items[index]);
      global.window_group.set_child_above_sibling(this.cyclerHighlight, null);
    });
  }

  protected finish(timestamp: number): void {
    const window = this.items[this.selectedIndex];
    const workspace = window.get_workspace();
    const activeWorkspace = global.workspace_manager.get_active_workspace();

    if (window.minimized) {
      Main.wm.skipNextEffect(window.get_compositor_private());
      window.unminimize();
    }

    if (activeWorkspace === workspace) {
      Main.activateWindow(window);
      KestrelUi.enterBoardWindow(window);
    } else {
      activeWorkspace.activate_with_focus(window, global.get_current_time());
      Main.wm.actionMoveWindow(window, workspace);
    }

    super.finish(timestamp);
  }

  protected onDestroy(): void {
    this.cyclerHighlight.destroy();

    super.onDestroy();
  }
}

function focusedAppWindows(): Meta.Window[] {
  const settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.app-switcher' });
  const windows = Shell.WindowTracker.get_default().focus_app?.get_windows() ?? [];
  if (!settings.get_boolean('current-workspace-only')) return windows;

  const workspace = global.workspace_manager.get_active_workspace();
  return windows.filter(window => window.located_on_workspace(workspace));
}

export class GroupCyclerPopup extends CyclerPopup {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(focusedAppWindows());
  }

  protected keyPressHandler(_keysym: number, action: number): boolean {
    if (action === Meta.KeyBindingAction.CYCLE_GROUP) this.select(this.next());
    else if (action === Meta.KeyBindingAction.CYCLE_GROUP_BACKWARD) this.select(this.previous());
    else return Clutter.EVENT_PROPAGATE;

    return Clutter.EVENT_STOP;
  }
}

export class WindowCyclerPopup extends CyclerPopup {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(switchableWindows(false));
  }

  protected keyPressHandler(_keysym: number, action: number): boolean {
    if (action === Meta.KeyBindingAction.CYCLE_WINDOWS) this.select(this.next());
    else if (action === Meta.KeyBindingAction.CYCLE_WINDOWS_BACKWARD) this.select(this.previous());
    else return Clutter.EVENT_PROPAGATE;

    return Clutter.EVENT_STOP;
  }
}
