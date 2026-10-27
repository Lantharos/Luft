import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { PopupMenuBase, type MenuCloseParams, type MenuOpenParams } from '../../shared/popups/popupMenu.js';

const POPUP_ANIMATION_TIME = 240;

export class QuickToggleMenu extends PopupMenuBase {
  declare actor: St.Widget;
  declare readonly sourceActor: St.Button;
  private readonly headerLayout = new Clutter.GridLayout();
  private readonly header: St.Widget;
  private readonly headerIcon = new St.Icon({ style_class: 'icon', y_align: Clutter.ActorAlign.CENTER });
  private readonly headerTitle = new St.Label({ style_class: 'title', y_align: Clutter.ActorAlign.CENTER, y_expand: true });
  private readonly headerSubtitle = new St.Label({ style_class: 'subtitle', y_align: Clutter.ActorAlign.CENTER });
  private readonly headerSpacer = new Clutter.Actor({ x_expand: true });
  private headerSet = false;
  private hostedState = false;

  constructor(sourceActor: St.Button) {
    super(sourceActor, 'quick-toggle-menu');

    const constraints = new Clutter.BindConstraint({ coordinate: Clutter.BindCoordinate.Y, source: sourceActor });
    sourceActor.bind_property('height', constraints, 'offset', GObject.BindingFlags.DEFAULT);

    this.actor = new St.Widget({
      layout_manager: new Clutter.BinLayout(),
      style_class: 'quick-toggle-menu-container',
      reactive: true,
      x_expand: true,
      y_expand: false,
      height: 0,
      constraints,
    });
    (this.actor as St.Widget & { _delegate: QuickToggleMenu })._delegate = this;
    this.actor.add_child(this.box);
    this.actor.set_keynav_flags(St.KeynavFlags.WRAP_VERTICALLY);

    global.focus_manager.add_group(this.actor);

    this.header = new St.Widget({ style_class: 'header', layout_manager: this.headerLayout, visible: false });
    this.headerLayout.hookup_style(this.header);
    this.box.add_child(this.header);

    const side = this.headerSide();
    this.headerLayout.attach(this.headerIcon, 0, 0, 1, 2);
    this.headerLayout.attach_next_to(this.headerTitle, this.headerIcon, side, 1, 1);
    this.headerLayout.attach_next_to(this.headerSpacer, this.headerTitle, side, 1, 1);
    this.headerLayout.attach_next_to(this.headerSubtitle, this.headerTitle, Clutter.GridPosition.BOTTOM, 1, 1);

    sourceActor.connect('notify::checked', () => this.syncChecked());
    this.syncChecked();
  }

  private headerSide(): Clutter.GridPosition {
    return this.actor.text_direction === Clutter.TextDirection.RTL ? Clutter.GridPosition.LEFT : Clutter.GridPosition.RIGHT;
  }

  setHeader(icon: Gio.Icon | string, title: string, subtitle = ''): void {
    if (icon instanceof Gio.Icon) this.headerIcon.gicon = icon;
    else this.headerIcon.icon_name = icon;

    this.headerTitle.text = title;
    this.headerSubtitle.set({ text: subtitle, visible: !!subtitle });

    this.headerSet = true;
    this.syncHeader();
  }

  get hosted(): boolean {
    return this.hostedState;
  }

  set hosted(hosted: boolean) {
    this.hostedState = hosted;
    this.syncHeader();
  }

  private syncHeader(): void {
    this.header.visible = this.headerSet && !this.hosted;
  }

  addHeaderSuffix(actor: Clutter.Actor): void {
    const side = this.headerSide();
    this.header.remove_child(this.headerSpacer);
    this.headerLayout.attach_next_to(actor, this.headerTitle, side, 1, 1);
    this.headerLayout.attach_next_to(this.headerSpacer, actor, side, 1, 1);
  }

  open(params: MenuOpenParams = {}): boolean {
    if (!super.open(params)) return false;
    if (this.hosted) return true;

    const previousHeight = this.actor.height;
    this.actor.height = -1;
    const [targetHeight] = this.actor.get_preferred_height(-1);
    this.actor.height = previousHeight;
    const distance = Math.abs(targetHeight - previousHeight);

    const { animate = true } = params;
    const duration = animate ? POPUP_ANIMATION_TIME / 2 : 0;

    this.box.opacity = 0;
    this.actor.ease({
      duration: duration * (distance / targetHeight),
      height: targetHeight,
      onComplete: () => {
        this.box.ease({ duration, opacity: 255 });
        this.actor.height = -1;
      },
    });
    return true;
  }

  close(params: MenuCloseParams = {}): boolean {
    if (!super.close(params)) return false;
    if (this.hosted) return true;

    const { animate = true } = params;
    const { opacity } = this.box;
    const duration = animate ? POPUP_ANIMATION_TIME / 2 : 0;

    this.box.ease({
      duration: duration * (opacity / 255),
      opacity: 0,
      onComplete: () => {
        this.actor.ease({
          duration,
          height: 0,
          onComplete: () => {
            this.actor.hide();
            this.emit('menu-closed');
          },
        });
      },
    });

    return true;
  }

  private syncChecked(): void {
    if (this.sourceActor.checked) this.headerIcon.add_style_class_name('active');
    else this.headerIcon.remove_style_class_name('active');
  }
}
