declare module 'virtual:settings-rows' {
	import type { PageId } from '@luft/settings-pages';

	export const ROWS: { page: PageId; title: string }[];
}
