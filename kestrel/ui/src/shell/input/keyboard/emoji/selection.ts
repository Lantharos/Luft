import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../../../kestrelUi.js';
import { PageIndicators } from '../../../widgets/pageIndicators.js';
import { AspectContainer, KeyContainer } from '../containers.js';
import { Key } from '../key.js';
import { loadResource } from '../model.js';
import { EmojiPager, type EmojiKey, type EmojiSection } from './pager.js';

const SKIN_TONES = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];

const SECTIONS = [
  { group: 'smileys', label: '🙂️' },
  { group: 'people', label: '👍️' },
  { group: 'nature', label: '🌷️' },
  { group: 'food', label: '🍴️' },
  { group: 'travel', label: '✈️' },
  { group: 'activities', label: '🏃️' },
  { group: 'objects', label: '🔔️' },
  { group: 'symbols', label: '❤️' },
  { group: 'flags', label: '🚩️' },
];

type EmojiEntry = string | [label: string, light: string];

function emojiKey(entry: EmojiEntry): EmojiKey {
  if (typeof entry === 'string') return { label: entry, variants: [] };
  const [label, light] = entry;
  return { label, variants: [label, ...SKIN_TONES.map(tone => light.replaceAll(SKIN_TONES[0], tone))] };
}

function loadSections(): EmojiSection[] {
  const groups = new Map(loadResource<{ group: string; emoji: EmojiEntry[] }[]>('emoji').map(({ group, emoji }) => [group, emoji]));
  return SECTIONS.map(section => ({ ...section, keys: groups.get(section.group)!.map(emojiKey) }));
}

export namespace EmojiSelection {
  export interface Signals extends St.Widget.SignalSignatures {
    'emoji-selected': (emoji: string) => void;
    'close-request': () => void;
    'toggle': () => void;
  }
}

export const EmojiSelection = GObject.registerClass({
  Signals: {
    'emoji-selected': { param_types: [GObject.TYPE_STRING] },
    'close-request': {},
    'toggle': {},
  },
}, class EmojiSelection extends St.Widget {
  declare connect: GObject.SignalMethods<this, EmojiSelection.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, EmojiSelection.Signals>['emit'];

  private readonly sections = loadSections();
  private readonly grid: Clutter.GridLayout;
  private readonly pagerBox = new Clutter.Actor({
    layout_manager: new Clutter.BoxLayout({ orientation: Clutter.Orientation.VERTICAL }),
  });
  private readonly emojiPager = new EmojiPager(this.sections);
  private readonly pageIndicator = new PageIndicators(Clutter.Orientation.HORIZONTAL);
  private readonly bottomRow: AspectContainer;
  private currentPage = 0;

  constructor() {
    const grid = new Clutter.GridLayout({
      orientation: Clutter.Orientation.HORIZONTAL,
      column_homogeneous: true,
      row_homogeneous: true,
    });
    super({
      layout_manager: grid,
      style_class: 'emoji-panel',
      x_expand: true,
      y_expand: true,
      text_direction: global.stage.text_direction,
    });
    this.grid = grid;

    this.emojiPager.connect('page-changed', (_pager, page, nPages) => this.onPageChanged(page, nPages));
    this.emojiPager.connect('emoji', (_pager, emoji) => this.emit('emoji-selected', emoji));
    this.pagerBox.add_child(this.emojiPager);

    this.pageIndicator.y_expand = false;
    this.pageIndicator.y_align = Clutter.ActorAlign.START;
    this.pagerBox.add_child(this.pageIndicator);
    this.pageIndicator.setReactive(false);

    this.emojiPager.connect('notify::delta', () => this.updateIndicatorPosition());

    this.bottomRow = this.createBottomRow();
  }

  vfunc_map(): void {
    this.emojiPager.setCurrentPage(0);
    super.vfunc_map();
  }

  setRatio(nCols: number, nRows: number): void {
    this.emojiPager.setRatio(Math.floor(nCols), Math.floor(nRows) - 1);
    this.bottomRow.setRatio(nCols, 1);

    if (this.pagerBox.get_parent()) this.remove_child(this.pagerBox);
    if (this.bottomRow.get_parent()) this.remove_child(this.bottomRow);

    this.grid.attach(this.pagerBox, 0, 0, 1, Math.floor(nRows) - 1);
    this.grid.attach(this.bottomRow, 0, Math.floor(nRows) - 1, 1, 1);
  }

  private onPageChanged(page: number, nPages: number): void {
    this.currentPage = page;
    this.pageIndicator.setNPages(nPages);
    this.updateIndicatorPosition();
  }

  private updateIndicatorPosition(): void {
    this.pageIndicator.setCurrentPosition(this.currentPage - this.emojiPager.delta / this.emojiPager.width);
  }

  private createBottomRow(): AspectContainer {
    const row = new KeyContainer();
    row.appendRow();

    const letters = new Key({ label: KestrelUi.t('osk-letters-key'), hasAction: true }, []);
    letters.keyButton.add_style_class_name('default-key');
    letters.connect('released', () => this.emit('toggle'));
    row.appendKey(letters, 1.5);

    for (const section of this.sections) {
      const key = new Key({ label: section.label }, []);
      key.connect('released', () => this.emojiPager.setCurrentSection(section, 0));
      row.appendKey(key);
    }

    const hide = new Key({ iconName: 'osk-hide-symbolic', hasAction: true });
    hide.keyButton.add_style_class_name('default-key');
    hide.keyButton.add_style_class_name('hide-key');
    hide.connect('released', () => this.emit('close-request'));
    row.appendKey(hide);

    const actor = new AspectContainer({
      layout_manager: new Clutter.BinLayout(),
      x_expand: true,
      y_expand: true,
    });
    actor.add_child(row);
    return actor;
  }
});

export type EmojiSelection = InstanceType<typeof EmojiSelection>;
