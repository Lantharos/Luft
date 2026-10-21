import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import type { ContextMenus } from '../../desktop/menus/contextMenus.js';
import { t } from '../../shared/i18n/index.js';
import { launchHistory } from '../../shared/launchHistory.js';
import type { QuickSettingsSource } from '../quickSettings/quickControls.js';
import { Calculator } from './calculator/calculator.js';
import { CurrencyRates } from './calculator/rates.js';
import { fileIndex, type MentioningFile, type NamedFile } from './files/index.js';
import { FileOpener, shortFolder } from './files/items.js';
import { RecentFiles } from './files/recent.js';
import type { GroupId, Ranked, SearchGroup, SearchItem, SearchView } from './item.js';
import { ActionResults } from './providers/actions.js';
import { AnswerResults } from './providers/answers.js';
import { AppResults } from './providers/apps.js';
import { ClipboardResults, type ClipboardSource } from './providers/clipboard.js';
import { CommandResults } from './providers/commands.js';
import { EmojiResults } from './providers/emoji.js';
import { SettingsResults } from './providers/settings.js';
import { WebSearch } from './providers/web.js';
import { WindowResults } from './providers/windows.js';
import { fold, query, type Query } from './ranking.js';

const FILE_LIMIT = 6;
const CONTENT_LIMIT = 4;
const SUGGESTED_APPS = 6;
const SUGGESTED_WINDOWS = 5;
const NAME_BIAS = 0.8;
const SHORTEST_NAME_QUERY = 2;
const SHORTEST_EXTRA_QUERY = 2;
const SHORTEST_CONTENT_QUERY = 3;
const CONTENT_DELAY = 120;
const TITLES = {
  apps: 'start-search-group-apps', commands: 'start-search-group-commands', windows: 'start-search-group-windows',
  actions: 'start-search-group-actions', settings: 'start-search-group-settings', clipboard: 'start-search-group-clipboard',
  emoji: 'start-search-group-emoji', files: 'start-search-group-files', contents: 'start-search-group-contents', web: 'start-search-group-web',
} as const satisfies Record<GroupId, string>;

export interface SearchHost {
  menus: ContextMenus;
  quickSettings: QuickSettingsSource;
  clipboard: ClipboardSource;
  paste(text: string): void;
  activateWindow(window: Meta.Window): void;
  close(): void;
}

interface Lookup<T> {
  text: string;
  found: T[];
}

interface Instant {
  answer: SearchItem | null;
  groups: [GroupId, Ranked[]][];
}

const basename = (path: string) => GLib.path_get_basename(path);
const uri = (path: string) => GLib.filename_to_uri(path, null);

export class SearchEngine {
  private readonly apps: AppResults;
  private readonly commands: CommandResults;
  private readonly windows: WindowResults;
  private readonly actions: ActionResults;
  private readonly settings: SettingsResults;
  private readonly clipboard: ClipboardResults;
  private readonly emoji: EmojiResults;
  private readonly calculator: Calculator;
  private readonly answers: AnswerResults;
  private readonly web: WebSearch;
  private readonly rates = new CurrencyRates(() => {
    if (this.text) this.emit(false, true);
  });
  private readonly recent = new RecentFiles();
  private readonly opener: FileOpener;
  private text = '';
  private search: Query = query('');
  private names: Lookup<NamedFile> = { text: '', found: [] };
  private mentions: Lookup<MentioningFile> = { text: '', found: [] };
  private waiting = new Set<'names' | 'mentions'>();
  private instant: Instant = { answer: null, groups: [] };
  private cancellable: Gio.Cancellable | null = null;
  private sources: number[] = [];
  private preparing = 0;

  constructor(host: SearchHost, private readonly show: (view: SearchView | null) => void) {
    this.apps = new AppResults(host.menus, host.close);
    this.commands = new CommandResults(host.close);
    this.windows = new WindowResults(host.activateWindow, host.close);
    this.actions = new ActionResults(host.quickSettings, host.close);
    this.settings = new SettingsResults(host.close);
    this.clipboard = new ClipboardResults(host.clipboard, host.close);
    this.emoji = new EmojiResults(host.paste, host.close);
    this.calculator = new Calculator(host.close);
    this.answers = new AnswerResults(host.close);
    this.web = new WebSearch(host.close);
    this.opener = new FileOpener(host.close);
  }

  update(apps: Gio.AppInfo[]): void {
    this.apps.update(apps);
    this.commands.update(apps);
    if (this.text) this.emit(false, true);
  }

