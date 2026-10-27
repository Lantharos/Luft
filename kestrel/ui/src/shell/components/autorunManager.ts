import Gio from 'gi://Gio';

import * as GnomeSession from '../system/gnomeSession.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as MessageTray from '../notifications/messageTray.js';
import { allowsAutorun } from './automountManager.js';

import { loadInterfaceXML } from '../runtime/fileUtils.js';

Gio._promisify(Gio.Mount.prototype, 'guess_content_type');

const SETTINGS_SCHEMA = 'org.gnome.desktop.media-handling';
const SETTING_DISABLE_AUTORUN = 'autorun-never';
const SETTING_START_APP = 'autorun-x-content-start-app';
const SETTING_IGNORE = 'autorun-x-content-ignore';
const SETTING_OPEN_FOLDER = 'autorun-x-content-open-folder';

const AutorunSetting = {
  RUN: 0,
  IGNORE: 1,
  FILES: 2,
  ASK: 3,
} as const;
type AutorunSetting = typeof AutorunSetting[keyof typeof AutorunSetting];

interface HotplugSnifferRemote {
  SniffURIAsync(uri: string): Promise<[string[]]>;
}

const HotplugSniffer = Gio.DBusProxy.makeProxyWrapper<HotplugSnifferRemote>(loadInterfaceXML('com.lantharos.Kestrel.HotplugSniffer'));

function shouldAutorunMount(mount: Gio.Mount): boolean {
  const volume = mount.get_volume();
  if (!volume || !allowsAutorun(volume)) return false;

  const root = mount.get_root();
  return !(root.is_native() && root.get_path()!.includes('/.'));
}

function isMountNonLocal(mount: Gio.Mount): boolean {
  const volume = mount.get_volume();
  return volume == null || volume.get_identifier('class') === 'network';
}

function startAppForMount(app: Gio.AppInfo, mount: Gio.Mount): boolean {
  try {
    return app.launch([mount.get_root()], global.create_app_launch_context(0, -1));
  } catch (error) {
    log(`Unable to launch the app ${app.get_name()}: ${error}`);
    return false;
  }
}

function defaultFileManager(): Gio.AppInfo {
  return Gio.app_info_get_default_for_type('inode/directory', false)!;
}

async function guessContentTypes(settings: Gio.Settings, mount: Gio.Mount): Promise<[Gio.AppInfo[], string[]]> {
  let contentTypes: string[] = [];
  if (!settings.get_boolean(SETTING_DISABLE_AUTORUN) && !isMountNonLocal(mount)) {
    try {
      contentTypes = await mount.guess_content_type(false, null);
    } catch (error) {
      log(`Unable to guess content types on added mount ${mount.get_name()}: ${error}`);
    }

    if (contentTypes.length === 0) {
      const hotplugSniffer = HotplugSniffer(Gio.DBus.session, 'com.lantharos.Kestrel.HotplugSniffer', '/com/lantharos/Kestrel/HotplugSniffer');
      [contentTypes] = await hotplugSniffer.SniffURIAsync(mount.get_root().get_uri());
    }
  }

  contentTypes = contentTypes.filter(type => type !== 'x-content/win32-software');

  const apps = contentTypes.flatMap(type => Gio.app_info_get_default_for_type(type, false) ?? []);
  if (apps.length === 0) apps.push(defaultFileManager());

  return [apps, contentTypes];
}

class AutorunDispatcher {
  private readonly notifications = new Map<Gio.Mount, MessageTray.Notification>();

  constructor(private readonly settings: Gio.Settings) {}

  private getAutorunSettingForType(contentType: string): AutorunSetting {
    if (this.settings.get_strv(SETTING_START_APP).includes(contentType)) return AutorunSetting.RUN;
    if (this.settings.get_strv(SETTING_IGNORE).includes(contentType)) return AutorunSetting.IGNORE;
    if (this.settings.get_strv(SETTING_OPEN_FOLDER).includes(contentType)) return AutorunSetting.FILES;
    return AutorunSetting.ASK;
  }

  private addNotification(mount: Gio.Mount, apps: Gio.AppInfo[]): void {
    if (this.notifications.has(mount)) return;

    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source,
      title: KestrelUi.t('autorun-connected', { driveName: mount.get_name() }),
      body: KestrelUi.t('autorun-ready'),
    });
    notification.connect('activated', () => startAppForMount(defaultFileManager(), mount));
    for (const app of apps)
      notification.addAction(KestrelUi.t('autorun-open-with', { appName: app.get_name() }), () => startAppForMount(app, mount));
    notification.connect('destroy', () => this.notifications.delete(mount));
    this.notifications.set(mount, notification);
    source.addNotification(notification);
  }

  addMount(mount: Gio.Mount, apps: Gio.AppInfo[], contentTypes: string[]): void {
    if (this.settings.get_boolean(SETTING_DISABLE_AUTORUN)) return;
    if (!shouldAutorunMount(mount)) return;

    const setting = contentTypes.length > 0 ? this.getAutorunSettingForType(contentTypes[0]) : AutorunSetting.ASK;
    if (setting === AutorunSetting.IGNORE) return;

    let app: Gio.AppInfo | null = null;
    if (setting === AutorunSetting.RUN)
      app = Gio.app_info_get_default_for_type(contentTypes[0], false);
    else if (setting === AutorunSetting.FILES)
      app = defaultFileManager();

    if (!app || !startAppForMount(app, mount)) this.addNotification(mount, apps);
  }

  removeMount(mount: Gio.Mount): void {
    this.notifications.get(mount)?.destroy();
  }
}

class AutorunManager {
  private readonly session = GnomeSession.SessionManager();
  private readonly volumeMonitor = Gio.VolumeMonitor.get();
  private readonly settings = new Gio.Settings({ schema_id: SETTINGS_SCHEMA });
  private readonly dispatcher = new AutorunDispatcher(this.settings);

  enable(): void {
    this.volumeMonitor.connectObject(
      'mount-added', (_monitor: Gio.VolumeMonitor, mount: Gio.Mount) => this.onMountAdded(mount).catch(logError),
      'mount-removed', (_monitor: Gio.VolumeMonitor, mount: Gio.Mount) => this.dispatcher.removeMount(mount), this);
  }

  disable(): void {
    this.volumeMonitor.disconnectObject(this);
  }

  private async onMountAdded(mount: Gio.Mount): Promise<void> {
    if (!this.session.SessionIsActive) return;

    const [apps, contentTypes] = await guessContentTypes(this.settings, mount);
    this.dispatcher.addMount(mount, apps, contentTypes);
  }
}

export { AutorunManager as Component };
