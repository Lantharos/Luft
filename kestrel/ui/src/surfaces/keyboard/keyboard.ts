import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import { styleSurface } from '../../appearance/kestrelGlass.js';
import { AspectContainer, Suggestions } from './containers.js';
import { KeyboardController } from './controller.js';
import { EmojiSelection } from './emoji/selection.js';
import { FocusLift, KEYBOARD_ANIMATION_TIME } from './focusLift.js';
import { FocusTracker } from './focusTracker.js';
import { isExtendedKey, type Key } from './key.js';
import { keyvalOf, levelsFor, type ModelKey } from './model.js';
import { KeyLevels } from './levels.js';
import { LanguageSelectionPopup } from './popups.js';
import { buildLevels, type KeyHandler } from './rows.js';

const KEYBOARD_REST_TIME = KEYBOARD_ANIMATION_TIME * 2;

const EMOJI_PURPOSES = new Set([
  Clutter.InputContentPurpose.NORMAL,
  Clutter.InputContentPurpose.ALPHA,
  Clutter.InputContentPurpose.PASSWORD,
  Clutter.InputContentPurpose.TERMINAL,
]);

export namespace Keyboard {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'visibility-changed': () => void;
  }
}

export const Keyboard = GObject.registerClass({
  Signals: {
    'visibility-changed': {},
  },
}, class Keyboard extends St.BoxLayout {
  declare connect: GObject.SignalMethods<this, Keyboard.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Keyboard.Signals>['emit'];

  private readonly focusTracker = new FocusTracker();
  private readonly focusLift: FocusLift;
  private readonly controller = new KeyboardController();
  private readonly suggestions = new Suggestions();
  private readonly aspectContainer = new AspectContainer({ layout_manager: new Clutter.BinLayout(), y_expand: true });
  private readonly emojiSelection = new EmojiSelection();
  private readonly levels = new KeyLevels();
  private currentLayout: Clutter.Actor | null = null;
  private languagePopup: LanguageSelectionPopup | null = null;
  private contentHints = 0;
  private focusInExtendedKeys = false;
  private emojiActive = false;
  private emojiVisible = false;
  private longPressed = false;
  private keyboardVisible = false;
  private keyboardRequested = false;
  private gestureInProgress = false;
  private showIdleId = 0;
  private keyboardRestingId = 0;
  private keyboardHeightNotifyId = 0;
  private surroundingTextId = 0;

  private readonly keyHandler: KeyHandler = {
    runAction: (key, button) => this.runAction(key, button),
    pressKeyval: keyval => {
      this.controller.keyvalPress(keyval);
      this.controller.keyvalRelease(keyval);
      this.updateLevelFromHints(true);
    },
    commit: text => {
      this.controller.commit(text, this.levels.modifiers).then(() => {
        this.levels.disableAllModifiers();
        this.updateLevelFromHints(true);
      }).catch(console.error);
    },
    latchLevel: level => {
      this.setActiveLevel(level);
      this.levels.setLatched(true);
      this.longPressed = true;
    },
    holdDelete: () => this.controller.toggleDelete(true),
  };

  constructor() {
    super({
      name: 'keyboard',
      reactive: true,
      text_direction: Clutter.TextDirection.LTR,
      orientation: Clutter.Orientation.VERTICAL,
    });
    styleSurface(this, 16);

    this.focusTracker.connectObject(
      'position-changed', () => this.onFocusPositionChanged(),
      'window-grabbed', () => this.onFocusWindowMoving(),
      'focus-changed', (_tracker: FocusTracker, focused: boolean) => this.onClientFocusChanged(focused), this);
    this.focusLift = new FocusLift(this, this.focusTracker, () => this.keyboardVisible, () => this.onFocusWindowMoving());

    Main.layoutManager.connectObject('monitors-changed', () => this.relayout(), this);

    this.setupKeyboard();

    this.connect('destroy', () => this.onDestroy());
  }

  get showing(): boolean {
    return this.keyboardVisible && this.visible;
  }

  open(immediate = false): void {
    this.clearShowIdle();
    this.keyboardRequested = true;

    if (this.keyboardVisible) {
      this.relayout();
      this.focusLift.liftChrome(true);
      return;
    }

    this.controller.setOskCompletion(true);
    this.clearKeyboardRestTimer();

    if (immediate) {
      this.openNow();
      return;
    }

    this.keyboardRestingId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, KEYBOARD_REST_TIME, () => {
      this.clearKeyboardRestTimer();
      this.openNow();
    });
    GLib.Source.set_name_by_id(this.keyboardRestingId, '[kestrel] this._clearKeyboardRestTimer');
  }

  close(immediate = false): void {
    this.clearShowIdle();
    this.keyboardRequested = false;

    if (!this.keyboardVisible) return;

    this.controller.setOskCompletion(false);
    this.clearKeyboardRestTimer();

    if (immediate) {
      this.closeNow();
      return;
    }

    this.keyboardRestingId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, KEYBOARD_REST_TIME, () => {
      this.clearKeyboardRestTimer();
      this.closeNow();
    });
    GLib.Source.set_name_by_id(this.keyboardRestingId, '[kestrel] this._clearKeyboardRestTimer');
  }

  releaseFocusWindow(): void {
    this.focusLift.setFocusWindow(null);
  }

  gestureProgress(delta: number): void {
    this.gestureInProgress = true;
    Main.layoutManager.keyboardBox.show();
    const progress = Math.min(delta, this.height) / this.height;
    this.translation_y = -this.height * progress;
    this.opacity = 255 * progress;
    this.focusLift.followGesture(this.height * progress);
  }

  gestureActivate(): void {
    this.open(true);
    this.gestureInProgress = false;
  }

  gestureCancel(): void {
    if (this.gestureInProgress) this.animateHide();
    this.gestureInProgress = false;
  }

  resetSuggestions(): void {
    this.suggestions.clear();
  }

  setSuggestionsVisible(visible: boolean): void {
    this.suggestions.setWordsVisible(visible);
  }

  addSuggestion(text: string, callback: () => void): void {
    this.suggestions.addWord(text, callback);
    this.suggestions.show();
  }

  private openOnFocus(): void {
    this.open(Main.layoutManager.focusIndex !== 0);
  }

  private onClientFocusChanged(focused: boolean): void {
    if (Main.inputMethod.currentFocus) return;

    if (focused) this.openOnFocus();
    else this.close();
  }

  private onFocusPositionChanged(): void {
    const rect = this.focusTracker.getCurrentRect();
    this.focusLift.setCursorLocation(this.focusTracker.currentWindow, rect.y, rect.height);
    this.updateLevelFromHints(true);
  }

  private onFocusWindowMoving(): void {
    this.focusLift.letGo();
    this.close(true);
  }

  private onDestroy(): void {
    this.focusLift.disconnect();
    this.focusTracker.destroy();

    this.clearShowIdle();
    this.stopWaitingForSurrounding();
    this.focusLift.liftChrome(false);

    this.controller.setOskCompletion(false);
    this.controller.destroy();

    Main.layoutManager.untrackChrome(this);
    Main.layoutManager.keyboardBox.remove_child(this);
    Main.layoutManager.keyboardBox.hide();

    this.languagePopup?.destroy();
    this.languagePopup = null;
  }

  private setupKeyboard(): void {
    Main.layoutManager.keyboardBox.add_child(this);
    Main.layoutManager.trackChrome(this);

    this.add_child(this.suggestions);
    this.add_child(this.aspectContainer);

    this.emojiSelection.connect('toggle', () => this.toggleEmoji());
    this.emojiSelection.connect('close-request', () => this.close(true));
    this.emojiSelection.connect('emoji-selected', (_selection, emoji) => {
      this.controller.commit(emoji).catch(console.error);
    });
    this.emojiSelection.hide();
    this.aspectContainer.add_child(this.emojiSelection);

    this.updateKeys();

    this.controller.connectObject(
      'group-changed', () => this.updateKeys(),
      'panel-state', (_controller: KeyboardController, state: Clutter.InputPanelState) => this.onKeyboardStateChanged(state),
      'purpose-changed', () => this.updateKeys(),
      'content-hints-changed', (_controller: KeyboardController, hints: Clutter.InputContentHintFlags) => this.onContentHintsChanged(hints),
      this);
    global.stage.connectObject('notify::key-focus', () => this.onKeyFocusChanged(), this);

    this.relayout();
    this.onKeyFocusChanged();
  }

  private shouldShowEmoji(): boolean {
    if ((this.contentHints & Clutter.InputContentHintFlags.NO_EMOJI) !== 0) return false;
    return EMOJI_PURPOSES.has(this.controller.purpose);
  }

  private onContentHintsChanged(contentHints: Clutter.InputContentHintFlags): void {
    this.contentHints = contentHints;
    this.stopWaitingForSurrounding();

    if (this.showing && (contentHints & Clutter.InputContentHintFlags.INHIBIT_OSK) !== 0) this.close();
    else if (this.shouldShowEmoji() !== this.emojiVisible) this.updateKeys();
    else this.updateLevelFromHints(false);
  }

  private updateLevelFromHints(userInputHappened: boolean): void {
    if (this.levels.latched) return;

    if ((this.contentHints & Clutter.InputContentHintFlags.LOWERCASE) !== 0) {
      this.setActiveLevel('default');
      return;
    }

    if (!this.levels.has('shift')) return;

    if ((this.contentHints & Clutter.InputContentHintFlags.UPPERCASE) !== 0) {
      this.setActiveLevel('shift');
      return;
    }

    if ((this.contentHints & (Clutter.InputContentHintFlags.AUTO_CAPITALIZATION | Clutter.InputContentHintFlags.TITLECASE)) !== 0) {
      if (this.surroundingTextId) return;

      this.surroundingTextId = Main.inputMethod.connect('surrounding-text-set', () => this.levelFromSurroundingText());
      Main.inputMethod.request_surrounding();
      return;
    }

    if (userInputHappened && this.levels.isActive('shift')) this.setActiveLevel('default');
  }

  private levelFromSurroundingText(): void {
    const [text, cursor] = Main.inputMethod.getSurroundingText();
    if (!text || cursor === 0) {
      this.setActiveLevel('shift');
      return;
    }

    const beforeCursor = GLib.utf8_substring(text, 0, cursor);

    if ((this.contentHints & Clutter.InputContentHintFlags.TITLECASE) !== 0)
      this.setActiveLevel(beforeCursor.charAt(beforeCursor.length - 1) === ' ' ? 'shift' : 'default');
    else if ((this.contentHints & Clutter.InputContentHintFlags.AUTO_CAPITALIZATION) !== 0)
      this.setActiveLevel(beforeCursor.charAt(beforeCursor.trimEnd().length - 1) === '.' ? 'shift' : 'default');

    this.stopWaitingForSurrounding();
  }

  private stopWaitingForSurrounding(): void {
    if (!this.surroundingTextId) return;
    Main.inputMethod.disconnect(this.surroundingTextId);
    this.surroundingTextId = 0;
  }

  private onKeyFocusChanged(): void {
    const focus = global.stage.key_focus;

    const extendedKeysWereFocused = this.focusInExtendedKeys;
    this.focusInExtendedKeys = focus !== null && isExtendedKey(focus);
    if (this.focusInExtendedKeys || extendedKeysWereFocused) return;

    if (!(focus instanceof Clutter.Text)) {
      this.close();
      return;
    }

    if (this.showIdleId) return;
    this.showIdleId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.openOnFocus();
      this.showIdleId = 0;
    });
    GLib.Source.set_name_by_id(this.showIdleId, '[kestrel] this.open');
  }

  private updateKeys(): void {
    const model = levelsFor(this.controller.getCurrentGroup(), this.controller.purpose);
    if (model) {
      this.emojiVisible = this.shouldShowEmoji();

      const levels = buildLevels(model, this.emojiVisible, this.keyHandler);
      this.aspectContainer.add_child(levels.layout);
      this.currentLayout?.destroy();
      this.currentLayout = levels.layout;
      this.levels.replace(levels);
    }
    this.setActiveLevel('default');
  }

  private runAction(key: ModelKey, button: Key): void {
    if (key.action === 'hide') {
      this.close(true);
      this.updateLevelFromHints(true);
    } else if (key.action === 'languageMenu') {
      this.popupLanguageMenu(button);
    } else if (key.action === 'emoji') {
      this.toggleEmoji();
    } else if (key.action === 'modifier') {
      this.levels.toggleModifier(keyvalOf(key));
    } else if (key.action === 'delete') {
      this.controller.toggleDelete(true);
      this.controller.toggleDelete(false);
      this.updateLevelFromHints(true);
    } else if (!this.longPressed && key.action === 'levelSwitch') {
      this.setActiveLevel(key.level!);
      this.levels.setLatched(false);
    }

    this.longPressed = false;
  }

  private popupLanguageMenu(keyActor: Key): void {
    this.languagePopup?.destroy();
    this.languagePopup = new LanguageSelectionPopup(keyActor);
    Main.layoutManager.addKeyboardChrome(this.languagePopup.actor);
    this.languagePopup.open();
  }

  private updateCurrentPageVisible(): void {
    const page = this.levels.page;
    if (page) page.visible = !this.emojiActive;
  }

  private setEmojiActive(active: boolean): void {
    this.emojiActive = active;
    this.emojiSelection.visible = active;
    this.updateCurrentPageVisible();
  }

  private toggleEmoji(): void {
    this.setEmojiActive(!this.emojiActive);
  }

  private relayout(): void {
    const monitor = Main.layoutManager.keyboardMonitor;
    const [minHeight] = this.get_preferred_height(-1);

    if (!monitor) return;

    this.width = monitor.width;
    const height = monitor.width > monitor.height ? monitor.height / 3 : monitor.height / 4;
    this.height = Math.min(Math.max(height, minHeight), monitor.height / 2);
  }

  private onKeyboardStateChanged(state: Clutter.InputPanelState): void {
    let enabled: boolean;
    if (state === Clutter.InputPanelState.OFF) enabled = false;
    else if (state === Clutter.InputPanelState.ON) enabled = true;
    else if (state === Clutter.InputPanelState.TOGGLE) enabled = !this.keyboardVisible;
    else return;

    if ((this.contentHints & Clutter.InputContentHintFlags.INHIBIT_OSK) !== 0) enabled = false;

    if (enabled) this.openOnFocus();
    else this.close(true);
  }

  private setActiveLevel(level: string): void {
    const page = this.levels.setActive(level);
    this.updateCurrentPageVisible();
    if (!page) return;

    this.aspectContainer.setRatio(...page.getRatio());
    this.emojiSelection.setRatio(...page.getRatio());
  }

  private clearKeyboardRestTimer(): void {
    if (!this.keyboardRestingId) return;
    GLib.source_remove(this.keyboardRestingId);
    this.keyboardRestingId = 0;
  }

  private clearShowIdle(): void {
    if (!this.showIdleId) return;
    GLib.source_remove(this.showIdleId);
    this.showIdleId = 0;
  }

  private openNow(): void {
    if (!this.keyboardRequested) return;

    this.relayout();
    this.animateShow();
    this.setEmojiActive(false);
  }

  private closeNow(): void {
    if (this.keyboardRequested) return;

    this.animateHide();
    this.focusLift.setFocusWindow(null);
    this.levels.disableAllModifiers();
  }

  private animateShow(): void {
    global.compositor.disable_unredirect();

    this.focusLift.slideWindow(true);

    Main.layoutManager.keyboardBox.show();
    this.ease({
      translation_y: -this.height,
      opacity: 255,
      duration: KEYBOARD_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.keyboardHeightNotifyId = Main.layoutManager.keyboardBox.connect('notify::height', () => {
          this.translation_y = -this.height;
        });
      },
    });
    this.keyboardVisible = true;
    this.emit('visibility-changed');
    this.focusLift.liftChrome(true);
  }

  private animateHide(): void {
    this.focusLift.slideWindow(false);
    this.focusLift.liftChrome(false);

    if (this.keyboardHeightNotifyId) {
      Main.layoutManager.keyboardBox.disconnect(this.keyboardHeightNotifyId);
      this.keyboardHeightNotifyId = 0;
    }
    this.ease({
      translation_y: 0,
      opacity: 0,
      duration: KEYBOARD_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => {
        Main.layoutManager.keyboardBox.hide();
        global.compositor.enable_unredirect();
      },
    });

    this.keyboardVisible = false;
    this.emit('visibility-changed');
  }
});

export type Keyboard = InstanceType<typeof Keyboard>;
