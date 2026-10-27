import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import * as PopupMenu from '../popups/popupMenu.js';
import * as Screenshot from '../screenshot/screenshot.js';

export class WindowMenu extends PopupMenu.PopupMenu {
    constructor(window, sourceActor) {
        super(sourceActor, 0, St.Side.TOP);

        this.actor.add_style_class_name('window-menu');

        Main.layoutManager.uiGroup.add_child(this.actor);
        this.actor.hide();

        this._buildMenu(window);
    }

    _buildMenu(window) {
        const type = window.get_window_type();

        let item;

        item = this.addAction(KestrelUi.t('title-bar-menu-screenshot'), async () => {
            try {
                const actor = window.get_compositor_private();
                const content = actor.paint_to_content(null);
                const texture = content.get_texture();

                await Screenshot.captureScreenshot(texture, null, 1, null);
            } catch (e) {
                logError(e, 'Error capturing screenshot');
            }
        });

        item = this.addAction(KestrelUi.t('title-bar-menu-hide'), () => {
            window.minimize();
        });
        if (!window.can_minimize())
            item.setSensitive(false);

        if (window.is_maximized()) {
            item = this.addAction(KestrelUi.t('title-bar-menu-restore'), () => {
                window.unmaximize();
            });
        } else {
            item = this.addAction(KestrelUi.t('title-bar-menu-maximize'), () => {
                window.maximize();
            });
        }
        if (!window.can_maximize())
            item.setSensitive(false);

        item = this.addAction(KestrelUi.t('title-bar-menu-move'), event => {
            const backend = global.stage.get_context().get_backend();
            const sprite = backend.get_sprite(global.stage, event) ||
                backend.get_pointer_sprite(global.stage);

            window.begin_grab_op(
                Meta.GrabOp.KEYBOARD_MOVING,
                sprite,
                event.get_time(),
                null);
        });
        if (!window.allows_move())
            item.setSensitive(false);

        item = this.addAction(KestrelUi.t('title-bar-menu-resize'), event => {
            const backend = global.stage.get_context().get_backend();
            const sprite = backend.get_sprite(global.stage, event) ||
                backend.get_pointer_sprite(global.stage);

            window.begin_grab_op(
                Meta.GrabOp.KEYBOARD_RESIZING_UNKNOWN,
                sprite,
                event.get_time(),
                null);
        });
        if (!window.allows_resize())
            item.setSensitive(false);

        item = this.addAction(KestrelUi.t('title-bar-menu-always-on-top'), () => {
            if (window.is_above())
                window.unmake_above();
            else
                window.make_above();
        });
        if (window.is_above())
            item.setOrnament(PopupMenu.Ornament.CHECK);
        if (window.is_maximized() ||
            type === Meta.WindowType.DOCK ||
            type === Meta.WindowType.DESKTOP ||
            type === Meta.WindowType.SPLASHSCREEN)
            item.setSensitive(false);

        if (Main.sessionMode.hasWorkspaces &&
            (!Meta.prefs_get_workspaces_only_on_primary() ||
             window.is_on_primary_monitor())) {
            const isSticky = window.is_on_all_workspaces();

            item = this.addAction(KestrelUi.t('title-bar-menu-always-on-visible-workspace'), () => {
                if (isSticky)
                    window.unstick();
                else
                    window.stick();
            });
            if (isSticky)
                item.setOrnament(PopupMenu.Ornament.CHECK);
            if (window.is_always_on_all_workspaces())
                item.setSensitive(false);

            if (!isSticky) {
                const workspace = window.get_workspace();
                if (workspace !== workspace.get_neighbor(Meta.MotionDirection.LEFT)) {
                    this.addAction(KestrelUi.t('title-bar-menu-workspace-left'), () => {
                        const dir = Meta.MotionDirection.LEFT;
                        window.change_workspace(workspace.get_neighbor(dir));
                    });
                }
                if (workspace !== workspace.get_neighbor(Meta.MotionDirection.RIGHT)) {
                    this.addAction(KestrelUi.t('title-bar-menu-workspace-right'), () => {
                        const dir = Meta.MotionDirection.RIGHT;
                        window.change_workspace(workspace.get_neighbor(dir));
                    });
                }
                if (workspace !== workspace.get_neighbor(Meta.MotionDirection.UP)) {
                    this.addAction(KestrelUi.t('title-bar-menu-workspace-up'), () => {
                        const dir = Meta.MotionDirection.UP;
                        window.change_workspace(workspace.get_neighbor(dir));
                    });
                }
                if (workspace !== workspace.get_neighbor(Meta.MotionDirection.DOWN)) {
                    this.addAction(KestrelUi.t('title-bar-menu-workspace-down'), () => {
                        const dir = Meta.MotionDirection.DOWN;
                        window.change_workspace(workspace.get_neighbor(dir));
                    });
                }
            }
        }

        const display = global.display;
        const nMonitors = display.get_n_monitors();
        const monitorIndex = window.get_monitor();
        if (nMonitors > 1 && monitorIndex >= 0) {
            this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            let dir = Meta.DisplayDirection.UP;
            const upMonitorIndex =
                display.get_monitor_neighbor_index(monitorIndex, dir);
            if (upMonitorIndex !== -1) {
                this.addAction(KestrelUi.t('title-bar-menu-monitor-up'), () => {
                    window.move_to_monitor(upMonitorIndex);
                });
            }

            dir = Meta.DisplayDirection.DOWN;
            const downMonitorIndex =
                display.get_monitor_neighbor_index(monitorIndex, dir);
            if (downMonitorIndex !== -1) {
                this.addAction(KestrelUi.t('title-bar-menu-monitor-down'), () => {
                    window.move_to_monitor(downMonitorIndex);
                });
            }

            dir = Meta.DisplayDirection.LEFT;
            const leftMonitorIndex =
                display.get_monitor_neighbor_index(monitorIndex, dir);
            if (leftMonitorIndex !== -1) {
                this.addAction(KestrelUi.t('title-bar-menu-monitor-left'), () => {
                    window.move_to_monitor(leftMonitorIndex);
                });
            }

            dir = Meta.DisplayDirection.RIGHT;
            const rightMonitorIndex =
                display.get_monitor_neighbor_index(monitorIndex, dir);
            if (rightMonitorIndex !== -1) {
                this.addAction(KestrelUi.t('title-bar-menu-monitor-right'), () => {
                    window.move_to_monitor(rightMonitorIndex);
                });
            }
        }

        this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        item = this.addAction(KestrelUi.t('title-bar-menu-close'), event => {
            window.delete(event.get_time());
        });
        if (!window.can_close())
            item.setSensitive(false);
    }

