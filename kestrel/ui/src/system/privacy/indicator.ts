import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { appIcons } from '../../appearance/icons/appIcons.js';
import type { ContextMenus, MenuEntry } from '../../desktop/menus/contextMenus.js';
import { windowAccess, type Grant } from '../look/access/grants.js';
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
const LABELS: Record<keyof PrivacyState, string> = {
  camera: 'camera', microphone: 'microphone', sharing: 'screen', recording: 'screen', location: 'location', windows: 'windows',
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
    this.sync();
  }

  shutdown(): void {
    this.monitor.destroy();
  }

  private sync(): void {
    const state = this.monitor.state;
    const active = (Object.keys(ICONS) as (keyof PrivacyState)[]).filter(kind => state[kind]);
    this.actor.visible = active.length > 0;
    this.actor.accessible_name = `Using your ${[...new Set(active.map(kind => LABELS[kind]))].join(', ')}`;
    this.icons.destroy_all_children();
    for (const kind of active) this.icons.add_child(new St.Icon({ icon_name: ICONS[kind], icon_size: 16 }));
  }

  private async open(): Promise<void> {
    const state = this.monitor.state;
    const users = state.camera || state.microphone ? await mediaUsers() : [];
    const entries: MenuEntry[] = [];
    for (const user of users) entries.push(this.userEntry(user));
    if (state.camera && !users.some(user => user.kind === 'camera'))
      entries.push({ label: 'An app is using the camera', icon: icon(ICONS.camera), enabled: false, run: () => {} });
    if (state.sharing)
      entries.push({ label: 'Stop sharing the screen', icon: icon(ICONS.sharing), run: () => { for (const handle of this.monitor.handles) if (!handle.is_recording) handle.stop(); } });
    if (state.recording)
      entries.push({ label: 'Stop recording', icon: icon(ICONS.recording), run: this.stopScreencast });
    if (state.location)
      entries.push({ label: 'Turn off location services', icon: icon(ICONS.location),
        run: () => new Gio.Settings({ schema_id: 'org.gnome.system.location' }).set_boolean('enabled', false) });
    for (const grant of windowAccess.active) entries.push(this.windowsEntry(grant));
    entries.push('separator', { label: 'Privacy settings', run: () => this.menus.settings('privacy') });
    const [x, y] = this.actor.get_transformed_position();
    this.menus.open(this.actor, entries, Math.round(x + this.actor.width / 2), Math.round(y));
  }

  private windowsEntry({ caller, level }: Grant): MenuEntry {
    return {
      label: `${caller.name} · ${level === 'use' ? 'Using your windows' : 'Seeing your windows'}`,
      icon: caller.app ? appIcons.gicon(caller.app) : icon(ICONS.windows),
      children: [{ label: 'Stop access', run: () => windowAccess.revoke(caller.unit) }],
    };
  }

  private userEntry(user: MediaUser): MenuEntry {
    const { app, name } = user;
    const actions: MenuEntry[] = [];
    if (user.kind === 'microphone')
      actions.push({ label: user.muted ? 'Unmute microphone' : 'Mute microphone', run: () => setMuted(user, !user.muted) });
    if (app) actions.push({ label: `Close ${name}`, run: () => app.request_quit() });
    return {
      label: `${name} · ${user.kind === 'camera' ? 'Camera' : user.muted ? 'Microphone muted' : 'Microphone'}`,
      icon: app ? appIcons.gicon(app) : icon(ICONS[user.kind]),
      children: actions,
    };
  }
}
