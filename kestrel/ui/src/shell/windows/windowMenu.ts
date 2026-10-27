import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import * as PopupMenu from '../popups/popupMenu.js';
import { captureScreenshot } from '../screenshot/capture.js';

const WORKSPACE_MOVES = [
  [Meta.MotionDirection.LEFT, 'title-bar-menu-workspace-left'],
  [Meta.MotionDirection.RIGHT, 'title-bar-menu-workspace-right'],
  [Meta.MotionDirection.UP, 'title-bar-menu-workspace-up'],
  [Meta.MotionDirection.DOWN, 'title-bar-menu-workspace-down'],
] as const;

const MONITOR_MOVES = [
  [Meta.DisplayDirection.UP, 'title-bar-menu-monitor-up'],
  [Meta.DisplayDirection.DOWN, 'title-bar-menu-monitor-down'],
  [Meta.DisplayDirection.LEFT, 'title-bar-menu-monitor-left'],
  [Meta.DisplayDirection.RIGHT, 'title-bar-menu-monitor-right'],
] as const;

const UNPINNABLE_TYPES = [Meta.WindowType.DOCK, Meta.WindowType.DESKTOP, Meta.WindowType.SPLASHSCREEN];

function beginKeyboardGrab(window: Meta.Window, op: Meta.GrabOp, event: Clutter.Event): void {
  const backend = global.stage.get_context().get_backend();
  const sprite = backend.get_sprite(global.stage, event) || backend.get_pointer_sprite(global.stage);
  window.begin_grab_op(op, sprite, event.get_time(), null);
}

class WindowMenu extends PopupMenu.PopupMenu {
  constructor(window: Meta.Window, sourceActor: Clutter.Actor) {
    super(sourceActor, 0, St.Side.TOP);

    this.actor.add_style_class_name('window-menu');

    Main.layoutManager.uiGroup.add_child(this.actor);
    this.actor.hide();

    this.buildMenu(window);
  }

  private buildMenu(window: Meta.Window): void {
    this.addAction(KestrelUi.t('title-bar-menu-screenshot'), async () => {
      try {
        const actor = window.get_compositor_private() as Meta.WindowActor;
        const content = actor.paint_to_content(null) as Clutter.TextureContent;
        await captureScreenshot(content.get_texture(), null, 1, null);
      } catch (e) {
        logError(e as Error, 'Error capturing screenshot');
      }
    });

    const hide = this.addAction(KestrelUi.t('title-bar-menu-hide'), () => window.minimize());
    if (!window.can_minimize()) hide.setSensitive(false);

    const maximized = window.is_maximized();
    const maximize = this.addAction(KestrelUi.t(maximized ? 'title-bar-menu-restore' : 'title-bar-menu-maximize'),
      () => maximized ? window.unmaximize() : window.maximize());
    if (!window.can_maximize()) maximize.setSensitive(false);

    const move = this.addAction(KestrelUi.t('title-bar-menu-move'),
      event => beginKeyboardGrab(window, Meta.GrabOp.KEYBOARD_MOVING, event!));
    if (!window.allows_move()) move.setSensitive(false);

    const resize = this.addAction(KestrelUi.t('title-bar-menu-resize'),
      event => beginKeyboardGrab(window, Meta.GrabOp.KEYBOARD_RESIZING_UNKNOWN, event!));
    if (!window.allows_resize()) resize.setSensitive(false);

    const onTop = this.addAction(KestrelUi.t('title-bar-menu-always-on-top'),
      () => window.is_above() ? window.unmake_above() : window.make_above());
    if (window.is_above()) onTop.setOrnament(PopupMenu.Ornament.CHECK);
    if (maximized || UNPINNABLE_TYPES.includes(window.get_window_type())) onTop.setSensitive(false);

    if (Main.sessionMode.hasWorkspaces && (!Meta.prefs_get_workspaces_only_on_primary() || window.is_on_primary_monitor()))
      this.addWorkspaceActions(window);

    this.addMonitorActions(window);

    this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    const close = this.addAction(KestrelUi.t('title-bar-menu-close'), event => window.delete(event!.get_time()));
    if (!window.can_close()) close.setSensitive(false);
  }

  private addWorkspaceActions(window: Meta.Window): void {
    const sticky = window.is_on_all_workspaces();

    const stick = this.addAction(KestrelUi.t('title-bar-menu-always-on-visible-workspace'), () => sticky ? window.unstick() : window.stick());
    if (sticky) stick.setOrnament(PopupMenu.Ornament.CHECK);
    if (window.is_always_on_all_workspaces()) stick.setSensitive(false);
    if (sticky) return;

    const workspace = window.get_workspace();
    for (const [direction, label] of WORKSPACE_MOVES) {
      const neighbor = workspace.get_neighbor(direction);
      if (workspace !== neighbor)
        this.addAction(KestrelUi.t(label), () => window.change_workspace(workspace.get_neighbor(direction)));
    }
  }

  private addMonitorActions(window: Meta.Window): void {
    const display = global.display;
    const monitorIndex = window.get_monitor();
    if (display.get_n_monitors() <= 1 || monitorIndex < 0) return;

    this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    for (const [direction, label] of MONITOR_MOVES) {
      const neighbor = display.get_monitor_neighbor_index(monitorIndex, direction);
      if (neighbor !== -1) this.addAction(KestrelUi.t(label), () => window.move_to_monitor(neighbor));
    }
  }

  addAction(label: string, callback: (event: Clutter.Event | null) => void): PopupMenu.PopupMenuItem | PopupMenu.PopupImageMenuItem {
    const item = super.addAction(label, callback);
    item.setOrnament(PopupMenu.Ornament.NONE);
    return item;
  }
}

export class WindowMenuManager {
  readonly manager = new PopupMenu.PopupMenuManager();
  private readonly sourceActor = new St.Widget({ reactive: true, visible: false });

  constructor() {
    const clickGesture = new Clutter.ClickGesture();
    clickGesture.set_recognize_on_press(true);
    clickGesture.connect('recognize', () => this.manager.activeMenu!.toggle());
    this.sourceActor.add_action(clickGesture);
    Main.uiGroup.add_child(this.sourceActor);
  }

  showWindowMenuForWindow(window: Meta.Window, type: Meta.WindowMenuType, rect: Mtk.Rectangle): void {
    if (!Main.sessionMode.hasWmMenus) return;

    if (type !== Meta.WindowMenuType.WM) throw new Error('Unsupported window menu type');
    const menu = new WindowMenu(window, this.sourceActor);

    this.manager.addMenu(menu);

    menu.connect('activate', () => window.check_alive(global.get_current_time()));
    const destroyId = window.connect('unmanaged', () => menu.close({ animate: false }));

    this.sourceActor.set_size(Math.max(1, rect.width), Math.max(1, rect.height));
    this.sourceActor.set_position(rect.x, rect.y);
    this.sourceActor.show();

    menu.open({ fadeOnly: true });
    menu.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
    menu.connect('open-state-changed', (_menu, isOpen) => {
      if (isOpen) return;

      this.sourceActor.hide();
      menu.destroy();
      window.disconnect(destroyId);
    });
  }
}
