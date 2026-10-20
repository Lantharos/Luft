import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { appIcons } from '../../appearance/icons/appIcons.js';
import type { ContextMenus, MenuEntry } from '../../desktop/menus/contextMenus.js';
import { formatsLocale, localized, t } from '../../shared/i18n/index.js';
import { windowAccess, type Grant } from '../peek/access/grants.js';
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
    for (const grant of windowAccess.active) entries.push(this.windowsEntry(grant));
    entries.push('separator', { label: t('privacy-settings'), run: () => this.menus.settings('privacy') });
    const [x, y] = this.actor.get_transformed_position();
    this.menus.open(this.actor, entries, Math.round(x + this.actor.width / 2), Math.round(y));
  }

  private windowsEntry({ caller, level }: Grant): MenuEntry {
    return {
      label: `${caller.name} · ${t(level === 'use' ? 'privacy-windows-using' : 'privacy-windows-seeing')}`,
      icon: caller.app ? appIcons.gicon(caller.app) : icon(ICONS.windows),
      children: [{ label: t('privacy-windows-stop'), run: () => windowAccess.revoke(caller.unit) }],
    };
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
