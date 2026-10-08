import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { appIcon } from '../../../appearance/icons/appIcons.js';
import { blurSurface } from '../../../shared/surface.js';

const ICON_SIZE = 20;

export interface DockActions {
  openStart(): void;
  enterApp(app: Shell.App): void;
}

export class Dock {
  readonly actor = new St.BoxLayout({ name: 'kestrel-board-dock', style_class: 'kestrel-board-dock kestrel-glass' });
  private readonly launcher = new St.Button({
    style_class: 'kestrel-board-dock-button',
    can_focus: true,
    accessible_name: 'Open Start',
    child: new St.Icon({ icon_name: 'view-grid-symbolic', style_class: 'kestrel-board-pill-icon' }),
  });
  private readonly apps = new St.BoxLayout({ style_class: 'kestrel-board-dock-apps' });
  private readonly buttons = new Map<string, St.Button>();
  private readonly tracker = Shell.WindowTracker.get_default();

  constructor(private readonly actions: DockActions) {
    this.actor.add_child(this.launcher);
    this.actor.add_child(this.apps);
    blurSurface(this.actor, 999);
    this.launcher.connect('clicked', () => actions.openStart());
  }

  show(windows: readonly Meta.Window[], entered: Meta.Window | null): void {
    const apps = [...new Map(windows.map(window => this.tracker.get_window_app(window)).filter(app => !!app).map(app => [app.get_id(), app])).values()];
    const ids = apps.map(app => app.get_id());
    const current = entered ? this.tracker.get_window_app(entered)?.get_id() : null;
    for (const [id, button] of this.buttons) {
      if (ids.includes(id)) continue;
      button.destroy();
      this.buttons.delete(id);
    }
    apps.forEach((app, index) => {
      const button = this.buttons.get(ids[index]!) ?? this.button(app);
      if (this.apps.get_child_at_index(index) !== button) this.apps.set_child_at_index(button, index);
      button.checked = ids[index] === current;
    });
    this.apps.visible = apps.length > 0;
  }

  private button(app: Shell.App): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-board-dock-button',
      can_focus: true,
      accessible_name: app.get_name(),
      child: appIcon(app, ICON_SIZE),
    });
    button.connect('clicked', () => this.actions.enterApp(app));
    this.apps.add_child(button);
    this.buttons.set(app.get_id(), button);
    return button;
  }
}
