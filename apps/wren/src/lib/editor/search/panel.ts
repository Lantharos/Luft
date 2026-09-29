import { openSearchPanel, search } from '@codemirror/search';
import type { EditorView, Panel } from '@codemirror/view';
import { mount, unmount } from 'svelte';
import SearchBar from './SearchBar.svelte';

type SearchBarApi = { focus: (replace: boolean) => void; refresh: () => void };

const bars = new WeakMap<EditorView, SearchBarApi>();
let replaceRequested = false;

function createPanel(view: EditorView): Panel {
	const dom = document.createElement('div');
	const bar = mount(SearchBar, { target: dom, props: { view, replace: replaceRequested } }) as SearchBarApi;
	bars.set(view, bar);
	return {
		dom,
		top: true,
		mount: () => bar.focus(replaceRequested),
		update: (update) => {
			if (update.docChanged || update.selectionSet || update.transactions.some((transaction) => transaction.effects.length)) bar.refresh();
		},
		destroy: () => {
			bars.delete(view);
			void unmount(bar);
		}
	};
}

export const searchExtension = search({ top: true, createPanel });

export function openSearch(view: EditorView, replace: boolean) {
	replaceRequested = replace;
	openSearchPanel(view);
	bars.get(view)?.focus(replace);
	return true;
}
