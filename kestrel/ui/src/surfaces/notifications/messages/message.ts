import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Util from '../../../core/runtime/util.js';
import { styleSurface } from '../../../appearance/kestrelGlass.js';
import { ANIMATION_TIME } from '../tray/messageTray.js';
import { MessageHeader } from './messageHeader.js';
import { LabelExpanderLayout, ScaleLayout } from './messageLayouts.js';
import type { MessageSource } from './source.js';
import { URLHighlighter } from './urlHighlighter.js';

const MAX_TITLE_LENGTH = 150;
const MAX_BODY_LENGTH = 850;

const limitString = (string: string, limit: number): string =>
  Array.from(new Intl.Segmenter().segment(string))
    .splice(0, limit)
    .map(o => o.segment)
    .join('');

export namespace Message {
  export interface Signals extends St.Button.SignalSignatures {
    'close': () => void;
    'expanded': () => void;
    'unexpanded': () => void;
  }
}

export class Message extends St.Button {
  static [GObject.properties] = {
    'title': GObject.ParamSpec.string(
      'title', null, null,
      GObject.ParamFlags.READWRITE,
      null),
    'body': GObject.ParamSpec.string(
      'body', null, null,
      GObject.ParamFlags.READWRITE,
      null),
    'use-body-markup': GObject.ParamSpec.boolean(
      'use-body-markup', null, null,
      GObject.ParamFlags.READWRITE,
      false),
    'icon': GObject.ParamSpec.object(
      'icon', null, null,
      GObject.ParamFlags.READWRITE,
      Gio.Icon),
    'datetime': GObject.ParamSpec.boxed(
      'datetime', null, null,
      GObject.ParamFlags.READWRITE,
      GLib.DateTime),
  };

  static [GObject.signals] = {
    'close': {
      flags: GObject.SignalFlags.RUN_LAST,
    },
    'expanded': {},
    'unexpanded': {},
  };

  static {
    GObject.registerClass(this);

    const closeIfAllowed = ((message: Message) => {
      message.closeIfAllowed();
      return Clutter.EVENT_STOP;
    }) as unknown as GObject.Closure;
    const bindingPool = this.get_binding_pool();
    bindingPool.install_closure('close', Clutter.KEY_BackSpace, 0 as Clutter.ModifierType, closeIfAllowed);
    bindingPool.install_closure('close', Clutter.KEY_Delete, 0 as Clutter.ModifierType, closeIfAllowed);
  }

  declare connect: GObject.SignalMethods<this, Message.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Message.Signals>['emit'];

  expanded = false;
  readonly header: MessageHeader;
  readonly titleLabel: St.Label;
  private useBodyMarkupValue = false;
  private titleText: string | null = null;
  private bodyText: string | null = null;
  private readonly actionBin: St.Bin;
  private readonly iconActor: St.Icon;
  private readonly mediaControls = new St.BoxLayout();
  private readonly bodyLabel: URLHighlighter;
  private readonly bodyBin: St.Bin;

