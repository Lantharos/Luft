import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import St from 'gi://St';
import Shell from 'gi://Shell';

import * as Main from './main.js';
import * as SwitcherPopup from './switcherPopup.js';

const PREVIEW_WIDTH = 224;
const PREVIEW_HEIGHT = 140;
const TITLE_ICON_SIZE = 16;

/**
 * @param {Meta.Workspace} workspace
 * @returns {Meta.Window}
 */
function getWindows(workspace) {
    // We ignore skip-taskbar windows in switchers, but if they are attached
    // to their parent, their position in the MRU list may be more appropriate
    // than the parent; so start with the complete list ...
    const windows = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, workspace);
    // ... map windows to their parent where appropriate ...
    return windows.map(w => {
        return w.is_attached_dialog() ? w.get_transient_for() : w;
    // ... and filter out skip-taskbar windows and duplicates
    }).filter((w, i, a) => !w.skip_taskbar && a.indexOf(w) === i);
}

const CyclerHighlight = GObject.registerClass(
class CyclerHighlight extends St.Widget {
    _init() {
        super._init({layout_manager: new Clutter.BinLayout()});
        this._window = null;

        this._clone = new Clutter.Clone();
        this.add_child(this._clone);

        this._highlight = new St.Widget({style_class: 'cycler-highlight'});
        this.add_child(this._highlight);

        const coordinate = Clutter.BindCoordinate.ALL;
        const constraint = new Clutter.BindConstraint({coordinate});
        this._clone.bind_property('source', constraint, 'source', 0);

        this.add_constraint(constraint);

        this.connect('destroy', this._onDestroy.bind(this));
    }

    set window(w) {
        if (this._window === w)
            return;

        this._window?.disconnectObject(this);

        this._window = w;

        if (this._clone.source)
            this._clone.source.sync_visibility();

        const windowActor = this._window?.get_compositor_private() ?? null;

        if (windowActor)
            windowActor.hide();

        this._clone.source = windowActor;

        if (this._window) {
            this._onSizeChanged();
            this._window.connectObject('size-changed',
                this._onSizeChanged.bind(this), this);
        } else {
            this._highlight.set_size(0, 0);
            this._highlight.hide();
        }
    }

    _onSizeChanged() {
        const bufferRect = this._window.get_buffer_rect();
        const rect = this._window.get_frame_rect();
        this._highlight.set_size(rect.width, rect.height);
        this._highlight.set_position(
            rect.x - bufferRect.x,
            rect.y - bufferRect.y);
        this._highlight.show();
    }

    _onDestroy() {
        this.window = null;
    }
});

// We don't show an actual popup, so just provide what SwitcherPopup
// expects instead of inheriting from SwitcherList
const CyclerList = GObject.registerClass({
    Signals: {
        'item-activated': {param_types: [GObject.TYPE_INT]},
        'item-entered': {param_types: [GObject.TYPE_INT]},
        'item-removed': {param_types: [GObject.TYPE_INT]},
        'item-highlighted': {param_types: [GObject.TYPE_INT]},
    },
}, class CyclerList extends St.Widget {
    highlight(index, _justOutline) {
        this.emit('item-highlighted', index);
    }
});

const CyclerPopup = GObject.registerClass({
    GTypeFlags: GObject.TypeFlags.ABSTRACT,
}, class CyclerPopup extends SwitcherPopup.SwitcherPopup {
    _init() {
        super._init();

        this._items = this._getWindows();

        this._highlight = new CyclerHighlight();
        global.window_group.add_child(this._highlight);

        this._switcherList = new CyclerList();
        this._switcherList.connect('item-highlighted', (list, index) => {
            this._highlightItem(index);
        });
    }

    _highlightItem(index, _justOutline) {
        this._highlight.window = this._items[index];
        global.window_group.set_child_above_sibling(this._highlight, null);
    }

    _finish() {
        const window = this._items[this._selectedIndex];
        const ws = window.get_workspace();
        const workspaceManager = global.workspace_manager;
        const activeWs = workspaceManager.get_active_workspace();

        if (window.minimized) {
            Main.wm.skipNextEffect(window.get_compositor_private());
            window.unminimize();
        }

        if (activeWs === ws) {
            Main.activateWindow(window);
        } else {
            // If the selected window is on a different workspace, we don't
            // want it to disappear, then slide in with the workspace; instead,
            // always activate it on the active workspace ...
            activeWs.activate_with_focus(window, global.get_current_time());

            // ... then slide it over to the original workspace if necessary
            Main.wm.actionMoveWindow(window, ws);
        }

        super._finish();
    }

    _onDestroy() {
        this._highlight.destroy();

        super._onDestroy();
    }
});


export const GroupCyclerPopup = GObject.registerClass(
class GroupCyclerPopup extends CyclerPopup {
    _init() {
        this._settings = new Gio.Settings({schema_id: 'org.gnome.shell.app-switcher'});
        super._init();
    }

    _getWindows() {
        const app = Shell.WindowTracker.get_default().focus_app;
        let appWindows = app?.get_windows() ?? [];

        if (this._settings.get_boolean('current-workspace-only')) {
            const workspaceManager = global.workspace_manager;
            const workspace = workspaceManager.get_active_workspace();
            appWindows = appWindows.filter(
                window => window.located_on_workspace(workspace));
        }

        return appWindows;
    }

    _keyPressHandler(keysym, action) {
        if (action === Meta.KeyBindingAction.CYCLE_GROUP)
            this._select(this._next());
        else if (action === Meta.KeyBindingAction.CYCLE_GROUP_BACKWARD)
            this._select(this._previous());
        else
            return Clutter.EVENT_PROPAGATE;

        return Clutter.EVENT_STOP;
    }
});