  prepare(): void {
    if (this.preparing) return;
    this.preparing = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.preparing = 0;
      void this.recent.refresh().then(changed => {
        if (changed && this.text) this.emit(false);
      });
      fileIndex.refresh();
      this.rates.prepare();
      this.answers.prepare();
      this.emoji.prepare();
      return GLib.SOURCE_REMOVE;
    });
  }

  setText(text: string): void {
    const trimmed = text.trim();
    if (trimmed === this.text) return;
    this.text = trimmed;
    this.stopLookUps();
    if (!trimmed) {
      this.waiting.clear();
      this.show(null);
      return;
    }
    this.search = query(trimmed);
    this.rates.want(trimmed);
    this.lookUp(trimmed);
    this.emit(true, true);
  }

  suggestions(): SearchView {
    const groups: [GroupId, SearchItem[]][] = [
      ['apps', this.apps.frequent(launchHistory.weigher(), SUGGESTED_APPS)],
      ['windows', this.windows.recent(SUGGESTED_WINDOWS)],
    ];
    return { best: null, groups: groups.filter(([, items]) => items.length).map(([id, items]) => ({ title: t(TITLES[id]), items })), pending: false, fresh: true };
  }

  destroy(): void {
    this.stopLookUps();
    this.rates.destroy();
    this.answers.destroy();
    this.emoji.destroy();
    if (this.preparing) GLib.source_remove(this.preparing);
  }

  private stopLookUps(): void {
    this.cancellable?.cancel();
    for (const source of this.sources.splice(0)) GLib.source_remove(source);
  }

  private later(add: (callback: () => boolean) => number, run: () => void): void {
    const source = add(() => {
      this.sources = this.sources.filter(pending => pending !== source);
      run();
      return GLib.SOURCE_REMOVE;
    });
    this.sources.push(source);
  }

  private lookUp(text: string): void {
    const cancellable = this.cancellable = new Gio.Cancellable();
    this.waiting.clear();
    if (text.length >= SHORTEST_NAME_QUERY) {
      this.waiting.add('names');
      this.later(callback => GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, callback), () => {
        void fileIndex.names(text, FILE_LIMIT * 2, cancellable).then(found => {
          if (cancellable.is_cancelled()) return;
          this.waiting.delete('names');
          this.names = { text, found: found ?? [] };
          this.emit(false);
        });
      });
    }
    if (text.length < SHORTEST_CONTENT_QUERY) return;
    this.waiting.add('mentions');
    this.later(callback => GLib.timeout_add(GLib.PRIORITY_DEFAULT, CONTENT_DELAY, callback), () => {
      void fileIndex.contents(text, CONTENT_LIMIT * 2, cancellable).then(found => {
        if (cancellable.is_cancelled()) return;
        this.waiting.delete('mentions');
        this.mentions = { text, found: found ?? [] };
        this.emit(false);
      });
    });
  }

  private namedFiles(): NamedFile[] {
    if (this.names.text === this.text) return this.names.found;
    const last = this.search.words[this.search.words.length - 1] ?? '';
    return this.waiting.has('names') ? this.names.found.filter(file => fold(basename(file.path)).includes(last)) : [];
  }

  private mentioningFiles(): MentioningFile[] {
    if (this.mentions.text === this.text) return this.mentions.found;
    return this.waiting.has('mentions') && this.text.startsWith(this.mentions.text) ? this.mentions.found : [];
  }

  private files(): { ranked: Ranked[]; shown: Set<string> } {
    const ranked: Ranked[] = this.recent.find(this.search).slice(0, FILE_LIMIT)
      .map(({ entry, score }) => ({ item: this.opener.item(entry.file, entry.location), score }));
    const shown = new Set(ranked.map(({ item }) => item.key));
    for (const file of this.namedFiles()) {
      if (ranked.length === FILE_LIMIT) break;
      const location = uri(file.path);
      if (shown.has(`file:${location}`)) continue;
      const item = this.opener.item({ uri: location, name: basename(file.path), folder: file.folder }, shortFolder(GLib.path_get_dirname(file.path)));
      shown.add(item.key);
      ranked.push({ item, score: file.score + NAME_BIAS });
    }
    return { ranked, shown };
  }

  private mentionItems(shown: Set<string>): SearchItem[] {
    return this.mentioningFiles()
      .map(file => this.opener.item({ uri: uri(file.path), name: basename(file.path), folder: false },
        file.snippet || shortFolder(GLib.path_get_dirname(file.path))))
      .filter(item => !shown.has(item.key))
      .slice(0, CONTENT_LIMIT);
  }

  private findInstantly(): Instant {
    const launches = launchHistory.weigher();
    const extra = this.text.length >= SHORTEST_EXTRA_QUERY;
    return {
      answer: this.calculator.find(this.text) ?? this.answers.find(this.text),
      groups: [
        ['apps', this.apps.find(this.search, launches)],
        ['commands', extra ? this.commands.find(this.search, launches) : []],
        ['windows', extra ? this.windows.find(this.search) : []],
        ['actions', this.actions.find(this.search, launches)],
        ['settings', this.settings.find(this.search, launches)],
        ['clipboard', extra ? this.clipboard.find(this.search) : []],
        ['emoji', this.emoji.find(this.search)],
      ],
    };
  }

  private emit(fresh: boolean, instantChanged = false): void {
    if (instantChanged) this.instant = this.findInstantly();
    const { answer, groups: instant } = this.instant;
    const files = this.files();
    const ranked = [...instant.flatMap(([, entries]) => entries), ...files.ranked];
    const web = this.web.item(this.text);
    const best = answer ?? ranked.reduce<Ranked | null>((top, entry) => !top || entry.score < top.score ? entry : top, null)?.item ?? null;
    const without = (entries: Ranked[]) => entries.filter(({ item }) => item !== best);
    const ordered = instant.map(([id, entries]) => [id, without(entries)] as const)
      .filter(([, entries]) => entries.length)
      .sort(([, a], [, b]) => a[0].score - b[0].score);
    const groups: SearchGroup[] = [...ordered, ['files', without(files.ranked)] as const]
      .map(([id, entries]) => ({ title: t(TITLES[id]), items: entries.map(({ item }) => item) }));
    groups.push({ title: t(TITLES.contents), items: this.mentionItems(files.shown) });
    const pending = this.waiting.size > 0;
    const found = groups.filter(group => group.items.length);
    if (best || pending) found.push({ title: t(TITLES.web), items: [web] });
    this.show({ best: best ?? (pending ? null : web), groups: found, pending, fresh });
  }
}
