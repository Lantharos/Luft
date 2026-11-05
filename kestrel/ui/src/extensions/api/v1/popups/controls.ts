import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { BarLevel } from '../../../../shared/widgets/barLevel.js';
import { Slider } from '../../../../shared/widgets/slider.js';
import { animateActor } from '../../../../shared/motion/motion.js';
import { resolveIcon } from '../icons.js';
import { artwork } from '../media/artwork.js';
import type { ButtonView, EntryView, IconView, ImageView, ItemView, ProgressView, SliderView, SwitchView, TextView, View } from '../types.js';

/** A control on screen for one node of a view, which takes later versions of the same kind of node in place. */
export interface Control<Node extends View = View> {
  readonly actor: Clutter.Actor;
  update(node: Node): void;
}

/** What controls need from the pop-up they're in. */
export interface ControlHost {
  readonly folders: readonly string[];
  readonly extensionPath: string;
  /** Runs an extension callback as something the person did. */
  act(run: () => void): void;
}

export function imageFile(host: ControlHost, path: string): Gio.File {
  const file = Gio.File.new_for_path(GLib.path_is_absolute(path) ? path : GLib.build_filenamev([host.extensionPath, path]));
  if (!host.folders.some(folder => file.has_prefix(Gio.File.new_for_path(folder))) && !artwork.holds(file.get_path()!))
    throw new Error(`${path} is outside the extension's folders`);
  return file;
}

const MARQUEE_PAUSE_MS = 1200;
const MARQUEE_PIXELS_PER_S = 36;

/** Lays out one child no wider than `widest`: cut to it, or at its full width for sliding along, and remembers by how much it's too wide. */
const WidestLayout = GObject.registerClass(class WidestLayout extends Clutter.BinLayout {
  widest = 0;
  sliding = false;
  overflow = 0;

  vfunc_get_preferred_width(container: Clutter.Actor, forHeight: number): [number, number] {
    const [minimum, natural] = super.vfunc_get_preferred_width(container, forHeight);
    return this.widest ? [Math.min(minimum, this.widest), Math.min(natural, this.widest)] : [minimum, natural];
  }

  vfunc_allocate(container: Clutter.Actor, box: Clutter.ActorBox): void {
    const child = container.get_first_child();
    if (!child) return;
    const [, natural] = child.get_preferred_width(box.get_height());
    const width = box.get_width();
    this.overflow = Math.max(0, natural - width);
    const shown = this.sliding ? natural : Math.min(natural, width);
    const top = box.y1 + (box.get_height() - child.get_preferred_height(shown)[1]) / 2;
    child.allocate(Clutter.ActorBox.new(box.x1, top, box.x1 + shown, top + child.get_preferred_height(shown)[1]));
  }
});

/** Text that fits its width: cut short with an ellipsis, or sliding along once to show the rest. */
function fittedText(label: St.Label): { actor: St.Widget; fit(maxWidth: number | undefined, marquee: boolean): void; slide(): void } {
  const layout = new WidestLayout();
  const clip = new St.Widget({ layout_manager: layout, clip_to_allocation: true, reactive: true, track_hover: true, y_align: Clutter.ActorAlign.CENTER });
  clip.add_child(label);
  let waiting = 0;
  const startSliding = () => {
    waiting = 0;
    const overflow = layout.overflow;
    if (!layout.sliding || overflow <= 0) return GLib.SOURCE_REMOVE;
    animateActor(label, {
      translation_x: -overflow, duration: Math.round(overflow / MARQUEE_PIXELS_PER_S * 1000), mode: Clutter.AnimationMode.EASE_IN_OUT_SINE,
      onComplete: () => animateActor(label, { translation_x: 0, duration: 400, delay: MARQUEE_PAUSE_MS, mode: Clutter.AnimationMode.EASE_OUT_QUAD }),
    });
    return GLib.SOURCE_REMOVE;
  };
  const slide = () => {
    label.remove_transition('translation-x');
    label.translation_x = 0;
    if (waiting) GLib.source_remove(waiting);
    waiting = GLib.timeout_add(GLib.PRIORITY_DEFAULT, MARQUEE_PAUSE_MS, startSliding);
  };
  clip.connect('destroy', () => {
    if (waiting) GLib.source_remove(waiting);
  });
  clip.connect('notify::hover', () => {
    if (clip.hover) slide();
  });
  return {
    actor: clip,
    fit: (maxWidth, marquee) => {
      layout.widest = maxWidth ?? 0;
      layout.sliding = !!maxWidth && marquee;
      label.clutter_text.ellipsize = maxWidth && !marquee ? Pango.EllipsizeMode.END : Pango.EllipsizeMode.NONE;
      layout.layout_changed();
    },
    slide,
  };
}

