import { t } from '../../../shared/i18n/index.js';
import type { MenuEntry } from '../../../desktop/menus/contextMenus.js';
import type { ClipboardEntry } from '../../clipboard/history.js';
import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { fold, rank, searchable, type Query } from '../ranking.js';

const LIMIT = 3;
const BIAS = 0.5;
const TITLE_LENGTH = 120;

export interface ClipboardSource {
  readonly entries: readonly ClipboardEntry[];
  paste(entry: ClipboardEntry): void;
  keep(entry: ClipboardEntry): void;
}

const searchWords = () => t('start-search-clipboard-keywords').split(',').map(word => fold(word.trim())).filter(Boolean);
const oneLine = (text: string) => text.trim().replace(/\s+/g, ' ').slice(0, TITLE_LENGTH);

export class ClipboardResults {
  constructor(private readonly source: ClipboardSource, private readonly close: () => void) {}

  find(search: Query): Ranked[] {
    const entries = this.source.entries;
    if (searchWords().some(word => word.startsWith(search.text)))
      return entries.slice(0, LIMIT).map((entry, index) => ({ item: this.item(entry, index), score: 3 + BIAS + index / 100 }));
    const texts = entries.flatMap((entry, index) => entry.kind === 'text' ? [searchable({ entry, index }, `clipboard:${index}`, oneLine(entry.text), [])] : []);
    return rank(texts, search, BIAS + 1, () => 0).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry.entry, entry.index), score }));
  }

  private item(entry: ClipboardEntry, index: number): SearchItem {
    const menu = (): MenuEntry[] => [
      { label: t('clipboard-paste'), run: () => this.source.paste(entry) },
      { label: t('clipboard-copy'), run: () => { this.source.keep(entry); this.close(); } },
    ];
    const common = { key: `clipboard:${index}`, icon: themedIcon('edit-paste-symbolic'), activate: () => this.source.paste(entry), menu };
    return entry.kind === 'text'
      ? { ...common, title: oneLine(entry.text), description: t('start-search-clipboard-text'), preview: { kind: 'text', text: entry.text } }
      : { ...common, title: t('clipboard-image', { width: entry.thumbnail.imageWidth, height: entry.thumbnail.imageHeight }), description: t('start-search-clipboard-text'), preview: { kind: 'image', thumbnail: entry.thumbnail } };
  }
}
