import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import * as Util from '../../../core/runtime/util.js';

export const URLHighlighter = GObject.registerClass(
class URLHighlighter extends St.Label {
  private linkColor = '#ccccff';
  private markupText = '';
  private urls: Util.UrlMatch[] = [];
  private cursorChanged = false;
  private readonly clickGesture = new Clutter.ClickGesture();

  constructor(text: string, lineWrap: boolean, allowMarkup: boolean) {
    super({
      reactive: true,
      style_class: 'url-highlighter',
      x_expand: true,
      x_align: Clutter.ActorAlign.START,
    });
    this.connect('style-changed', () => {
      const [hasColor, color] = this.get_theme_node().lookup_color('link-color', false);
      if (!hasColor) return;
      const linkColor = color.to_string().substring(0, 7);
      if (linkColor === this.linkColor) return;
      this.linkColor = linkColor;
      this.highlightUrls();
    });
    this.clutter_text.line_wrap = lineWrap;
    this.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;

    this.setMarkup(text, allowMarkup);

    this.clickGesture.connectObject(
      'recognize', () => this.onClick(),
      'may-recognize', () => this.findUrlAtGesture() !== -1,
      this);
    this.add_action(this.clickGesture);

    const motionController = new Clutter.MotionController();
    motionController.connect('leave', () => this.onLeave());
    motionController.connect('motion', (_controller, _sprite, x, y) => this.onMotion(x, y));
    this.add_action(motionController);
  }

  private findUrlAtGesture(): number {
    const { x, y } = this.clickGesture.get_coords_abs();
    return this.findUrlAtPos(x, y);
  }

  private onClick(): void {
    const urlId = this.findUrlAtGesture();
    if (urlId === -1) return;

    let url = this.urls[urlId].url;
    if (!url.includes(':'))
      url = `http://${url}`;

    Gio.app_info_launch_default_for_uri(url, global.create_app_launch_context(0, -1));
  }

  private onMotion(x: number, y: number): void {
    if (!this.visible || this.get_paint_opacity() === 0) return;

    const urlId = this.findUrlAtPos(x, y);
    if (urlId !== -1 && !this.cursorChanged) {
      this.set_cursor_type(Clutter.CursorType.POINTER);
      this.cursorChanged = true;
    } else if (urlId === -1) {
      this.set_cursor_type(Clutter.CursorType.DEFAULT);
      this.cursorChanged = false;
    }
  }

  private onLeave(): void {
    if (!this.visible || this.get_paint_opacity() === 0) return;
    if (!this.cursorChanged) return;
    this.cursorChanged = false;
    this.set_cursor_type(Clutter.CursorType.DEFAULT);
  }

  setMarkup(text: string, allowMarkup: boolean): void {
    this.markupText = text ? Util.fixMarkup(text, allowMarkup) : '';

    this.clutter_text.set_markup(this.markupText);
    this.urls = Util.findUrls(this.clutter_text.text);
    this.highlightUrls();
  }

  private highlightUrls(): void {
    const urls = Util.findUrls(this.markupText);
    let markup = '';
    let pos = 0;
    for (const url of urls) {
      const str = this.markupText.substring(pos, url.pos);
      markup += `${str}<span foreground="${this.linkColor}"><u>${url.url}</u></span>`;
      pos = url.pos + url.url.length;
    }
    markup += this.markupText.substring(pos);
    this.clutter_text.set_markup(markup);
  }

  private findUrlAtPos(stageX: number, stageY: number): number {
    const [, x, y] = this.transform_stage_point(stageX, stageY);
    let findPos = -1;
    for (let i = 0; i < this.clutter_text.text.length; i++) {
      const [, px, py, lineHeight] = this.clutter_text.position_to_coords(i);
      if (py > y || py + lineHeight < y || x < px)
        continue;
      findPos = i;
    }
    if (findPos === -1) return -1;
    return this.urls.findIndex(url => findPos >= url.pos && url.pos + url.url.length > findPos);
  }
});
export type URLHighlighter = InstanceType<typeof URLHighlighter>;
