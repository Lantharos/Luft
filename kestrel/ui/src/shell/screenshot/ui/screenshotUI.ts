import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as GrabHelper from '../../popups/grabHelper.js';
import * as Layout from '../../stage/layout.js';
import * as Main from '../../main.js';
import { type CursorCapture, captureScreenshot } from '../capture.js';
import type { Geometry } from '../selection/areaCursor.js';
import { UIAreaIndicator } from '../selection/areaIndicator.js';
import { UIAreaSelector } from '../selection/areaSelector.js';
import { UIWindowSelector, type UIWindowSelectorWindow } from '../selection/windowSelector.js';
import { SELECTION_KEYBOARD_INCREMENT, addShortcuts, installKeyBindings } from './keyBindings.js';
import { ScreenshotPanel } from './panel.js';
import { Screencaster } from './screencaster.js';

Gio._promisify(Shell.Screenshot.prototype, 'screenshot_stage_to_content');

export const UIMode = {
  SCREENSHOT: 0,
  SCREENCAST: 1,
  SCREENSHOT_ONLY: 2,
} as const;

type UIMode = typeof UIMode[keyof typeof UIMode];

const FADE = { duration: 200, mode: Clutter.AnimationMode.EASE_OUT_QUAD };

function fadeIn(actor: Clutter.Actor): void {
  actor.show();
  actor.remove_all_transitions();
  actor.ease({ opacity: 255, ...FADE });
}

function fadeOut(actor: Clutter.Actor): void {
  actor.remove_all_transitions();
  actor.ease({ opacity: 0, ...FADE, onComplete: () => actor.hide() });
}

const bindToStage = () => new Clutter.BindConstraint({ source: global.stage, coordinate: Clutter.BindCoordinate.ALL });

async function capture(texture: Cogl.Texture, geometry: Geometry | null, scale: number, cursor: CursorCapture): Promise<Gio.File | null> {
  try {
    return await captureScreenshot(texture, geometry, scale, cursor);
  } catch (e) {
    logError(e as object, 'Error capturing screenshot');
    return null;
  }
}

export namespace ScreenshotUI {
  export interface Signals extends St.Widget.SignalSignatures {
    'screenshot-taken': (file: Gio.File) => void;
    'closed': () => void;
  }
}

export class ScreenshotUI extends St.Widget {
  static [GObject.properties] = {
    'screencast-in-progress': GObject.ParamSpec.boolean('screencast-in-progress', null, null, GObject.ParamFlags.READABLE, false),
  };

  static [GObject.signals] = {
    'screenshot-taken': { param_types: [Gio.File.$gtype] },
    'closed': {},
  };

  static {
    GObject.registerClass(this);
    installKeyBindings(this.get_binding_pool());
  }

  declare connect: GObject.SignalMethods<this, ScreenshotUI.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, ScreenshotUI.Signals>['emit'];

  readonly panel: ScreenshotPanel;
  private readonly screencaster = new Screencaster({
    supportChanged: () => this.syncCastButton(),
    progressChanged: () => this.notify('screencast-in-progress'),
  });

  private readonly stageScreenshotContainer = new St.Widget({ visible: false });
  private readonly stageScreenshot = new St.Widget({ style_class: 'screenshot-ui-screen-screenshot' });
  private readonly cursorActor = new St.Widget({ visible: false });
  private readonly screencastAreaIndicator = new UIAreaIndicator({
    style_class: 'screenshot-ui-screencast-area-indicator',
    visible: false,
  });

  private readonly grabHelper: GrabHelper.GrabHelper;
  private readonly areaSelector = new UIAreaSelector({
    style_class: 'screenshot-ui-area-selector',
    x_expand: true,
    y_expand: true,
    reactive: true,
  });

  private readonly primaryMonitorBin = new St.Widget({ layout_manager: new Clutter.BinLayout() });
  private currentMode: UIMode = UIMode.SCREENSHOT;
  private openingCoroutineInProgress = false;
  private scale = 1;
  private cursorScale = 1;
  private monitorBins: St.Widget[] = [];
  private windowSelectors: UIWindowSelector[] = [];
  private screenSelectors: St.Button[] = [];

