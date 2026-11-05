import type { Extension } from '@luft/extension-api';

import type { Granted, Reminders } from '../reminders.js';

const FILE_NAME = 'reminders.ics';

/** The extension's page in Settings, with moving reminders in and out of calendars. */
export class SettingsPage {
  private note = '';

  constructor(private readonly extension: Extension<Granted>, private readonly reminders: Reminders) {
    const { t } = extension;
    extension.settingsPage.describe(() => [
      { title: t('section-reminding'), items: [{ setting: 'morning' }, { setting: 'snooze' }, { setting: 'come-back' }, { setting: 'come-back-every' }] },
      { title: t('section-birthdays'), items: [{ setting: 'birthday-heads-up' }] },
      { title: t('section-goals'), items: [{ setting: 'goal-nudges' }, { setting: 'goal-nudge-every' }, { setting: 'goal-humour' }] },
      { title: t('section-taskbar'), items: [{ setting: 'taskbar-shows' }, { setting: 'taskbar-next-within' }, { type: 'taskbar-place', element: 'reminders' }] },
      {
        title: t('section-calendars'),
        description: t('section-calendars-note'),
        items: [
          { type: 'button', title: t('import'), description: t('import-note'), label: t('import-button'), onActivate: () => this.importFile() },
          { type: 'button', title: t('export'), description: t('export-note'), label: t('export-button'), onActivate: () => this.exportFile() },
          ...this.note ? [{ type: 'text' as const, text: this.note }] : [],
        ],
      },
    ]);
  }

  private say(note: string): void {
    this.note = note;
    this.extension.settingsPage.refresh();
  }

  private async importFile(): Promise<void> {
    const { t, pickFiles, readText, deleteFile } = this.extension;
    const [path] = await pickFiles({ title: t('import-title'), kind: 'calendars' });
    if (!path) return;
    const { found, skipped } = await this.reminders.import(readText(path)!);
    deleteFile(path);
    this.say(t('import-done', { count: found.length, skipped }));
  }

  private async exportFile(): Promise<void> {
    const { t, saveFile } = this.extension;
    if (await saveFile({ title: t('export-title'), name: FILE_NAME, text: this.reminders.exported() })) this.say(t('export-done'));
  }
}
