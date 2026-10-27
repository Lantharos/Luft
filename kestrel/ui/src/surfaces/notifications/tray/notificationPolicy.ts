import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import type Shell from 'gi://Shell';

import type { SoundChoice } from '../../../system/sounds/sounds.js';

const MASTER_SCHEMA = 'org.gnome.desktop.notifications';

export const NotificationPolicy = GObject.registerClass({
  GTypeFlags: GObject.TypeFlags.ABSTRACT,
  Properties: {
    'enable': GObject.ParamSpec.boolean('enable', null, null, GObject.ParamFlags.READABLE, true),
    'sound': GObject.ParamSpec.string('sound', null, null, GObject.ParamFlags.READABLE, 'automatic'),
    'show-banners': GObject.ParamSpec.boolean('show-banners', null, null, GObject.ParamFlags.READABLE, true),
    'force-expanded': GObject.ParamSpec.boolean('force-expanded', null, null, GObject.ParamFlags.READABLE, false),
    'show-in-lock-screen': GObject.ParamSpec.boolean('show-in-lock-screen', null, null, GObject.ParamFlags.READABLE, false),
    'details-in-lock-screen': GObject.ParamSpec.boolean('details-in-lock-screen', null, null, GObject.ParamFlags.READABLE, false),
    'during-do-not-disturb': GObject.ParamSpec.string('during-do-not-disturb', null, null, GObject.ParamFlags.READABLE, 'urgent'),
    'keep-in-list': GObject.ParamSpec.boolean('keep-in-list', null, null, GObject.ParamFlags.READABLE, true),
  },
}, class NotificationPolicy extends GObject.Object {
  declare readonly id: string;

  store(): void {}

  destroy(): void {
    this.run_dispose();
  }

  protected changed(key: string): void {
    if ((this.constructor as typeof GObject.Object).find_property(key))
      this.notify(key);
  }

  get enable(): boolean {
    return true;
  }

  get sound(): SoundChoice {
    return 'automatic';
  }

  get showBanners(): boolean {
    return true;
  }

  get forceExpanded(): boolean {
    return false;
  }

  get showInLockScreen(): boolean {
    return false;
  }

  get detailsInLockScreen(): boolean {
    return false;
  }

  get duringDoNotDisturb(): string {
    return 'urgent';
  }

  get keepInList(): boolean {
    return true;
  }
});
export type NotificationPolicy = InstanceType<typeof NotificationPolicy>;

export const NotificationGenericPolicy = GObject.registerClass(
class NotificationGenericPolicy extends NotificationPolicy {
  readonly id = 'generic';
  private readonly masterSettings = new Gio.Settings({ schema_id: MASTER_SCHEMA });

  constructor() {
    super();
    this.masterSettings.connect('changed', (_settings, key) => this.changed(key));
  }

  destroy(): void {
    this.masterSettings.run_dispose();
    super.destroy();
  }

  get showInLockScreen(): boolean {
    return this.masterSettings.get_boolean('show-in-lock-screen');
  }
});
export type NotificationGenericPolicy = InstanceType<typeof NotificationGenericPolicy>;

const canonicalizeId = (id: string): string => id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');

export const NotificationApplicationPolicy = GObject.registerClass(
class NotificationApplicationPolicy extends NotificationPolicy {
  private readonly canonicalId: string;
  private readonly masterSettings = new Gio.Settings({ schema_id: MASTER_SCHEMA });
  private readonly settings: Gio.Settings;
  private readonly rules: Gio.Settings;

  constructor(readonly id: string) {
    super();
    this.canonicalId = canonicalizeId(id);
    this.settings = new Gio.Settings({
      schema_id: 'org.gnome.desktop.notifications.application',
      path: `/org/gnome/desktop/notifications/application/${this.canonicalId}/`,
    });
    this.rules = new Gio.Settings({
      schema_id: 'com.lantharos.kestrel.notifications.application',
      path: `/com/lantharos/kestrel/notifications/application/${this.canonicalId}/`,
    });
    for (const settings of [this.masterSettings, this.settings, this.rules])
      settings.connect('changed', (_settings, key) => this.changed(key));
  }

  store(): void {
    this.settings.set_string('application-id', `${this.id}.desktop`);
    const apps = this.masterSettings.get_strv('application-children');
    if (apps.includes(this.canonicalId)) return;
    apps.push(this.canonicalId);
    this.masterSettings.set_strv('application-children', apps);
  }

  destroy(): void {
    this.masterSettings.run_dispose();
    this.settings.run_dispose();
    this.rules.run_dispose();
    super.destroy();
  }

  get enable(): boolean {
    return this.settings.get_boolean('enable');
  }

  get sound(): SoundChoice {
    return this.rules.get_string('sound') as SoundChoice;
  }

  get showBanners(): boolean {
    return this.settings.get_boolean('show-banners');
  }

  get forceExpanded(): boolean {
    return this.settings.get_boolean('force-expanded');
  }

  get showInLockScreen(): boolean {
    return this.masterSettings.get_boolean('show-in-lock-screen') && this.settings.get_boolean('show-in-lock-screen');
  }

  get detailsInLockScreen(): boolean {
    return this.settings.get_boolean('details-in-lock-screen');
  }

  get duringDoNotDisturb(): string {
    return this.rules.get_string('during-do-not-disturb');
  }

  get keepInList(): boolean {
    return this.rules.get_boolean('keep-in-list');
  }
});
export type NotificationApplicationPolicy = InstanceType<typeof NotificationApplicationPolicy>;

export function policyForApp(app: Shell.App | null): NotificationPolicy {
  if (!app?.get_app_info())
    return new NotificationGenericPolicy();
  return new NotificationApplicationPolicy(app.get_id().replace(/\.desktop$/, ''));
}
