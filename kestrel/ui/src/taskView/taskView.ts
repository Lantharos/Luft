import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { animateActor } from '../motion.js';
import type { Monitor } from '../panel.js';
import { blurSurface, PANEL_HEIGHT } from '../surface.js';
import { windowSlots } from './grid.js';
import { CARD_HEADER, WindowCard } from './windowCard.js';
import { WorkspaceStrip, type BackgroundFactory } from './workspaceStrip.js';

const MARGIN = 40;
const SPACING = 28;

export class TaskView {
  readonly actor = new St.Widget({ name: 'kestrel-task-view', style_class: 'kestrel-task-view', reactive: true, visible: false });
  private readonly windowLayer = new St.Widget();
  private readonly strip: WorkspaceStrip;
  private cards: WindowCard[] = [];
  private monitor: Monitor | null = null;
  private signals: [GObject.Object, number][] = [];
  private rebuildSource = 0;

  constructor(background: BackgroundFactory, private readonly dismiss: () => void) {
    blurSurface(this.actor, 0);
    this.strip = new WorkspaceStrip(background);
    this.actor.add_child(this.windowLayer);
    this.actor.add_child(this.strip.actor);
    this.actor.connect('button-press-event', (_actor, event: Clutter.Event) => {
      if (event.get_source() !== this.actor && event.get_source() !== this.windowLayer) return Clutter.EVENT_PROPAGATE;
      this.dismiss();
      return Clutter.EVENT_STOP;
    });
  }

  get visible(): boolean {
    return !!this.monitor;
  }

  open(monitor: Monitor): void {
    this.monitor = monitor;
    this.actor.set_position(monitor.x, monitor.y);
    this.actor.set_size(monitor.width, monitor.height - PANEL_HEIGHT);
    const shell = global as unknown as Shell.Global;
    const manager = shell.workspace_manager;
    const rebuild = () => this.scheduleRebuild();
    this.signals = [
      [manager, manager.connect('active-workspace-changed', rebuild)],
      [manager, manager.connect('workspace-added', rebuild)],
      [manager, manager.connect('workspace-removed', rebuild)],
      [shell.display, shell.display.connect('window-created', rebuild)],
    ];
    this.rebuild();
    this.actor.get_parent()!.set_child_above_sibling(this.actor, null);
    this.actor.remove_all_transitions();
    this.actor.show();
    this.actor.opacity = 0;
    this.windowLayer.set_pivot_point(0.5, 0.5);
    this.windowLayer.set_scale(0.96, 0.96);
    animateActor(this.actor, { opacity: 255, duration: 180, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    animateActor(this.windowLayer, { scale_x: 1, scale_y: 1, duration: 220, mode: Clutter.AnimationMode.EASE_OUT_QUART });
    (this.cards[0]?.actor ?? this.strip.actor).grab_key_focus();
    if (!this.cards.length) this.strip.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
  }

  close(immediate = false): void {
    if (!this.monitor) return;
    this.monitor = null;
    for (const [object, id] of this.signals) object.disconnect(id);
    this.signals = [];
    if (this.rebuildSource) GLib.Source.remove(this.rebuildSource);
    this.rebuildSource = 0;
    const finish = () => {
      if (this.monitor) return;
      this.actor.hide();
      this.clearCards();
      this.strip.clear();
    };
    if (immediate) {
      this.actor.remove_all_transitions();
      finish();
      return;
    }
    animateActor(this.actor, { opacity: 0, duration: 140, mode: Clutter.AnimationMode.EASE_IN_QUAD, onStopped: finish });
  }

  private scheduleRebuild(): void {
    if (this.rebuildSource) return;
    this.rebuildSource = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      this.rebuildSource = 0;
      if (this.monitor) this.rebuild();
      return GLib.SOURCE_REMOVE;
    });
  }

  private clearCards(): void {
    for (const card of this.cards) card.destroy();
    this.cards = [];
  }

  private rebuild(): void {
    const monitor = this.monitor!;
    const shell = global as unknown as Shell.Global;
    const focused = shell.stage.get_key_focus();
    const focusedWindow = this.cards.find(card => card.actor === focused)?.window;
    this.clearCards();
    const workspace = shell.workspace_manager.get_active_workspace();
    const windows = shell.display.get_tab_list(Meta.TabList.NORMAL, workspace);
    this.cards = windows.map(window => new WindowCard(window, () => {
      this.dismiss();
      window.activate(shell.get_current_time());
    }, () => this.scheduleRebuild()));
    for (const card of this.cards) this.windowLayer.add_child(card.actor);
    this.strip.build(monitor);

    const width = monitor.width;
    const height = monitor.height - PANEL_HEIGHT;
    const [, stripWidth] = this.strip.actor.get_preferred_width(-1);
    const [, stripHeight] = this.strip.actor.get_preferred_height(stripWidth);
    const stripY = height - stripHeight - 20;
    this.strip.actor.set_position(Math.round(Math.max(MARGIN, (width - stripWidth) / 2)), stripY);
    this.strip.actor.set_size(Math.min(stripWidth, width - 2 * MARGIN), stripHeight);
    this.windowLayer.set_size(width, stripY);
    const area = { x: MARGIN, y: MARGIN, width: width - 2 * MARGIN, height: stripY - 2 * MARGIN };
    const slots = windowSlots(windows.map(window => window.get_frame_rect()), area, SPACING, CARD_HEADER);
    this.cards.forEach((card, index) => card.place(slots[index]));
    const restore = this.cards.find(card => card.window === focusedWindow);
    if (restore) restore.actor.grab_key_focus();
    else if (this.monitor && focused && !this.actor.contains(focused)) this.cards[0]?.actor.grab_key_focus();
  }
}