export function textControl(node: TextView): Control<TextView> {
  const label = new St.Label({ y_align: Clutter.ActorAlign.CENTER, x_align: Clutter.ActorAlign.START });
  const fitted = fittedText(label);
  let shown = '';
  const update = (next: TextView) => {
    const changed = next.text !== shown;
    shown = next.text;
    label.text = next.text;
    label.style_class = `kestrel-extension-text kestrel-extension-text-${next.style ?? 'body'}`;
    label.clutter_text.line_wrap = !next.maxWidth;
    fitted.fit(next.maxWidth, !!next.marquee);
    if (changed) fitted.slide();
  };
  update(node);
  return { actor: fitted.actor, update };
}

export function iconControl(node: IconView, host: ControlHost): Control<IconView> {
  const icon = new St.Icon({ y_align: Clutter.ActorAlign.CENTER });
  const update = (next: IconView) => {
    icon.gicon = resolveIcon(host.extensionPath, next.icon);
    icon.icon_size = next.size ?? 16;
  };
  update(node);
  return { actor: icon, update };
}

const RING_WIDTH = 2;

function ring(area: St.DrawingArea, value: () => number): void {
  area.connect('repaint', () => {
    const cr = area.get_context();
    const [width, height] = area.get_surface_size();
    const color = area.get_theme_node().get_foreground_color();
    const radius = Math.min(width, height) / 2 - RING_WIDTH / 2;
    cr.setLineWidth(RING_WIDTH);
    cr.setSourceRGBA(color.red / 255, color.green / 255, color.blue / 255, 0.22);
    cr.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    cr.stroke();
    cr.setSourceRGBA(color.red / 255, color.green / 255, color.blue / 255, 0.9);
    cr.arc(width / 2, height / 2, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * value());
    cr.stroke();
    cr.$dispose();
  });
}