  constructor() {
    super({
      name: 'screenshot-ui',
      constraints: bindToStage(),
      layout_manager: new Clutter.BinLayout(),
      opacity: 0,
      visible: false,
      reactive: true,
    });

    this.stageScreenshotContainer.add_constraint(bindToStage());
    Main.layoutManager.screenshotUIGroup.add_child(this.stageScreenshotContainer);

    this.screencastAreaIndicator.add_constraint(bindToStage());
    this.bind_property('screencast-in-progress', this.screencastAreaIndicator, 'visible', GObject.BindingFlags.DEFAULT);
    global.stage.add_child(this.screencastAreaIndicator);
    Shell.util_set_hidden_from_pick(this.screencastAreaIndicator, true);

    Main.layoutManager.screenshotUIGroup.add_child(this);

    this.stageScreenshot.add_constraint(bindToStage());
    this.stageScreenshotContainer.add_child(this.stageScreenshot);
    this.stageScreenshotContainer.add_child(this.cursorActor);

    this.grabHelper = new GrabHelper.GrabHelper(this, { actionMode: Shell.ActionMode.POPUP });

    this.add_child(this.areaSelector);

    this.primaryMonitorBin.add_constraint(new Layout.MonitorConstraint({ primary: true }));
    this.add_child(this.primaryMonitorBin);

    this.panel = new ScreenshotPanel(this);
    this.primaryMonitorBin.add_child(this.panel);
    this.connectPanel();

    this.rebuildMonitorBins();

    Main.layoutManager.connect('monitors-changed', () => {
      this.close(true);
      this.rebuildMonitorBins();
    });

    addShortcuts(this);

    Main.sessionMode.connect('updated', () => this.close(true));
    this.close(true);
  }

  get screencast_in_progress(): boolean {
    return this.screencaster.inProgress;
  }

  async open(mode: UIMode = UIMode.SCREENSHOT): Promise<void> {
    if (this.openingCoroutineInProgress || this.screencaster.inProgress) return;
    if (mode === UIMode.SCREENCAST && !this.screencaster.supported) return;

    this.currentMode = mode;
    this.panel.castButton.checked = mode === UIMode.SCREENCAST;
    this.syncCastButton();

    if (!this.visible) await this.captureStage();

    Main.layoutManager.emit('system-modal-opened');

    const { screenshotUIGroup } = Main.layoutManager;
    screenshotUIGroup.get_parent()!.set_child_above_sibling(screenshotUIGroup, null);

    if (!this.grabHelper.grab({ actor: this, onUngrab: () => this.close() })) {
      this.close(true);
      return;
    }

    this.remove_all_transitions();
    this.visible = true;
    this.ease({
      opacity: 255,
      ...FADE,
      onComplete: () => {
        this.stageScreenshotContainer.get_parent()!.remove_child(this.stageScreenshotContainer);
        this.insert_child_at_index(this.stageScreenshotContainer, 0);
      },
    });
  }

  close(instantly = false): void {
    this.grabHelper.ungrab();

    if (instantly) {
      this.finishClosing();
      return;
    }

    this.remove_all_transitions();
    this.ease({ opacity: 0, ...FADE, onComplete: () => this.finishClosing() });
  }

  stopScreencast(): Promise<void> {
    return this.screencaster.stop();
  }

  toggleScreenRecording(): void {
    if (this.screencaster.inProgress) void this.stopScreencast();
    else this.open(UIMode.SCREENCAST).catch(err => logError(err, 'Error opening the screenshot UI'));
  }

  activate(): void {
    this.onCaptureButtonClicked().catch(logError);
  }

  resetArea(): void {
    this.areaSelector.resetArea();
  }

  moveSelection(direction: St.DirectionType, increment: number): void {
    if (this.panel.selectionButton.checked) this.areaSelector.moveInDirection(direction, increment);
  }

  resizeSelection(direction: St.DirectionType, increment: number): void {
    if (this.panel.selectionButton.checked) this.areaSelector.resizeInDirection(direction, increment);
  }

  moveFocus(direction: St.DirectionType): void {
    if (this.panel.windowButton.checked)
      this.navigate_focus(this.windows().find(win => win.checked) ?? null, direction, false);
    else if (this.panel.screenButton.checked)
      this.navigate_focus(this.screenSelectors.find(selector => selector.checked) ?? null, direction, false);
    else
      this.resizeSelection(direction, SELECTION_KEYBOARD_INCREMENT);
  }

  private connectPanel(): void {
    const { panel } = this;

    for (const signal of ['drag-started', 'drag-ended'] as const) {
      this.areaSelector.connect(signal, () => panel.ease({
        opacity: signal === 'drag-started' ? 100 : 255,
        ...FADE,
      }));
    }

    panel.selectionButton.connect('notify::checked', () => this.onSelectionButtonToggled());
    panel.screenButton.connect('notify::checked', () => this.onScreenButtonToggled());
    panel.windowButton.connect('notify::checked', () => this.onWindowButtonToggled());
    panel.shotButton.connect('notify::checked', () => this.onShotButtonToggled());
    panel.castButton.connect('notify::checked', () => this.onCastButtonToggled());
    panel.captureButton.connect('clicked', () => this.onCaptureButtonClicked().catch(logError));
    panel.closeButton.connect('clicked', () => this.close());

    panel.showPointerButton.connect('notify::checked', () => {
      const state = panel.showPointerButton.checked;
      this.cursorActor.visible = state;
      for (const window of this.windows()) window.setCursorVisible(state);
    });
  }

