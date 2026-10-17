import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ContextMenus } from '../../../desktop/menus/contextMenus.js';
import { launchHistory } from '../../../shared/launchHistory.js';
import type { QuickSettingsSource } from '../../quickSettings/quickControls.js';
import { Calculator } from './calculator/calculator.js';
import { fileIndex, type MentioningFile, type NamedFile } from './files/index.js';
import { FileOpener, shortFolder } from './files/items.js';
import { RecentFiles } from './files/recent.js';
import type { GroupId, Ranked, SearchGroup, SearchItem, SearchView } from './item.js';
import { ActionResults } from './providers/actions.js';
import { AppResults } from './providers/apps.js';
import { SettingsResults } from './providers/settings.js';
import { fold, query, type Query } from './ranking.js';

const FILE_LIMIT = 6;
const CONTENT_LIMIT = 4;
const NAME_BIAS = 0.8;
const SHORTEST_NAME_QUERY = 2;
const SHORTEST_CONTENT_QUERY = 3;
const CONTENT_DELAY = 120;
const TITLES: Record<GroupId, string> = { apps: 'Apps', actions: 'Actions', settings: 'Settings', files: 'Files', contents: 'Inside files' };

interface Lookup<T> {
  text: string;
  found: T[];
}

const basename = (path: string) => GLib.path_get_basename(path);
const uri = (path: string) => GLib.filename_to_uri(path, null);

export class StartSearch {
  private readonly apps: AppResults;
  private readonly actions: ActionResults;
  private readonly settings: SettingsResults;
  private readonly calculator: Calculator;
  private readonly recent = new RecentFiles();
  private readonly opener: FileOpener;
  private text = '';
  private search: Query = query('');
  private names: Lookup<NamedFile> = { text: '', found: [] };
  private mentions: Lookup<MentioningFile> = { text: '', found: [] };
  private waiting = new Set<'names' | 'mentions'>();
  private cancellable: Gio.Cancellable | null = null;
  private sources: number[] = [];
  private preparing = 0;

  constructor(
    menus: ContextMenus,
    launch: (app: Gio.AppInfo) => void,
    close: () => void,
    quickSettings: QuickSettingsSource,
    private readonly show: (view: SearchView | null) => void,
  ) {
    this.apps = new AppResults(menus, launch);
    this.actions = new ActionResults(quickSettings, close);
    this.settings = new SettingsResults(close);
    this.calculator = new Calculator(close);
    this.opener = new FileOpener(close);
  }

  update(apps: Gio.AppInfo[]): void {
    this.apps.update(apps);
    if (this.text) this.emit(false);
  }

  prepare(): void {
    if (this.preparing) return;
    this.preparing = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.preparing = 0;
      void this.recent.refresh().then(changed => {
        if (changed && this.text) this.emit(false);
      });
      fileIndex.refresh();
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
    this.lookUp(trimmed);
    this.emit(true);
  }

  destroy(): void {
    this.stopLookUps();
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

  private emit(fresh: boolean): void {
    const launches = launchHistory.weigher();
    const calculation = this.calculator.find(this.text);
    const instant: [GroupId, Ranked[]][] = [
      ['apps', this.apps.find(this.search, launches)],
      ['actions', this.actions.find(this.search, launches)],
      ['settings', this.settings.find(this.search, launches)],
    ];
    const files = this.files();
    const ranked = [...instant.flatMap(([, entries]) => entries), ...files.ranked];
    const best = calculation ?? ranked.reduce<Ranked | null>((top, entry) => !top || entry.score < top.score ? entry : top, null)?.item ?? null;
    const without = (entries: Ranked[]) => entries.filter(({ item }) => item !== best);
    const ordered = instant.map(([id, entries]) => [id, without(entries)] as const)
      .filter(([, entries]) => entries.length)
      .sort(([, a], [, b]) => a[0].score - b[0].score);
    const groups: SearchGroup[] = [...ordered, ['files', without(files.ranked)] as const]
      .map(([id, entries]) => ({ title: TITLES[id], items: entries.map(({ item }) => item) }));
    groups.push({ title: TITLES.contents, items: this.mentionItems(files.shown) });
    this.show({ best, groups: groups.filter(group => group.items.length), pending: this.waiting.size > 0, fresh });
  }
}
