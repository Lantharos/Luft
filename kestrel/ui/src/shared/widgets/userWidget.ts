import type AccountsService from 'gi://AccountsService';
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