  private windows(): UIWindowSelectorWindow[] {
    return this.windowSelectors.flatMap(selector => selector.windows());
  }

  private syncCastButton(): void {
    const visible = this.screencaster.supported;
    const reactive = visible && this.currentMode !== UIMode.SCREENSHOT_ONLY && Main.sessionMode.allowScreencast;
    this.panel.castButton.set({ visible, reactive });
  }

  private syncWindowButtonSensitivity(): void {
    this.panel.windowButton.reactive =
      Main.sessionMode.hasWindows && this.windows().length > 0 && !this.panel.castButton.checked;
  }

  private rebuildMonitorBins(): void {
    for (const bin of this.monitorBins) bin.destroy();

    this.monitorBins = [];
    this.windowSelectors = [];
    this.screenSelectors = [];

    for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
      const bin = new St.Widget({ layout_manager: new Clutter.BinLayout() });
      bin.add_constraint(new Layout.MonitorConstraint({ index: i }));
      this.insert_child_below(bin, this.primaryMonitorBin);
      this.monitorBins.push(bin);

      const windowSelector = new UIWindowSelector(i, {
        style_class: 'screenshot-ui-window-selector',
        x_expand: true,
        y_expand: true,
        visible: this.panel.windowButton.checked,
      });
      if (i === Main.layoutManager.primaryIndex) windowSelector.add_style_pseudo_class('primary-monitor');

      bin.add_child(windowSelector);
      this.windowSelectors.push(windowSelector);

      const screenSelector = new St.Button({
        style_class: 'screenshot-ui-screen-selector',
        x_expand: true,
        y_expand: true,
        visible: this.panel.screenButton.checked,
        reactive: true,
        can_focus: true,
        toggle_mode: true,
      });
      screenSelector.connect('key-focus-in', () => {
        this.grab_key_focus();
        screenSelector.checked = true;
      });
      bin.add_child(screenSelector);
      this.screenSelectors.push(screenSelector);

      screenSelector.connect('notify::checked', () => {
        if (screenSelector.checked) this.checkExclusively(screenSelector, this.screenSelectors);
      });
    }