    addAction(label, callback) {
        const item = super.addAction(label, callback);
        item.setOrnament(PopupMenu.Ornament.NONE);
        return item;
    }
}

export class WindowMenuManager {
    constructor() {
        this._manager = new PopupMenu.PopupMenuManager();

        this._sourceActor = new St.Widget({reactive: true, visible: false});

        this._clickGesture = new Clutter.ClickGesture();
        this._clickGesture.set_recognize_on_press(true);
        this._clickGesture.connect('recognize', () => {
            this._manager.activeMenu.toggle();
        });
        this._sourceActor.add_action(this._clickGesture);
        Main.uiGroup.add_child(this._sourceActor);
    }

    showWindowMenuForWindow(window, type, rect) {
        if (!Main.sessionMode.hasWmMenus)
            return;

        if (type !== Meta.WindowMenuType.WM)
            throw new Error('Unsupported window menu type');
        const menu = new WindowMenu(window, this._sourceActor);

        this._manager.addMenu(menu);

        menu.connect('activate', () => {
            window.check_alive(global.get_current_time());
        });
        const destroyId = window.connect('unmanaged', () => {
            menu.close({animate: false});
        });

        this._sourceActor.set_size(Math.max(1, rect.width), Math.max(1, rect.height));
        this._sourceActor.set_position(rect.x, rect.y);
        this._sourceActor.show();

        menu.open({fadeOnly: true});
        menu.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
        menu.connect('open-state-changed', (menu_, isOpen) => {
            if (isOpen)
                return;

            this._sourceActor.hide();
            menu.destroy();
            window.disconnect(destroyId);
        });
    }
}
