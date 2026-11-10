import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Layout from '../../../../core/stage/layout.js';
import * as Main from '../../../../core/main.js';
import { followInk } from '../../../../shared/ink/inkInput.js';
import type { Geometry } from '../selection/areaCursor.js';
import { UIAreaIndicator } from '../selection/areaIndicator.js';
import { CropFrame } from './cropFrame.js';
import { MarkupCanvas, type Tool, type Undo } from './markupCanvas.js';
import { type Color, MarkupToolbar } from './markupToolbar.js';
import { croppedArea, shotContent, type Shot } from './shot.js';

export interface Finished {
  area: Geometry;
  markup: Cairo.ImageSurface | null;
}

const TOOL_KEYS = new Map<number, Tool>([
  [Clutter.KEY_p, 'pen'],
  [Clutter.KEY_h, 'highlighter'],
  [Clutter.KEY_e, 'eraser'],
  [Clutter.KEY_c, 'crop'],
]);

function monitorAt([x, y, width, height]: Geometry): number {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const index = Main.layoutManager.monitors.findIndex(monitor =>
    centerX >= monitor.x && centerX < monitor.x + monitor.width && centerY >= monitor.y && centerY < monitor.y + monitor.height);
  return index === -1 ? Main.layoutManager.primaryIndex : index;
}

export class MarkupEditor extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  readonly canvas = new MarkupCanvas(undo => this.remember(undo));
  readonly cropFrame = new CropFrame(before => this.remember(() => (this.cropFrame.crop = before)));
  private readonly backdrop = new UIAreaIndicator({ style_class: 'screenshot-ui-markup-backdrop' });
  private readonly frame = new Clutter.Actor();
  private readonly image = new Clutter.Actor();
  private readonly cursor = new Clutter.Actor();
  private readonly toolbarBin = new St.Widget({ layout_manager: new Clutter.BinLayout() });
  private readonly toolbarPlace = new Layout.MonitorConstraint({ primary: true });
  readonly toolbar: MarkupToolbar;
  private readonly history: Undo[] = [];
  private shot: Shot | null = null;

  constructor(private readonly finish: (shot: Shot, finished: Finished) => void, private readonly cancel: () => void) {
    super({ visible: false, reactive: true, can_focus: true });
    this.add_constraint(new Clutter.BindConstraint({ source: global.stage, coordinate: Clutter.BindCoordinate.ALL }));

    this.backdrop.add_constraint(new Clutter.BindConstraint({ source: this, coordinate: Clutter.BindCoordinate.SIZE }));
    this.add_child(this.backdrop);

    this.frame.add_child(this.image);
    this.frame.add_child(this.cursor);
    this.frame.add_child(this.canvas);
    this.frame.add_child(this.cropFrame);
    for (const layer of [this.image, this.canvas, this.cropFrame])
      layer.add_constraint(new Clutter.BindConstraint({ source: this.frame, coordinate: Clutter.BindCoordinate.SIZE }));
    this.add_child(this.frame);
    followInk(this.canvas, this.canvas);

    this.toolbar = new MarkupToolbar(this, {
      tool: tool => this.selectTool(tool),
      color: color => this.paintWith(color),
      undo: () => this.undo(),
      save: () => this.save(),
      close: () => this.cancel(),
    });
    this.toolbarBin.add_constraint(this.toolbarPlace);
    this.toolbarBin.add_child(this.toolbar);
    this.add_child(this.toolbarBin);

    this.connect('key-press-event', (_actor, event: Clutter.Event) => this.onKey(event));
  }

  open(shot: Shot): void {
    this.shot = shot;
    const [x, y, width, height] = shot.placement;
    this.backdrop.setSelectionRect(x, y, width, height);
    this.frame.set_position(x, y);
    this.frame.set_size(width, height);
    this.image.set_content(shotContent(shot));
    this.showCursor(shot);
    this.cropFrame.crop = [0, 0, width, height];
    this.toolbarPlace.index = monitorAt(shot.placement);
    this.selectTool('pen');
    this.show();
    this.grab_key_focus();
  }

  reset(): void {
    this.hide();
    this.shot = null;
    this.history.length = 0;
    this.toolbar.undoButton.reactive = false;
    this.canvas.clear();
    this.image.set_content(null);
    this.cursor.set_content(null);
  }

  undo(): void {
    this.history.pop()?.();
    this.toolbar.undoButton.reactive = this.history.length > 0;
  }

  save(): void {
    const shot = this.shot!;
    const crop = this.cropFrame.crop;
    const area = croppedArea(shot, crop);
    this.finish(shot, { area, markup: this.canvas.empty ? null : this.drawing(crop, area) });
  }

  private selectTool(tool: Tool): void {
    this.canvas.tool = tool;
    this.cropFrame.editing = tool === 'crop';
    this.toolbar.showTool(tool, tool === 'pen' || tool === 'highlighter' ? this.canvas.colors[tool] : null);
  }

  private paintWith(color: Color): void {
    const { tool } = this.canvas;
    if (tool !== 'pen' && tool !== 'highlighter') return;
    this.canvas.colors[tool] = color;
    this.toolbar.showTool(tool, color);
  }

  private remember(undo: Undo): void {
    this.history.push(undo);
    this.toolbar.undoButton.reactive = true;
  }

  private drawing([x, y, width, height]: Geometry, [, , pixelsWide, pixelsHigh]: Geometry): Cairo.ImageSurface {
    const surface = new Cairo.ImageSurface(Cairo.Format.ARGB32, pixelsWide, pixelsHigh);
    const cr = new Cairo.Context(surface);
    cr.scale(pixelsWide / width, pixelsHigh / height);
    cr.translate(-x, -y);
    this.canvas.paintStrokes(cr);
    cr.$dispose();
    return surface;
  }

  private showCursor({ cursor, scale, area }: Shot): void {
    this.cursor.visible = cursor.texture !== null;
    if (!cursor.texture) return;
    const [left, top] = area ?? [0, 0];
    this.cursor.set_content(Clutter.TextureContent.new_from_texture(cursor.texture, null));
    this.cursor.set_position((cursor.x - left) / scale, (cursor.y - top) / scale);
    this.cursor.set_size(cursor.texture.get_width() * cursor.scale, cursor.texture.get_height() * cursor.scale);
  }

  private onKey(event: Clutter.Event): boolean {
    const symbol = event.get_key_symbol();
    const tool = TOOL_KEYS.get(symbol);
    if (symbol === Clutter.KEY_Escape) this.cancel();
    else if (symbol === Clutter.KEY_Return || symbol === Clutter.KEY_KP_Enter) this.save();
    else if ((symbol === Clutter.KEY_z || symbol === Clutter.KEY_Z) && event.has_control_modifier()) this.undo();
    else if (tool && !event.has_control_modifier()) this.selectTool(tool);
    return Clutter.EVENT_STOP;
  }
}
