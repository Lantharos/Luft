import type { Extension, PageGroupItem, PageSection } from '@luft/extension-api';

import type { Looks } from '../looks/looks.js';
import type { Granted } from '../rules.js';

export function lookSection(phosphor: Extension<Granted>, looks: Looks): PageSection {
  const { t, settingsPage } = phosphor;
  const saved = looks.saved;
  const after = (done: Promise<void> | void) => void Promise.resolve(done).then(() => settingsPage.refresh());
  const items: PageGroupItem[] = [
    {
      type: 'list',
      empty: t('looks-empty'),
      items: saved.map(({ name }) => ({
        title: name,
        actions: [
          { label: t('look-wear'), onActivate: () => looks.apply(name) },
          { label: t('look-share'), onActivate: () => after(looks.share(name)) },
          { label: t('rule-remove'), danger: true, onActivate: () => after(looks.remove(name)) },
        ],
      })),
    },
    {
      type: 'entry', title: t('look-save'), value: '', placeholder: t('look-save-name'),
      onSubmit: name => {
        if (name.trim()) after(looks.save(name.trim()));
      },
    },
    { type: 'button', title: t('look-share-current'), label: t('look-share'), onActivate: () => after(looks.share()) },
    { type: 'button', title: t('look-import'), label: t('look-import-pick'), onActivate: () => after(looks.open()) },
    ...looks.importFailed ? [{ type: 'text' as const, text: t('look-import-failed') }] : [],
  ];
  return {
    items: [
      { setting: 'look' },
      { type: 'group', title: t('looks-yours'), value: saved.length ? `${saved.length}` : undefined, items },
    ],
  };
}
