import type Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';

export const CATEGORIES = ['office', 'graphics', 'audiovideo', 'game', 'development', 'education', 'science', 'network', 'utility', 'system'] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_NAMES = {
  office: 'gust-category-office', graphics: 'gust-category-graphics', audiovideo: 'gust-category-audiovideo',
  game: 'gust-category-game', development: 'gust-category-development', education: 'gust-category-education',
  science: 'gust-category-science', network: 'gust-category-network', utility: 'gust-category-utility', system: 'gust-category-system',
} as const satisfies Record<Category, string>;

const LISTED = new Map<string, Category>([
  ['office', 'office'], ['productivity', 'office'],
  ['graphics', 'graphics'], ['photography', 'graphics'],
  ['audiovideo', 'audiovideo'], ['audio', 'audiovideo'], ['video', 'audiovideo'], ['music', 'audiovideo'],
  ['game', 'game'], ['games', 'game'],
  ['development', 'development'],
  ['education', 'education'],
  ['science', 'science'],
  ['network', 'network'], ['internet', 'network'],
  ['utility', 'utility'], ['utilities', 'utility'],
  ['system', 'system'],
]);

export function categoriesOf(app: Gio.AppInfo): Set<Category> {
  const listed = app instanceof GioUnix.DesktopAppInfo ? app.get_categories()?.split(';') ?? [] : [];
  return new Set(listed.flatMap(name => LISTED.get(name.toLowerCase()) ?? []));
}
