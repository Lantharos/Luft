import Atspi from 'gi://Atspi';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { SystemBackground } from '../../stage/background.js';
import { FocusCaretTracker } from '../../stage/focusCaretTracker.js';
import * as Main from '../../main.js';

const POINTER_REST_TIME = 1000;
const SCROLL_DURATION = 100;
const TOPLEVEL_ROLES = new Set([Atspi.Role.FRAME, Atspi.Role.DIALOG, Atspi.Role.WINDOW]);

export interface Pointer {
  x: number;
  y: number;
}

interface RoiChange {
  magFactor?: number;
  xCenter?: number;
  yCenter?: number;
  redoCursorTracking?: boolean;
  animate?: boolean;
}

interface Actors {
  magView: St.Bin;
  mainGroup: Clutter.Actor;
  background: SystemBackground;
  uiGroupClone: Clutter.Clone;
}

function focusedExtentsOnScreen(accessible: Atspi.Accessible, extents: Atspi.Rect): Atspi.Rect | null {
  let app: Atspi.Accessible | null = null;
  let parentWindow: Atspi.Accessible | null = null;
  for (let iter: Atspi.Accessible | null = accessible; iter; iter = iter.get_parent()) {
    const role = iter.get_role();
    if (role === Atspi.Role.APPLICATION) {
      app = iter;
      break;
    }
    if (TOPLEVEL_ROLES.has(role)) parentWindow = iter;
  }

  if (app?.get_name() === 'gnome-shell') return extents;

  const windowActive = parentWindow?.get_state_set().contains(Atspi.StateType.ACTIVE) ?? false;
  const accessibleFocused = accessible.get_state_set().contains(Atspi.StateType.FOCUSED);
  if (!windowActive || !accessibleFocused) return null;

  const { focus_window: focusWindow } = global.display;
  if (!focusWindow) return null;

  const windowRect = focusWindow.get_client_content_rect();
  const { scale_factor: scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
  return new Atspi.Rect({
    x: windowRect.x + scaleFactor * extents.x,
    y: windowRect.y + scaleFactor * extents.y,
    width: scaleFactor * extents.width,
    height: scaleFactor * extents.height,
  });
}

export class ZoomRegion {
  private readonly focusCaretTracker = new FocusCaretTracker();
  private actors: Actors | null = null;
  private magFactor = 1;
  private xCenter = global.screen_width / 2;
  private yCenter = global.screen_height / 2;
  private followingCursor = false;
  private xFocus = 0;
  private yFocus = 0;
  private xCaret = 0;
  private yCaret = 0;
  private delayed: Pointer | null = null;
  private scrollContentsTimerId = 0;

  constructor(private readonly cursorRoot: Clutter.Actor, private readonly pointer: Pointer) {
    this.focusCaretTracker.connect('caret-moved', (_tracker, event) => this.updateCaret(event));
    this.focusCaretTracker.connect('focus-changed', (_tracker, event) => this.updateFocus(event));
  }

  isActive(): boolean {
    return this.actors !== null;
  }

  setActive(activate: boolean): void {
    if (activate && !this.actors) this.activate();
    else if (!activate && this.actors) this.deactivate(this.actors);
  }

  private activate(): void {
    const actors = this.createActors();
    this.actors = actors;
    this.syncViewPort(actors);
    Main.layoutManager.connectObject('monitors-changed', () => this.monitorsChanged(actors), this);
    this.focusCaretTracker.registerCaretListener();
    this.focusCaretTracker.registerFocusListener();
  }

  private deactivate(actors: Actors): void {
    Main.uiGroup.set_opacity(255);
    Main.layoutManager.disconnectObject(this);
    actors.mainGroup.remove_child(this.cursorRoot);
    actors.magView.destroy();
    this.actors = null;
    this.focusCaretTracker.deregisterCaretListener();
    this.focusCaretTracker.deregisterFocusListener();
  }

  setMagFactor(magFactor: number): void {
    this.changeROI({ magFactor, redoCursorTracking: this.followingCursor, animate: true });
  }

  scrollToMousePos(): void {
    this.followingCursor = true;
    this.changeROI({ redoCursorTracking: true });

    this.clearScrollContentsTimer();
    this.scrollContentsTimerId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, POINTER_REST_TIME, () => {
      this.followingCursor = false;
      if (this.delayed) {
        this.scrollContentsToDelayed(this.delayed.x, this.delayed.y);
        this.delayed = null;
      }

      this.scrollContentsTimerId = 0;
    });
  }

  scrollContentsTo(x: number, y: number): void {
    if (x < 0 || x > global.screen_width || y < 0 || y > global.screen_height) return;

    this.clearScrollContentsTimer();

    this.followingCursor = false;
    this.changeROI({ xCenter: x, yCenter: y, animate: true });
  }

  private updateFocus(event: Atspi.Event): void {
    const component = event.source.get_component_iface();
    if (!component || event.detail1 !== 1) return;

    let extents: Atspi.Rect | null;
    try {
      extents = focusedExtentsOnScreen(event.source, component.get_extents(Atspi.CoordType.WINDOW));
    } catch (e) {
      log(`Failed to read extents of focused component: ${(e as Error).message}`);
      return;
    }
    if (!extents) return;

    const xFocus = extents.x + extents.width / 2;
    const yFocus = extents.y + extents.height / 2;
    if (this.xFocus === xFocus && this.yFocus === yFocus) return;

    this.xFocus = xFocus;
    this.yFocus = yFocus;
    const [x, y] = this.centerFromPointProportional(xFocus, yFocus);
    this.scrollContentsToDelayed(x, y);
  }

  private updateCaret(event: Atspi.Event): void {
    const text = event.source.get_text_iface();
    if (!text) return;

    let extents: Atspi.Rect | null;
    try {
      extents = focusedExtentsOnScreen(event.source, text.get_character_extents(text.get_caret_offset(), Atspi.CoordType.WINDOW));
    } catch (e) {
      log(`Failed to read extents of text caret: ${(e as Error).message}`);
      return;
    }
    if (!extents || (extents.width === 0 && extents.height === 0)) return;
    if (this.xCaret === extents.x && this.yCaret === extents.y) return;

    this.xCaret = extents.x;
    this.yCaret = extents.y;
    this.scrollContentsToDelayed(extents.x, extents.y);
  }

  private clearScrollContentsTimer(): void {
    if (this.scrollContentsTimerId === 0) return;

    GLib.source_remove(this.scrollContentsTimerId);
    this.scrollContentsTimerId = 0;
  }

  private scrollContentsToDelayed(x: number, y: number): void {
    if (this.followingCursor) this.delayed = { x, y };
    else this.scrollContentsTo(x, y);
  }

  private createActors(): Actors {
    const mainGroup = new Clutter.Actor({ clip_to_allocation: true });

    const magView = new St.Bin({
      style_class: 'magnifier-zoom-region full-screen',
      child: mainGroup,
    });
    global.stage.add_child(magView);
    Shell.util_set_hidden_from_pick(magView, true);

    const background = new SystemBackground();
    mainGroup.add_child(background);

    const uiGroupClone = new Clutter.Clone({
      source: Main.uiGroup,
      clip_to_allocation: true,
    });
    mainGroup.add_child(uiGroupClone);
    mainGroup.add_child(this.cursorRoot);

    return { magView, mainGroup, background, uiGroupClone };
  }

  private syncViewPort(actors: Actors): void {
    actors.magView.set_size(global.screen_width, global.screen_height);
    actors.magView.set_position(0, 0);
    this.changeROI({ redoCursorTracking: this.followingCursor });
    Main.uiGroup.set_opacity(0);
  }

  private changeROI({
    magFactor = this.magFactor,
    xCenter = this.xCenter,
    yCenter = this.yCenter,
    redoCursorTracking = false,
    animate = false,
  }: RoiChange = {}): void {
    this.magFactor = magFactor;

    if (redoCursorTracking) [xCenter, yCenter] = this.centerFromPointProportional(this.pointer.x, this.pointer.y);

    const roiWidth = global.screen_width / magFactor;
    const roiHeight = global.screen_height / magFactor;
    this.xCenter = Math.max(Math.min(xCenter, global.screen_width - roiWidth / 2), roiWidth / 2);
    this.yCenter = Math.max(Math.min(yCenter, global.screen_height - roiHeight / 2), roiHeight / 2);

    this.updateCloneGeometry(animate);
  }

  private centerFromPointProportional(xPoint: number, yPoint: number): [number, number] {
    const width = global.screen_width;
    const height = global.screen_height;
    const unscaledPadding = Math.min(width, height) / 5;
    const padding = unscaledPadding / this.magFactor;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const xProportion = (xPoint - halfWidth) / halfWidth;
    const yProportion = (yPoint - halfHeight) / halfHeight;

    return [
      xPoint - xProportion * (width / this.magFactor / 2 - padding),
      yPoint - yProportion * (height / this.magFactor / 2 - padding),
    ];
  }

  private screenToViewPort(screenX: number, screenY: number): [number, number] {
    return [
      global.screen_width / 2 + (screenX - this.xCenter) * this.magFactor,
      global.screen_height / 2 + (screenY - this.yCenter) * this.magFactor,
    ];
  }

  private mousePosition(): [number, number] {
    const [x, y] = this.screenToViewPort(this.pointer.x, this.pointer.y);
    return [Math.round(x), Math.round(y)];
  }

  private updateCloneGeometry(animate = false): void {
    if (!this.actors) return;

    const duration = animate ? SCROLL_DURATION : 0;
    const [x, y] = this.screenToViewPort(0, 0);
    this.actors.uiGroupClone.ease({
      x: Math.round(x),
      y: Math.round(y),
      scale_x: this.magFactor,
      scale_y: this.magFactor,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration,
    });

    const [mouseX, mouseY] = this.mousePosition();
    const sourceMouseScale = this.cursorRoot.get_resource_scale();
    this.cursorRoot.ease({
      x: mouseX,
      y: mouseY,
      scale_x: this.magFactor / sourceMouseScale,
      scale_y: this.magFactor / sourceMouseScale,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration,
    });
  }

  private monitorsChanged(actors: Actors): void {
    actors.background.set_size(global.screen_width, global.screen_height);
    this.syncViewPort(actors);
  }
}
