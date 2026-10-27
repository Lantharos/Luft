import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as AltTab from '../switchers/altTab.js';
import * as Cycler from '../switchers/cycler.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as SwitchMonitor from '../switchers/switchMonitor.js';
import * as IBusManager from '../input/ibusManager.js';
import * as Main from '../main.js';
import { WorkspaceSwitcherPopup } from '../switchers/workspaceSwitcherPopup.js';
import { InhibitShortcutsDialog } from '../dialogs/inhibitShortcutsDialog.js';
import { CloseDialog } from './closeDialog.js';
import { CornerSnap } from './cornerSnap.js';
import { DisplayChangeDialog } from './displayChangeDialog.js';
import { bindKeys } from './keybindings.js';
import { ResizePopup } from './resizePopup.js';
import { TilePreview } from './tilePreview.js';
import { WindowMenuManager } from './windowMenu.js';
import { WindowDimming } from './effects/dimmer.js';
import { MinimizeEffects } from './effects/minimize.js';
import { WindowMorphs } from './effects/morph.js';
import { OpenCloseEffects } from './effects/openClose.js';
import { WorkspaceAnimationController } from './workspaces/animation.js';
import { MAX_NUM_WORKSPACES, WorkspaceTracker } from './workspaces/tracker.js';

const X11_SETTINGS_TIMEOUT_MS = 10000;

const MINIMIZE_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.DIALOG];
const MAP_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG];
const MORPH_TYPES = [Meta.WindowType.NORMAL];

const NEIGHBOR_DIRECTIONS: Record<string, Meta.MotionDirection> = {
  left: Meta.MotionDirection.LEFT,
  right: Meta.MotionDirection.RIGHT,
  up: Meta.MotionDirection.UP,
  down: Meta.MotionDirection.DOWN,
};

type TileRequest = [Meta.Window, Mtk.Rectangle, number];

export class WindowManager {
  private readonly shellwm = global.window_manager;
  private readonly openClose = new OpenCloseEffects();
  private readonly morphs = new WindowMorphs();
  private readonly minimizeEffects = new MinimizeEffects(this.shellwm, actor => this.shouldAnimateActor(actor, MINIMIZE_TYPES));
  private readonly dimming = new WindowDimming(() => this.shouldAnimate());
  private readonly skippedActors = new Set<Meta.WindowActor>();
  private readonly allowedKeybindings = new Map<string, Shell.ActionMode>();
  private readonly cornerSnap = new CornerSnap((window, rect, monitorIndex) => this.showCornerPreview(window, rect, monitorIndex),
    window => this.morphWindow(window));
  private readonly windowMenuManager: WindowMenuManager;
  private readonly workspaceTracker: WorkspaceTracker | null;
  private readonly workspaceAnimation: WorkspaceAnimationController;
  private tileRequest: TileRequest | null = null;
  private tilePreview: TilePreview | null = null;
  private resizePopup: ResizePopup | null = null;
  private workspaceSwitcherPopup: WorkspaceSwitcherPopup | null = null;
  private isWorkspacePrepended = false;
  private switchInProgress = false;
  private blockCount = 0;

