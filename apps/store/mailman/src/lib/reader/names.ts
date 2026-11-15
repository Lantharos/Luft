import { i18n } from '@luft/i18n';

export const names = (list: string[]) => new Intl.ListFormat([i18n.locale], { type: 'unit', style: 'short' }).format(list);
