import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { appIcons } from '../../appearance/icons/appIcons.js';
import type { ContextMenus, MenuEntry } from '../../desktop/menus/contextMenus.js';
import { formatsLocale, localized, t } from '../../shared/i18n/index.js';
import { windowAccess, type Level } from '../peek/access/grants.js';
import { mediaUsers, setMuted, type MediaUser } from './mediaUsers.js';
import { PrivacyMonitor, type PrivacyState } from './monitor.js';

const ICONS: Record<keyof PrivacyState, string> = {
  camera: 'camera-web-symbolic',
  microphone: 'audio-input-microphone-symbolic',
  sharing: 'screen-shared-symbolic',
  recording: 'media-record-symbolic',
  location: 'find-location-symbolic',
  windows: 'focus-windows-symbolic',
};
const THINGS: Record<keyof PrivacyState, string> = {
  camera: 'privacy-thing-camera', microphone: 'privacy-thing-microphone', sharing: 'privacy-thing-screen', recording: 'privacy-thing-screen',
  location: 'privacy-thing-location', windows: 'privacy-thing-windows',
};

const WINDOW_ACCESS: Record<Level, string> = { use: 'privacy-windows-using-programs', see: 'privacy-windows-seeing-programs' };

const icon = (name: string) => new Gio.ThemedIcon({ name });

export class PrivacyIndicator {
  readonly actor: St.Button;
  private readonly icons = new St.BoxLayout({ style_class: 'kestrel-privacy-icons', y_align: Clutter.ActorAlign.CENTER });
  private readonly monitor: PrivacyMonitor;

  constructor(private readonly menus: ContextMenus, private readonly stopScreencast: () => void) {
    this.actor = new St.Button({
      name: 'kestrel-privacy', style_class: 'kestrel-status-button kestrel-privacy', child: this.icons,
      can_focus: true, visible: false, y_align: Clutter.ActorAlign.CENTER, button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.SECONDARY,
    });
    this.actor.connect('clicked', () => void this.open());
    this.monitor = new PrivacyMonitor(() => this.sync());
    localized(this.actor, () => this.sync());
  }

  orient(orientation: Clutter.Orientation): void {
    this.icons.orientation = orientation;
  }

  shutdown(): void {
    this.monitor.destroy();
  }

  private sync(): void {
    const state = this.monitor.state;
    const active = (Object.keys(ICONS) as (keyof PrivacyState)[]).filter(kind => state[kind]);
    this.actor.visible = active.length > 0;
    const things = [...new Set(active.map(kind => THINGS[kind]))].map(id => t(id));
    this.actor.accessible_name = t('privacy-indicator', { things: new Intl.ListFormat(formatsLocale(), { type: 'conjunction' }).format(things) });
    this.icons.destroy_all_children();
    for (const kind of active) this.icons.add_child(new St.Icon({ icon_name: ICONS[kind], icon_size: 16 }));
  }

  private async open(): Promise<void> {
    const state = this.monitor.state;
    const users = state.camera || state.microphone ? await mediaUsers(this.monitor.ownDictation) : [];
    const entries: MenuEntry[] = [];
    for (const user of users) entries.push(this.userEntry(user));
    if (state.camera && !users.some(user => user.kind === 'camera'))
      entries.push({ label: t('privacy-camera-unknown-app'), icon: icon(ICONS.camera), enabled: false, run: () => {} });
    if (state.sharing)
      entries.push({ label: t('privacy-stop-sharing'), icon: icon(ICONS.sharing), run: () => { for (const handle of this.monitor.handles) if (!handle.is_recording) handle.stop(); } });
    if (state.recording)
      entries.push({ label: t('privacy-stop-recording'), icon: icon(ICONS.recording), run: this.stopScreencast });
    if (state.location)
      entries.push({ label: t('privacy-turn-off-location'), icon: icon(ICONS.location),
        run: () => new Gio.Settings({ schema_id: 'org.gnome.system.location' }).set_boolean('enabled', false) });
    entries.push(...this.windowEntries());
    entries.push('separator', { label: t('privacy-settings'), run: () => this.menus.settings('privacy') });
    this.menus.openFrom(this.actor, entries);
  }

  private windowEntries(): MenuEntry[] {
    return (Object.keys(WINDOW_ACCESS) as Level[]).flatMap(level => {
      const units = windowAccess.active.filter(grant => grant.level === level).map(grant => grant.caller.unit);
      return units.length ? [{
        label: t(WINDOW_ACCESS[level], { count: units.length }),
        icon: icon(ICONS.windows),
        children: [{ label: t('privacy-windows-stop'), run: () => { for (const unit of units) windowAccess.revoke(unit); } }],
      }] : [];
    });
  }

  private userEntry(user: MediaUser): MenuEntry {
    const { app, name } = user;
    const actions: MenuEntry[] = [];
    if (user.kind === 'microphone')
      actions.push({ label: t(user.muted ? 'privacy-unmute-microphone' : 'privacy-mute-microphone'), run: () => setMuted(user, !user.muted) });
    if (app) actions.push({ label: t('privacy-close-app', { app: name }), run: () => app.request_quit() });
    return {
      label: `${name} · ${t(user.kind === 'camera' ? 'privacy-camera' : user.muted ? 'privacy-microphone-muted' : 'privacy-microphone')}`,
      icon: app ? appIcons.gicon(app) : icon(ICONS[user.kind]),
      children: actions,
    };
  }
}