    if (Main.layoutManager.primaryIndex !== -1)
      this.screenSelectors[Main.layoutManager.primaryIndex].checked = true;
  }

  private checkExclusively(checked: St.Button, group: St.Button[]): void {
    checked.toggle_mode = false;

    for (const other of group) {
      if (other === checked) continue;

      other.toggle_mode = true;
      other.checked = false;
    }
  }

  private async captureStage(): Promise<void> {
    for (const selector of this.windowSelectors) selector.capture();

    const windows = this.windows();
    for (const window of windows) {
      window.connect('notify::checked', () => {
        if (window.checked) this.checkExclusively(window, windows);
      });
    }

    this.syncWindowButtonSensitivity();
    if (!this.panel.windowButton.reactive) this.panel.selectionButton.checked = true;

    this.openingCoroutineInProgress = true;
    try {
      const [content, scale, cursorContent, cursorPoint, cursorScale] =
        await new Shell.Screenshot().screenshot_stage_to_content();
      this.stageScreenshot.set_content(content);
      this.scale = scale;

      if (cursorContent !== null) {
        this.cursorActor.set_content(cursorContent);
        this.cursorActor.set_position(cursorPoint!.x, cursorPoint!.y);

        const [, w, h] = cursorContent.get_preferred_size();
        this.cursorActor.set_size(w * cursorScale, h * cursorScale);
        this.cursorScale = cursorScale;

        for (const window of windows) {
          window.addCursorTexture(cursorContent, cursorPoint!, cursorScale);
          window.setCursorVisible(this.panel.showPointerButton.checked);
        }
      }

      this.stageScreenshotContainer.show();
    } catch (e) {
      log(`Error capturing screenshot: ${(e as Error).message}`);
    }
    this.openingCoroutineInProgress = false;
  }

  private finishClosing(): void {
    this.hide();

    this.panel.shotButton.checked = true;

    this.stageScreenshotContainer.get_parent()!.remove_child(this.stageScreenshotContainer);
    Main.layoutManager.screenshotUIGroup.insert_child_at_index(this.stageScreenshotContainer, 0);
    this.stageScreenshotContainer.hide();

    this.stageScreenshot.set_content(null);
    this.cursorActor.set_content(null);

    this.areaSelector.reset();
    for (const selector of this.windowSelectors) selector.reset();

    this.emit('closed');
  }

  private onSelectionButtonToggled(): void {
    const { selectionButton, windowButton, screenButton } = this.panel;
    if (selectionButton.checked) {
      selectionButton.toggle_mode = false;
      windowButton.checked = false;
      screenButton.checked = false;

      this.areaSelector.reactive = true;
      fadeIn(this.areaSelector);
    } else {
      selectionButton.toggle_mode = true;

      this.areaSelector.stopDrag();
      this.set_cursor_type(Clutter.CursorType.INHERIT);

      this.areaSelector.reactive = false;
      fadeOut(this.areaSelector);
    }
  }

  private onScreenButtonToggled(): void {
    const { selectionButton, windowButton, screenButton } = this.panel;
    if (screenButton.checked) {
      screenButton.toggle_mode = false;
      selectionButton.checked = false;
      windowButton.checked = false;

      for (const selector of this.screenSelectors) fadeIn(selector);
    } else {
      screenButton.toggle_mode = true;

      for (const selector of this.screenSelectors) fadeOut(selector);
    }
  }

  private onWindowButtonToggled(): void {
    const { selectionButton, windowButton, screenButton } = this.panel;
    if (windowButton.checked) {
      windowButton.toggle_mode = false;
      selectionButton.checked = false;
      screenButton.checked = false;

      for (const selector of this.windowSelectors) fadeIn(selector);
    } else {
      windowButton.toggle_mode = true;

      for (const selector of this.windowSelectors) fadeOut(selector);
    }
  }

  private onShotButtonToggled(): void {
    const { shotButton } = this.panel;
    if (shotButton.checked) {
      shotButton.toggle_mode = false;
      fadeIn(this.stageScreenshotContainer);
    } else {
      shotButton.toggle_mode = true;
    }
  }

  private onCastButtonToggled(): void {
    const { castButton, captureButton, windowButton, selectionButton } = this.panel;
    if (castButton.checked) {
      castButton.toggle_mode = false;
      captureButton.add_style_pseudo_class('cast');
      fadeOut(this.stageScreenshotContainer);

      if (windowButton.checked) selectionButton.checked = true;
      windowButton.reactive = false;
    } else {
      castButton.toggle_mode = true;
      captureButton.remove_style_pseudo_class('cast');
      this.syncWindowButtonSensitivity();
    }
  }

  private selectedGeometry(): Geometry {
    if (this.panel.selectionButton.checked) return this.areaSelector.getGeometry();

    const monitor = Main.layoutManager.monitors[this.screenSelectors.findIndex(screen => screen.checked)];
    return [monitor.x, monitor.y, monitor.width, monitor.height];
  }

  private async onCaptureButtonClicked(): Promise<void> {
    if (!this.panel.shotButton.checked) {
      this.startScreencast();
      return;
    }

    try {
      await this.saveScreenshot();
    } catch (e) {
      logError(e as object);
    }
    this.close();
  }

  private async saveScreenshot(): Promise<void> {
    const file = this.panel.windowButton.checked ? await this.saveWindow() : await this.saveArea();
    if (file) this.emit('screenshot-taken', file);
  }

  private async saveArea(): Promise<Gio.File | null> {
    const content = this.stageScreenshot.get_content() as Clutter.TextureContent | null;
    if (!content) return null;

    const geometry = this.selectedGeometry().map(value => value * this.scale) as Geometry;
    const cursorContent = this.cursorActor.content as Clutter.TextureContent | null;

    return capture(content.get_texture(), geometry, this.scale, {
      texture: this.cursorActor.visible ? cursorContent?.get_texture() ?? null : null,
      x: this.cursorActor.x * this.scale,
      y: this.cursorActor.y * this.scale,
      scale: this.cursorScale,
    });
  }

  private async saveWindow(): Promise<Gio.File | null> {
    const window = this.windows().find(win => win.checked);
    if (!window) return null;

    const content = window.windowContent;
    if (!content) return null;

    return capture(content.get_texture(), null, window.bufferScale, {
      texture: this.cursorActor.visible ? window.getCursorTexture()?.get_texture() ?? null : null,
      x: window.cursorPoint.x * window.bufferScale,
      y: window.cursorPoint.y * window.bufferScale,
      scale: this.cursorScale,
    });
  }

  private startScreencast(): void {
    if (this.panel.windowButton.checked) return;

    const [x, y, width, height] = this.selectedGeometry();
    const drawCursor = this.cursorActor.visible;

    this.screencastAreaIndicator.setSelectionRect(x, y, width, height);
    this.close(true);

    void this.screencaster.start({ x, y, width, height, drawCursor });
  }
}
