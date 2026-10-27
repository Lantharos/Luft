import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

export const CheckBox = GObject.registerClass(class CheckBox extends St.Button {
  private readonly caption: St.Label;

  constructor(label?: string) {
    const container = new St.BoxLayout({ x_expand: true, y_expand: true });
    super({
      style_class: 'check-box',
      child: container,
      button_mask: St.ButtonMask.PRIMARY,
      toggle_mode: true,
      can_focus: true,
    });
    this.set_accessible_role(Atk.Role.CHECK_BOX);

    const box = new St.Bin({ y_align: Clutter.ActorAlign.START });
    container.add_child(box);
    box.set_child(new St.Icon({ icon_name: 'check-symbolic' }));

    this.caption = new St.Label({ y_align: Clutter.ActorAlign.CENTER });
    this.caption.clutter_text.set_line_wrap(true);
    this.caption.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
    this.set_label_actor(this.caption);
    container.add_child(this.caption);

    if (label) this.setLabel(label);
  }

  setLabel(label: string): void {
    this.caption.set_text(label);
  }

  getLabelActor(): St.Label {
    return this.caption;
  }
});
export type CheckBox = InstanceType<typeof CheckBox>;
