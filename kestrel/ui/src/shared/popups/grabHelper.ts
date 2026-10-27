import Clutter from 'gi://Clutter';
import St from 'gi://St';

import * as Main from '../../core/main.js';

type ModalOptions = Parameters<typeof Main.pushModal>[1];

export interface GrabOptions {
  actor: St.Widget;
  focus?: Clutter.Actor | null;
  onUngrab?: ((isUser: boolean) => void) | null;
}

interface UngrabOptions {
  actor?: Clutter.Actor;
  isUser?: boolean;
}

interface GrabEntry extends GrabOptions {
  savedFocus: Clutter.Actor | null;
}

export class GrabHelper {
  private readonly grabStack: GrabEntry[] = [];
  private modalCount = 0;
  private modalGrab: Clutter.Grab | null = null;
  private clickGesture: Clutter.ClickGesture | null = null;

  constructor(private readonly owner: Clutter.Actor, private readonly modalOptions?: ModalOptions) {}

  private get currentGrab(): GrabEntry | undefined {
    return this.grabStack.at(-1);
  }

  private isWithinGrabbedActor(actor: Clutter.Actor | null): boolean {
    const currentActor = this.currentGrab?.actor;
    for (; actor; actor = actor.get_parent()) {
      if (actor === currentActor) return true;
    }
    return false;
  }

  private findStackIndex(actor: Clutter.Actor | undefined): number {
    return actor ? this.grabStack.findIndex(grab => grab.actor === actor) : -1;
  }

  private actorInGrabStack(actor: Clutter.Actor | null): number {
    for (; actor; actor = actor.get_parent()) {
      const index = this.findStackIndex(actor);
      if (index >= 0) return index;
    }
    return -1;
  }

  grab({ actor, focus = null, onUngrab = null }: GrabOptions): boolean {
    const savedFocus = global.stage.key_focus;
    const hadFocus = savedFocus && this.isWithinGrabbedActor(savedFocus);

    if (this.findStackIndex(actor) >= 0) return true;

    if (!this.takeModalGrab()) return false;

    this.grabStack.push({ actor, focus, onUngrab, savedFocus });

    if (focus) focus.grab_key_focus();
    else if (hadFocus && !actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false)) actor.grab_key_focus();

    return true;
  }

  grabAsync(options: Omit<GrabOptions, 'onUngrab'>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.grab({ ...options, onUngrab: resolve })) reject(new Error('Grab failed'));
    });
  }

  private takeModalGrab(): boolean {
    if (this.modalCount === 0) {
      this.modalGrab = Main.pushModal(this.owner, this.modalOptions);

      const clickGesture = new Clutter.ClickGesture();
      clickGesture.connect('recognize', () => {
        const targetActor = global.stage.get_event_actor(clickGesture.get_point_event(0));
        if (!this.currentGrab!.actor.contains(targetActor!)) {
          const index = this.actorInGrabStack(targetActor) + 1;
          this.ungrab({ actor: this.grabStack[index].actor, isUser: true });
        }
      });
      this.owner.add_action(clickGesture);
      this.clickGesture = clickGesture;

      const keyController = new Clutter.KeyController();
      keyController.connect('key-press', () => {
        const [, key] = keyController.get_key();
        if (key !== Clutter.KEY_Escape) return Clutter.EVENT_PROPAGATE;

        this.ungrab({ isUser: true });
        return Clutter.EVENT_STOP;
      });
      this.owner.add_action_full('grab-helper-key-capture', Clutter.EventPhase.CAPTURE, keyController);
    }

    this.modalCount++;
    return true;
  }

  private releaseModalGrab(): void {
    this.modalCount--;
    if (this.modalCount > 0) return;

    this.owner.remove_action(this.clickGesture!);

    Main.popModal(this.modalGrab!);
    this.modalGrab = null;
  }

  ungrab({ actor = this.currentGrab?.actor, isUser = false }: UngrabOptions = {}): void {
    const index = this.findStackIndex(actor);
    if (index < 0) return;

    const focus = global.stage.key_focus;
    const hadFocus = focus && this.isWithinGrabbedActor(focus);

    const poppedGrabs = this.grabStack.splice(index);
    for (const grab of poppedGrabs.toReversed()) {
      grab.onUngrab?.(isUser);
      this.releaseModalGrab();
    }

    if (hadFocus) poppedGrabs[0].savedFocus?.grab_key_focus();
  }
}
