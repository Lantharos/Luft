import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GnomeDesktop from 'gi://GnomeDesktop';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import Meta from 'gi://Meta';
import St from 'gi://St';

import * as Config from '../misc/config.js';
import * as CtrlAltTab from './ctrlAltTab.js';
import * as PopupMenu from './popupMenu.js';
import * as PanelMenu from './panelMenu.js';
import {QuickSettingsMenu, SystemIndicator} from './quickSettings.js';
import * as Main from './main.js';
import * as Util from '../misc/util.js';

import * as RemoteAccessStatus from './status/remoteAccess.js';
import * as RFKillStatus from './status/rfkill.js';
import * as CameraStatus from './status/camera.js';
import * as VolumeStatus from './status/volume.js';
import * as BrightnessStatus from './status/brightness.js';
import * as SystemStatus from './status/system.js';

import {ATIndicator} from './status/accessibility.js';
import {InputSourceIndicator} from './status/keyboard.js';
import {DwellClickIndicator} from './status/dwellClick.js';
import {ScreenRecordingIndicator, ScreenSharingIndicator} from './status/remoteAccess.js';

const N_QUICK_SETTINGS_COLUMNS = 2;

const SessionClock = GObject.registerClass(
class SessionClock extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Clock'), true);
        this._clock = new GnomeDesktop.WallClock();
        const label = new St.Label({y_align: Clutter.ActorAlign.CENTER});
        this.add_child(label);
        this._clock.bind_property('clock', label, 'text', GObject.BindingFlags.SYNC_CREATE);
        this.connect('destroy', () => this._clock.run_dispose());
    }
});

