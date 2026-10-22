import St from 'gi://St';

import { t } from '../../../shared/i18n/index.js';
import { describe, withTone, type Item } from '../../emoji/catalog/catalog.js';
import { builtEmojiData, prepareEmojiData } from '../../emoji/catalog/shared.js';
import { prewarmSoon } from '../../prewarm/queue.js';
import { EmojiPreferences } from '../../emoji/preferences.js';
import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { fold, type Query } from '../ranking.js';

const LIMIT = 4;
const SHORTEST_QUERY = 3;
const SCORE = 3.6;


export class EmojiResults {
  private readonly preferences = new EmojiPreferences(() => {});
  private stopPreparing = () => {};

  constructor(private readonly paste: (text: string) => void, private readonly close: () => void) {}

  prepare(): void {
    if (builtEmojiData()) return;
    this.stopPreparing();
    this.stopPreparing = prewarmSoon([() => prepareEmojiData()]);
  }

  destroy(): void {
    this.stopPreparing();
  }

  find(search: Query): Ranked[] {
    const data = builtEmojiData();
    if (!data || search.text.length < SHORTEST_QUERY) return [];
    return data.index.search(search.text)
      .filter(item => item.kind === 'emoji' && [item.name, ...item.aliases].some(name => fold(name).startsWith(search.text)))
      .slice(0, LIMIT)
      .map((item, index) => ({ item: this.item(item), score: SCORE + index / 100 }));
  }

  private item(item: Item): SearchItem {
    const text = withTone(item, this.preferences.tone);
    const insert = () => {
      this.preferences.remember(item.text);
      this.close();
      this.paste(text);
    };
    return {
      key: `emoji:${item.text}`, title: describe(item), description: '', icon: themedIcon('face-smile-symbolic'), glyph: text,
      preview: { kind: 'glyph', text },
      activate: insert,
      menu: () => [
        { label: t('start-search-emoji-insert'), run: insert },
        { label: t('start-search-copy'), run: () => { St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, text); this.close(); } },
      ],
    };
  }
}
