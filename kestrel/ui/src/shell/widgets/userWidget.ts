import type AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

const AVATAR_ICON_SIZE = 64;

interface AvatarOptions {
  styleClass?: string;
  reactive?: boolean;
  iconSize?: number;
}

export const Avatar = GObject.registerClass(class Avatar extends St.Bin {
  private iconSize: number;

  constructor(private readonly user: AccountsService.User | null, { styleClass = 'user-icon', reactive = false, iconSize = AVATAR_ICON_SIZE }: AvatarOptions = {}) {
    const themeContext = St.ThemeContext.get_for_stage(global.stage);
    super({
      style_class: styleClass,
      reactive,
      width: iconSize * themeContext.scaleFactor,
      height: iconSize * themeContext.scaleFactor,
      x_expand: false,
      y_expand: false,
    });
    this.iconSize = iconSize;

    this.bind_property('reactive', this, 'track-hover', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('reactive', this, 'can-focus', GObject.BindingFlags.SYNC_CREATE);

    themeContext.connectObject('notify::scale-factor', () => this.update(), this);
  }

  vfunc_style_changed(): void {
    super.vfunc_style_changed();

    const [found, iconSize] = this.get_theme_node().lookup_length('icon-size', false);
    if (!found) return;

    const themeContext = St.ThemeContext.get_for_stage(global.stage);
    this.iconSize = iconSize / themeContext.scaleFactor;
    this.update();
  }

  setSensitive(sensitive: boolean): void {
    this.reactive = sensitive;
  }

  update(): void {
    let iconFile = this.user?.get_icon_file() ?? null;
    if (iconFile && !GLib.file_test(iconFile, GLib.FileTest.EXISTS)) iconFile = null;

    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    this.set_size(this.iconSize * scaleFactor, this.iconSize * scaleFactor);

    if (iconFile) {
      St.TextureCache.get_default().preload_file_to_cairo_surface(
        Gio.File.new_for_path(iconFile), scaleFactor, this.get_resource_scale());
      this.set_child(null);
      this.add_style_class_name('user-avatar');
      this.style = `
                background-image: url("${iconFile}");
                background-size: cover;`;
    } else {
      this.style = null;
      this.child = new St.Icon({
        icon_name: 'avatar-default-symbolic',
        icon_size: this.iconSize,
        x_expand: true,
        y_expand: true,
      });
    }
  }
});
export type Avatar = InstanceType<typeof Avatar>;

const UserWidgetLabel = GObject.registerClass(class UserWidgetLabel extends St.Widget {
  private readonly realNameLabel = new St.Label({ style_class: 'user-widget-label', y_align: Clutter.ActorAlign.CENTER });
  private readonly userNameLabel = new St.Label({ style_class: 'user-widget-label', y_align: Clutter.ActorAlign.CENTER });
  private currentLabel: St.Label | null = null;

  constructor(private readonly user: AccountsService.User) {
    super({ layout_manager: new Clutter.BinLayout() });
    this.add_child(this.realNameLabel);
    this.add_child(this.userNameLabel);

    user.connectObject(
      'notify::is-loaded', () => this.updateUser(),
      'changed', () => this.updateUser(), this);
    this.updateUser();
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    this.set_allocation(box);

    const availWidth = box.x2 - box.x1;
    const availHeight = box.y2 - box.y1;
    const [, , natRealNameWidth] = this.realNameLabel.get_preferred_size();
    const childBox = new Clutter.ActorBox();

    const fits = natRealNameWidth <= availWidth;
    const currentLabel = fits ? this.realNameLabel : this.userNameLabel;
    const hiddenLabel = fits ? this.userNameLabel : this.realNameLabel;
    this.currentLabel = currentLabel;
    this.label_actor = currentLabel;

    hiddenLabel.allocate(childBox);
    childBox.set_size(availWidth, availHeight);
    currentLabel.allocate(childBox);
  }

  vfunc_paint(paintContext: Clutter.PaintContext): void {
    this.currentLabel!.paint(paintContext);
  }

  private updateUser(): void {
    const loaded = this.user.is_loaded;
    this.realNameLabel.text = loaded ? this.user.get_real_name() : '';
    this.userNameLabel.text = loaded ? this.user.get_user_name() : '';
  }
});

export const UserWidget = GObject.registerClass(class UserWidget extends St.BoxLayout {
  private readonly avatar: Avatar;

  constructor(user: AccountsService.User | null, orientation = Clutter.Orientation.HORIZONTAL) {
    const vertical = orientation === Clutter.Orientation.VERTICAL;
    super({
      style_class: vertical ? 'user-widget vertical' : 'user-widget horizontal',
      orientation,
      x_align: vertical ? Clutter.ActorAlign.CENTER : Clutter.ActorAlign.START,
    });

    this.avatar = new Avatar(user);
    this.avatar.x_align = Clutter.ActorAlign.CENTER;
    this.add_child(this.avatar);

    if (user) {
      const nameLabel = new UserWidgetLabel(user);
      this.add_child(nameLabel);
      nameLabel.bind_property('label-actor', this, 'label-actor', GObject.BindingFlags.SYNC_CREATE);
      user.connectObject(
        'notify::is-loaded', () => this.avatar.update(),
        'changed', () => this.avatar.update(), this);
    } else {
      this.add_child(new St.Label({ style_class: 'user-widget-label', text: 'Empty User', opacity: 0 }));
    }

    this.avatar.update();
  }
});
export type UserWidget = InstanceType<typeof UserWidget>;
