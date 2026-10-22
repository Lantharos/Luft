import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { locale } from '../../../shared/i18n/index.js';
import type { Work } from '../../prewarm/queue.js';
import { annotate, annotationPaths } from './annotations.js';
import { buildCatalog, type Catalog, type EmojiGroups } from './catalog.js';
import type { CharacterTable } from './characters.js';
import { SearchIndex } from './search.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');

const EMOJI = '/com/lantharos/kestrel/osk-layouts/emoji.json';
const INDEX_CHUNK = 250;

interface EmojiData {
  locale: string;
  catalog: Catalog;
  index: SearchIndex;
}

interface Files {
  characters: Uint8Array;
  annotations: (Uint8Array | null)[];
}

const decoder = new TextDecoder();
const paths = () => [`${global.datadir}/characters.json`, ...annotationPaths()];

function readSync(path: string): Uint8Array | null {
  try {
    return GLib.file_get_contents(path)[1];
  } catch {
    return null;
  }
}

async function read(path: string): Promise<Uint8Array | null> {
  try {
    return (await Gio.File.new_for_path(path).load_contents_async(null))[0];
  } catch {
    return null;
  }
}

function files([characters, ...annotations]: (Uint8Array | null)[]): Files {
  return { characters: characters!, annotations };
}

function* steps(locale: string, { characters, annotations }: Files): Generator<void, EmojiData, unknown> {
  const groups: EmojiGroups = JSON.parse(decoder.decode(Gio.resources_lookup_data(EMOJI, Gio.ResourceLookupFlags.NONE).toArray()));
  const table: CharacterTable = JSON.parse(decoder.decode(characters));
  yield;
  const catalog = yield* buildCatalog(groups, table);
  yield* annotate(catalog, annotations);
  return { locale, catalog, index: new SearchIndex(catalog.items) };
}

class Build {
  readonly locale = locale();
  data: EmojiData | null = null;
  private files: Files | null = null;
  private steps: Generator<void, EmojiData, unknown> | null = null;

  *prepare(): Work {
    if (!this.files) {
      const contents = (yield Promise.all(paths().map(read))) as (Uint8Array | null)[];
      this.files ??= files(contents);
    }
    while (!this.step()) yield;
    for (const { index } = this.data!; !index.complete; yield) index.extend(INDEX_CHUNK);
  }

  finish(): EmojiData {
    this.files ??= files(paths().map(readSync));
    while (!this.step());
    return this.data!;
  }

  private step(): boolean {
    if (this.data) return true;
    this.steps ??= steps(this.locale, this.files!);
    const next = this.steps.next();
    if (next.done) this.data = next.value;
    return !!next.done;
  }
}

let build: Build | null = null;

function current(): Build {
  if (build?.locale !== locale()) build = new Build();
  return build;
}

export function builtEmojiData(): EmojiData | null {
  return build?.locale === locale() ? build.data : null;
}

export function emojiData(): EmojiData {
  return current().finish();
}

export function prepareEmojiData(): Work {
  return current().prepare();
}
