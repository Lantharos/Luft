import { locale } from '../../../shared/i18n/index.js';
import { annotate } from './annotations.js';
import { Catalog } from './catalog.js';
import { SearchIndex } from './search.js';

interface EmojiData {
  locale: string;
  catalog: Catalog;
  index: SearchIndex;
}

let data: EmojiData | null = null;

export function builtEmojiData(): EmojiData | null {
  return data?.locale === locale() ? data : null;
}

export function emojiData(): EmojiData {
  if (data?.locale === locale()) return data;
  const catalog = new Catalog();
  annotate(catalog);
  data = { locale: locale(), catalog, index: new SearchIndex(catalog.items) };
  return data;
}
