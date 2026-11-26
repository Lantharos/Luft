import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { MenuEntry } from '../../../menus/contextMenus.js';
import type { TaskbarMetrics } from '../../preferences/taskbarPreferences.js';
import type { AppsRoom } from '../../islands/islandFit.js';
import { isVertical, type Edge } from '../../../../shared/layout/edge.js';
import { frameOnPixels, pixelScale, type PixelFrame } from '../../../../shared/display/graphics.js';
import { animateActor, Curve, Duration } from '../../../../shared/motion/motion.js';
import { localized, t } from '../../../../shared/i18n/index.js';
import { AppIndicators } from '../appIndicators.js';
import type { LauncherEntry } from '../launcherEntries.js';
import type { OverflowPopup } from './overflowPopup.js';
import type { OverflowApps } from './overflowRow.js';
import { capacityFor, splitApps } from './shownApps.js';

const NO_ENTRY: LauncherEntry = { count: 0, countVisible: false, progress: 0, progressVisible: false, urgent: false };
const GLYPHS: Record<Edge, string> = { bottom: 'pan-up-symbolic', top: 'pan-down-symbolic', left: 'pan-end-symbolic', right: 'pan-start-symbolic' };
const GLYPH_SCALE = 0.4;
const FOCUSED = 2;
const ATTENTION = 1;

export interface OverflowHost {
  frame(): PixelFrame;
  icon(app: Shell.App): St.Icon;
  windowsOf(app: Shell.App): Meta.Window[];
  attention(app: Shell.App): boolean;
  focused(app: Shell.App): boolean;
  pinned(app: Shell.App): boolean;
  activate(app: Shell.App, source: St.Button): void;
  entries(app: Shell.App): MenuEntry[];
  monitorIndex(): number;
  changed(): void;
}

export class AppOverflow implements AppsRoom {
  readonly slot = new St.Widget({ visible: false });
  private readonly content = new St.Widget();
  private readonly glyph = new St.Icon();
  private readonly button = new St.Button({ name: 'kestrel-taskbar-overflow', style_class: 'kestrel-task-button', child: this.content, can_focus: true, track_hover: true });
  private readonly indicators: AppIndicators;
  private hidden: Shell.App[] = [];
  private count = 0;
  private room = Infinity;
  private later = 0;

  constructor(private readonly host: OverflowHost, private readonly popup: OverflowPopup, private metrics: TaskbarMetrics, private edge: Edge) {
    this.content.add_child(this.glyph);
    this.indicators = new AppIndicators(this.content, metrics.button, edge);
    this.slot.add_child(this.button);
    localized(this.button, () => (this.button.accessible_name = t('taskbar-more-apps')));
    this.button.connect('clicked', () => this.popup.toggle(this.button, this.list));
    this.button.connect('notify::allocation', () => this.syncIconGeometry());
    this.layout(metrics, edge);
  }

  get least(): number {
    return this.metrics.button + this.metrics.gap;
  }

  private get lengthKey(): 'width' | 'height' {
    return isVertical(this.edge) ? 'height' : 'width';
  }

  private get capacity(): number {
    return capacityFor(this.count, this.room, this.least);
  }

  private get list(): OverflowApps {
    const { host } = this;
    return {
      apps: this.hidden, frame: host.frame(),
      icon: app => host.icon(app), windowsOf: app => host.windowsOf(app), attention: app => host.attention(app),
      pinned: app => host.pinned(app), entries: app => host.entries(app), activate: app => host.activate(app, this.button),
    };
  }

  fit(room: number): void {
    const before = this.capacity;
    this.room = room;
    if (this.capacity === before || this.later) return;
    this.later = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.later = 0;
      this.host.changed();
      return false;
    });
  }

  split(apps: Shell.App[]): Shell.App[] {
    this.count = apps.length;
    const { shown, hidden } = this.splitOf(apps);
    this.hidden = hidden;
    this.sync();
    return shown;
  }

  recheck(apps: Shell.App[]): void {
    const hidden = this.splitOf(apps).hidden;
    if (hidden.length !== this.hidden.length || hidden.some((app, index) => app !== this.hidden[index])) this.host.changed();
    else this.sync();
  }

  private splitOf(apps: Shell.App[]) {
    return splitApps(apps, this.capacity, app => this.host.focused(app) ? FOCUSED : this.host.attention(app) ? ATTENTION : 0);
  }

  layout(metrics: TaskbarMetrics, edge: Edge): void {
    this.metrics = metrics;
    this.edge = edge;
    const vertical = isVertical(edge);
    const size = Math.round(metrics.button * GLYPH_SCALE);
    const { outer, inner, inset } = frameOnPixels(metrics.button, size, pixelScale(this.slot));
    this.slot.remove_transition(this.lengthKey);
    this.slot.set_size(vertical ? metrics.button : this.slotLength, vertical ? this.slotLength : metrics.button);
    this.button.set_position(vertical ? 0 : Math.floor(metrics.gap / 2), vertical ? Math.floor(metrics.gap / 2) : 0);
    this.button.set_size(outer, outer);
    this.content.set_size(outer, outer);
    this.glyph.set({ icon_name: GLYPHS[edge], icon_size: size, x: inset, y: inset, width: inner, height: inner });
    this.indicators.resize(outer, edge);
  }

  private get slotLength(): number {
    return this.hidden.length ? this.least : 0;
  }

  private sync(): void {
    const wanted = this.hidden.length > 0;
    if (wanted && !this.slot.visible) this.slot.show();
    if (this.slot[this.lengthKey] !== this.slotLength) {
      animateActor(this.slot, {
        [this.lengthKey]: this.slotLength, duration: wanted ? Duration.moderate : Duration.quick, curve: wanted ? Curve.settle : Curve.pulse,
        onComplete: () => { if (!this.hidden.length) this.slot.hide(); },
      });
    }
    this.indicators.update(NO_ENTRY, this.hidden.some(app => this.host.attention(app)), false);
    this.syncIconGeometry();
    this.popup.update(this.button, this.list);
  }

  syncIconGeometry(): void {
    if (!this.button.mapped || !this.hidden.length) return;
    const [x, y] = this.button.get_transformed_position();
    const [width, height] = this.button.get_transformed_size();
    const geometry = new Mtk.Rectangle({ x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) });
    const monitor = this.host.monitorIndex();
    for (const window of this.hidden.flatMap(app => this.host.windowsOf(app))) {
      if (window.get_monitor() === monitor) window.set_icon_geometry(geometry);
    }
  }

  stop(): void {
    if (this.later) global.compositor.get_laters().remove(this.later);
    this.later = 0;
    this.popup.forget(this.button);
  }
}
