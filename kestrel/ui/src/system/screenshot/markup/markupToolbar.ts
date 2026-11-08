import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import { PILL, styleSurface } from '../../../appearance/kestrelGlass.js';
import { Tooltip } from '../ui/tooltip.js';
import type { Tool } from './markupCanvas.js';

export type Color = [number, number, number];

export const SWATCHES: Color[] = [
  [0.9, 0.18, 0.2],
  [1, 0.84, 0.04],
  [0.2, 0.75, 0.35],
  [0.24, 0.48, 0.98],
  [0.1, 0.1, 0.12],
  [1, 1, 1],
];

const TOOLS: [Tool, string, string][] = [
  ['pen', 'screenshot-ui-pen-symbolic', 'screenshot-markup-pen'],
  ['highlighter', 'screenshot-ui-highlighter-symbolic', 'screenshot-markup-highlighter'],
  ['eraser', 'screenshot-ui-eraser-symbolic', 'screenshot-markup-eraser'],
  ['crop', 'screenshot-ui-crop-symbolic', 'screenshot-markup-crop'],
];

const css = ([r, g, b]: Color) => `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;

export interface ToolbarActions {
  tool(tool: Tool): void;
  color(color: Color): void;
  undo(): void;
  save(): void;
  close(): void;
}

export class MarkupToolbar extends St.BoxLayout {
  static {
    GObject.registerClass(this);
  }

  readonly undoButton = new St.Button({
    style_class: 'screenshot-ui-markup-button', icon_name: 'edit-undo-symbolic', y_align: Clutter.ActorAlign.CENTER, reactive: false,
  });

  private readonly toolButtons = new Map<Tool, St.Button>();
  private readonly swatches: St.Button[] = [];

  constructor(private readonly tooltipParent: Clutter.Actor, actions: ToolbarActions) {
    super({
      style_class: 'screenshot-ui-panel screenshot-ui-markup-toolbar',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.END,
      y_expand: true,
      offscreen_redirect: Clutter.OffscreenRedirect.AUTOMATIC_FOR_OPACITY,
    });
    styleSurface(this, PILL);

    const tools = new St.BoxLayout({ style_class: 'screenshot-ui-type-button-container' });
    this.add_child(tools);
    for (const [tool, icon, label] of TOOLS) {
      const button = new St.Button({ style_class: 'screenshot-ui-type-button', icon_name: icon, toggle_mode: true, can_focus: true });
      button.connect('clicked', () => actions.tool(tool));
      this.label(button, label);
      tools.add_child(button);
      this.toolButtons.set(tool, button);
    }

    this.addSeparator();

    const palette = new St.BoxLayout({ style_class: 'screenshot-ui-markup-swatches', y_align: Clutter.ActorAlign.CENTER });
    this.add_child(palette);
    for (const color of SWATCHES) {
      const swatch = new St.Button({ style_class: 'screenshot-ui-markup-swatch', toggle_mode: true, can_focus: true });
      swatch.set_child(new St.Widget({ style_class: 'screenshot-ui-markup-swatch-color', style: `background-color: ${css(color)};` }));
      swatch.connect('clicked', () => actions.color(color));
      palette.add_child(swatch);
      this.swatches.push(swatch);
    }

    this.addSeparator();

    this.undoButton.connect('clicked', () => actions.undo());
    this.label(this.undoButton, 'screenshot-markup-undo');
    this.add_child(this.undoButton);

    const save = new St.Button({ style_class: 'screenshot-ui-markup-save', icon_name: 'object-select-symbolic', y_align: Clutter.ActorAlign.CENTER, can_focus: true });
    save.connect('clicked', () => actions.save());
    this.label(save, 'screenshot-markup-save');
    this.add_child(save);

    const close = new St.Button({ style_class: 'screenshot-ui-close-button', icon_name: 'window-close-symbolic', y_align: Clutter.ActorAlign.CENTER, can_focus: true });
    close.connect('clicked', () => actions.close());
    KestrelUi.localized(close, () => (close.accessible_name = KestrelUi.t('screenshot-close')));
    this.add_child(close);
  }

  showTool(tool: Tool, color: Color | null): void {
    for (const [name, button] of this.toolButtons) button.checked = name === tool;
    for (const [i, swatch] of this.swatches.entries()) {
      swatch.reactive = color !== null;
      swatch.opacity = color ? 255 : 110;
      swatch.checked = !!color && SWATCHES[i].every((value, channel) => value === color[channel]);
    }
  }

  private label(button: St.Button, textId: string): void {
    KestrelUi.localized(button, () => (button.accessible_name = KestrelUi.t(textId)));
    const tooltip = new Tooltip(button, { style_class: 'screenshot-ui-tooltip', visible: false });
    KestrelUi.bindText(tooltip, textId);
    this.tooltipParent.add_child(tooltip);
  }

  private addSeparator(): void {
    this.add_child(new St.Widget({ style_class: 'screenshot-ui-separator', y_align: Clutter.ActorAlign.CENTER }));
  }
}
