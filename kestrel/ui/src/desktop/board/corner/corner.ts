import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { Monitor } from '../../panel/panel.js';
import { animateActor } from '../../../shared/motion.js';
import { blurSurface } from '../../../shared/surface.js';
import { Dock, type DockActions } from './dock.js';
import { CornerPill } from './pill.js';

const MARGIN = 12;
const FADE_DURATION = 180;

export interface CornerActions extends DockActions {
  openQuickSettings(): void;
  overview(): void;
}

export class Corner {
  readonly actor = new St.BoxLayout({ name: 'kestrel-board-corner', style_class: 'kestrel-board-corner', visible: false });
  private readonly overview = new St.Button({
    style_class: 'kestrel-board-overview kestrel-glass',
    can_focus: true,
    accessible_name: 'Show all windows',
    child: new St.Icon({ icon_name: 'view-restore-symbolic', style_class: 'kestrel-board-pill-icon' }),
    y_align: Clutter.ActorAlign.CENTER,
    visible: false,
    opacity: 0,
  });
  private readonly dock: Dock;
  private readonly pill: CornerPill;
  private monitor: Monitor | null = null;
  private entered = false;
  private repositioning = 0;

  constructor(actions: CornerActions) {
    this.dock = new Dock(actions);
    this.pill = new CornerPill(() => actions.openQuickSettings());
    blurSurface(this.overview, 999);
    this.overview.connect('clicked', () => actions.overview());
    for (const child of [this.overview, this.dock.actor, this.pill.actor]) this.actor.add_child(child);
    this.actor.connect('notify::width', () => this.queueReposition());
    this.actor.connect('notify::height', () => this.queueReposition());
  }

  get clearance(): number {
    const [, height] = this.actor.get_preferred_height(-1);
    return MARGIN + height;
  }

  place(monitor: Monitor): void {
    this.monitor = monitor;
    this.reposition();
  }

  setShown(shown: boolean): void {
    this.actor.visible = shown;
    this.syncOverview(false);
  }

  showWindows(windows: readonly Meta.Window[], entered: Meta.Window | null): void {
    this.dock.show(windows, entered);
    if (this.entered === !!entered) return;
    this.entered = !!entered;
    this.syncOverview(true);
  }

  showStatus(iconNames: string[]): void {
    this.pill.showStatus(iconNames);
  }

  destroy(): void {
    if (this.repositioning) (global as unknown as Shell.Global).compositor.get_laters().remove(this.repositioning);
    this.pill.destroy();
    this.actor.destroy();
  }

  private queueReposition(): void {
    if (this.repositioning) return;
    this.repositioning = (global as unknown as Shell.Global).compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.repositioning = 0;
      this.reposition();
      return false;
    });
  }

  private reposition(): void {
    const monitor = this.monitor;
    if (!monitor) return;
    const [, width] = this.actor.get_preferred_width(-1);
    const [, height] = this.actor.get_preferred_height(width);
    this.actor.set_position(monitor.x + monitor.width - width - MARGIN, monitor.y + monitor.height - height - MARGIN);
  }

  private syncOverview(animated: boolean): void {
    const shown = this.actor.visible && this.entered;
    if (!animated) {
      this.overview.remove_transition('opacity');
      this.overview.visible = shown;
      this.overview.opacity = shown ? 255 : 0;
      return;
    }
    if (shown) this.overview.show();
    animateActor(this.overview, {
      opacity: shown ? 255 : 0,
      duration: FADE_DURATION,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.overview.visible = this.actor.visible && this.entered,
    });
  }
}
