import { styleSurface } from '../stage/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

export interface ButtonInfo {
  label: string;
  action: () => void;
  key?: number;
  default?: boolean;
  reactive?: boolean;
  button?: St.Button;
}

interface KeyBinding {
  button: St.Button;
  action: () => void;
}

const DEFAULT_KEYS = [Clutter.KEY_Return, Clutter.KEY_KP_Enter, Clutter.KEY_ISO_Enter];

function setLabel(label: St.Label, value: string | null): void {
  label.set({ text: value || '', visible: value !== null });
}

function wrappingLabel(styleClass: string): St.Label {
  const label = new St.Label({ style_class: styleClass });
  label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
  label.clutter_text.line_wrap = true;
  return label;
}

export const Dialog = GObject.registerClass(class Dialog extends St.Widget {
  readonly surface = new St.BoxLayout({
    style_class: 'modal-dialog',
    x_align: Clutter.ActorAlign.CENTER,
    y_align: Clutter.ActorAlign.CENTER,
    orientation: Clutter.Orientation.VERTICAL,
  });
  readonly contentLayout = new St.BoxLayout({
    orientation: Clutter.Orientation.VERTICAL,
    style_class: 'modal-dialog-content-box',
    y_expand: true,
  });
  readonly buttonLayout = new St.Widget({
    style_class: 'modal-dialog-button-box',
    layout_manager: new Clutter.BoxLayout({ spacing: 12, homogeneous: true }),
  });
  private initialFocus: St.Widget | null = null;
  private pressedKey: number | null = null;
  private buttonKeys = new Map<number, KeyBinding>();

  constructor(parentActor: Clutter.Actor, styleClass?: string | null) {
    super({ layout_manager: new Clutter.BinLayout(), reactive: true });
    this.connect('destroy', () => this.makeInactive());

    this.surface.request_mode = Clutter.RequestMode.HEIGHT_FOR_WIDTH;
    this.surface.add_child(this.contentLayout);
    this.surface.add_child(this.buttonLayout);
    styleSurface(this.surface);
    this.add_child(this.surface);

    if (styleClass != null) this.surface.add_style_class_name(styleClass);

    parentActor.add_child(this);

    const keyController = new Clutter.KeyController();
    keyController.connectObject(
      'key-press', () => {
        const [, symbol] = keyController.get_key();
        this.pressedKey = symbol;
        return Clutter.EVENT_PROPAGATE;
      },
      'key-release', () => {
        const pressedKey = this.pressedKey;
        this.pressedKey = null;

        const [, symbol] = keyController.get_key();
        if (symbol !== pressedKey) return Clutter.EVENT_PROPAGATE;

        const binding = this.buttonKeys.get(symbol);
        if (!binding?.button.reactive) return Clutter.EVENT_PROPAGATE;
        binding.action();
        return Clutter.EVENT_STOP;
      },
      this);
    this.add_action(keyController);
  }

  makeInactive(): void {
    for (const child of this.buttonLayout.get_children()) child.set_reactive(false);
  }

  private setInitialKeyFocus(actor: St.Widget): void {
    this.initialFocus?.disconnectObject(this);
    this.initialFocus = actor;
    actor.connectObject('destroy', () => (this.initialFocus = null), this);
  }

  get initialKeyFocus(): St.Widget {
    return this.initialFocus || this;
  }

  addButton(buttonInfo: ButtonInfo): St.Button {
    const { label, action, key, reactive = true } = buttonInfo;
    const isDefault = buttonInfo.default;
    const keys = key ? [key] : isDefault ? DEFAULT_KEYS : [];

    const button = new St.Button({
      style_class: 'modal-dialog-button',
      button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.SECONDARY,
      reactive,
      can_focus: reactive,
      x_expand: true,
      y_expand: true,
      label,
    });
    button.connect('clicked', () => action());

    buttonInfo.button = button;

    if (isDefault) button.add_style_pseudo_class('default');

    if (this.initialFocus == null || isDefault) this.setInitialKeyFocus(button);

    for (const symbol of keys) this.buttonKeys.set(symbol, { button, action });

    this.buttonLayout.add_child(button);

    return button;
  }

  clearButtons(): void {
    this.buttonLayout.destroy_all_children();
    this.buttonKeys = new Map();
  }
});
export type Dialog = InstanceType<typeof Dialog>;

interface MessageDialogContentProps extends Partial<St.BoxLayout.ConstructorProps> {
  title?: string;
  description?: string;
  icon_name?: string;
  iconName?: string;
}

