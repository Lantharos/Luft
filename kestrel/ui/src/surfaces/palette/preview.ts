import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import type { SearchItem } from '../search/item.js';

const WIDTH = 248;
const HEIGHT = 168;
const TEXT_LIMIT = 600;

function wrapped(label: St.Label): St.Label {
  label.clutter_text.line_wrap = true;
  label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
  label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
  return label;
}

function fitted(width: number, height: number): [number, number] {
  const scale = Math.min(WIDTH / width, HEIGHT / height, 1);
  return [Math.round(width * scale), Math.round(height * scale)];
}

export class PalettePreview {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-palette-preview', style_class: 'kestrel-palette-preview', orientation: Clutter.Orientation.VERTICAL,
    width: WIDTH, visible: false, y_align: Clutter.ActorAlign.START,
  });
  private readonly picture = new St.Widget({ layout_manager: new Clutter.BinLayout(), style_class: 'kestrel-palette-picture', x_expand: true });
  private readonly heading = wrapped(new St.Label({ style_class: 'kestrel-palette-preview-heading' }));
  private readonly detail = wrapped(new St.Label({ style_class: 'kestrel-palette-preview-detail' }));
  private releaseSource: (() => void) | null = null;

  constructor() {
    for (const child of [this.picture, this.heading, this.detail]) this.actor.add_child(child);
  }

  show(item: SearchItem | null): void {
    this.release();
    const preview = item?.preview;
    this.actor.visible = !!preview;
    if (!item || !preview) return;
    this.picture.destroy_all_children();
    if (preview.kind === 'answer') this.actor.add_style_class_name('kestrel-palette-answer');
    else this.actor.remove_style_class_name('kestrel-palette-answer');
    this.picture.visible = preview.kind !== 'answer' && preview.kind !== 'text';
    this.heading.text = preview.kind === 'text' ? '' : item.title;
    this.heading.visible = !!this.heading.text;
    this.detail.text = preview.kind === 'text' ? preview.text.slice(0, TEXT_LIMIT) : item.description;
    this.detail.visible = !!this.detail.text;
    if (preview.kind === 'window') this.showWindow(preview.window.get_compositor_private() as Clutter.Actor | null);
    if (preview.kind === 'glyph') this.picture.add_child(new St.Label({ text: preview.text, style_class: 'kestrel-palette-glyph', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER }));
    if (preview.kind === 'image') {
      const [width, height] = fitted(preview.thumbnail.width, preview.thumbnail.height);
      this.picture.add_child(new Clutter.Actor({ content: preview.thumbnail.content, width, height, x_align: Clutter.ActorAlign.CENTER }));
    }
  }

  destroy(): void {
    this.release();
  }

  private showWindow(source: Clutter.Actor | null): void {
    if (!source) return;
    const clone = new Clutter.Clone({ source, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
    const resize = () => {
      clone.visible = source.width > 0 && source.height > 0;
      if (clone.visible) clone.set_size(...fitted(source.width, source.height));
    };
    const signals = [
      source.connect('notify::width', resize), source.connect('notify::height', resize),
      source.connect('destroy', () => (this.releaseSource = null)),
    ];
    this.releaseSource = () => signals.forEach(signal => source.disconnect(signal));
    resize();
    this.picture.add_child(clone);
  }

  private release(): void {
    this.releaseSource?.();
    this.releaseSource = null;
  }
}
