import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import * as GrabHelper from '../../popups/grabHelper.js';
import * as Main from '../../main.js';

export class SelectArea extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private readonly grabHelper: GrabHelper.GrabHelper;
  private readonly rubberband = new St.Widget({ style_class: 'select-area-rubberband', visible: false });
  private readonly panGesture = new Clutter.PanGesture();
  private startX = -1;
  private startY = -1;
  private lastX = 0;
  private lastY = 0;
  private result: Mtk.Rectangle | null = null;

  constructor() {
    super({ visible: false, reactive: true, x: 0, y: 0 });
    Main.uiGroup.add_child(this);

    this.grabHelper = new GrabHelper.GrabHelper(this);

    this.add_constraint(new Clutter.BindConstraint({
      source: global.stage,
      coordinate: Clutter.BindCoordinate.ALL,
    }));

    this.add_child(this.rubberband);

    this.panGesture.set_begin_threshold(0);
    this.panGesture.connect('recognize', () => this.onPanBegin());
    this.panGesture.connect('pan-update', () => this.onPanUpdate());
    this.panGesture.connect('end', () => this.onPanEnd());
    this.add_action(this.panGesture);

    this.set_cursor_type(Clutter.CursorType.CROSSHAIR);
  }

  async selectAsync(): Promise<Mtk.Rectangle | null> {
    Main.uiGroup.set_child_above_sibling(this, null);
    this.show();

    try {
      await this.grabHelper.grabAsync({ actor: this });
    } finally {
      GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.destroy());
    }

    return this.result;
  }

  private getGeometry(): Mtk.Rectangle {
    return new Mtk.Rectangle({
      x: Math.min(this.startX, this.lastX),
      y: Math.min(this.startY, this.lastY),
      width: Math.abs(this.startX - this.lastX) + 1,
      height: Math.abs(this.startY - this.lastY) + 1,
    });
  }

  private onPanUpdate(): void {
    if (this.result) return;

    const coords = this.panGesture.get_centroid_abs();
    this.lastX = Math.floor(coords.x);
    this.lastY = Math.floor(coords.y);
    const geometry = this.getGeometry();

    this.rubberband.set_position(geometry.x, geometry.y);
    this.rubberband.set_size(geometry.width, geometry.height);
    this.rubberband.show();
  }

  private onPanBegin(): void {
    if (this.result) return;

    const coords = this.panGesture.get_centroid_abs();
    this.startX = Math.floor(coords.x);
    this.startY = Math.floor(coords.y);
    this.rubberband.set_position(this.startX, this.startY);
  }

  private onPanEnd(): void {
    if (this.result) return;

    this.result = this.getGeometry();
    this.ease({
      opacity: 0,
      duration: 200,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.grabHelper.ungrab(),
    });
  }
}