  constructor() {
    const shellwm = this.shellwm;
    shellwm.connect('kill-window-effects', (_shellwm, actor) => {
      this.minimizeEffects.handOver(actor);
      this.openClose.finish(actor);
      this.morphs.interrupt(actor);
    });

    shellwm.connect('switch-workspace', (_shellwm, from, to) => this.switchWorkspace(from, to));
    shellwm.connect('show-tile-preview', (_shellwm, window, tileRect, monitorIndex) => this.showTilePreview(window, tileRect, monitorIndex));
    shellwm.connect('hide-tile-preview', () => this.hideTilePreview());
    shellwm.connect('show-window-menu', (_shellwm, window, menu, rect) => this.windowMenuManager.showWindowMenuForWindow(window, menu, rect));
    shellwm.connect('minimize', (_shellwm, actor) => this.minimizeEffects.minimize(actor));
    shellwm.connect('unminimize', (_shellwm, actor) => this.minimizeEffects.unminimize(actor));
    shellwm.connect('size-change', (_shellwm, actor, _change, oldFrameRect) => this.sizeChangeWindow(actor, oldFrameRect));
    shellwm.connect('map', (_shellwm, actor) => this.mapWindow(actor));
    shellwm.connect('destroy', (_shellwm, actor) => this.destroyWindow(actor));
    shellwm.connect('filter-keybinding', (_shellwm, binding) => this.filterKeybinding(binding));
    shellwm.connect('confirm-display-change', () => new DisplayChangeDialog(shellwm).open());
    shellwm.connect('create-close-dialog', (_shellwm, window) => new CloseDialog(window));
    shellwm.connect('create-inhibit-shortcuts-dialog', (_shellwm, window) => new InhibitShortcutsDialog(window));

    bindKeys(this, {
      workspaceSwitcher: (display, window, _event, binding) => this.showWorkspaceSwitcher(display, window, binding),
      switcher: (_display, _window, _event, binding) => this.startSwitcher(binding),
      a11ySwitcher: (_display, _window, _event, binding) =>
        Main.ctrlAltTabManager.popup(binding.is_reversed(), binding.get_name(), binding.get_mask()),
    });

    global.display.connect('show-resize-popup', (_display, show, rect, width, height) => this.showResizePopup(show, rect, width, height));
    global.display.connect('show-osd', (_display, monitorIndex, iconName, label) => {
      Main.osdWindowManager.showOne(monitorIndex, Gio.Icon.new_for_string(iconName), label);
    });

    global.display.connect('init-xserver', (_display, task) => {
      if (Main.sessionMode.isPeek) {
        task.return_boolean(true);
        return true;
      }

      IBusManager.getIBusManager().restartDaemon(['--xim']);
      this.shareSettingsWithX11(task);
      return true;
    });
    global.display.connect('x11-display-closing', () => {
      if (!Main.sessionMode.isPeek) IBusManager.getIBusManager().restartDaemon();
    });

    this.windowMenuManager = new WindowMenuManager();
    this.workspaceTracker = Main.sessionMode.hasWorkspaces ? new WorkspaceTracker() : null;

    this.addUnfullscreenGesture();

    this.workspaceAnimation = new WorkspaceAnimationController();
    shellwm.connect('kill-switch-workspace', () => {
      this.workspaceAnimation.cancelSwitchAnimation();
      this.switchWorkspaceDone();
    });
  }

  private addUnfullscreenGesture(): void {
    const topDragGesture = new Shell.EdgeDragGesture({
      name: 'Window unfullscreen top drag',
    });
    topDragGesture.set_side(St.Side.TOP);
    topDragGesture.connect('may-recognize', () => (Shell.ActionMode.NORMAL & Main.actionMode) !== 0);
    topDragGesture.connect('end', () => global.display.focus_window?.unmake_fullscreen());

    const updateUnfullscreenGesture = () => {
      topDragGesture.enabled = !!global.display.focus_window?.is_fullscreen();
    };
    global.display.connect('notify::focus-window', updateUnfullscreenGesture);
    global.display.connect('in-fullscreen-changed', updateUnfullscreenGesture);
    updateUnfullscreenGesture();

    global.stage.add_action(topDragGesture);
  }

  private async shareSettingsWithX11(task: Gio.Task): Promise<void> {
    try {
      await Gio.DBus.session.call('com.lantharos.Settings', '/com/lantharos/Settings',
        'com.lantharos.Settings.Xwayland', 'Start',
        new GLib.Variant('(ss)', [GLib.getenv('GNOME_SETUP_DISPLAY')!, GLib.getenv('XAUTHORITY')!]),
        null, Gio.DBusCallFlags.NO_AUTO_START, X11_SETTINGS_TIMEOUT_MS, null);
    } catch (e) {
      log(`X11 apps start without the desktop settings: ${(e as Error).message}`);
    } finally {
      task.return_boolean(true);
    }
  }