const UnsafeModeIndicator = GObject.registerClass(
class UnsafeModeIndicator extends SystemIndicator {
    _init() {
        super._init();

        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'channel-insecure-symbolic';

        global.context.bind_property('unsafe-mode',
            this._indicator, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
    }
});

export const QuickSettings = GObject.registerClass(
class QuickSettings extends PanelMenu.Button {
    constructor() {
        super(0.0, C_('System menu in the top bar', 'System'), true);

        this._indicators = new St.BoxLayout({
            style_class: 'panel-status-indicators-box',
        });
        this.add_child(this._indicators);

        this.setMenu(new QuickSettingsMenu(this, N_QUICK_SETTINGS_COLUMNS));

        this.ready = this._setupIndicators();
        this.ready.catch(error =>
            logError(error, 'Failed to setup quick settings'));
    }

    async _setupIndicators() {
        if (Config.HAVE_NETWORKMANAGER) {
            /** @type {import('./status/network.js')} */
            const NetworkStatus = await import('./status/network.js');

            this._network = new NetworkStatus.Indicator();
        } else {
            this._network = null;
        }

        if (Config.HAVE_BLUETOOTH) {
            /** @type {import('./status/bluetooth.js')} */
            const BluetoothStatus = await import('./status/bluetooth.js');

            this._bluetooth = new BluetoothStatus.Indicator();
        } else {
            this._bluetooth = null;
        }

        this._system = new SystemStatus.Indicator();
        this._camera = new CameraStatus.Indicator();
        this._volumeOutput = new VolumeStatus.OutputIndicator();
        this._volumeInput = new VolumeStatus.InputIndicator();
        this._brightness = new BrightnessStatus.Indicator();
        this._remoteAccess = new RemoteAccessStatus.RemoteAccessApplet();
        this._rfkill = new RFKillStatus.Indicator();
        this._unsafeMode = new UnsafeModeIndicator();

        // add privacy-related indicators before any external indicators
        let pos = 0;
        this._indicators.insert_child_at_index(this._remoteAccess, pos++);
        this._indicators.insert_child_at_index(this._camera, pos++);
        this._indicators.insert_child_at_index(this._volumeInput, pos++);

        // append all other indicators
        this._indicators.add_child(this._brightness);
        if (this._network)
            this._indicators.add_child(this._network);
        if (this._bluetooth)
            this._indicators.add_child(this._bluetooth);
        this._indicators.add_child(this._rfkill);
        this._indicators.add_child(this._volumeOutput);
        this._indicators.add_child(this._unsafeMode);
        this._indicators.add_child(this._system);

        // add our quick settings items before any external ones
        const sibling = this.menu.getFirstItem();
        this._addItemsBefore(this._system.quickSettingsItems,
            sibling, N_QUICK_SETTINGS_COLUMNS);
        this._addItemsBefore(this._volumeOutput.quickSettingsItems,
            sibling, N_QUICK_SETTINGS_COLUMNS);
        this._addItemsBefore(this._volumeInput.quickSettingsItems,
            sibling, N_QUICK_SETTINGS_COLUMNS);
        this._addItemsBefore(this._brightness.quickSettingsItems,
            sibling, N_QUICK_SETTINGS_COLUMNS);

        this._addItemsBefore(this._camera.quickSettingsItems, sibling);
        this._addItemsBefore(this._remoteAccess.quickSettingsItems, sibling);
        if (this._network)
            this._addItemsBefore(this._network.quickSettingsItems, sibling);
        if (this._bluetooth)
            this._addItemsBefore(this._bluetooth.quickSettingsItems, sibling);
        this._addItemsBefore(this._rfkill.quickSettingsItems, sibling);
        this._addItemsBefore(this._unsafeMode.quickSettingsItems, sibling);
    }

    _addItemsBefore(items, sibling, colSpan = 1) {
        items.forEach(item => this.menu.insertItemBefore(item, sibling, colSpan));
    }

    /**
     * Insert indicator and quick settings items at
     * appropriate positions
     *
     * @param {SystemIndicator} indicator
     * @param {number=} colSpan
     */
    addExternalIndicator(indicator, colSpan = 1) {
        // Insert before first non-privacy indicator if it exists
        const sibling = this._brightness ?? null;
        this._indicators.insert_child_below(indicator, sibling);

        this._addItemsBefore(indicator.quickSettingsItems, null, colSpan);
    }
});

const PANEL_ITEM_IMPLEMENTATIONS = {
    'quickSettings': QuickSettings,
    'clock': SessionClock,
    'a11y': ATIndicator,
    'keyboard': InputSourceIndicator,
    'dwellClick': DwellClickIndicator,
    'screenRecording': ScreenRecordingIndicator,
    'screenSharing': ScreenSharingIndicator,
};

export class Panel extends St.Widget {
    static {
        GObject.registerClass(this);

        const bindingPool = this.get_binding_pool();

        bindingPool.install_closure(
            'unfocus', Clutter.KEY_Escape, 0,
            () => {
                global.display.focus_default_window(Clutter.CURRENT_TIME);
                return Clutter.EVENT_STOP;
            }
        );
    }

    _init() {
        super._init({
            name: 'panel',
            reactive: true,
        });

        this.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS);

        this._sessionStyle = null;

        this.statusArea = {};

        this.menuManager = new PopupMenu.PopupMenuManager(this);

        this._leftBox = new St.BoxLayout({name: 'panelLeft'});
        this.add_child(this._leftBox);
        this._centerBox = new St.BoxLayout({name: 'panelCenter'});
        this.add_child(this._centerBox);
        this._rightBox = new St.BoxLayout({name: 'panelRight'});
        this.add_child(this._rightBox);

        this._clickGesture = new Clutter.ClickGesture({
            recognize_on_press: true,
        });
        this._clickGesture.connect(
            'recognize', this._onWindowDragGestureRecognize.bind(this));
        this.add_action_full(
            'window-drag', Clutter.EventPhase.TARGET, this._clickGesture);

        Main.overview.connectObject('showing',
            () => this.add_style_pseudo_class('overview'),
            this);
        Main.overview.connectObject('hiding',
            () => this.remove_style_pseudo_class('overview'),
            this);

        Main.layoutManager.panelBox.add_child(this);
        Main.ctrlAltTabManager.addGroup(this,
            _('Top Bar'), 'shell-focus-top-bar-symbolic',
            {sortGroup: CtrlAltTab.SortGroup.TOP});

        Main.sessionMode.connectObject('updated',
            this._updatePanel.bind(this),
            this);

        global.display.connectObject('workareas-changed',
            () => this.queue_relayout(),
            this);
        this._updatePanel();
    }

    vfunc_get_preferred_width(_forHeight) {
        const primaryMonitor = Main.layoutManager.primaryMonitor;

        if (primaryMonitor)
            return [0, primaryMonitor.width];

        return [0,  0];
    }

    vfunc_allocate(box) {
        this.set_allocation(box);

        const allocWidth = box.x2 - box.x1;
        const allocHeight = box.y2 - box.y1;

        const [, leftNaturalWidth] = this._leftBox.get_preferred_width(-1);
        const [, centerNaturalWidth] = this._centerBox.get_preferred_width(-1);
        const [, rightNaturalWidth] = this._rightBox.get_preferred_width(-1);

        const centerWidth = centerNaturalWidth;

        // get workspace area and center date entry relative to it
        const monitor = Main.layoutManager.findMonitorForActor(this);
        let centerOffset = 0;
        if (monitor) {
            const workArea = Main.layoutManager.getWorkAreaForMonitor(monitor.index);
            centerOffset = 2 * (workArea.x - monitor.x) + workArea.width - monitor.width;
        }

        const sideWidth = Math.max(0, (allocWidth - centerWidth + centerOffset) / 2);

        const childBox = new Clutter.ActorBox();

        childBox.y1 = 0;
        childBox.y2 = allocHeight;
        if (this.get_text_direction() === Clutter.TextDirection.RTL) {
            childBox.x1 = Math.max(
                allocWidth - Math.min(Math.floor(sideWidth), leftNaturalWidth),
                0);
            childBox.x2 = allocWidth;
        } else {
            childBox.x1 = 0;
            childBox.x2 = Math.min(Math.floor(sideWidth), leftNaturalWidth);
        }
        this._leftBox.allocate(childBox);

        childBox.x1 = Math.ceil(sideWidth);
        childBox.y1 = 0;
        childBox.x2 = childBox.x1 + centerWidth;
        childBox.y2 = allocHeight;
        this._centerBox.allocate(childBox);

        childBox.y1 = 0;
        childBox.y2 = allocHeight;
        if (this.get_text_direction() === Clutter.TextDirection.RTL) {
            childBox.x1 = 0;
            childBox.x2 = Math.min(Math.floor(sideWidth), rightNaturalWidth);
        } else {
            childBox.x1 = Math.max(
                allocWidth - Math.min(Math.floor(sideWidth), rightNaturalWidth),
                0);
            childBox.x2 = allocWidth;
        }
        this._rightBox.allocate(childBox);
    }

    _onWindowDragGestureRecognize() {
        if (Main.modalCount > 0)
            return;

        const event = this._clickGesture.get_point_event(0);
        const backend = global.stage.get_context().get_backend();
        const sprite = backend.get_sprite(global.stage, event);

        const coords = this._clickGesture.get_coords_abs();
        const dragWindow = this._getDraggableWindowForPosition(coords.x);

        if (!dragWindow)
            return;

        dragWindow.begin_grab_op(
            Meta.GrabOp.MOVING,
            sprite,
            event.get_time(),
            coords);
    }

    _toggleMenu(indicator) {
        if (!indicator || !indicator.mapped)
            return; // menu not supported by current session mode

        const menu = indicator.menu;
        if (!indicator.reactive)
            return;

        menu.toggle();
        if (menu.isOpen)
            menu.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
    }

    _closeMenu(indicator) {
        if (!indicator || !indicator.mapped)
            return; // menu not supported by current session mode

        if (!indicator.reactive)
            return;

        indicator.menu.close();
    }

    toggleQuickSettings() {
        this._toggleMenu(this.statusArea.quickSettings);
    }

    closeQuickSettings() {
        this._closeMenu(this.statusArea.quickSettings);
    }

    set boxOpacity(value) {
        const isReactive = value > 0;

        this._leftBox.opacity = value;
        this._leftBox.reactive = isReactive;
        this._centerBox.opacity = value;
        this._centerBox.reactive = isReactive;
        this._rightBox.opacity = value;
        this._rightBox.reactive = isReactive;
    }

    get boxOpacity() {
        return this._leftBox.opacity;
    }

    _updatePanel() {
        const panel = Main.sessionMode.panel;
        this._hideIndicators();
        this._updateBox(panel.left, this._leftBox);
        this._updateBox(panel.center, this._centerBox);
        this._updateBox(panel.right, this._rightBox);

        if (panel.left.includes('clock'))
            Main.messageTray.bannerAlignment = Clutter.ActorAlign.START;
        else if (panel.right.includes('clock'))
            Main.messageTray.bannerAlignment = Clutter.ActorAlign.END;
        // Default to center if there is no clock
        else
            Main.messageTray.bannerAlignment = Clutter.ActorAlign.CENTER;

        if (this._sessionStyle)
            this.remove_style_class_name(this._sessionStyle);

        this._sessionStyle = Main.sessionMode.panelStyle;
        if (this._sessionStyle)
            this.add_style_class_name(this._sessionStyle);
    }

    _hideIndicators() {
        for (const role in PANEL_ITEM_IMPLEMENTATIONS) {
            const indicator = this.statusArea[role];
            if (!indicator)
                continue;
            indicator.container.hide();
        }
    }

    _ensureIndicator(role) {
        let indicator = this.statusArea[role];
        if (!indicator) {
            const constructor = PANEL_ITEM_IMPLEMENTATIONS[role];
            if (!constructor) {
                // This icon is not implemented (this is a bug)
                return null;
            }
            indicator = new constructor(this);
            this.statusArea[role] = indicator;
        }
        return indicator;
    }

    _updateBox(elements, box) {
        const nChildren = box.get_n_children();

        for (let i = 0; i < elements.length; i++) {
            const role = elements[i];
            const indicator = this._ensureIndicator(role);
            if (indicator == null)
                continue;

            this._addToPanelBox(role, indicator, i + nChildren, box);
        }
    }

    _addToPanelBox(role, indicator, position, box) {
        const container = indicator.container;
        container.show();

        const parent = container.get_parent();
        if (parent)
            parent.remove_child(container);


        box.insert_child_at_index(container, position);
        this.statusArea[role] = indicator;
        const destroyId = indicator.connect('destroy', emitter => {
            delete this.statusArea[role];
            emitter.disconnect(destroyId);
        });
        indicator.connect('menu-set', this._onMenuSet.bind(this));
        this._onMenuSet(indicator);
    }

    addToStatusArea(role, indicator, position, box) {
        if (this.statusArea[role])
            throw new Error(`Extension point conflict: there is already a status indicator for role ${role}`);

        if (!(indicator instanceof PanelMenu.Button))
            throw new TypeError('Status indicator must be an instance of PanelMenu.Button');

        position ??= 0;
        const boxes = {
            left: this._leftBox,
            center: this._centerBox,
            right: this._rightBox,
        };
        const boxContainer = boxes[box] || this._rightBox;
        this.statusArea[role] = indicator;
        this._addToPanelBox(role, indicator, position, boxContainer);
        return indicator;
    }

    _onMenuSet(indicator) {
        if (!indicator.menu || indicator.menu._openChangedConnected)
            return;

        this.menuManager.addMenu(indicator.menu);

        indicator.menu._openChangedConnected = true;
        indicator.menu.connectObject('open-state-changed',
            (menu, isOpen) => {
                let boxAlignment;
                if (this._leftBox.contains(indicator.container))
                    boxAlignment = Clutter.ActorAlign.START;
                else if (this._centerBox.contains(indicator.container))
                    boxAlignment = Clutter.ActorAlign.CENTER;
                else if (this._rightBox.contains(indicator.container))
                    boxAlignment = Clutter.ActorAlign.END;

                if (boxAlignment === Main.messageTray.bannerAlignment)
                    Main.messageTray.bannerBlocked = isOpen;
            }, this);
    }

    _getDraggableWindowForPosition(stageX) {
        const workspaceManager = global.workspace_manager;
        const windows = workspaceManager.get_active_workspace().list_windows();
        const allWindowsByStacking =
            global.display.sort_windows_by_stacking(windows).reverse();

        return allWindowsByStacking.find(metaWindow => {
            const rect = metaWindow.get_frame_rect();
            return metaWindow.is_on_primary_monitor() &&
                   metaWindow.showing_on_its_workspace() &&
                   metaWindow.get_window_type() !== Meta.WindowType.DESKTOP &&
                   metaWindow.maximized_vertically &&
                   stageX > rect.x && stageX < rect.x + rect.width;
        });
    }
}
