import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';

import { QuickMenuToggle, SystemIndicator } from '../toggles/quickSettings.js';

import * as PopupMenu from '../../shared/popups/popupMenu.js';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';

const BUS_NAME = 'org.freedesktop.UPower.PowerProfiles';
const OBJECT_PATH = '/org/freedesktop/UPower/PowerProfiles';

interface PowerProfilesRemote {
  ActiveProfile: string;
  readonly Profiles: Record<string, GLib.Variant>[];
}

const PowerProfilesProxy = Gio.DBusProxy.makeProxyWrapper<PowerProfilesRemote>(loadInterfaceXML('org.freedesktop.UPower.PowerProfiles'));

interface ProfileParams {
  nameId: string;
  iconName: string;
}

const PROFILE_PARAMS: Record<string, ProfileParams> = {
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

const FALLBACK_PARAMS: ProfileParams = {
  nameId: 'power-profile-custom',
  iconName: 'gnome-power-manager-symbolic',
};

const LAST_PROFILE_KEY = 'last-selected-power-profile';

const PowerProfilesToggle = GObject.registerClass(class PowerProfilesToggle extends QuickMenuToggle {
  private readonly profileItems = new Map<string, PopupMenu.PopupImageMenuItem>();
  private readonly profileSection = new PopupMenu.PopupMenuSection();
  private readonly proxy: PowerProfilesRemote & Gio.DBusProxy;

  constructor() {
    super();

    this.connect('clicked', () => {
      this.proxy.ActiveProfile = this.checked ? 'balanced' : global.settings.get_string(LAST_PROFILE_KEY);
    });

    this.proxy = PowerProfilesProxy(Gio.DBus.system, BUS_NAME, OBJECT_PATH, (_proxy, error) => {
      if (error) {
        log((error as Error).message);
      } else {
        this.proxy.connect('g-properties-changed', (_p, properties) => {
          if (properties.lookup_value('Profiles', null)) this.syncProfiles();
          this.sync();
        });

        if (this.proxy.g_name_owner) this.syncProfiles();
      }
      this.sync();
    });

    this.menu.addMenuItem(this.profileSection);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    KestrelUi.bindText(this.menu.addSettingsAction('', 'power').label, 'power-profile-settings');

    KestrelUi.localized(this, () => {
      this.title = KestrelUi.t('power-profile-title');
      this.menu_button_accessible_name = KestrelUi.t('power-profile-open-menu');
      this.menu.setHeader('power-profile-balanced-symbolic', KestrelUi.t('power-profile-header'));
      this.sync();
    });
  }

  private syncProfiles(): void {
    this.profileSection.removeAll();
    this.profileItems.clear();

    const profiles = this.proxy.Profiles.map(p => p.Profile.unpack<string>()).reverse();
    for (const profile of profiles) {
      const params = PROFILE_PARAMS[profile];
      if (!params) continue;

      const item = new PopupMenu.PopupImageMenuItem('', params.iconName);
      KestrelUi.bindText(item.label, params.nameId);
      item.connect('activate', () => (this.proxy.ActiveProfile = profile));
      this.profileItems.set(profile, item);
      this.profileSection.addMenuItem(item);
    }

    this.menuEnabled = this.profileItems.size > 2;
  }

  private sync(): void {
    this.visible = this.proxy.g_name_owner !== null;
    if (!this.visible) return;

    const activeProfile = this.proxy.ActiveProfile;

    for (const [profile, item] of this.profileItems)
      item.setOrnament(profile === activeProfile ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);

    const { nameId, iconName } = PROFILE_PARAMS[activeProfile] ?? FALLBACK_PARAMS;
    this.set({ subtitle: KestrelUi.t(nameId), icon_name: iconName });

    this.checked = activeProfile !== 'balanced';

    if (this.checked) global.settings.set_string(LAST_PROFILE_KEY, activeProfile);
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();

    const indicator = this._addIndicator();
    const toggle = new PowerProfilesToggle();
    toggle.bind_property('icon-name', indicator, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
    toggle.bind_property('checked', indicator, 'visible', GObject.BindingFlags.SYNC_CREATE);

    this.quickSettingsItems.push(toggle);
  }
});