  private insertWorkspace(pos: number): void {
    const workspaceManager = global.workspace_manager;
    if (workspaceManager.n_workspaces >= MAX_NUM_WORKSPACES) return;

    workspaceManager.append_new_workspace(false, global.get_current_time());

    for (const actor of global.get_window_actors()) {
      const window = actor.meta_window!;
      if (window.get_transient_for() != null || window.is_override_redirect() || window.on_all_workspaces) continue;
      const index = window.get_workspace().index();
      if (index >= pos) window.change_workspace_by_index(index + 1, true);
    }

    const activeIndex = workspaceManager.get_active_workspace_index();
    if (activeIndex >= pos) workspaceManager.get_workspace_by_index(activeIndex + 1)!.activate(global.get_current_time());
  }

  blockWorkspaceUpdates(): void {
    if (++this.blockCount > 1) return;
    this.workspaceTracker?.blockUpdates();
  }

  unblockWorkspaceUpdates(): void {
    console.assert(this.blockCount > 0, 'Unmatched call to unblockWorkspaceUpdates()');
    if (this.blockCount === 0) return;

    this.blockCount -= 1;
    if (this.blockCount !== 0) return;
    this.workspaceTracker?.unblockUpdates();
  }

  skipNextEffect(actor: Meta.WindowActor): void {
    this.skippedActors.add(actor);
  }

  setCustomKeybindingHandler(name: string, modes: Shell.ActionMode, handler: Meta.KeyHandlerFunc): void {
    if (Meta.keybindings_set_custom_handler(name, handler)) this.allowKeybinding(name, modes);
  }

  addKeybinding(name: string, settings: Gio.Settings, flags: Meta.KeyBindingFlags, modes: Shell.ActionMode, handler: Meta.KeyHandlerFunc): number {
    const action = global.display.add_keybinding(name, settings, flags, handler);
    if (action !== Meta.KeyBindingAction.NONE) this.allowKeybinding(name, modes);
    return action;
  }

  allowKeybinding(name: string, modes: Shell.ActionMode): void {
    this.allowedKeybindings.set(name, modes);
  }

  private animationWindowType(actor: Meta.WindowActor): Meta.WindowType {
    const window = actor.meta_window!;
    const { windowType } = window;

    if (windowType !== Meta.WindowType.NORMAL || window.get_client_type() === Meta.WindowClientType.X11) return windowType;

    return window.get_transient_for() != null ? Meta.WindowType.DIALOG : windowType;
  }

  private shouldAnimate(): boolean {
    return !this.workspaceAnimation.gestureActive;
  }

  private shouldAnimateActor(actor: Meta.WindowActor, types: Meta.WindowType[]): boolean {
    if (this.skippedActors.delete(actor)) return false;
    if (!this.shouldAnimate()) return false;
    if (!actor.get_texture()) return false;
    return types.includes(this.animationWindowType(actor));
  }

  private sizeChangeWindow(actor: Meta.WindowActor, oldFrameRect: Mtk.Rectangle): void {
    const completed = () => this.shellwm.completed_size_change(actor);
    if (!this.shouldAnimateActor(actor, MORPH_TYPES) || !this.morphs.begin(actor, oldFrameRect, completed)) completed();
  }

  morphWindow(window: Meta.Window): void {
    const actor = window.get_compositor_private() as Meta.WindowActor | null;
    if (actor && this.shouldAnimateActor(actor, MORPH_TYPES)) this.morphs.begin(actor, window.get_frame_rect(), () => {});
  }

  private mapWindow(actor: Meta.WindowActor): void {
    const window = actor.meta_window!;
    let windowType = window.get_window_type();
    window.connectObject('notify::window-type', () => {
      const type = window.get_window_type();
      if (type === windowType) return;
      if (type === Meta.WindowType.MODAL_DIALOG || windowType === Meta.WindowType.MODAL_DIALOG) {
        const parent = window.get_transient_for();
        if (parent) this.dimming.check(parent);
      }
      windowType = type;
    }, actor);
    window.connect('unmanaged', () => {
      const parent = window.get_transient_for();
      if (parent) this.dimming.check(parent);
    });

    if (window.is_attached_dialog()) this.dimming.check(window.get_transient_for()!);

    if (!this.shouldAnimateActor(actor, MAP_TYPES)) {
      this.shellwm.completed_map(actor);
      return;
    }

    const dialog = this.animationWindowType(actor) !== Meta.WindowType.NORMAL;
    this.openClose.open(actor, dialog, () => this.shellwm.completed_map(actor));
  }

