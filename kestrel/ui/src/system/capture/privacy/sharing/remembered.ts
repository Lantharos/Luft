import GLib from 'gi://GLib';

import { readText, userFile, writeText } from '../../../../appearance/files.js';

export type Kind = 'screen' | 'control' | 'input' | 'windows-see' | 'windows-use';

export interface Remembered {
  readonly id: string;
  readonly app: string;
  readonly kind: Kind;
  readonly since: number;
}

export class RememberedGrants {
  private readonly file = userFile(GLib.get_user_data_dir(), 'kestrel', 'sharing-grants.json');
  private grants: Remembered[] = [];
  private readonly loaded = this.load();
  private writing = Promise.resolve();

  async all(): Promise<readonly Remembered[]> {
    await this.loaded;
    return this.grants;
  }

  async add(app: string, kind: Kind): Promise<string> {
    await this.loaded;
    const id = GLib.uuid_string_random();
    this.grants.push({ id, app, kind, since: Math.floor(GLib.get_real_time() / GLib.USEC_PER_SEC) });
    await this.save();
    return id;
  }

  async remove(id: string): Promise<boolean> {
    await this.loaded;
    const kept = this.grants.filter(grant => grant.id !== id);
    if (kept.length === this.grants.length) return false;
    this.grants = kept;
    await this.save();
    return true;
  }

  private async load(): Promise<void> {
    try {
      this.grants = JSON.parse(await readText(this.file) ?? '[]');
    } catch (error) {
      console.warn(`Kestrel couldn't read which apps may share the screen without asking, so they'll ask again: ${error}`);
    }
  }

  private save(): Promise<void> {
    const contents = JSON.stringify(this.grants);
    this.writing = this.writing.then(() => writeText(this.file, contents))
      .catch(error => console.warn(`Kestrel couldn't keep which apps may share the screen without asking: ${error}`));
    return this.writing;
  }
}
