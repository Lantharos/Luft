import type { View } from '@luft/extension-api';

import { SERVER } from './client.js';
import type { Pult } from './pult.js';

/** Everything waiting, urgent items first, then each inbox with where it is and how much waits there. */
export function waitingView(pult: Pult): View {
  const { t, open, openSettings } = pult.extension;
  if (!pult.client.signedIn) {
    return {
      type: 'column', spacing: 12,
      children: [
        { type: 'text', text: t('signed-out'), style: 'title' },
        { type: 'text', text: t('signed-out.description'), style: 'caption' },
        { type: 'button', label: t('sign-in'), style: 'primary', onActivate: () => openSettings() },
      ],
    };
  }
  const field = pult.extension.settings.get<'open' | 'unread'>('count');
  const inboxes = (pult.places ?? []).flatMap(place => place.inboxes
    .filter(inbox => inbox[field] > 0)
    .map((inbox): View => ({
      type: 'item', title: inbox.label, icon: 'icons/inbox-symbolic.svg',
      subtitle: t('inbox-detail', { place: `${place.project.name} · ${place.environment.name}`, count: inbox[field] }),
      onActivate: () => open(inbox.url),
    })));
  const urgent = pult.urgent.map((item): View => ({
    type: 'item', title: item.title, subtitle: item.inboxLabel, icon: 'dialog-warning-symbolic', onActivate: () => open(item.url),
  }));
  return {
    type: 'column', spacing: 10,
    children: [
      { type: 'text', text: pult.reachable ? t('waiting', { count: pult.count }) : t('not-connected'), style: 'title' },
      ...urgent.length ? [{ type: 'text' as const, text: t('urgent-items'), style: 'caption' as const }, { type: 'column' as const, spacing: 0, children: urgent }] : [],
      ...inboxes.length ? [{ type: 'text' as const, text: t('inboxes'), style: 'caption' as const }, { type: 'column' as const, spacing: 0, children: inboxes }] : [],
      { type: 'button', label: t('open-pult'), onActivate: () => open(SERVER) },
    ],
  };
}
