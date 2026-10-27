import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { MessageDialogContent } from '../dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { ModalDialog } from '../dialogs/modalDialog.js';
import * as PermissionStore from '../runtime/permissionStore.js';
import { loadInterfaceXML } from '../runtime/fileUtils.js';

const LOCATION_SCHEMA = 'org.gnome.system.location';
const MAX_ACCURACY_LEVEL = 'max-accuracy-level';
const ENABLED = 'enabled';

const APP_PERMISSIONS_TABLE = 'location';
const APP_PERMISSIONS_ID = 'location';

const GeoclueAccuracyLevel = {
  NONE: 0,
  COUNTRY: 1,
  CITY: 4,
  NEIGHBORHOOD: 5,
  STREET: 6,
  EXACT: 8,
} as const;

type AccuracyLevelName = keyof typeof GeoclueAccuracyLevel;
type Permissions = Record<string, string[]>;

function accuracyLevel(name: string): number {
  return GeoclueAccuracyLevel[name as AccuracyLevelName] || GeoclueAccuracyLevel.NONE;
}

function accuracyLevelToString(level: number): AccuracyLevelName {
  const names = Object.keys(GeoclueAccuracyLevel) as AccuracyLevelName[];
  return names.find(name => GeoclueAccuracyLevel[name] === level) ?? 'NONE';
}

interface GeoclueManagerProxy extends Gio.DBusProxy {
  readonly InUse: boolean;
  AddAgentAsync(id: string): Promise<[]>;
}

interface PermissionStoreProxy extends Gio.DBusProxy {
  LookupAsync(table: string, id: string): Promise<[Permissions, GLib.Variant]>;
  SetAsync(table: string, create: boolean, id: string, permissions: Permissions, data: GLib.Variant): Promise<[]>;
}

type ProxyReady<T> = (proxy: T | null, error: GLib.Error | null) => void;

type GeoclueManagerClass = new (bus: Gio.DBusConnection, name: string, path: string, ready: ProxyReady<GeoclueManagerProxy>) => GeoclueManagerProxy;

const GeoclueManager = Gio.DBusProxy.makeProxyWrapper(loadInterfaceXML('org.freedesktop.GeoClue2.Manager')) as unknown as GeoclueManagerClass;
const AgentIface = loadInterfaceXML('org.freedesktop.GeoClue2.Agent')!;
const permissionStore = PermissionStore.PermissionStore as unknown as (ready: ProxyReady<PermissionStoreProxy>) => PermissionStoreProxy;

let geoclueAgent: GeoclueAgent | null = null;

export function getGeoclueAgent(): GeoclueAgent {
  geoclueAgent ??= new GeoclueAgent();
  return geoclueAgent;
}

const GeoclueAgent = GObject.registerClass({
  Properties: {
    'enabled': GObject.ParamSpec.boolean('enabled', null, null, GObject.ParamFlags.READWRITE, false),
    'in-use': GObject.ParamSpec.boolean('in-use', null, null, GObject.ParamFlags.READABLE, false),
    'max-accuracy-level': GObject.ParamSpec.int('max-accuracy-level', null, null, GObject.ParamFlags.READABLE, 0, 8, 0),
  },
}, class GeoclueAgent extends GObject.Object {
  private readonly settings = new Gio.Settings({ schema_id: LOCATION_SCHEMA });
  private readonly agent: Gio.DBusExportedObject;
  private managerProxy: GeoclueManagerProxy | null = null;
  private permStoreProxy: PermissionStoreProxy | null = null;
  private connecting = false;

  constructor() {
    super();

    this.settings.connectObject(
      `changed::${ENABLED}`, () => this.notify('enabled'),
      `changed::${MAX_ACCURACY_LEVEL}`, () => this.onMaxAccuracyLevelChanged(),
      this);

    this.agent = Gio.DBusExportedObject.wrapJSObject(AgentIface, this);
    this.agent.export(Gio.DBus.system, '/org/freedesktop/GeoClue2/Agent');

    this.connect('notify::enabled', () => this.onMaxAccuracyLevelChanged());

    Gio.bus_watch_name(Gio.BusType.SYSTEM, 'org.freedesktop.GeoClue2', 0,
      () => this.connectToGeoclue(),
      () => this.onGeoclueVanished());
    this.onMaxAccuracyLevelChanged();
    this.connectToGeoclue();
    permissionStore((proxy, error) => {
      if (error != null) {
        log(error.message);
        return;
      }
      this.permStoreProxy = proxy;
    });
  }

  get enabled(): boolean {
    return this.settings.get_boolean(ENABLED);
  }

  set enabled(value: boolean) {
    this.settings.set_boolean(ENABLED, value);
  }

  get inUse(): boolean {
    return this.managerProxy?.InUse ?? false;
  }

  get maxAccuracyLevel(): number {
    if (!this.enabled) return GeoclueAccuracyLevel.NONE;
    return accuracyLevel(this.settings.get_string(MAX_ACCURACY_LEVEL).toUpperCase());
  }

  async AuthorizeAppAsync([desktopId, reqAccuracyLevel]: [string, number], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const authorizer = new AppAuthorizer(desktopId, reqAccuracyLevel, this.permStoreProxy, this.maxAccuracyLevel);
    const level = await authorizer.authorize();
    invocation.return_value(GLib.Variant.new('(bu)', [level !== GeoclueAccuracyLevel.NONE, level]));
  }

  get MaxAccuracyLevel(): number {
    return this.maxAccuracyLevel;
  }

  private connectToGeoclue(): boolean {
    if (this.managerProxy != null || this.connecting) return false;

    this.connecting = true;
    new GeoclueManager(Gio.DBus.system, 'org.freedesktop.GeoClue2', '/org/freedesktop/GeoClue2/Manager',
      (proxy, error) => void this.onManagerProxyReady(proxy, error));
    return true;
  }

  private async onManagerProxyReady(proxy: GeoclueManagerProxy | null, error: GLib.Error | null): Promise<void> {
    if (error != null) {
      log(error.message);
      this.connecting = false;
      return;
    }

    this.managerProxy = proxy!;
    this.managerProxy.connectObject('g-properties-changed',
      (_proxy: Gio.DBusProxy, properties: GLib.Variant) => this.onGeocluePropsChanged(properties), this);

    this.notify('in-use');

    try {
      await this.managerProxy.AddAgentAsync('gnome-shell');
      this.connecting = false;
      this.notifyMaxAccuracyLevel();
    } catch (e) {
      log((e as Error).message);
    }
  }

  private onGeoclueVanished(): void {
    this.managerProxy?.disconnectObject(this);
    this.managerProxy = null;

    this.notify('in-use');
  }

  private onMaxAccuracyLevelChanged(): void {
    this.notify('max-accuracy-level');

    if (!this.connectToGeoclue()) this.notifyMaxAccuracyLevel();
  }

  private notifyMaxAccuracyLevel(): void {
    this.agent.emit_property_changed('MaxAccuracyLevel', new GLib.Variant('u', this.maxAccuracyLevel));
  }

  private onGeocluePropsChanged(properties: GLib.Variant): void {
    if (properties.lookup_value('InUse', null)) this.notify('in-use');
  }
});

