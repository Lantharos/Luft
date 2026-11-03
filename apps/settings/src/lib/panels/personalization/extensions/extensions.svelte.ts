import { commands, events } from '#lib/bindings.js';
import type { Extension, ExtensionSetting, ExtensionSettingValue } from '#lib/bindings.js';

class Extensions {
	list = $state<Extension[] | null>(null);
	unavailable = $state(false);
	#watching = false;

	async load() {
		if (!this.#watching) {
			this.#watching = true;
			events.extensionsChanged((list) => (this.list = list));
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
}

export const extensions = new Extensions();

export function shown(extension: Extension, setting: ExtensionSetting): boolean {
	if (!setting.depends) return true;
	const parent = extension.settings.find((other) => other.key === setting.depends);
	return !!parent && parent.value === true && shown(extension, parent);
}
