import Clutter from 'gi://Clutter';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { Ornament, PopupMenu, PopupSeparatorMenuItem, type MenuCloseParams, type MenuOpenParams } from '../../shared/popups/popupMenu.js';
import { getInputSourceManager } from '../../system/inputSources/keyboard.js';

export class NoGrabPopup extends PopupMenu {
  private readonly clickGesture = new Clutter.ClickGesture();

  constructor(actor: Clutter.Actor, arrowSide: St.Side) {
    super(actor, 0.5, arrowSide);

    actor.connectObject(
      'destroy', () => this.close(),
      'notify::mapped', () => {
        if (!actor.is_mapped()) this.close();
      },
      this);

    this.clickGesture.connect('may-recognize', () => this.mayRecognize());
    this.clickGesture.connect('recognize', () => this.close());
  }

  private mayRecognize(): boolean {
    const { x, y } = this.clickGesture.get_coords_abs();
    const targetActor = global.stage.get_actor_at_pos(Clutter.PickMode.ALL, x, y);
    return targetActor !== this.actor && !this.actor.contains(targetActor);
  }

  open(params: MenuOpenParams = {}): boolean {
    if (!super.open(params)) return false;

    global.stage.add_action_full('close-popup-gesture', Clutter.EventPhase.CAPTURE, this.clickGesture);
    return true;
  }

  close(params: MenuCloseParams = {}): boolean {
    if (!super.close(params)) return false;
    global.stage.remove_action(this.clickGesture);
    return true;
  }

  destroy(): void {
    global.stage.remove_action(this.clickGesture);
    super.destroy();
  }
}

export class LanguageSelectionPopup extends NoGrabPopup {
  constructor(actor: Clutter.Actor) {
    super(actor, St.Side.BOTTOM);

    const inputSourceManager = getInputSourceManager();
    for (const source of Object.values(inputSourceManager.inputSources)) {
      const item = this.addAction(source.displayName, () => inputSourceManager.activateInputSource(source, true));
      item.can_focus = false;
      item.setOrnament(source === inputSourceManager.currentSource ? Ornament.DOT : Ornament.NO_DOT);
    }

    this.addMenuItem(new PopupSeparatorMenuItem());
    this.addSettingsAction(KestrelUi.t('osk-keyboard-settings'), 'input').can_focus = false;
  }
}