export function imageControl(node: ImageView, host: ControlHost): Control<ImageView> {
  const holder = new St.Widget({ layout_manager: new Clutter.BinLayout(), y_align: Clutter.ActorAlign.CENTER });
  const picture = new St.Widget({ x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
  const progress = new St.DrawingArea({ style_class: 'kestrel-extension-ring', x_expand: true, y_expand: true, visible: false });
  holder.add_child(picture);
  holder.add_child(progress);
  let value = 0;
  ring(progress, () => value);
  const update = (next: ImageView) => {
    const ringed = next.progress !== undefined;
    const inset = ringed ? (RING_WIDTH + 2) * 2 : 0;
    holder.set_size(next.width, next.height);
    picture.set_size(next.width - inset, next.height - inset);
    const uri = imageFile(host, next.path).get_uri();
    const radius = Math.max(0, ringed ? (next.width - inset) / 2 : next.radius ?? 0);
    picture.style = `background-image: url("${uri}"); background-size: cover; border-radius: ${radius}px;`;
    progress.visible = ringed;
    const target = Math.min(1, Math.max(0, next.progress ?? 0));
    if (ringed && Math.abs(target - value) > 1e-3) {
      value = target;
      progress.queue_repaint();
    }
  };
  update(node);
  return { actor: holder, update };
}

export function buttonControl(node: ButtonView, host: ControlHost): Control<ButtonView> {
  const box = new St.BoxLayout({ style_class: 'kestrel-extension-button-box', x_align: Clutter.ActorAlign.CENTER });
  const icon = new St.Icon({ icon_size: 16, y_align: Clutter.ActorAlign.CENTER });
  const label = new St.Label({ y_align: Clutter.ActorAlign.CENTER });
  box.add_child(icon);
  box.add_child(label);
  const button = new St.Button({ child: box, can_focus: true, track_hover: true });
  let current = node;
  button.connect('clicked', () => host.act(() => current.onActivate()));
  const update = (next: ButtonView) => {
    current = next;
    icon.visible = !!next.icon;
    if (next.icon) icon.gicon = resolveIcon(host.extensionPath, next.icon);
    label.visible = !!next.label && !(next.iconOnly && next.icon);
    label.text = next.label ?? '';
    button.accessible_name = next.label ?? '';
    button.reactive = button.can_focus = !next.disabled;
    button.opacity = next.disabled ? 110 : 255;
    icon.icon_size = next.small ? 14 : 16;
    button.style_class = `button kestrel-extension-button ${next.style ?? 'default'}${label.visible ? '' : ' icon-only'}${next.small ? ' small' : ''}`;
  };
  update(node);
  return { actor: button, update };
}

export function switchControl(node: SwitchView, host: ControlHost): Control<SwitchView> {
  const knob = new St.Widget({ style_class: 'kestrel-extension-switch-knob', y_align: Clutter.ActorAlign.CENTER });
  const track = new St.Bin({ style_class: 'kestrel-extension-switch', child: knob, y_align: Clutter.ActorAlign.CENTER });
  const label = new St.Label({ x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  const box = new St.BoxLayout({ style_class: 'kestrel-extension-switch-row', x_expand: true });
  box.add_child(label);
  box.add_child(track);
  const button = new St.Button({ style_class: 'kestrel-extension-row', child: box, can_focus: true, track_hover: true, toggle_mode: true, x_expand: true });
  let current = node;
  const show = (checked: boolean) => {
    knob.x_align = checked ? Clutter.ActorAlign.END : Clutter.ActorAlign.START;
    if (checked) track.add_style_pseudo_class('checked');
    else track.remove_style_pseudo_class('checked');
  };
  button.connect('clicked', () => {
    show(button.checked);
    host.act(() => current.onToggled(button.checked));
  });
  const update = (next: SwitchView) => {
    current = next;
    label.text = next.label;
    button.accessible_name = next.label;
    button.checked = next.checked;
    show(next.checked);
  };
  update(node);
  return { actor: button, update };
}

export function sliderControl(node: SliderView, host: ControlHost): Control<SliderView> {
  const slider = new Slider(node.value);
  slider.style_class = 'slider kestrel-slider';
  let current = node;
  let dragging = false;
  let setting = false;
  slider.connect('drag-begin', () => (dragging = true));
  slider.connect('drag-end', () => (dragging = false));
  slider.connect('notify::value', () => {
    if (!setting) host.act(() => current.onChanged(slider.value));
  });
  const update = (next: SliderView) => {
    current = next;
    slider.accessible_name = next.label;
    if (dragging || Math.abs(slider.value - next.value) < 1e-6) return;
    setting = true;
    slider.value = Math.min(1, Math.max(0, next.value));
    setting = false;
  };
  update(node);
  return { actor: slider, update };
}

export function entryControl(node: EntryView, host: ControlHost): Control<EntryView> {
  const entry = new St.Entry({ style_class: 'kestrel-extension-entry', can_focus: true, x_expand: true, text: node.text ?? '' });
  let current = node;
  let given = node.text ?? '';
  let replacing = false;
  entry.clutter_text.connect('text-changed', () => {
    if (current.onChanged && !replacing) host.act(() => current.onChanged!(entry.text));
  });
  entry.clutter_text.connect('activate', () => {
    if (current.onSubmit) host.act(() => current.onSubmit!(entry.text));
  });
  const update = (next: EntryView) => {
    current = next;
    entry.hint_text = next.placeholder ?? next.label;
    entry.accessible_name = next.label;
    if ((next.text ?? '') === given) return;
    given = next.text ?? '';
    if (entry.text === given) return;
    replacing = true;
    entry.text = given;
    replacing = false;
  };
  update(node);
  return { actor: entry, update };
}

export function itemControl(node: ItemView, host: ControlHost): Control<ItemView> {
  const icon = new St.Icon({ style_class: 'kestrel-context-icon', icon_size: 16, y_align: Clutter.ActorAlign.CENTER });
  const title = new St.Label({ x_align: Clutter.ActorAlign.START });
  const subtitle = new St.Label({ style_class: 'kestrel-context-detail', x_align: Clutter.ActorAlign.START });
  const texts = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  texts.add_child(title);
  texts.add_child(subtitle);
  const check = new St.Icon({ style_class: 'kestrel-context-icon', icon_name: 'object-select-symbolic', icon_size: 16, y_align: Clutter.ActorAlign.CENTER });
  const box = new St.BoxLayout({ style_class: 'kestrel-context-row', x_expand: true });
  for (const child of [icon, texts, check]) box.add_child(child);
  const button = new St.Button({ style_class: 'kestrel-context-action', child: box, can_focus: true, track_hover: true, x_expand: true });
  let current = node;
  button.connect('clicked', () => {
    if (current.onActivate) host.act(() => current.onActivate!());
  });
  const update = (next: ItemView) => {
    current = next;
    icon.visible = !!next.icon;
    if (next.icon) icon.gicon = resolveIcon(host.extensionPath, next.icon);
    title.text = next.title;
    subtitle.text = next.subtitle ?? '';
    subtitle.visible = !!next.subtitle;
    check.opacity = next.checked ? 255 : 0;
    check.visible = next.checked !== undefined;
    button.accessible_name = next.subtitle ? `${next.title}, ${next.subtitle}` : next.title;
    button.reactive = button.can_focus = !!next.onActivate;
  };
  update(node);
  return { actor: button, update };
}

export function progressControl(node: ProgressView): Control<ProgressView> {
  const bar = new BarLevel({ style_class: 'kestrel-slider kestrel-extension-progress', x_expand: true });
  const update = (next: ProgressView) => {
    bar.value = Math.min(1, Math.max(0, next.value));
  };
  update(node);
  return { actor: bar, update };
}
