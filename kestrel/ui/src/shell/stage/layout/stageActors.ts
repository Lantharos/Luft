import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as Main from '../../main.js';
import type { Monitor } from './monitor.js';

const SPLASH_LOGO_PLACEMENT = '/run/sushi/logo';
const FIRMWARE_LOGO = '/sys/firmware/acpi/bgrt/image';
const SCREEN_TRANSITION_DELAY = 250;
const SCREEN_TRANSITION_DURATION = 500;

export function firmwareLogo(monitor: Monitor): Clutter.Actor | null {
  try {
    const [, placement] = GLib.file_get_contents(SPLASH_LOGO_PLACEMENT);
    const [x, y, width, height] = new TextDecoder().decode(placement).trim().split(' ').map(Number);
    const pixbuf = GdkPixbuf.Pixbuf.new_from_file(FIRMWARE_LOGO);
    const content = St.ImageContent.new_with_preferred_size(pixbuf.width, pixbuf.height) as St.ImageContent;
    content.set_bytes(global.stage.context.get_backend().get_cogl_context(), pixbuf.read_pixel_bytes(),
      pixbuf.has_alpha ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
      pixbuf.width, pixbuf.height, pixbuf.rowstride);
    const scale = monitor.geometry_scale;
    return new Clutter.Actor({
      content,
      x: monitor.x + x / scale,
      y: monitor.y + y / scale,
      width: width / scale,
      height: height / scale,
    });
  } catch {
    return null;
  }
}

export const UiActor = GObject.registerClass(class UiActor extends Clutter.Actor {
  vfunc_get_preferred_width(_forHeight: number): [number, number] {
    const width = global.stage.width;
    return [width, width];
  }

  vfunc_get_preferred_height(_forWidth: number): [number, number] {
    const height = global.stage.height;
    return [height, height];
  }
});

export const ScreenTransition = GObject.registerClass(class ScreenTransition extends Clutter.Actor {
  constructor() {
    super({ visible: false });
  }

  vfunc_hide(): void {
    this.set_content(null);
    super.vfunc_hide();
  }

  run(): void {
    if (this.visible) return;

    Main.uiGroup.set_child_above_sibling(this, null);

    const rect = new Mtk.Rectangle({
      x: 0,
      y: 0,
      width: global.screen_width,
      height: global.screen_height,
    });
    const [, , , scale] = global.stage.get_capture_final_size(rect);
    this.content = global.stage.paint_to_content(rect, scale, null, Clutter.PaintFlag.NO_CURSORS);

    this.opacity = 255;
    this.show();

    this.ease({
      opacity: 0,
      duration: SCREEN_TRANSITION_DURATION,
      delay: SCREEN_TRANSITION_DELAY,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => this.hide(),
    });
  }
});
export type ScreenTransition = InstanceType<typeof ScreenTransition>;
