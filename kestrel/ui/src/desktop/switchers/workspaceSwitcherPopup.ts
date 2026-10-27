import { styleSurface, PILL } from '../../appearance/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';

import * as Layout from '../../core/stage/layout.js';
import * as Main from '../../core/main.js';

export const ANIMATION_TIME = 100;
const DISPLAY_TIMEOUT = 600;

const MonitorWorkspaceSwitcherPopup = GObject.registerClass(class MonitorWorkspaceSwitcherPopup extends Clutter.Actor {
  private readonly list = new St.BoxLayout({ style_class: 'workspace-switcher' });

  constructor(constraint: Clutter.Constraint) {
    super({
      x_expand: true,
      y_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.END,
    });
    this.add_constraint(constraint);
    styleSurface(this.list, PILL);
    this.add_child(this.list);
  }

  redisplay(activeWorkspaceIndex: number): void {
    this.list.destroy_all_children();
    for (let i = 0; i < global.workspace_manager.n_workspaces; i++) {
      const indicator = new St.Bin({ style_class: 'ws-switcher-indicator' });
      if (i === activeWorkspaceIndex) indicator.add_style_pseudo_class('active');
      this.list.add_child(indicator);
    }
  }
});
type MonitorWorkspaceSwitcherPopup = InstanceType<typeof MonitorWorkspaceSwitcherPopup>;

export const WorkspaceSwitcherPopup = GObject.registerClass(class WorkspaceSwitcherPopup extends Clutter.Actor {
  private readonly popups: MonitorWorkspaceSwitcherPopup[];
  private timeoutId = 0;
  private activeWorkspaceIndex = 0;

  constructor() {
    super();
    Main.uiGroup.add_child(this);
    this.hide();

    const constraints: Clutter.Constraint[] = Meta.prefs_get_workspaces_only_on_primary()
      ? [new Layout.MonitorConstraint({ primary: true })]
      : Main.layoutManager.monitors.map((_: unknown, index: number) => new Layout.MonitorConstraint({ index }));
    this.popups = constraints.map(constraint => new MonitorWorkspaceSwitcherPopup(constraint));
    for (const popup of this.popups) this.add_child(popup);

    global.workspace_manager.connectObject(
      'workspace-added', () => this.redisplayAllPopups(),
      'workspace-removed', () => this.redisplayAllPopups(), this);
    this.connect('destroy', () => this.onDestroy());
  }

  vfunc_map(): void {
    global.compositor.disable_unredirect();
    super.vfunc_map();
  }

  vfunc_unmap(): void {
    global.compositor.enable_unredirect();
    super.vfunc_unmap();
  }

  private redisplayAllPopups(): void {
    for (const popup of this.popups) popup.redisplay(this.activeWorkspaceIndex);
  }

  display(activeWorkspaceIndex: number): void {
    this.activeWorkspaceIndex = activeWorkspaceIndex;

    if (this.timeoutId !== 0) GLib.source_remove(this.timeoutId);
    this.timeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, DISPLAY_TIMEOUT, () => this.onTimeout());
    GLib.Source.set_name_by_id(this.timeoutId, '[kestrel] this._onTimeout');

    this.redisplayAllPopups();

    const duration = this.visible ? 0 : ANIMATION_TIME;
    this.show();
    this.opacity = 0;
    this.ease({
      opacity: 255,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    });
  }

  private onTimeout(): void {
    this.timeoutId = 0;
    this.ease({
      opacity: 0.0,
      duration: ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.destroy(),
    });
  }

  private onDestroy(): void {
    if (this.timeoutId) GLib.source_remove(this.timeoutId);
    this.timeoutId = 0;
  }
});
export type WorkspaceSwitcherPopup = InstanceType<typeof WorkspaceSwitcherPopup>;
