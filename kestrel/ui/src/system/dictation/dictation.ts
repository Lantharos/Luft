import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';
import { getInputSourceManager } from 'resource:///com/lantharos/kestrel/ui/status/keyboard.js';

import type { Context } from '../../context.js';
import { openSettings } from '../settingsPages.js';
import { DictationIndicator } from './indicator.js';
import { NotInstalled, Speech } from './speech.js';

const HELD_MODIFIERS = Clutter.ModifierType.SHIFT_MASK | Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK;
const MODIFIER_POLL_MS = 20;
const MODIFIER_WAIT_MS = 1000;

type Phase = 'idle' | 'listening' | 'finishing';

const shell = () => global as unknown as Shell.Global;
const prependFilter = (Clutter.Event as unknown as { prepend_filter: typeof Clutter.Event.add_filter }).prepend_filter;

function currentLayout(): string {
  const manager = getInputSourceManager();
  const source = manager.currentSource;
  return source?.type === 'xkb' ? source.id : manager.keyboardManager.currentLayout?.id ?? '';
}

function afterModifiersAreReleased(run: () => void): void {
  const deadline = GLib.get_monotonic_time() + MODIFIER_WAIT_MS * 1000;
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, MODIFIER_POLL_MS, () => {
    const [, , modifiers] = shell().get_pointer();
    if (modifiers & HELD_MODIFIERS && GLib.get_monotonic_time() < deadline) return GLib.SOURCE_CONTINUE;
    run();
    return GLib.SOURCE_REMOVE;
  });
}

export class Dictation {
  private readonly preferences = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.dictation' });
  private readonly speech: Speech;
  private readonly indicator: DictationIndicator;
  private phase: Phase = 'idle';
  private started: Promise<boolean> = Promise.resolve(false);
  private session = 0;
  private target: Clutter.InputFocus | null = null;
  private escapeFilter = 0;
  private offeredSetup = false;

  constructor(private readonly context: Context, private readonly paste: (text: string) => void) {
    this.indicator = new DictationIndicator(context);
    this.speech = new Speech(text => this.heard(text), level => {
      if (this.phase === 'listening') this.indicator.level(level);
    });
  }

  begin(): void {
    if (!this.preferences.get_boolean('enabled')) {
      if (!this.offeredSetup) this.offerSetup();
      return;
    }
    const session = ++this.session;
    this.phase = 'listening';
    this.target = this.context.inputMethod.currentFocus;
    this.indicator.show(this.context.inputMethod.caret, !this.target);
    this.listenForEscape();
    this.started = this.speech.start(currentLayout()).then(() => true, error => {
      if (session !== this.session) return false;
      this.finish();
      if (error instanceof NotInstalled) this.offerSetup();
      else console.warn(`Dictation couldn't start: ${error}`);
      return false;
    });
  }

  end(): void {
    if (this.phase !== 'listening') return;
    const session = this.session;
    this.phase = 'finishing';
    this.indicator.finishing();
    this.stopListeningForEscape();
    this.started
      .then(started => started ? this.speech.stop() : '')
      .then(text => {
        if (session === this.session) this.deliver(text);
      }, error => {
        if (session === this.session) console.warn(`Dictation couldn't finish: ${error}`);
      })
      .finally(() => {
        if (session === this.session) this.finish();
      });
  }

  private cancel(): void {
    if (this.phase === 'idle') return;
    this.session++;
    this.speech.cancel();
    this.finish();
  }

  private heard(text: string): void {
    if (this.phase === 'idle') return;
    if (this.target && this.target === this.context.inputMethod.currentFocus) this.context.inputMethod.showPreedit(text);
    else this.indicator.heard(text);
  }

  private deliver(text: string): void {
    this.clearPreedit();
    if (!text) return;
    if (this.context.inputMethod.currentFocus) this.context.inputMethod.commit(text);
    else afterModifiersAreReleased(() => this.paste(text));
  }

  private clearPreedit(): void {
    if (this.target && this.target === this.context.inputMethod.currentFocus) this.context.inputMethod.showPreedit(null);
  }

  private finish(): void {
    this.clearPreedit();
    this.stopListeningForEscape();
    this.phase = 'idle';
    this.target = null;
    this.indicator.hide();
  }

  private listenForEscape(): void {
    this.escapeFilter = prependFilter(null, event => {
      if (event.type() !== Clutter.EventType.KEY_PRESS || event.get_key_symbol() !== Clutter.KEY_Escape) return Clutter.EVENT_PROPAGATE;
      this.cancel();
      return Clutter.EVENT_STOP;
    });
  }

  private stopListeningForEscape(): void {
    if (this.escapeFilter) Clutter.Event.remove_filter(this.escapeFilter);
    this.escapeFilter = 0;
  }

  private offerSetup(): void {
    this.offeredSetup = true;
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source,
      title: 'Type by speaking',
      body: 'Hold the Copilot key and talk to type what you say. It listens on this computer, so it needs its speech model first.',
      gicon: new Gio.ThemedIcon({ name: 'audio-input-microphone-symbolic' }),
    });
    notification.addAction('Set up dictation', () => openSettings('keyboard/dictation'));
    source.addNotification(notification);
  }

  destroy(): void {
    this.cancel();
    this.speech.destroy();
    this.indicator.destroy();
  }
}
