import type { Extension, SearchResult } from '@luft/extension-api';

import { parse, type Parsed } from './parse/parse.js';
import type { Granted, Reminders } from './reminders.js';
import { ICON } from './view/element.js';
import { draftOf, usesDayFirst } from './view/quickAdd.js';
import { rowDetail, spokenWhen } from './view/say.js';

const SHORTEST_QUERY = 2;
const MOST_FOUND = 4;

/** Whether what's typed reads as a new reminder rather than a search for something else. */
const addable = ({ title, when, asked }: Parsed) => !!title && (asked || !!when);

export function addSearch(extension: Extension<Granted>, reminders: Reminders, open: (id?: string) => void): void {
  const { t } = extension;
  extension.search.addProvider({
    title: t('reminders'),
    search: query => {
      const text = query.trim();
      if (text.length < SHORTEST_QUERY) return [];
      const now = Date.now();
      const lowered = text.toLowerCase();
      const found = reminders.all
        .filter(reminder => reminder.doneAt === null && reminder.title.toLowerCase().includes(lowered))
        .slice(0, MOST_FOUND)
        .map((reminder): SearchResult => ({ title: reminder.title, description: rowDetail(extension, reminder, now), icon: ICON, activate: () => open(reminder.id) }));
      const parsed = parse(text, now, usesDayFirst());
      if (!addable(parsed)) return found;
      const add: SearchResult = {
        title: t('search-add', { title: parsed.title }),
        description: parsed.when ? spokenWhen(extension, parsed.when, now) : t('preview-no-date'),
        icon: ICON,
        activate: () => open(reminders.add(draftOf(extension, parsed)).id),
      };
      return [...found, add];
    },
  });
}
