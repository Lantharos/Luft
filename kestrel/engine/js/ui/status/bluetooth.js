import Atk from 'gi://Atk';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import {Spinner} from '../animation.js';
import * as PopupMenu from '../popupMenu.js';
import {QuickMenuToggle, SystemIndicator} from '../quickSettings.js';

import {getBluetoothClient} from './bluetooth/client.js';

const STATE_ICONS = new Map([
    ['on', 'bluetooth-active-symbolic'],
    ['off', 'bluetooth-disabled-symbolic'],
    ['absent', 'bluetooth-disabled-symbolic'],
    ['turning-on', 'bluetooth-acquiring-symbolic'],
    ['turning-off', 'bluetooth-acquiring-symbolic'],
]);

const BluetoothDeviceItem = GObject.registerClass(
class BluetoothDeviceItem extends PopupMenu.PopupBaseMenuItem {
    constructor(device, client) {
        super({
            style_class: 'bt-device-item',
        });

        this._device = device;
        this._client = client;

        this._icon = new St.Icon({
            style_class: 'popup-menu-icon',
        });
        this.add_child(this._icon);

        this._label = new St.Label({
            x_expand: true,
        });
        this.add_child(this._label);

        this._subtitle = new St.Label({
            style_class: 'device-subtitle',
        });
        this.add_child(this._subtitle);

        this._spinner = new Spinner(16, {hideOnStop: true});
        this.add_child(this._spinner);

        this._spinner.bind_property('visible',
            this._subtitle, 'visible',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.INVERT_BOOLEAN);

        this._device.bind_property('connectable',
            this, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this._device.bind_property('icon',
            this._icon, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE);
        this._device.bind_property('alias',
            this._label, 'text',
            GObject.BindingFlags.SYNC_CREATE);
        this._device.bind_property_full('connected',
            this._subtitle, 'text',
            GObject.BindingFlags.SYNC_CREATE,
            (bind, source) => [true, source ? _('Disconnect') : _('Connect')],
            null);

        this.connect('destroy', () => (this._spinner = null));
        this.connect('activate', () => this._toggleConnected().catch(logError));
        this._device.connectObject(
            'notify::alias', () => this._updateAccessibleName(),
            'notify::connected', () => this._updateAccessibleName(),
            this);
        this._updateAccessibleName();
    }

    async _toggleConnected() {
        this._spinner.play();
        await this._client.toggleDevice(this._device);
        this._spinner?.stop();
    }

    _updateAccessibleName() {
        this.accessible_name = this._device.connected
            // Translators: %s is a device name like "MyPhone"
            ? _('Disconnect %s').format(this._device.alias)
            // Translators: %s is a device name like "MyPhone"
            : _('Connect to %s').format(this._device.alias);
    }
});

const BluetoothToggle = GObject.registerClass(
class BluetoothToggle extends QuickMenuToggle {
    _init(client) {
        super._init({
            title: _('Bluetooth'),
            menuButtonAccessibleName: _('Open Bluetooth menu'),
        });

        this.menu.setHeader('bluetooth-active-symbolic', _('Bluetooth'));

        this._deviceItems = new Map();
        this._deviceSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._deviceSection);

        this._placeholderItem = new PopupMenu.PopupMenuItem('', {
            style_class: 'bt-menu-placeholder',
            reactive: false,
            can_focus: false,
        });
        this._placeholderItem.label.clutter_text.set({
            ellipsize: Pango.EllipsizeMode.NONE,
            line_wrap: true,
        });
        this.menu.addMenuItem(this._placeholderItem);

        this._deviceSection.actor.bind_property('visible',
            this._placeholderItem, 'visible',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.INVERT_BOOLEAN);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addSettingsAction(_('Bluetooth Settings'), 'bluetooth');

        this._client = client;

        this._client.bind_property('available',
            this, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this._client.bind_property('active',
            this, 'checked',
            GObject.BindingFlags.SYNC_CREATE);
        this._client.bind_property_full('adapter-state',
            this, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE,
            (bind, source) => [true, STATE_ICONS.get(source)],
            null);

        this._client.connectObject(
            'notify::active', () => this._onActiveChanged(),
            'devices-changed', () => this._sync(),
            'device-removed', (c, path) => this._removeDevice(path),
            this);

        this.menu.connect('open-state-changed', isOpen => {
            // We don't reorder the list while the menu is open,
            // so do it now to start with the proper order
            if (isOpen)
                this._reorderDeviceItems();
        });

        this.connect('clicked', () => this._client.toggleActive());

        this._updatePlaceholder();
        this._sync();
    }

    _onActiveChanged() {
        this._updatePlaceholder();

        this._deviceItems.forEach(item => item.destroy());
        this._deviceItems.clear();

        this._sync();
    }

    _updatePlaceholder() {
        this._placeholderItem.label.text = this._client.active
            ? _('No available or connected devices')
            : _('Turn on Bluetooth to connect to devices');
    }

    _updatePlaceholderRelation() {
        const accel = this.get_accessible();
        const placeholderAccel = this._placeholderItem.get_accessible();
        if (this._deviceSection.actor.visible)
            accel.remove_relationship(Atk.RelationType.DESCRIBED_BY, placeholderAccel);
        else
            accel.add_relationship(Atk.RelationType.DESCRIBED_BY, placeholderAccel);
    }

    _updateDeviceVisibility() {
        this._deviceSection.actor.visible =
            [...this._deviceItems.values()].some(item => item.visible);
        this._updatePlaceholderRelation();
    }

    _getSortedDevices() {
        return [...this._client.getDevices()].sort((dev1, dev2) => {
            if (dev1.connected !== dev2.connected)
                return dev2.connected - dev1.connected;
            return dev1.alias.localeCompare(dev2.alias);
        });
    }

    _removeDevice(path) {
        this._deviceItems.get(path)?.destroy();
        this._deviceItems.delete(path);

        this._updateDeviceVisibility();
    }

    _reorderDeviceItems() {
        const devices = this._getSortedDevices();
        for (const [i, dev] of devices.entries()) {
            const item = this._deviceItems.get(dev.get_object_path());
            if (!item)
                continue;

            this._deviceSection.moveMenuItem(item, i);
        }
    }

    _sync() {
        const devices = this._getSortedDevices();

        for (const dev of devices) {
            const path = dev.get_object_path();
            if (this._deviceItems.has(path))
                continue;

            const item = new BluetoothDeviceItem(dev, this._client);
            item.connect('notify::visible', () => this._updateDeviceVisibility());

            this._deviceSection.addMenuItem(item);
            this._deviceItems.set(path, item);
        }

        const connectedDevices = devices.filter(dev => dev.connected);
        const nConnected = connectedDevices.length;

        if (nConnected > 1)
            /* Translators: This is the number of connected bluetooth devices */
            this.subtitle = ngettext('%d Connected', '%d Connected', nConnected).format(nConnected);
        else if (nConnected === 1)
            this.subtitle = connectedDevices[0].alias;
        else
            this.subtitle = null;

        this._updateDeviceVisibility();
    }
});

export const Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this._client = getBluetoothClient();
        this._client.connectObject('devices-changed', () => this._sync(), this);

        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'bluetooth-active-symbolic';

        this.quickSettingsItems.push(new BluetoothToggle(this._client));

        this._sync();
    }

    _sync() {
        const devices = [...this._client.getDevices()];
        const connectedDevices = devices.filter(dev => dev.connected);
        const nConnectedDevices = connectedDevices.length;

        this._indicator.visible = nConnectedDevices > 0;
    }
});
