import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Graphene from 'gi://Graphene';
import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as Main from '../../../core/main.js';
import { WindowGridLayout } from './windowLayout.js';

class UIWindowSelectorWindowContent extends Clutter.Actor {
  static {
    GObject.registerClass(this);
  }

  readonly boundingBox: Mtk.Rectangle;
  readonly bufferScale: number;
  private readonly bufferRect: Mtk.Rectangle;
  private readonly windowActor = new Clutter.Actor();
  private readonly border: St.Bin;
  private readonly shouldShowCursor: boolean;
  private borderSize = 0;
  private cursor: St.Widget | null = null;
  private cursorPosition = { x: 0, y: 0 };
  private cursorScale = 1;

  constructor(actor: Meta.WindowActor) {
    super({ x_expand: true, y_expand: true });

    const window = actor.metaWindow!;
    this.boundingBox = window.get_frame_rect();
    this.bufferRect = window.get_buffer_rect();
    this.bufferScale = actor.get_resource_scale();
    this.windowActor.set_content(actor.paint_to_content(null));
    this.add_child(this.windowActor);

    this.border = new St.Bin({
      style_class: 'screenshot-ui-window-selector-window-border',
      child: new St.Icon({
        icon_name: 'object-select-symbolic',
        style_class: 'screenshot-ui-window-selector-check',
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
      }),
    });
    this.border.connect('style-changed', () => {
      this.borderSize = this.border.get_theme_node().get_border_width(St.Side.TOP);
    });
    this.add_child(this.border);

    this.shouldShowCursor = window.has_pointer();
  }

  get cursorPoint(): { x: number; y: number } {
    return {
      x: this.cursorPosition.x + this.boundingBox.x - this.bufferRect.x,
      y: this.cursorPosition.y + this.boundingBox.y - this.bufferRect.y,
    };
  }

  get windowContent(): Clutter.TextureContent | null {
    return this.windowActor.content as Clutter.TextureContent | null;
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    this.set_allocation(box);

    const borderBox = box.copy();
    borderBox.set_origin(0, 0);
    borderBox.x1 -= this.borderSize;
    borderBox.y1 -= this.borderSize;
    borderBox.x2 += this.borderSize;
    borderBox.y2 += this.borderSize;
    this.border.allocate(borderBox);

    const xScale = box.get_width() / this.boundingBox.width;
    const yScale = box.get_height() / this.boundingBox.height;

    const [, windowW, windowH] = this.windowActor.content.get_preferred_size();

    const actorBox = new Clutter.ActorBox();
    actorBox.set_origin(
      (this.bufferRect.x - this.boundingBox.x) * xScale,
      (this.bufferRect.y - this.boundingBox.y) * yScale);
    actorBox.set_size(
      windowW * xScale / this.bufferScale,
      windowH * yScale / this.bufferScale);
    this.windowActor.allocate(actorBox);

    if (!this.cursor) return;

    const [, , w, h] = this.cursor.get_preferred_size();
    this.cursor.allocate(new Clutter.ActorBox({
      x1: this.cursorPosition.x * xScale,
      y1: this.cursorPosition.y * yScale,
      x2: (this.cursorPosition.x + w * this.cursorScale) * xScale,
      y2: (this.cursorPosition.y + h * this.cursorScale) * yScale,
    }));
  }

  addCursorTexture(content: Clutter.Content, point: Graphene.Point, scale: number): void {
    if (!this.shouldShowCursor) return;

    this.cursor = new St.Widget({ content, request_mode: Clutter.RequestMode.CONTENT_SIZE });
    this.cursorPosition = { x: point.x - this.boundingBox.x, y: point.y - this.boundingBox.y };
    this.cursorScale = scale;

    this.insert_child_below(this.cursor, this.border);
  }

  getCursorTexture(): Clutter.TextureContent | undefined {
    return this.cursor?.content as Clutter.TextureContent | undefined;
  }

  setCursorVisible(visible: boolean): void {
    if (this.cursor) this.cursor.visible = visible;
  }
}

export class UIWindowSelectorWindow extends St.Button {
  static {
    GObject.registerClass(this);
  }

  constructor(actor: Meta.WindowActor, params: Partial<St.Button.ConstructorProps>) {
    super({ child: new UIWindowSelectorWindowContent(actor), ...params });
  }

  private get preview(): UIWindowSelectorWindowContent {
    return this.child as UIWindowSelectorWindowContent;
  }

  get boundingBox(): Mtk.Rectangle {
    return this.preview.boundingBox;
  }

  get windowCenter(): { x: number; y: number } {
    const { boundingBox } = this;
    return { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };
  }

  get cursorPoint(): { x: number; y: number } {
    return this.preview.cursorPoint;
  }

  get bufferScale(): number {
    return this.preview.bufferScale;
  }

  get windowContent(): Clutter.TextureContent | null {
    return this.preview.windowContent;
  }

  addCursorTexture(content: Clutter.Content, point: Graphene.Point, scale: number): void {
    this.preview.addCursorTexture(content, point, scale);
  }

  getCursorTexture(): Clutter.TextureContent | undefined {
    return this.preview.getCursorTexture();
  }

  setCursorVisible(visible: boolean): void {
    this.preview.setCursorVisible(visible);
  }
}

export class UIWindowSelector extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private readonly gridLayout: WindowGridLayout<UIWindowSelectorWindow>;

  constructor(private readonly monitorIndex: number, params: Partial<St.Widget.ConstructorProps>) {
    super(params);
    this.layout_manager = new Clutter.BinLayout();

    this.gridLayout = new WindowGridLayout<UIWindowSelectorWindow>(monitorIndex);

    const container = new St.Widget({
      style_class: 'screenshot-ui-window-selector-window-container',
      x_expand: true,
      y_expand: true,
    });
    container.layout_manager = this.gridLayout;
    this.add_child(container);
  }

  capture(): void {
    for (const actor of global.get_window_actors()) {
      const window = actor.metaWindow!;
      const activeWorkspace = global.workspace_manager.get_active_workspace();
      if (window.is_override_redirect() ||
        window.get_window_type() === Meta.WindowType.DESKTOP ||
        !window.located_on_workspace(activeWorkspace) ||
        window.get_monitor() !== this.monitorIndex)
        continue;

      const widget = new UIWindowSelectorWindow(actor, {
        style_class: 'screenshot-ui-window-selector-window',
        reactive: true,
        can_focus: true,
        toggle_mode: true,
      });

      widget.connect('key-focus-in', () => {
        Main.screenshotUI.grab_key_focus();
        widget.checked = true;
      });

      if (window.has_focus()) {
        widget.checked = true;
        widget.toggle_mode = false;
      }

      this.gridLayout.addWindow(widget);
    }
  }

  reset(): void {
    this.gridLayout.reset();
  }

  windows(): UIWindowSelectorWindow[] {
    return this.gridLayout.windows;
  }
}
