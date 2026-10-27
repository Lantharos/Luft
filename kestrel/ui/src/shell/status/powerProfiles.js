import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';

import {QuickMenuToggle, SystemIndicator} from './quickSettings.js';

import * as PopupMenu from '../popups/popupMenu.js';

import {loadInterfaceXML} from '../runtime/fileUtils.js';

const BUS_NAME = 'org.freedesktop.UPower.PowerProfiles';
const OBJECT_PATH = '/org/freedesktop/UPower/PowerProfiles';

const PowerProfilesIface = loadInterfaceXML('org.freedesktop.UPower.PowerProfiles');
const PowerProfilesProxy = Gio.DBusProxy.makeProxyWrapper(PowerProfilesIface);

const PROFILE_PARAMS = {
    'performance': {
        nameId: 'power-profile-performance',
        iconName: 'power-profile-performance-symbolic',
    },

    'balanced': {
        nameId: 'power-profile-balanced',
        iconName: 'power-profile-balanced-symbolic',
    },

    'power-saver': {
        nameId: 'power-profile-power-saver',
        iconName: 'power-profile-power-saver-symbolic',
    },
};

const FALLBACK_PARAMS = {
    nameId: 'power-profile-custom',
    iconName: 'gnome-power-manager-symbolic',
};

const LAST_PROFILE_KEY = 'last-selected-power-profile';

const PowerProfilesToggle = GObject.registerClass(
class PowerProfilesToggle extends QuickMenuToggle {
    _init() {
        super._init();

        this._profileItems = new Map();

        this.connect('clicked', () => {
            this._proxy.ActiveProfile = this.checked
                ? 'balanced'
                : global.settings.get_string(LAST_PROFILE_KEY);
        });

        this._proxy = new PowerProfilesProxy(Gio.DBus.system, BUS_NAME, OBJECT_PATH,
            (proxy, error) => {
                if (error) {
                    log(error.message);
                } else {
                    this._proxy.connect('g-properties-changed', (p, properties) => {
                        const profilesChanged = !!properties.lookup_value('Profiles', null);
                        if (profilesChanged)
                            this._syncProfiles();
                        this._sync();
                    });

                    if (this._proxy.g_name_owner)
                        this._syncProfiles();
                }
                this._sync();
            });

        this._profileSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._profileSection);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        KestrelUi.bindText(this.menu.addSettingsAction('', 'power').label, 'power-profile-settings');

        KestrelUi.localized(this, () => {
            this.title = KestrelUi.t('power-profile-title');
            this.menuButtonAccessibleName = KestrelUi.t('power-profile-open-menu');
            this.menu.setHeader('power-profile-balanced-symbolic', KestrelUi.t('power-profile-header'));
            this._sync();
        });
    }

    _syncProfiles() {
        this._profileSection.removeAll();
        this._profileItems.clear();

        const profiles = this._proxy.Profiles
            .map(p => p.Profile.unpack())
            .reverse();
        for (const profile of profiles) {
            if (!PROFILE_PARAMS[profile])
                continue;

            const {nameId, iconName} = PROFILE_PARAMS[profile];
            const item = new PopupMenu.PopupImageMenuItem('', iconName);
            KestrelUi.bindText(item.label, nameId);
            item.connect('activate',
                () => (this._proxy.ActiveProfile = profile));
            this._profileItems.set(profile, item);
            this._profileSection.addMenuItem(item);
        }

        this.menuEnabled = this._profileItems.size > 2;
    }

    _sync() {
        this.visible = this._proxy.g_name_owner !== null;

        if (!this.visible)
            return;

        const {ActiveProfile: activeProfile} = this._proxy;

        for (const [profile, item] of this._profileItems) {
            item.setOrnament(profile === activeProfile
                ? PopupMenu.Ornament.CHECK
                : PopupMenu.Ornament.NONE);
        }

        const {nameId, iconName} = PROFILE_PARAMS[activeProfile] ?? FALLBACK_PARAMS;
        this.set({subtitle: KestrelUi.t(nameId), iconName});

        this.checked = activeProfile !== 'balanced';

        if (this.checked)
            global.settings.set_string(LAST_PROFILE_KEY, activeProfile);
    }
});

export const Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this._indicator = this._addIndicator();

        this._powerProfilesToggle = new PowerProfilesToggle();

        this._powerProfilesToggle.bind_property('icon-name',
            this._indicator, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE);
        this._powerProfilesToggle.bind_property('checked',
            this._indicator, 'visible',
            GObject.BindingFlags.SYNC_CREATE);

        this.quickSettingsItems.push(this._powerProfilesToggle);
    }
});
