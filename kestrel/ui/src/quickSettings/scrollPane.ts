import Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import { ensureActorVisibleInScrollView } from 'resource:///org/gnome/shell/misc/animationUtils.js';

export class ScrollPane {
  readonly body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  readonly actor = new St.ScrollView({
    style_class: 'kestrel-app-scroll', hscrollbar_policy: St.PolicyType.NEVER,
    vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: true, child: this.body,
  });

  constructor() {
    const stage = (global as unknown as Shell.Global).stage;
    const focusSignal = stage.connect('notify::key-focus', () => {
      const focus = stage.get_key_focus();
      if (focus && this.body.contains(focus)) this.reveal(focus);
    });
    this.actor.connect('destroy', () => stage.disconnect(focusSignal));
  }

  measure(width: number, limit: number): number {
    const natural = this.body.get_preferred_height(width)[1];
    this.actor.height = Math.max(0, Math.min(natural, limit));
    return this.actor.height;
  }

  reveal(actor: Clutter.Actor): void {
    ensureActorVisibleInScrollView(this.actor, actor);
  }
}