  constructor(source: MessageSource) {
    super({
      style_class: 'message',
      accessible_role: Atk.Role.NOTIFICATION,
      can_focus: true,
      x_expand: true,
      y_expand: false,
    });

    styleSurface(this, 20);

    const vbox = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });
    this.set_child(vbox);

    this.header = new MessageHeader(source);
    vbox.add_child(this.header);

    const hbox = new St.BoxLayout({
      style_class: 'message-box',
    });
    vbox.add_child(hbox);

    this.actionBin = new St.Bin({
      style_class: 'message-action-bin',
      layout_manager: new ScaleLayout(),
      visible: false,
    });
    vbox.add_child(this.actionBin);

    this.iconActor = new St.Icon({
      style_class: 'message-icon',
      y_expand: true,
      y_align: Clutter.ActorAlign.START,
      visible: false,
    });
    hbox.add_child(this.iconActor);

    this.iconActor.connect('notify::is-symbolic', () => {
      if (this.iconActor.is_symbolic)
        this.iconActor.add_style_class_name('message-themed-icon');
      else
        this.iconActor.remove_style_class_name('message-themed-icon');
    });

    const contentBox = new St.BoxLayout({
      style_class: 'message-content',
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });
    hbox.add_child(contentBox);

    hbox.add_child(this.mediaControls);

    this.titleLabel = new St.Label({
      style_class: 'message-title',
      y_align: Clutter.ActorAlign.END,
    });
    contentBox.add_child(this.titleLabel);

    this.bodyLabel = new URLHighlighter('', true, this.useBodyMarkupValue);
    this.bodyLabel.add_style_class_name('message-body');
    this.bodyBin = new St.Bin({
      x_expand: true,
      layout_manager: new LabelExpanderLayout(),
      child: this.bodyLabel,
    });
    contentBox.add_child(this.bodyBin);

    this.header.closeButton.connect('clicked', () => this.close());
    this.header.closeButton.visible = this.canClose();

    this.header.expandButton.connect('clicked', () => {
      if (this.expanded)
        this.unexpand(true);
      else
        this.expand(true);
    });
    this.bodyLabel.connect('notify::allocation', () => this.updateExpandButton());
    this.updateExpandButton();
  }

  private updateExpandButton(): void {
    if (!this.bodyLabel.has_allocation()) return;
    const layout = this.bodyLabel.clutter_text.get_layout();
    const canExpand = layout.is_ellipsized() || this.expanded || !!this.actionBin.child;
    this.header.expandButton.opacity = canExpand ? 255 : 0;
  }

  close(): void {
    this.emit('close');
  }

  set icon(icon: Gio.Icon | null) {
    this.iconActor.gicon = icon;
    this.iconActor.visible = !!icon;
    this.notify('icon');
  }

  get icon(): Gio.Icon | null {
    return this.iconActor.gicon;
  }

  set datetime(datetime: GLib.DateTime | null) {
    this.header.timeLabel.datetime = datetime;
    this.notify('datetime');
  }

  get datetime(): GLib.DateTime | null {
    return this.header.timeLabel.datetime;
  }

  set title(text: string | null) {
    this.titleText = limitString(text ?? '', MAX_TITLE_LENGTH);
    const title = text ? Util.fixMarkup(text.replace(/\n/g, ' '), false) : '';
    this.titleLabel.clutter_text.set_markup(title);
    this.notify('title');
  }

  get title(): string | null {
    return this.titleText;
  }

  set body(text: string | null) {
    this.bodyText = limitString(text ?? '', MAX_BODY_LENGTH);
    this.bodyLabel.setMarkup(text ? text.replace(/\n/g, ' ') : '', this.useBodyMarkupValue);
    this.notify('body');
  }

  get body(): string | null {
    return this.bodyText;
  }

  set useBodyMarkup(enable: boolean) {
    if (this.useBodyMarkupValue === enable) return;
    this.useBodyMarkupValue = enable;
    this.body = this.bodyText;
    this.notify('use-body-markup');
  }

  get useBodyMarkup(): boolean {
    return this.useBodyMarkupValue;
  }

  setActionArea(actor: Clutter.Actor): void {
    this.actionBin.child = actor;
    this.actionBin.visible = this.expanded;
    this.updateExpandButton();
  }

  addMediaControl(iconName: string, callback: () => void): St.Button {
    const button = new St.Button({
      style_class: 'message-media-control',
      icon_name: iconName,
    });
    button.connect('clicked', callback);
    this.mediaControls.add_child(button);
    return button;
  }

  expand(animate: boolean): void {
    if (this.expanded) return;

    this.expanded = true;
    this.actionBin.visible = !!this.actionBin.child;

    const duration = animate ? ANIMATION_TIME : 0;
    this.bodyBin.ease_property('@layout.expansion', 1, {
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration,
    });

    this.actionBin.scale_y = 0;
    this.actionBin.ease({
      scale_y: 1,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    });

    this.header.expandButton.ease({
      rotation_angle_z: 180,
      duration,
    });

    this.emit('expanded');
  }

  unexpand(animate: boolean): void {
    const duration = animate ? ANIMATION_TIME : 0;
    this.bodyBin.ease_property('@layout.expansion', 0, {
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration,
    });

    this.actionBin.ease({
      scale_y: 0,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.actionBin.hide();
        this.expanded = false;
      },
    });

    this.header.expandButton.ease({
      rotation_angle_z: 0,
      duration,
    });

    this.emit('unexpanded');
  }

  canClose(): boolean {
    return false;
  }

  private closeIfAllowed(): void {
    if (this.canClose())
      this.close();
  }
}
