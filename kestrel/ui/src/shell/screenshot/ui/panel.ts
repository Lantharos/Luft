import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import { PILL, styleSurface } from '../../stage/kestrelGlass.js';
import { Tooltip } from './tooltip.js';

function localizeButton(button: St.Button, nameId: string): void {
  KestrelUi.localized(button, () => (button.accessible_name = KestrelUi.t(nameId)));
}

const typeButton = (iconName: string, params: Partial<St.Button.ConstructorProps>) =>
  new St.Button({ style_class: 'screenshot-ui-type-button', icon_name: iconName, ...params });

const shotCastButton = (iconName: string, params: Partial<St.Button.ConstructorProps>) =>
  new St.Button({ style_class: 'screenshot-ui-shot-cast-button', icon_name: iconName, ...params });

export class ScreenshotPanel extends St.BoxLayout {
  static {
    GObject.registerClass(this);
  }

  readonly selectionButton = typeButton('screenshot-ui-area-symbolic', { checked: true });
  readonly screenButton = typeButton('screenshot-ui-display-symbolic', { toggle_mode: true });
  readonly windowButton = typeButton('screenshot-ui-window-symbolic', { toggle_mode: true });
  readonly shotButton = shotCastButton('camera-photo-symbolic', { checked: true });
  readonly castButton = shotCastButton('camera-web-symbolic', { toggle_mode: true, visible: false });

  readonly showPointerButton = new St.Button({
    style_class: 'screenshot-ui-show-pointer-button',
    icon_name: 'screenshot-ui-show-pointer-symbolic',
    toggle_mode: true,
    y_align: Clutter.ActorAlign.CENTER,
  });

  readonly captureButton = new St.Button({
    style_class: 'screenshot-ui-capture-button',
    y_align: Clutter.ActorAlign.CENTER,
    child: new St.Widget({
      style_class: 'screenshot-ui-capture-button-circle',
      x_expand: true,
      y_expand: true,
    }),
  });

  readonly closeButton = new St.Button({
    style_class: 'screenshot-ui-close-button',
    icon_name: 'window-close-symbolic',
    y_align: Clutter.ActorAlign.CENTER,
  });

  constructor(private readonly tooltipParent: Clutter.Actor) {
    super({
      style_class: 'screenshot-ui-panel',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.END,
      y_expand: true,
      offscreen_redirect: Clutter.OffscreenRedirect.AUTOMATIC_FOR_OPACITY,
    });
    styleSurface(this, PILL);

    const typeButtons = new St.BoxLayout({ style_class: 'screenshot-ui-type-button-container' });
    this.add_child(typeButtons);
    for (const [button, textId] of [
      [this.selectionButton, 'screenshot-area'],
      [this.screenButton, 'screenshot-screen'],
      [this.windowButton, 'screenshot-window'],
    ] as const) {
      localizeButton(button, textId);
      typeButtons.add_child(button);
      this.addTooltip(button, textId);
    }

    this.addSeparator();

    const shotCast = new St.BoxLayout({
      style_class: 'screenshot-ui-shot-cast-container',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(shotCast);
    shotCast.add_child(this.shotButton);
    this.addTooltip(this.shotButton, 'screenshot-take');
    shotCast.add_child(this.castButton);
    this.addTooltip(this.castButton, 'screenshot-record');

    this.shotButton.bind_property('checked', this.castButton, 'checked',
      GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.INVERT_BOOLEAN);

    this.add_child(this.showPointerButton);
    this.addTooltip(this.showPointerButton, 'screenshot-show-pointer');

    this.addSeparator();

    this.addTooltip(this.captureButton, 'screenshot-capture');
    this.add_child(this.captureButton);

    localizeButton(this.closeButton, 'screenshot-close');
    this.add_child(this.closeButton);
  }

  private addTooltip(button: St.Button, textId: string): void {
    const tooltip = new Tooltip(button, { style_class: 'screenshot-ui-tooltip', visible: false });
    KestrelUi.bindText(tooltip, textId);
    this.tooltipParent.add_child(tooltip);
  }

  private addSeparator(): void {
    this.add_child(new St.Widget({ style_class: 'screenshot-ui-separator', y_align: Clutter.ActorAlign.CENTER }));
  }
}
