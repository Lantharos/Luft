import type { PageItem, PageSection } from '@luft/extension-api';

import { fileName } from './format.js';
import type { Pigeon } from './pigeon.js';

const PIN_DIGITS = 6;

function newPin(): string {
  return Array.from({ length: PIN_DIGITS }, () => Math.floor(Math.random() * 10)).join('');
}

/** Pigeon's page in Settings: its name, where files go, a PIN, the clipboard, the taskbar and trusted devices. */
export function describePage(pigeon: Pigeon): void {
  const { t, settingsPage, chooseFiles } = pigeon.extension;
  const chooseFolder = async () => {
    const [folder] = await chooseFiles({ title: t('choose-folder'), folder: true });
    if (folder) pigeon.keep('folder', folder);
  };
  settingsPage.describe((): PageSection[] => {
    const pin = pigeon.pin;
    const receiving: PageItem[] = [
      { setting: 'receive' },
      { type: 'entry', title: t('name'), description: t('name.description'), value: pigeon.name, placeholder: pigeon.alias, onSubmit: name => pigeon.keep('name', name.trim() || null) },
      { type: 'row', title: t('folder'), value: fileName(pigeon.folder), onActivate: () => void chooseFolder() },
      ...pigeon.chosenFolder ? [{ type: 'button', title: t('folder-chosen'), label: t('use-downloads'), onActivate: () => pigeon.keep('folder', null) } as const] : [],
    ];
    const pinItems: PageItem[] = [
      { type: 'switch', title: t('require-pin'), description: t('require-pin.description'), checked: !!pin, onToggled: on => pigeon.keep('pin', on ? newPin() : null) },
      ...pin ? [{ type: 'entry', title: t('pin'), value: pin, onSubmit: (text: string) => pigeon.keep('pin', text.trim() || null) } as const] : [],
    ];
    return [
      { items: receiving },
      { items: pinItems },
      { items: [{ setting: 'copy-text' }, { setting: 'copy-picture' }] },
      { items: [{ setting: 'taskbar' }, { type: 'taskbar-place', element: 'pigeon' }] },
      {
        title: t('trusted'),
        description: t('trusted-description'),
        items: [{
          type: 'list', empty: t('trusted-empty'),
          items: pigeon.trusted.map(device => ({ title: device.alias, actions: [{ label: t('forget'), onActivate: () => pigeon.forget(device.id) }] })),
        }],
      },
    ];
  });
}
