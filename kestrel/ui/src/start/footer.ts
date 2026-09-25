import AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import { Avatar } from 'resource:///org/gnome/shell/ui/userWidget.js';

import { animateActor } from '../motion.js';
import type { ContextMenus } from '../contextMenus.js';
import { LOCK, POWER_ACTIONS, bindAvailability, type SessionAction } from '../sessionActions.js';

const SWAP_DURATION = 180;
const SWAP_DISTANCE = 16;

export class StartFooter {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-footer' });
  private readonly stack = new St.Widget({ layout_manager: new Clutter.BinLayout(), x_expand: true, clip_to_allocation: true });
  private readonly account = new St.BoxLayout({ style_class: 'kestrel-account', reactive: true, x_expand: true });
  private readonly actions = new St.BoxLayout({ style_class: 'kestrel-session-actions', x_expand: true, visible: false, opacity: 0 });
  private readonly toggleIcon = new St.Icon({ icon_name: 'system-shutdown-symbolic', icon_size: 18 });
  readonly powerButton: St.Button;
  private open = false;

  constructor(private readonly close: () => void, menus: ContextMenus) {
    const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
    const avatar = new Avatar(user, { styleClass: 'kestrel-avatar', iconSize: 32 });
    avatar.y_align = Clutter.ActorAlign.CENTER;
    const signals = [
      user.connect('notify::is-loaded', () => avatar.update()),
      user.connect('changed', () => avatar.update()),
    ];
    avatar.connect('destroy', () => signals.forEach(signal => user.disconnect(signal)));
    avatar.update();
    this.account.add_child(avatar);
    this.account.add_child(new St.Label({
      text: GLib.get_real_name() || GLib.get_user_name(), y_align: Clutter.ActorAlign.CENTER,
    }));
    this.stack.add_child(this.account);
    for (const action of [LOCK, ...POWER_ACTIONS]) this.actions.add_child(this.actionButton(action));
    this.stack.add_child(this.actions);
    this.actor.add_child(this.stack);

    this.powerButton = new St.Button({
      style_class: 'kestrel-icon-button', child: this.toggleIcon,
      accessible_name: 'Power and session', can_focus: true, track_hover: true,
    });
    this.powerButton.connect('clicked', () => this.setOpen(!this.open));
    this.actor.add_child(this.powerButton);

    menus.bind(this.account, () => [{ label: 'Account settings', run: () => menus.settings('system') }]);
    menus.bind(this.powerButton, () => [{ label: 'Power and session', run: () => this.setOpen(true) }]);
  }

  get sessionOpen(): boolean { return this.open; }

  setOpen(open: boolean, animate = true): void {
    if (this.open === open) return;
    this.open = open;
    this.toggleIcon.icon_name = open ? 'window-close-symbolic' : 'system-shutdown-symbolic';
    this.powerButton.accessible_name = open ? 'Close power options' : 'Power and session';
    if (open) this.powerButton.add_style_pseudo_class('checked');
    else this.powerButton.remove_style_pseudo_class('checked');
    const [shown, hidden] = open ? [this.actions, this.account] : [this.account, this.actions];
    const direction = open ? 1 : -1;
    shown.show();
    if (animate) {
      shown.translation_x = SWAP_DISTANCE * direction;
      animateActor(shown, { opacity: 255, translation_x: 0, duration: SWAP_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUART });
      animateActor(hidden, {
        opacity: 0, translation_x: -SWAP_DISTANCE * direction, duration: SWAP_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUART,
        onStopped: (finished: boolean) => { if (finished) hidden.hide(); },
      });
    } else {
      for (const actor of [shown, hidden]) actor.remove_all_transitions();
      shown.set({ opacity: 255, translation_x: 0 });
      hidden.set({ opacity: 0, translation_x: 0, visible: false });
    }
    if (open) this.actions.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
  }

  private actionButton(action: SessionAction): St.Button {
    const content = new St.BoxLayout({ style_class: 'kestrel-session-action-content', x_align: Clutter.ActorAlign.CENTER });
    content.add_child(new St.Icon({ icon_name: action.icon, icon_size: 16, y_align: Clutter.ActorAlign.CENTER }));
    content.add_child(new St.Label({ text: action.label, y_align: Clutter.ActorAlign.CENTER }));
    const button = new St.Button({
      style_class: 'kestrel-session-action', child: content,
      can_focus: true, track_hover: true, accessible_name: action.label,
    });
    button.connect('clicked', () => {
      this.close();
      action.run();
    });
    bindAvailability(action, button);
    return button;
  }
}