type GeoclueAgent = InstanceType<typeof GeoclueAgent>;

class AppAuthorizer {
  private permissions: Permissions = {};
  private accuracyLevel: number = GeoclueAccuracyLevel.NONE;

  constructor(
    private readonly desktopId: string,
    private readonly reqAccuracyLevel: number,
    private readonly permStoreProxy: PermissionStoreProxy | null,
    private readonly maxAccuracyLevel: number,
  ) {}

  async authorize(): Promise<number> {
    const app = Shell.AppSystem.get_default().lookup_app(`${this.desktopId}.desktop`);
    if (app == null || this.permStoreProxy == null) return this.completeAuth();

    try {
      [this.permissions] = await this.permStoreProxy.LookupAsync(APP_PERMISSIONS_TABLE, APP_PERMISSIONS_ID);
    } catch (error) {
      log((error as Error).message);
      this.permissions = {};
    }

    const permission = this.permissions[this.desktopId];
    if (permission == null) await this.userAuthorizeApp(app);
    else this.accuracyLevel = accuracyLevel(permission[0]);

    return this.completeAuth();
  }

  private async userAuthorizeApp(app: Shell.App): Promise<void> {
    const reason = app.get_app_info().get_locale_string('X-Geoclue-Reason');
    this.accuracyLevel = await askForLocation(app.get_name(), reason, this.reqAccuracyLevel);
  }

  private completeAuth(): number {
    if (this.accuracyLevel !== GeoclueAccuracyLevel.NONE)
      this.accuracyLevel = Math.min(Math.max(this.accuracyLevel, 0), this.maxAccuracyLevel);
    void this.saveToPermissionStore();

    return this.accuracyLevel;
  }

  private async saveToPermissionStore(): Promise<void> {
    if (this.permStoreProxy == null) return;

    const dateStr = Math.round(Date.now() / 1000).toString();
    this.permissions[this.desktopId] = [accuracyLevelToString(this.accuracyLevel), dateStr];

    try {
      await this.permStoreProxy.SetAsync(APP_PERMISSIONS_TABLE, true, APP_PERMISSIONS_ID, this.permissions, GLib.Variant.new('av', []));
    } catch (error) {
      log((error as Error).message);
    }
  }
}

function askForLocation(name: string, reason: string | null, reqAccuracyLevel: number): Promise<number> {
  const dialog = new ModalDialog({ styleClass: 'geolocation-dialog' });

  const content = new MessageDialogContent({
    title: KestrelUi.t('location-dialog-title'),
    icon_name: 'find-location-symbolic',
    description: KestrelUi.t('location-dialog-description', { appName: name }),
  });
  content.add_child(new St.Label({ text: reason ?? '', style_class: 'message-dialog-description' }));
  content.add_child(new St.Label({ text: KestrelUi.t('location-dialog-info'), style_class: 'message-dialog-description' }));
  dialog.contentLayout.add_child(content);

  return new Promise(resolve => {
    const respond = (level: number) => {
      resolve(level);
      dialog.close();
    };
    const button = dialog.addButton({
      label: KestrelUi.t('location-dialog-deny'),
      action: () => respond(GeoclueAccuracyLevel.NONE),
      key: Clutter.KEY_Escape,
    });
    dialog.addButton({
      label: KestrelUi.t('location-dialog-grant'),
      action: () => respond(reqAccuracyLevel),
    });
    dialog.setInitialKeyFocus(button);
    dialog.open();
  });
}
