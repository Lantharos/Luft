import { commands, events } from '#lib/bindings.js';
import type { Extension, ExtensionSetting, ExtensionSettingValue, PageItem, PageSection } from '#lib/bindings.js';

export type Unreviewed = 'copy' | 'folder';

const WAIT_FOR_PERMISSION = { timeoutMs: 300_000 };

class Extensions {
	list = $state<Extension[] | null>(null);
	unavailable = $state(false);
	developerTools = $state(false);
	pages = $state<Record<string, PageSection[]>>({});
	#watching = false;
	#shownPages = new Set<string>();

	async load() {
		if (!this.#watching) {
			this.#watching = true;
			events.extensionsChanged((list) => {
				this.list = list;
				void this.readDeveloperTools();
				for (const id of this.#shownPages) void this.loadPage(id);
			});
			events.extensionsPageChanged((id) => {
				if (this.#shownPages.has(id)) void this.loadPage(id);
			});
		}
		void this.readDeveloperTools();
		try {
			this.list = await commands.extensions();
		} catch {
			this.unavailable = true;
		}
	}

	async readDeveloperTools() {
		this.developerTools = (await commands.developerTools().catch(() => null)) ?? false;
	}

	find(id: string) {
		return this.list?.find((extension) => extension.id.toLowerCase() === id.toLowerCase()) ?? null;
	}

	setEnabled(extension: Extension, on: boolean) {
		extension.enabled = on;
		return on ? commands.extensionsEnable({ id: extension.id }) : commands.extensionsDisable({ id: extension.id });
	}

	set(extension: Extension, setting: ExtensionSetting, value: ExtensionSettingValue) {
		setting.value = value;
		return commands.extensionsSet({ id: extension.id, key: setting.key, value });
	}

	remove(extension: Extension) {
		return commands.extensionsRemove({ id: extension.id });
	}

	runUnreviewed({ id, path }: Extension, how: Unreviewed) {
		return how === 'copy'
			? commands.extensionsInstallCopy({ id, path }, WAIT_FOR_PERMISSION)
			: commands.extensionsRunFromFolder({ id, path }, WAIT_FOR_PERMISSION);
	}

	stopUnreviewed(extension: Extension) {
		return commands.extensionsStopUnreviewed({ id: extension.id });
	}

	reload(extension: Extension) {
		return commands.extensionsReload({ id: extension.id });
	}

	showPage(id: string) {
		this.#shownPages.add(id);
		void this.loadPage(id);
		return () => this.#shownPages.delete(id);
	}

	indexPages() {
		for (const extension of this.list ?? []) if (extension.state === 'running' && !(extension.id in this.pages)) void this.loadPage(extension.id);
	}

	async loadPage(id: string) {
		this.pages[id] = await commands.extensionsPage({ id }).catch(() => []);
	}

	act(extension: Extension, control: string, value: ExtensionSettingValue = true) {
		return commands.extensionsAct({ id: extension.id, control, value });
	}

	setShortcut(id: string, key: string, accelerators: string[] | null) {
		return commands.extensionsSetShortcut({ id, key, accelerators });
	}

	onPage(page: string) {
		return (this.list ?? []).flatMap((extension) => {
			const settings = extension.state === 'running' ? extension.settings.filter((setting) => setting.page === page && shown(extension, setting)) : [];
			return settings.length ? [{ extension, settings }] : [];
		});
	}
}

export const extensions = new Extensions();

function met({ when, whenMin, whenMax }: ExtensionSetting, value: ExtensionSettingValue): boolean {
	if (when.length) return when.some((wanted) => (Array.isArray(value) ? value.includes(String(wanted)) : value === wanted));
	if (whenMin === null && whenMax === null) return value === true;
	return typeof value === 'number' && value >= (whenMin ?? value) && value <= (whenMax ?? value);
}

export function shown(extension: Extension, setting: ExtensionSetting): boolean {
	if (!setting.depends) return true;
	const parent = extension.settings.find((other) => other.key === setting.depends);
	return !!parent && met(setting, parent.value) && shown(extension, parent);
}

export function shownSections(extension: Extension, sections: PageSection[]): PageSection[] {
	return sections.filter((section) => section.items.some((item) => showing(extension, item)));
}

export function showing(extension: Extension, item: PageItem): boolean {
	if (item.type === 'group') return item.items.some((inner) => showing(extension, inner));
	if (item.type === 'page') return item.sections.some((section) => section.items.some((inner) => showing(extension, inner)));
	if (item.type !== 'setting') return true;
	const declared = extension.settings.find((setting) => setting.key === item.key);
	return !!declared && shown(extension, declared);
}

export type Subpage = Extract<PageItem, { type: 'page' }>;

export const subpageOf = (sections: PageSection[], key: string): Subpage | null =>
	sections.flatMap((section) => section.items).find((item): item is Subpage => item.type === 'page' && item.key === key) ?? null;

const holds = (items: PageItem[], key: string): boolean =>
	items.some((item) => (item.type === 'setting' && item.key === key) || (item.type === 'group' && holds(item.items, key)));

/** Where a declared setting shows: on the extension's page, on one of its subpages, or nowhere when its page leaves it out. */
function placeOf(id: string, key: string): string | null {
	const sections = extensions.pages[id];
	const link = `extensions/${id.toLowerCase()}`;
	if (!sections?.length) return link;
	if (sections.some((section) => holds(section.items, key))) return link;
	const page = sections
		.flatMap((section) => section.items)
		.find((item): item is Subpage => item.type === 'page' && item.sections.some((section) => holds(section.items, key)));
	return page ? `${link}/${page.key}` : null;
}

export interface FoundOption {
	title: string;
	where: string;
	link: string;
}

export function searchOptions(query: string): FoundOption[] {
	const needle = query.trim().toLocaleLowerCase();
	return (extensions.list ?? []).flatMap((extension) => {
		if (extension.state !== 'running') return [];
		return extension.settings.flatMap((setting) => {
			const link = !setting.hidden && shown(extension, setting) && setting.label.toLocaleLowerCase().includes(needle) ? placeOf(extension.id, setting.key) : null;
			return link ? [{ title: setting.label, where: extension.name, link }] : [];
		});
	});
}