  private destroyWindow(actor: Meta.WindowActor): void {
    const window = actor.meta_window!;
    window.disconnectObject(actor);

    if (window.is_attached_dialog()) this.dimming.check(window.get_transient_for()!);

    if (!this.shouldAnimateActor(actor, MAP_TYPES)) {
      this.shellwm.completed_destroy(actor);
      return;
    }

    const parent = window.is_attached_dialog() ? window.get_transient_for() : null;
    parent?.connectObject('unmanaged', () => this.openClose.finish(actor), actor);
    this.openClose.close(actor, () => {
      parent?.disconnectObject(actor);
      this.shellwm.completed_destroy(actor);
    });
  }

  private filterKeybinding(binding: Meta.KeyBinding): boolean {
    if (Main.actionMode === Shell.ActionMode.NONE) return true;
    if (Main.actionMode === Shell.ActionMode.NORMAL && binding.is_builtin()) return false;
    return !((this.allowedKeybindings.get(binding.get_name()) ?? 0) & Main.actionMode);
  }

  private switchWorkspace(from: number, to: number): void {
    if (!Main.sessionMode.hasWorkspaces || !this.shouldAnimate() || KestrelUi.taskViewOpen()) {
      this.shellwm.completed_switch_workspace();
      return;
    }

    this.switchInProgress = true;
    this.workspaceAnimation.animateSwitch(from, to, () => {
      this.shellwm.completed_switch_workspace();
      this.switchInProgress = false;
    });
  }

  swipeWorkspaces(event: Clutter.Event): boolean {
    return this.workspaceAnimation.handleScrollEvent(event);
  }

  private switchWorkspaceDone(): void {
    if (!this.switchInProgress) return;

    this.shellwm.completed_switch_workspace();
    this.switchInProgress = false;
  }

  private showTilePreview(window: Meta.Window, tileRect: Mtk.Rectangle, monitorIndex: number): void {
    this.tileRequest = [window, tileRect, monitorIndex];
    if (!this.cornerSnap.active) this.openTilePreview(window, tileRect, monitorIndex);
  }

  private hideTilePreview(): void {
    this.tileRequest = null;
    if (!this.cornerSnap.active) this.tilePreview?.close();
  }

  private openTilePreview(window: Meta.Window, rect: Mtk.Rectangle, monitorIndex: number): void {
    this.tilePreview ??= new TilePreview();
    this.tilePreview.open(window, rect, monitorIndex);
  }

  private showCornerPreview(window: Meta.Window, rect: Mtk.Rectangle | null, monitorIndex: number): void {
    if (rect)
      this.openTilePreview(window, rect, monitorIndex);
    else if (this.tileRequest)
      this.openTilePreview(...this.tileRequest);
    else
      this.tilePreview?.close();
  }

  activateWithSnapGroup(window: Meta.Window): void {
    const time = global.get_current_time();
    for (const member of this.cornerSnap.group(window).reverse()) {
      member.unminimize();
      member.raise();
    }
    window.activate(time);
  }

  snapWindow(window: Meta.Window, rect: Mtk.Rectangle): void {
    this.cornerSnap.snap(window, rect);
  }

  showWindowMenu(window: Meta.Window, rect: Mtk.Rectangle): void {
    this.windowMenuManager.showWindowMenuForWindow(window, Meta.WindowMenuType.WM, rect);
  }

