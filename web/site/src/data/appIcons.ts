const icons = import.meta.glob<string>('../../../../apps/*/*/public/favicon.svg', { eager: true, query: '?no-inline', import: 'default' });

export const appIcon = (id: string) => Object.entries(icons).find(([path]) => path.split('/').at(-3) === id)?.[1];