export const MessageDialogContent = GObject.registerClass({
  Properties: {
    'title': GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
    'description': GObject.ParamSpec.string('description', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
    'icon-name': GObject.ParamSpec.string('icon-name', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
  },
}, class MessageDialogContent extends St.BoxLayout {
  declare private iconActor: St.Icon;
  declare private titleLabel: St.Label;
  declare private descriptionLabel: St.Label;

  _init(params: MessageDialogContentProps = {}): void {
    this.iconActor = new St.Icon({ style_class: 'message-dialog-icon', x_align: Clutter.ActorAlign.START });
    this.titleLabel = wrappingLabel('message-dialog-title');
    this.descriptionLabel = wrappingLabel('message-dialog-description');

    super._init({
      style_class: 'message-dialog-content',
      x_expand: true,
      orientation: Clutter.Orientation.VERTICAL,
      ...params,
    });

    this.add_child(this.iconActor);
    this.add_child(this.titleLabel);
    this.add_child(this.descriptionLabel);
  }

  get iconName(): string | null {
    return this.iconActor.icon_name;
  }

  set iconName(iconName: string | null) {
    this.iconActor.set({ icon_name: iconName, visible: !!iconName });
    this.notify('icon-name');
  }

  get title(): string {
    return this.titleLabel.text;
  }

  set title(title: string | null) {
    if (this.titleLabel.text === title) return;
    setLabel(this.titleLabel, title);
    this.notify('title');
  }

  get description(): string {
    return this.descriptionLabel.text;
  }

  set description(description: string | null) {
    if (this.descriptionLabel.text === description) return;
    setLabel(this.descriptionLabel, description);
    this.notify('description');
  }
});
export type MessageDialogContent = InstanceType<typeof MessageDialogContent>;

interface ListSectionProps extends Partial<St.BoxLayout.ConstructorProps> {
  title?: string;
}

export const ListSection = GObject.registerClass({
  Properties: {
    'title': GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
  },
}, class ListSection extends St.BoxLayout {
  declare private titleLabel: St.Label;
  declare list: St.BoxLayout;

  _init(params: ListSectionProps = {}): void {
    this.titleLabel = wrappingLabel('dialog-list-title');
    this.list = new St.BoxLayout({ style_class: 'dialog-list-box', orientation: Clutter.Orientation.VERTICAL });
    const scrollView = new St.ScrollView({ style_class: 'dialog-list-scrollview', child: this.list });

    super._init({
      style_class: 'dialog-list',
      x_expand: true,
      orientation: Clutter.Orientation.VERTICAL,
      ...params,
    });

    this.label_actor = this.titleLabel;
    this.add_child(this.titleLabel);
    this.add_child(scrollView);
  }

  get title(): string {
    return this.titleLabel.text;
  }

  set title(title: string | null) {
    setLabel(this.titleLabel, title);
    this.notify('title');
  }
});
export type ListSection = InstanceType<typeof ListSection>;

interface ListSectionItemProps extends Partial<St.BoxLayout.ConstructorProps> {
  icon_actor?: Clutter.Actor;
  iconActor?: Clutter.Actor;
  title?: string;
  description?: string;
}

export const ListSectionItem = GObject.registerClass({
  Properties: {
    'icon-actor': GObject.ParamSpec.object('icon-actor', null, null, GObject.ParamFlags.READWRITE, Clutter.Actor.$gtype),
    'title': GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
    'description': GObject.ParamSpec.string('description', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
  },
}, class ListSectionItem extends St.BoxLayout {
  declare private iconActorBin: St.Bin;
  declare private titleLabel: St.Label;
  declare private descriptionLabel: St.Label;

  _init(params: ListSectionItemProps = {}): void {
    this.iconActorBin = new St.Bin();

    const textLayout = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    });

    this.titleLabel = new St.Label({ style_class: 'dialog-list-item-title' });
    this.descriptionLabel = new St.Label({ style_class: 'dialog-list-item-description' });
    this.descriptionLabel.clutter_text.line_wrap = true;
    this.descriptionLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    textLayout.add_child(this.titleLabel);
    textLayout.add_child(this.descriptionLabel);

    super._init({ style_class: 'dialog-list-item', ...params });

    this.label_actor = this.titleLabel;
    this.add_child(this.iconActorBin);
    this.add_child(textLayout);
  }

  get iconActor(): Clutter.Actor | null {
    return this.iconActorBin.get_child();
  }

  set iconActor(actor: Clutter.Actor | null) {
    this.iconActorBin.set_child(actor);
    this.notify('icon-actor');
  }

  get title(): string {
    return this.titleLabel.text;
  }

  set title(title: string | null) {
    setLabel(this.titleLabel, title);
    this.notify('title');
  }

  get description(): string {
    return this.descriptionLabel.text;
  }

  set description(description: string | null) {
    setLabel(this.descriptionLabel, description);
    this.notify('description');
  }
});
export type ListSectionItem = InstanceType<typeof ListSectionItem>;

export const EntryField = GObject.registerClass(class EntryField extends St.BoxLayout {
  private readonly heading = wrappingLabel('kestrel-entry-label');

  constructor(entry: St.Entry, label: string, statusActor: St.Widget | null = null) {
    super({
      style_class: 'kestrel-entry-field',
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });
    this.label_actor = this.heading;
    if (statusActor) {
      const header = new St.BoxLayout();
      this.heading.x_expand = true;
      statusActor.y_align = Clutter.ActorAlign.CENTER;
      header.add_child(this.heading);
      header.add_child(statusActor);
      this.add_child(header);
    } else {
      this.add_child(this.heading);
    }
    entry.x_expand = true;
    entry.x_align = Clutter.ActorAlign.FILL;
    entry.label_actor = this.heading;
    this.add_child(entry);
    entry.bind_property('visible', this, 'visible', GObject.BindingFlags.SYNC_CREATE);
    this.label = label;
  }

  set label(text: string) {
    this.heading.text = text;
  }
});
export type EntryField = InstanceType<typeof EntryField>;
