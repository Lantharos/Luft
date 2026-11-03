import { commands, events } from '#lib/bindings.js';
import type { Extension, ExtensionSetting, ExtensionSettingValue, PageSection } from '#lib/bindings.js';

class Extensions {
	list = $state<Extension[] | null>(null);
	unavailable = $state(false);
	pages = $state<Record<string, PageSection[]>>({});
	#watching = false;
	#shownPages = new Set<string>();

	async load() {
		if (!this.#watching) {
			this.#watching = true;
			events.extensionsChanged((list) => {
				this.list = list;
				for (const id of this.#shownPages) void this.loadPage(id);
			});
			events.extensionsPageChanged((id) => {
				if (this.#shownPages.has(id)) void this.loadPage(id);
			});
		}
		try {
			this.list = await commands.extensions();
		} catch {
			this.unavailable = true;
		}
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

	showPage(id: string) {
		this.#shownPages.add(id);
		void this.loadPage(id);
		return () => this.#shownPages.delete(id);
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

export function shown(extension: Extension, setting: ExtensionSetting): boolean {
	if (!setting.depends) return true;
	const parent = extension.settings.find((other) => other.key === setting.depends);
	return !!parent && parent.value === true && shown(extension, parent);
}