export const WindowSwitcherPopup = GObject.registerClass(
class WindowSwitcherPopup extends SwitcherPopup.SwitcherPopup {
    _init(bindingName) {
        super._init();
        this._settings = new Gio.Settings({schema_id: 'org.gnome.shell.window-switcher'});
        this._switcherList = new WindowSwitcher(this._getWindowList(bindingName.startsWith('switch-group')));
        this._items = this._switcherList.cards;
    }

    _getWindowList(focusedAppOnly) {
        const workspace = this._settings.get_boolean('current-workspace-only')
            ? global.workspace_manager.get_active_workspace()
            : null;
        const windows = getWindows(workspace);
        if (!focusedAppOnly)
            return windows;

        const tracker = Shell.WindowTracker.get_default();
        const app = tracker.focus_app;
        return windows.filter(window => tracker.get_window_app(window) === app);
    }

    _keyPressHandler(keysym, action) {
        const rtl = Clutter.get_default_text_direction() === Clutter.TextDirection.RTL;
        switch (action) {
        case Meta.KeyBindingAction.SWITCH_APPLICATIONS:
        case Meta.KeyBindingAction.SWITCH_WINDOWS:
        case Meta.KeyBindingAction.SWITCH_GROUP:
            this._select(this._next());
            return Clutter.EVENT_STOP;
        case Meta.KeyBindingAction.SWITCH_APPLICATIONS_BACKWARD:
        case Meta.KeyBindingAction.SWITCH_WINDOWS_BACKWARD:
        case Meta.KeyBindingAction.SWITCH_GROUP_BACKWARD:
            this._select(this._previous());
            return Clutter.EVENT_STOP;
        }

        if (keysym === Clutter.KEY_Left)
            this._select(rtl ? this._next() : this._previous());
        else if (keysym === Clutter.KEY_Right)
            this._select(rtl ? this._previous() : this._next());
        else if (keysym === Clutter.KEY_w || keysym === Clutter.KEY_W || keysym === Clutter.KEY_F4)
            this._items[this._selectedIndex]?.window.delete(global.get_current_time());
        else
            return Clutter.EVENT_PROPAGATE;

        return Clutter.EVENT_STOP;
    }

    _finish() {
        const {window} = this._items[this._selectedIndex];
        if (window.minimized) {
            Main.wm.skipNextEffect(window.get_compositor_private());
            window.unminimize();
        }
        Main.activateWindow(window);

        super._finish();
    }
});

export const WindowCyclerPopup = GObject.registerClass(
class WindowCyclerPopup extends CyclerPopup {
    _init() {
        this._settings = new Gio.Settings({schema_id: 'org.gnome.shell.window-switcher'});
        super._init();
    }

    _getWindows() {
        let workspace = null;

        if (this._settings.get_boolean('current-workspace-only')) {
            const workspaceManager = global.workspace_manager;

            workspace = workspaceManager.get_active_workspace();
        }

        return getWindows(workspace);
    }

    _keyPressHandler(keysym, action) {
        if (action === Meta.KeyBindingAction.CYCLE_WINDOWS)
            this._select(this._next());
        else if (action === Meta.KeyBindingAction.CYCLE_WINDOWS_BACKWARD)
            this._select(this._previous());
        else
            return Clutter.EVENT_PROPAGATE;

        return Clutter.EVENT_STOP;
    }
});

const WindowCard = GObject.registerClass(
class WindowCard extends St.BoxLayout {
    _init(window) {
        super._init({
            style_class: 'kestrel-switcher-window',
            orientation: Clutter.Orientation.VERTICAL,
        });

        this.window = window;
        const app = Shell.WindowTracker.get_default().get_window_app(window);

        const header = new St.BoxLayout({style_class: 'kestrel-switcher-header', width: PREVIEW_WIDTH});
        const icon = app
            ? app.create_window_icon_texture(window, TITLE_ICON_SIZE)
            : new St.Icon({icon_name: 'application-x-executable', icon_size: TITLE_ICON_SIZE});
        icon.y_align = Clutter.ActorAlign.CENTER;
        header.add_child(icon);
        this.label = new St.Label({
            text: window.get_title() ?? app?.get_name() ?? '',
            style_class: 'kestrel-switcher-title',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
        header.add_child(this.label);
        this.add_child(header);

        const preview = new St.Widget({
            style_class: 'kestrel-switcher-preview',
            layout_manager: new Clutter.BinLayout(),
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
        });
        const actor = window.get_compositor_private();
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

        window.connectObject('notify::title', () => {
            this.label.text = window.get_title() ?? '';
        }, this);
    }
});

const WindowSwitcher = GObject.registerClass(
class WindowSwitcher extends SwitcherPopup.SwitcherList {
    _init(windows) {
        super._init(false);

        this.cards = windows.map(window => {
            const card = new WindowCard(window);
            this.addItem(card, card.label);
            window.connectObject('unmanaged', () => this._removeWindow(window), this);
            return card;
        });

        this.connect('destroy', () => {
            for (const card of this.cards)
                card.window.disconnectObject(this);
        });
    }

    _removeWindow(window) {
        const index = this.cards.findIndex(card => card.window === window);
        if (index === -1)
            return;

        this.cards.splice(index, 1);
        this.removeItem(index);
    }
});
