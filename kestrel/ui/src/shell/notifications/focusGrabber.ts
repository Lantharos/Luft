import type Clutter from 'gi://Clutter';
import St from 'gi://St';

export class FocusGrabber {
  private prevKeyFocusActor: Clutter.Actor | null = null;
  private focused = false;

  constructor(private readonly actor: St.Widget) {}

  grabFocus(): void {
    if (this.focused) return;

    this.prevKeyFocusActor = global.stage.get_key_focus();
    this.prevKeyFocusActor?.connectObject('destroy', () => {
      this.prevKeyFocusActor = null;
    }, this);
    global.stage.connectObject('notify::key-focus', () => this.focusActorChanged(), this);

    if (!this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false))
      this.actor.grab_key_focus();

    this.focused = true;
  }

  private focusUngrabbed(): boolean {
    if (!this.focused) return false;
    this.prevKeyFocusActor?.disconnectObject(this);
    global.stage.disconnectObject(this);
    this.focused = false;
    return true;
  }

  private focusActorChanged(): void {
    const focusedActor = global.stage.get_key_focus();
    if (!focusedActor || !this.actor.contains(focusedActor))
      this.focusUngrabbed();
  }

  ungrabFocus(): void {
    if (!this.focusUngrabbed()) return;

    if (this.prevKeyFocusActor) {
      global.stage.set_key_focus(this.prevKeyFocusActor);
      this.prevKeyFocusActor = null;
      return;
    }
    const focusedActor = global.stage.get_key_focus();
    if (focusedActor && this.actor.contains(focusedActor))
      global.stage.set_key_focus(null);
  }
}
