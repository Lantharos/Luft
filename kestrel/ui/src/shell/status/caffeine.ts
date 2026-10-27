import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';
import * as PopupMenu from '../popups/popupMenu.js';

import { QuickMenuToggle, SystemIndicator } from './quickSettings.js';

import { formatTime } from '../../shared/time/dateUtils.js';

const BUS_NAME = 'org.gnome.SessionManager';
const OBJECT_PATH = '/org/gnome/SessionManager';
const INHIBIT_IDLE = 8;
const ICON_NAME = 'view-reveal-symbolic';

const DURATIONS = new Map([
  [0, 'caffeine-until-turned-off'],
  [30, 'caffeine-30-minutes'],
  [60, 'caffeine-1-hour'],
  [120, 'caffeine-2-hours'],
]);

function callSessionManager(method: string, parameters: GLib.Variant, replyType: string | null): Promise<GLib.Variant> {
  return Gio.DBus.session.call(BUS_NAME, OBJECT_PATH, BUS_NAME, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

function uninhibit(cookie: number): void {
  callSessionManager('Uninhibit', new GLib.Variant('(u)', [cookie]), null)
    .catch((error: Error) => logError(error, 'Could not release the keep awake request'));
}

const CaffeineToggle = GObject.registerClass(class CaffeineToggle extends QuickMenuToggle {
  private cookie = 0;
  private request: symbol | null = null;
  private timeoutId = 0;
  private minutes: number | null = null;
  private until: GLib.DateTime | null = null;
  private readonly durationItems = new Map<number, PopupMenu.PopupMenuItem>();

  constructor() {
    super({ icon_name: ICON_NAME });

    for (const [minutes, labelId] of DURATIONS) {
      const item = new PopupMenu.PopupMenuItem('');
      KestrelUi.bindText(item.label, labelId);
      item.connect('activate', () => void this.start(minutes));
      this.durationItems.set(minutes, item);
      this.menu.addMenuItem(item);
    }

    this.connect('clicked', () => (this.checked ? this.stop() : void this.start(0)));
    this.connect('destroy', () => this.stop());
    KestrelUi.localized(this, () => {
      this.title = KestrelUi.t('caffeine-title');
      this.menu_button_accessible_name = KestrelUi.t('caffeine-open-menu');
      this.menu.setHeader(ICON_NAME, KestrelUi.t('caffeine-title'));
      this.sync();
    });
  }

  private async start(minutes: number): Promise<void> {
    this.stop();
    const request = Symbol('inhibit');
    this.request = request;
    this.minutes = minutes;
    this.until = minutes ? GLib.DateTime.new_now_local().add_minutes(minutes) : null;
    this.sync();
    if (minutes) {
      this.timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, minutes * 60, () => {
        this.timeoutId = 0;
        this.stop();
        return GLib.SOURCE_REMOVE;
      });
    }
    try {
      const reply = await callSessionManager('Inhibit',
        new GLib.Variant('(susu)', ['org.gnome.Shell', 0, KestrelUi.t('caffeine-inhibit-reason'), INHIBIT_IDLE]),
        '(u)');
      const [cookie] = reply.deepUnpack<[number]>();
      if (this.request === request) this.cookie = cookie;
      else uninhibit(cookie);
    } catch (error) {
      logError(error as Error, 'Could not keep the session awake');
      if (this.request === request) this.stop();
    }
  }

  private stop(): void {
    this.request = null;
    if (this.timeoutId) GLib.source_remove(this.timeoutId);
    this.timeoutId = 0;
    if (this.cookie) uninhibit(this.cookie);
    this.cookie = 0;
    this.minutes = null;
    this.until = null;
    this.sync();
  }

  private sync(): void {
    const active = this.minutes !== null;
    this.set({
      checked: active,
      subtitle: this.until ? KestrelUi.t('caffeine-until', { time: formatTime(this.until) }) : null,
    });
    for (const [duration, item] of this.durationItems)
      item.setOrnament(active && duration === this.minutes ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    this.quickSettingsItems.push(new CaffeineToggle());
  }
});
