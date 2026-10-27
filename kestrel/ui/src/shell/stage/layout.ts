import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as Background from './background.js';
import { LockBackdrop } from '../lockScreen/backdrop.js';
import * as Main from '../main.js';
import { logErrorUnlessCancelled } from '../runtime/errorUtils.js';
import { MonitorBackgrounds } from './layout/backgrounds.js';
import { ChromeTracker, type ChromeOptions } from './layout/chrome.js';
import { Monitor } from './layout/monitor.js';
import { firmwareLogo, ScreenTransition, UiActor } from './layout/stageActors.js';

export { MonitorConstraint } from './layout/monitorConstraint.js';
export type { ChromeOptions } from './layout/chrome.js';
export type { Monitor } from './layout/monitor.js';

const STARTUP_ANIMATION_TIME = 500;
const STARTUP_SCALE = 0.94;

export namespace LayoutManager {
  export interface Signals extends GObject.Object.SignalSignatures {
    'startup-complete': () => void;
    'startup-prepared': () => void;
    'first-frame': () => void;
    'monitors-changed': () => void;
    'system-modal-opened': () => void;
  }
}

export const LayoutManager = GObject.registerClass({
  Signals: {
    'startup-complete': {},
    'startup-prepared': {},
    'first-frame': {},
    'monitors-changed': {},
    'system-modal-opened': {},
  },
}, class LayoutManager extends GObject.Object {
  declare connect: GObject.SignalMethods<this, LayoutManager.Signals>['connect'];
  declare connect_after: GObject.SignalMethods<this, LayoutManager.Signals>['connect_after'];
  declare emit: GObject.SignalMethods<this, LayoutManager.Signals>['emit'];

  monitors: Monitor[] = [];
  primaryMonitor: Monitor | null = null;
  bottomMonitor: Monitor | null = null;
  primaryIndex = -1;
  bottomIndex = -1;
  readonly uiGroup: InstanceType<typeof UiActor>;
  readonly screenShieldGroup: St.Widget;
  readonly modalDialogGroup: St.Widget;
  readonly keyboardBox: St.BoxLayout;
  readonly screenshotUIGroup: St.Widget;
  readonly dummyCursor: St.Widget;
  readonly screenTransition: ScreenTransition;
  private primaryMonitorReadyResolver: (() => void) | null = null;
  private currentKeyboardIndex = -1;
  private startingUp = true;
  private readonly chrome = new ChromeTracker(actor => this.findMonitorForActor(actor));
  private readonly inputPanelGroup: Clutter.Actor;
  private readonly bgGroup: Meta.BackgroundGroup;
  private readonly backgrounds: MonitorBackgrounds;
  private systemBackground: Clutter.Actor | null = null;
  private coverPane: Clutter.Actor | null = null;
  private backdropStore: LockBackdrop | null = null;

  constructor() {
    super();

    this.uiGroup = new UiActor({ name: 'uiGroup' });
    this.uiGroup.set_no_layout(true);

    global.stage.add_child(this.uiGroup);

    global.stage.remove_child(global.window_group);
    this.uiGroup.add_child(global.window_group);
    global.connect('shutdown', () => {
      global.backend.get_monitor_manager().disconnectObject(this);

      const adoptedUiGroupActors = [
        global.window_group,
        global.top_window_group,
        global.compositor.get_input_panel_group(),
        global.compositor.get_feedback_group(),
      ];

      for (const adoptedActor of adoptedUiGroupActors) {
        this.uiGroup.remove_child(adoptedActor);
        global.stage.add_child(adoptedActor);
      }

      this.uiGroup.destroy();
    });

    global.stage.remove_child(global.top_window_group);
    this.uiGroup.add_child(global.top_window_group);

    this.screenShieldGroup = new St.Widget({
      name: 'screenShieldGroup',
      visible: false,
      clip_to_allocation: true,
      layout_manager: new Clutter.BinLayout(),
      constraints: new Clutter.BindConstraint({
        source: this.uiGroup,
        coordinate: Clutter.BindCoordinate.ALL,
      }),
    });
    this.addChrome(this.screenShieldGroup);

    this.modalDialogGroup = new St.Widget({
      name: 'modalDialogGroup',
      layout_manager: new Clutter.BinLayout(),
    });
    this.uiGroup.add_child(this.modalDialogGroup);

    this.inputPanelGroup = global.compositor.get_input_panel_group();
    global.stage.remove_child(this.inputPanelGroup);
    this.uiGroup.add_child(this.inputPanelGroup);

    this.keyboardBox = new St.BoxLayout({
      name: 'keyboardBox',
      reactive: true,
      track_hover: true,
    });
    this.inputPanelGroup.add_child(this.keyboardBox);

    this.screenshotUIGroup = new St.Widget({
      name: 'screenshotUIGroup',
      layout_manager: new Clutter.BinLayout(),
    });
    this.uiGroup.add_child(this.screenshotUIGroup);
    this.chrome.track(this.screenshotUIGroup);

    this.dummyCursor = new St.Widget({ width: 0, height: 0, opacity: 0, name: 'Dummy Cursor' });
    this.uiGroup.add_child(this.dummyCursor);

    const feedbackGroup = global.compositor.get_feedback_group();
    global.stage.remove_child(feedbackGroup);
    this.uiGroup.add_child(feedbackGroup);

    this.bgGroup = new Meta.BackgroundGroup();
    global.window_group.add_child(this.bgGroup);
    global.window_group.set_child_below_sibling(this.bgGroup, null);
    this.backgrounds = new MonitorBackgrounds(this, this.bgGroup);

    global.workspace_manager.connect('notify::n-workspaces', () => this.chrome.queueUpdateRegions());
    global.display.connect('in-fullscreen-changed', () => this.updateFullscreen());
    global.backend.get_monitor_manager().connectObject('monitors-changed', () => this.monitorsChanged(), this);
    this.monitorsChanged();

    this.screenTransition = new ScreenTransition();
    this.uiGroup.add_child(this.screenTransition);
    this.screenTransition.add_constraint(new Clutter.BindConstraint({
      source: this.uiGroup,
      coordinate: Clutter.BindCoordinate.ALL,
    }));
  }

  init(interfaceReady: Promise<unknown> = Promise.resolve()): void {
    Main.sessionMode.connect('updated', () => this.sessionUpdated());

    this.doStartupAnimation(interfaceReady).catch(logError);
  }

  get keyboardMonitor(): Monitor {
    return this.monitors[this.keyboardIndex];
  }

  get focusIndex(): number {
    if (global.stage.key_focus !== null) return this.findIndexForActor(global.stage.key_focus);
    if (global.display.focus_window !== null) return global.display.focus_window.get_monitor();
    return this.primaryIndex;
  }

  set keyboardIndex(v: number) {
    this.currentKeyboardIndex = v;
    this.updateKeyboardBox();
  }

  get keyboardIndex(): number {
    return this.currentKeyboardIndex;
  }

  get backgroundGroup(): Meta.BackgroundGroup {
    return this.bgGroup;
  }

  setDummyCursorGeometry(x: number, y: number, w: number, h: number): void {
    this.dummyCursor.set_position(Math.round(x), Math.round(y));
    this.dummyCursor.set_size(Math.round(w), Math.round(h));
  }

  addChrome(actor: Clutter.Actor, options?: ChromeOptions): void {
    this.uiGroup.add_child(actor);
    if (this.uiGroup.contains(global.top_window_group)) this.uiGroup.set_child_below_sibling(actor, global.top_window_group);
    this.chrome.track(actor, options);
  }

  addTopChrome(actor: Clutter.Actor, options?: ChromeOptions): void {
    this.uiGroup.insert_child_below(actor, this.inputPanelGroup);
    this.chrome.track(actor, options);
  }

  addKeyboardChrome(actor: Clutter.Actor): void {
    this.inputPanelGroup.add_child(actor);
  }

  trackChrome(actor: Clutter.Actor, options?: ChromeOptions): void {
    this.chrome.trackDescendant(actor, options);
  }

  untrackChrome(actor: Clutter.Actor): void {
    this.chrome.untrack(actor);
  }

  removeChrome(actor: Clutter.Actor): void {
    this.uiGroup.remove_child(actor);
    this.chrome.untrack(actor);
  }

  createBackground(container: Clutter.Actor, monitorIndex: number): Background.BackgroundManager {
    return new Background.BackgroundManager({ container, layoutManager: this, monitorIndex, controlPosition: false });
  }

  getWorkAreaForMonitor(monitorIndex: number): Mtk.Rectangle {
    return global.workspace_manager.get_workspace_by_index(0)!.get_work_area_for_monitor(monitorIndex);
  }

  findIndexForActor(actor: Clutter.Actor): number {
    const [x, y] = actor.get_transformed_position();
    const [w, h] = actor.get_transformed_size();
    return this.findIndexForRect(x, y, w, h);
  }

  findMonitorForActor(actor: Clutter.Actor): Monitor | null {
    return this.findMonitorForIndex(this.findIndexForActor(actor));
  }

  findMonitorForPoint(x: number, y: number): Monitor | null {
    return this.findMonitorForIndex(this.findIndexForRect(x, y, 1, 1));
  }

  modalEnded(): void {
    this.chrome.queueUpdateRegions();
  }

  private sessionUpdated(): void {
    this.updateVisibility();
    this.chrome.queueUpdateRegions();
  }

  private async ensurePrimaryMonitor(): Promise<void> {
    if (this.primaryMonitor) return;

    const { promise, resolve } = Promise.withResolvers<void>();
    this.primaryMonitorReadyResolver = resolve;
    await promise;
  }

  private updateMonitors(): void {
    const display = global.display;

    this.monitors = [];
    const nMonitors = display.get_n_monitors();
    for (let i = 0; i < nMonitors; i++)
      this.monitors.push(new Monitor(i, display.get_monitor_geometry(i), display.get_monitor_scale(i)));

    if (nMonitors === 0) {
      this.primaryIndex = this.bottomIndex = -1;
    } else if (nMonitors === 1) {
      this.primaryIndex = this.bottomIndex = 0;
    } else {
      this.primaryIndex = this.bottomIndex = display.get_primary_monitor();
      for (let i = 0; i < this.monitors.length; i++) {
        const monitor = this.monitors[i];
        if (this.isAboveOrBelowPrimary(monitor) && monitor.y > this.monitors[this.bottomIndex].y) this.bottomIndex = i;
      }
    }

    if (this.primaryIndex === -1) {
      this.primaryMonitor = null;
      this.bottomMonitor = null;
      return;
    }

    this.primaryMonitor = this.monitors[this.primaryIndex];
    this.bottomMonitor = this.monitors[this.bottomIndex];
    this.primaryMonitorReadyResolver?.();
  }

  private updateKeyboardBox(): void {
    this.keyboardBox.set_position(this.keyboardMonitor.x, this.keyboardMonitor.y + this.keyboardMonitor.height);
    this.keyboardBox.set_size(this.keyboardMonitor.width, -1);
  }

  private monitorsChanged(): void {
    this.updateMonitors();
    if (this.primaryMonitor) this.keyboardIndex = this.primaryIndex;
    this.backgrounds.update(this.startingUp).catch(logError);
    this.updateFullscreen();
    this.updateVisibility();
    this.chrome.queueUpdateRegions();

    this.emit('monitors-changed');
  }

  private isAboveOrBelowPrimary(monitor: Monitor): boolean {
    const primary = this.monitors[this.primaryIndex];
    const monitorLeft = monitor.x, monitorRight = monitor.x + monitor.width;
    const primaryLeft = primary.x, primaryRight = primary.x + primary.width;

    return (monitorLeft >= primaryLeft && monitorLeft < primaryRight) ||
      (monitorRight > primaryLeft && monitorRight <= primaryRight) ||
      (primaryLeft >= monitorLeft && primaryLeft < monitorRight) ||
      (primaryRight > monitorLeft && primaryRight <= monitorRight);
  }

  private async doStartupAnimation(interfaceReady: Promise<unknown>): Promise<void> {
    const systemBackground = await this.loadBackground();

    systemBackground.show();
    global.stage.show();
    const firstFrame = new Promise<void>(resolve => {
      const id = global.stage.connect('after-paint', () => {
        global.stage.disconnect(id);
        resolve();
      });
    }).then(() => this.emit('first-frame'));

    try {
      await this.prepareStartupAnimation();
      await firstFrame;
      await interfaceReady;
      await this.startupAnimation();
    } catch (e) {
      logError(e as Error);
    } finally {
      this.startupAnimationComplete();
    }
  }

  private async loadBackground(): Promise<Clutter.Actor> {
    await this.ensurePrimaryMonitor();

    let systemBackground;
    if (Main.sessionMode.isPeek) {
      systemBackground = new Clutter.Actor();
    } else if (Main.sessionMode.isGreeter || Main.sessionMode.isSetup) {
      const background = new Background.SystemBackground();
      background.add_constraint(new Clutter.BindConstraint({
        source: global.stage,
        coordinate: Clutter.BindCoordinate.ALL,
      }));
      systemBackground = new Clutter.Actor();
      systemBackground.add_child(background);
      const logo = firmwareLogo(this.primaryMonitor!);
      if (logo) systemBackground.add_child(logo);
      await new Promise(resolve => background.connect('loaded', resolve));
    } else {
      const backdrop = new LockBackdrop();
      systemBackground = backdrop.actor;
      await backdrop.loaded;
    }
    this.systemBackground = systemBackground;
    systemBackground.hide();
    global.stage.insert_child_below(systemBackground, null);
    return systemBackground;
  }

  private async prepareStartupAnimation(): Promise<void> {
    await this.ensurePrimaryMonitor();

    this.coverPane = new Clutter.Actor({
      opacity: 0,
      width: global.screen_width,
      height: global.screen_height,
      reactive: true,
    });
    this.addChrome(this.coverPane);

    this.chrome.updateRegions();

    this.keyboardBox.hide();

    const monitor = this.primaryMonitor!;

    const x = monitor.x + monitor.width / 2.0;
    const y = monitor.y + monitor.height / 2.0;

    this.uiGroup.set_pivot_point(x / global.screen_width, y / global.screen_height);
    this.uiGroup.scale_x = this.uiGroup.scale_y = STARTUP_SCALE;
    this.uiGroup.opacity = 0;

    global.window_group.set_clip(monitor.x, monitor.y, monitor.width, monitor.height);

    await this.backgrounds.update(this.startingUp);

    this.emit('startup-prepared');
  }

  private async startupAnimation(): Promise<void> {
    if (Main.sessionMode.isPeek) {
      this.uiGroup.set({ scale_x: 1, scale_y: 1, opacity: 255 });
      return;
    }

    await this.uiGroup.easeAsync({
      scale_x: 1,
      scale_y: 1,
      opacity: 255,
      duration: STARTUP_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    }).catch(logErrorUnlessCancelled);
  }

  private startupAnimationComplete(): void {
    this.coverPane!.destroy();
    this.coverPane = null;

    this.systemBackground!.destroy();
    this.systemBackground = null;

    if (!Main.sessionMode.isPeek && !Main.sessionMode.isSetup) {
      this.backdropStore = new LockBackdrop({ offscreen: true });
      global.stage.insert_child_below(this.backdropStore.actor, null);
    }

    this.startingUp = false;

    this.keyboardBox.show();

    this.backgrounds.showSecondary();
    global.window_group.remove_clip();

    this.chrome.queueUpdateRegions();

    this.emit('startup-complete');
  }

  private updateVisibility(): void {
    const windowsVisible = Main.sessionMode.hasWindows;

    global.window_group.visible = windowsVisible;
    global.top_window_group.visible = windowsVisible;

    this.chrome.updateVisibility();
  }

  private updateFullscreen(): void {
    this.updateVisibility();
    this.chrome.queueUpdateRegions();
  }

  private findIndexForRect(x: number, y: number, width: number, height: number): number {
    const rect = new Mtk.Rectangle({
      x: Math.floor(x),
      y: Math.floor(y),
      width: Math.ceil(x + width) - Math.floor(x),
      height: Math.ceil(y + height) - Math.floor(y),
    });
    return global.display.get_monitor_index_for_rect(rect);
  }

  private findMonitorForIndex(index: number): Monitor | null {
    if (index >= 0 && index < this.monitors.length) return this.monitors[index];
    return null;
  }
});
export type LayoutManager = InstanceType<typeof LayoutManager>;
