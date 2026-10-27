import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as GrabHelper from '../../popups/grabHelper.js';
import * as Main from '../../main.js';
import { RecolorEffect } from './recolorEffect.js';

Gio._promisify(Shell.Screenshot.prototype, 'pick_color');

export class PickPixel extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private readonly grabHelper: GrabHelper.GrabHelper;
  private readonly recolorEffect = new RecolorEffect({
    chroma: new Cogl.Color({ red: 80, green: 219, blue: 181 }),
    threshold: 0.04,
    smoothing: 0.07,
  });

  private readonly previewCursor = new St.Icon({
    icon_name: 'color-pick',
    icon_size: Meta.prefs_get_cursor_size(),
    effect: this.recolorEffect,
    visible: false,
  });

  private result: Cogl.Color | null = null;
  private color: Cogl.Color | null = null;
  private inPick = false;

  constructor(private readonly screenshot: Shell.Screenshot) {
    super({ visible: false, reactive: true });

    Main.uiGroup.add_child(this);

    this.grabHelper = new GrabHelper.GrabHelper(this);

    this.add_constraint(new Clutter.BindConstraint({
      source: global.stage,
      coordinate: Clutter.BindCoordinate.ALL,
    }));

    const clickGesture = new Clutter.ClickGesture();
    clickGesture.connect('recognize', async () => {
      const { x, y } = clickGesture.get_coords_abs();

      await this.pickColor(x, y);
      this.result = this.color;
      this.grabHelper.ungrab();
    });
    this.add_action(clickGesture);

    const motionController = new Clutter.MotionController();
    motionController.connect('motion', (_controller, _sprite, x, y) => void this.pickColor(x, y));
    this.add_action(motionController);

    Main.uiGroup.add_child(this.previewCursor);

    this.set_cursor_type(Clutter.CursorType.NONE);
  }

  async pickAsync(): Promise<Cogl.Color | null> {
    Main.uiGroup.set_child_above_sibling(this, null);
    this.show();

    const [x, y] = global.get_pointer();
    void this.pickColor(x, y);

    try {
      await this.grabHelper.grabAsync({ actor: this });
    } finally {
      this.previewCursor.destroy();
      GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.destroy());
    }

    return this.result;
  }

  private async pickColor(x: number, y: number): Promise<void> {
    if (this.inPick) return;

    this.inPick = true;
    this.previewCursor.set_position(x, y);
    try {
      [this.color] = await (this.screenshot.pick_color(x, y) as unknown as Promise<[Cogl.Color]>);
    } catch (e) {
      logError(e as object, 'Error picking a color');
      return;
    } finally {
      this.inPick = false;
    }

    this.recolorEffect.color = this.color;
    this.previewCursor.show();
  }
}
