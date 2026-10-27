import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import { MouseSpriteContent } from './mouseSprite.js';
import { type Pointer, ZoomRegion } from './zoomRegion.js';

const MAGNIFIER_SCHEMA = 'org.gnome.desktop.a11y.magnifier';
const MAG_FACTOR_KEY = 'mag-factor';

export class Magnifier {
  private readonly settings = new Gio.Settings({ schema_id: MAGNIFIER_SCHEMA });
  private readonly cursorTracker = global.backend.get_cursor_tracker();
  private readonly mouseSpriteContent = new MouseSpriteContent();
  private readonly mouseSprite = new Clutter.Actor({ request_mode: Clutter.RequestMode.CONTENT_SIZE, content: this.mouseSpriteContent });
  private readonly cursorRoot = new Clutter.Actor();
  private readonly seat = this.cursorRoot.get_context().get_backend().get_default_seat();
  private readonly pointer: Pointer;
  private readonly zoomRegion: ZoomRegion;
  private pointerPositionId = 0;
  private pointerPositionLaterId = 0;
  private cursorUnfocusInhibited = false;
  private cursorVisibleInhibited = false;

  constructor() {
    this.cursorRoot.add_child(this.mouseSprite);

    const [x, y] = this.pointerPosition();
    this.pointer = { x, y };
    this.zoomRegion = new ZoomRegion(this.cursorRoot, this.pointer);
    this.settings.connect(`changed::${MAG_FACTOR_KEY}`, () => this.zoomRegion.setMagFactor(this.magFactor()));
    this.zoomRegion.setMagFactor(this.magFactor());
    this.zoomRegion.scrollContentsTo(x, y);

    this.updateContentScale();

    St.Settings.get().connect('notify::magnifier-active', () => this.setActive(St.Settings.get().magnifier_active));
    this.setActive(St.Settings.get().magnifier_active);
  }

  private magFactor(): number {
    return parseFloat(this.settings.get_double(MAG_FACTOR_KEY).toFixed(2));
  }

  private updateContentScale(): void {
    const monitor = Main.layoutManager.findMonitorForPoint(this.pointer.x, this.pointer.y);
    this.mouseSpriteContent.monitorScale = monitor ? monitor.geometry_scale : 1;
  }

  private showSystemCursor(): void {
    if (this.cursorUnfocusInhibited) {
      this.seat.uninhibit_unfocus();
      this.cursorUnfocusInhibited = false;
    }

    if (this.cursorVisibleInhibited) {
      this.cursorTracker.uninhibit_cursor_visibility();
      this.cursorVisibleInhibited = false;
    }
  }

  private hideSystemCursor(): void {
    if (!this.cursorUnfocusInhibited) {
      this.seat.inhibit_unfocus();
      this.cursorUnfocusInhibited = true;
    }

    if (!this.cursorVisibleInhibited) {
      this.cursorTracker.inhibit_cursor_visibility();
      this.cursorVisibleInhibited = true;
    }
  }

  private setActive(activate: boolean): void {
    if (activate === this.zoomRegion.isActive()) return;

    this.zoomRegion.setActive(activate);

    if (activate) {
      this.hideSystemCursor();
      this.updateMouseSprite();
      this.cursorTracker.connectObject('cursor-changed', () => this.updateMouseSprite(), this);
      global.compositor.disable_unredirect();
      this.startTrackingMouse();
    } else {
      this.cursorTracker.disconnectObject(this);
      this.mouseSpriteContent.texture = null;
      global.compositor.enable_unredirect();
      this.stopTrackingMouse();
      this.showSystemCursor();
    }
  }

  private startTrackingMouse(): void {
    this.pointerPositionId = this.cursorTracker.connect('position-invalidated', () => this.queuePointerPositionUpdate());
    this.scrollToMousePos();
  }

  private stopTrackingMouse(): void {
    this.cursorTracker.disconnect(this.pointerPositionId);
    this.pointerPositionId = 0;

    if (this.pointerPositionLaterId) {
      global.compositor.get_laters().remove(this.pointerPositionLaterId);
      this.pointerPositionLaterId = 0;
    }
  }

  private pointerPosition(): [number, number] {
    const [coords] = this.cursorTracker.get_pointer();
    return [coords!.x, coords!.y];
  }

  private queuePointerPositionUpdate(): void {
    if (this.pointerPositionLaterId) return;

    this.pointerPositionLaterId = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.pointerPositionLaterId = 0;
      this.scrollToMousePos();
      return GLib.SOURCE_REMOVE;
    });
  }

  private scrollToMousePos(): void {
    const [x, y] = this.pointerPosition();
    if (x === this.pointer.x && y === this.pointer.y) return;

    this.pointer.x = x;
    this.pointer.y = y;

    this.updateContentScale();
    this.zoomRegion.scrollToMousePos();
  }

  private updateMouseSprite(): void {
    const sprite = this.cursorTracker.get_sprite();
    if (sprite) {
      this.mouseSpriteContent.texture = sprite;
      this.mouseSprite.show();
    } else {
      this.mouseSprite.hide();
    }

    const [xHot, yHot] = this.cursorTracker.get_hot();
    this.mouseSprite.set({ translation_x: -xHot, translation_y: -yHot });
  }
}
