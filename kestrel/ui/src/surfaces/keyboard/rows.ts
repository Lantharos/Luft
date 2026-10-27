import Clutter from 'gi://Clutter';

import * as KestrelUi from '../../kestrelUi.js';
import type { Sound } from '../../system/sounds/catalog.js';
import { KeyContainer } from './containers.js';
import { Key } from './key.js';
import { keyvalOf, type ModelKey, type ModelLevel } from './model.js';

export interface KeyHandler {
  runAction(key: ModelKey, button: Key): void;
  pressKeyval(keyval: number): void;
  commit(text: string): void;
  latchLevel(level: string): void;
  holdDelete(): void;
  releaseDelete(): void;
}

export interface Levels {
  layout: Clutter.Actor;
  layers: Record<string, KeyContainer>;
  modifierKeys: Map<number, Key[]>;
}

function tapSound(key: ModelKey, commitString?: string): Sound {
  if (key.action === 'delete') return 'keyboard-tap-delete';
  return commitString === ' ' ? 'keyboard-tap-space' : 'keyboard-tap';
}

function addRowKeys(keys: ModelKey[], layout: KeyContainer, emojiVisible: boolean, handler: KeyHandler, modifierKeys: Map<number, Key[]>): void {
  let accumulatedWidth = 0;
  for (const key of keys) {
    const commitString = key.strings?.shift();

    if (key.action === 'emoji' && !emojiVisible) {
      accumulatedWidth = key.width ?? 1;
      continue;
    }

    if (accumulatedWidth > 0) {
      key.width = (key.width ?? 1) + accumulatedWidth;
      accumulatedWidth = 0;
    }

    const keyval = keyvalOf(key);
    const button = new Key({
      commitString,
      label: key.label,
      iconName: key.iconName,
      keyval,
      hasAction: !!key.action,
    }, key.strings);
    const tap = tapSound(key, commitString);
    button.connect('released', () => KestrelUi.playSound(tap));

    if (key.action) button.connect('released', () => handler.runAction(key, button));
    else if (key.keyval) button.connect('keyval', (_button, value) => handler.pressKeyval(value));
    else button.connect('commit', (_button, text) => handler.commit(text));

    if (key.action === 'levelSwitch' && key.iconName === 'osk-shift-symbolic') {
      layout.shiftKeys.push(button);
      if (key.level === 'shift') button.connect('long-press', () => handler.latchLevel('shift'));
    }

    if (key.action === 'delete') {
      button.connect('long-press', () => handler.holdDelete());
      button.connect('long-press-end', () => handler.releaseDelete());
    }

    if (key.action === 'modifier') modifierKeys.set(keyval, [...modifierKeys.get(keyval) ?? [], button]);

    if (key.action || key.keyval) button.keyButton.add_style_class_name('default-key');

    layout.appendKey(button, key.width, key.height, key.leftOffset);
  }
}

export function buildLevels(levels: ModelLevel[], emojiVisible: boolean, handler: KeyHandler): Levels {
  const layout = new Clutter.Actor({
    layout_manager: new Clutter.BinLayout(),
    x_expand: true,
    y_expand: true,
  });
  const layers: Record<string, KeyContainer> = {};
  const modifierKeys = new Map<number, Key[]>();

  for (const level of levels) {
    const levelLayout = new KeyContainer();
    for (const row of level.rows) {
      levelLayout.appendRow();
      addRowKeys(row, levelLayout, emojiVisible, handler, modifierKeys);
    }

    layers[level.level] = levelLayout;
    layout.add_child(levelLayout);
    levelLayout.hide();
  }

  return { layout, layers, modifierKeys };
}
