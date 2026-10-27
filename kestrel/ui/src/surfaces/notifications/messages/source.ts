import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

export const Source = GObject.registerClass({
  Properties: {
    'title': GObject.ParamSpec.string(
      'title', null, null,
      GObject.ParamFlags.READWRITE,
      null),
    'icon': GObject.ParamSpec.object(
      'icon', null, null,
      GObject.ParamFlags.READWRITE,
      Gio.Icon),
    'icon-name': GObject.ParamSpec.string(
      'icon-name', null, null,
      GObject.ParamFlags.READWRITE,
      null),
  },
}, class Source extends GObject.Object {
  declare private titleValue: string | null;
  declare private iconValue: Gio.Icon | null;

  get title(): string | null {
    return this.titleValue ?? null;
  }

  set title(title: string | null) {
    if (title === this.titleValue) return;
    this.titleValue = title;
    this.notify('title');
  }

  get icon(): Gio.Icon | null {
    return this.iconValue ?? null;
  }

  set icon(icon: Gio.Icon | null) {
    if (icon === this.iconValue) return;
    this.iconValue = icon;
    this.notify('icon');
  }

  get iconName(): string | null {
    return this.icon instanceof Gio.ThemedIcon ? this.icon.get_names()[0] : null;
  }

  set iconName(iconName: string) {
    this.icon = new Gio.ThemedIcon({ name: iconName });
  }
});
export type Source = InstanceType<typeof Source>;

export type MessageSource = Source & { readonly policy?: { readonly id: string } };