  private startSwitcher(binding: Meta.KeyBinding): void {
    const name = binding.get_name();
    if (name === 'switch-applications' && binding.get_modifiers() & Clutter.ModifierType.SUPER_MASK) {
      KestrelUi.toggleSurface('tasks');
      return;
    }

    let createPopup;
    switch (name) {
    case 'switch-applications':
    case 'switch-applications-backward':
    case 'switch-group':
    case 'switch-group-backward':
    case 'switch-windows':
    case 'switch-windows-backward':
      createPopup = () => new AltTab.WindowSwitcherPopup(name);
      break;
    case 'cycle-windows':
    case 'cycle-windows-backward':
      createPopup = () => new Cycler.WindowCyclerPopup();
      break;
    case 'cycle-group':
    case 'cycle-group-backward':
      createPopup = () => new Cycler.GroupCyclerPopup();
      break;
    case 'switch-monitor':
      createPopup = () => new SwitchMonitor.SwitchMonitorPopup();
      break;
    default:
      return;
    }

    this.workspaceSwitcherPopup?.destroy();

    const tabPopup = createPopup();
    if (!tabPopup.open(binding.is_reversed(), name, binding.get_mask())) tabPopup.destroy();
  }

  private showWorkspaceSwitcher(display: Meta.Display, window: Meta.Window | null, binding: Meta.KeyBinding): void {
    const workspaceManager = display.get_workspace_manager();
    if (!Main.sessionMode.hasWorkspaces || workspaceManager.n_workspaces === 1) return;

    const [action, , , target] = binding.get_name().split('-');
    if (action === 'move' && (window!.is_always_on_all_workspaces() ||
      (Meta.prefs_get_workspaces_only_on_primary() && window!.get_monitor() !== Main.layoutManager.primaryIndex)))
      return;

    const rtl = Clutter.get_default_text_direction() === Clutter.TextDirection.RTL;
    const forward = rtl ? Meta.MotionDirection.LEFT : Meta.MotionDirection.RIGHT;
    const backward = rtl ? Meta.MotionDirection.RIGHT : Meta.MotionDirection.LEFT;
    const activeIndex = workspaceManager.get_active_workspace_index();
    let newWs: Meta.Workspace | null = null;
    let direction: Meta.MotionDirection | undefined;

    if (target === 'last') {
      direction = forward;
      newWs = workspaceManager.get_workspace_by_index(workspaceManager.n_workspaces - 1);
    } else if (isNaN(Number(target))) {
      if (activeIndex === 0 && action === 'move' && target === (rtl ? 'right' : 'left') && !this.isWorkspacePrepended) {
        this.insertWorkspace(0);
        this.isWorkspacePrepended = true;
      }

      direction = NEIGHBOR_DIRECTIONS[target];
      newWs = workspaceManager.get_active_workspace().get_neighbor(direction);
    } else if (Number(target) > 0 && Number(target) <= workspaceManager.n_workspaces) {
      const index = Number(target) - 1;
      newWs = workspaceManager.get_workspace_by_index(index);
      direction = workspaceManager.get_active_workspace_index() > index ? backward : forward;
    }

    if (direction !== Meta.MotionDirection.LEFT && direction !== Meta.MotionDirection.RIGHT) return;

    if (action === 'switch')
      this.actionMoveWorkspace(newWs!);
    else
      this.actionMoveWindow(window!, newWs!);

    if (!this.workspaceSwitcherPopup) {
      this.blockWorkspaceUpdates();
      this.workspaceSwitcherPopup = new WorkspaceSwitcherPopup();
      this.workspaceSwitcherPopup.connect('destroy', () => {
        this.unblockWorkspaceUpdates();
        this.workspaceSwitcherPopup = null;
        this.isWorkspacePrepended = false;
      });
    }
    this.workspaceSwitcherPopup.display(newWs!.index());
  }

  actionMoveWorkspace(workspace: Meta.Workspace): void {
    if (!Main.sessionMode.hasWorkspaces) return;
    if (!workspace.active) workspace.activate(global.get_current_time());
  }

  actionMoveWindow(window: Meta.Window, workspace: Meta.Workspace): void {
    if (!Main.sessionMode.hasWorkspaces || workspace.active) return;

    this.workspaceAnimation.movingWindow = window;
    window.change_workspace(workspace);

    global.display.clear_mouse_mode();
    workspace.activate_with_focus(window, global.get_current_time());
  }

  private showResizePopup(show: boolean, rect: Mtk.Rectangle, width: number, height: number): void {
    if (show) {
      this.resizePopup ??= new ResizePopup();
      this.resizePopup.update(rect, width, height);
      return;
    }

    this.resizePopup?.destroy();
    this.resizePopup = null;
  }
}
