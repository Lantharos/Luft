import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { developmentPath } from '../shared/apps/development.js';

const PUBLISHED = '/run/luft/policy/policy.json';

interface Published {
  extensions?: { unreviewed?: boolean };
}

/** The policy locksmith publishes for the desktop, read again whenever it changes. */
export class Policy {
  private readonly file = Gio.File.new_for_path(developmentPath('KESTREL_POLICY') ?? PUBLISHED);
  private readonly monitor = this.file.monitor_file(Gio.FileMonitorFlags.WATCH_MOVES, null);
  private readonly listeners = new Set<() => void>();
  private published: Published = this.read();

  constructor() {
    this.monitor.connect('changed', () => {
      const published = this.read();
      if (JSON.stringify(published) === JSON.stringify(this.published)) return;
      this.published = published;
      for (const listener of [...this.listeners]) listener();
    });
  }

  get unreviewedExtensions(): boolean {
    return this.published.extensions?.unreviewed ?? true;
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  destroy(): void {
    this.monitor.cancel();
    this.listeners.clear();
  }

  private read(): Published {
    try {
      const [, contents] = this.file.load_contents(null);
      return JSON.parse(new TextDecoder().decode(contents)) as Published;
    } catch (error) {
      if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))) console.warn(`Couldn't read the policy: ${error}`);
      return {};
    }
  }
}
