import { commands, events } from '#lib/bindings.js';
import type { Engine, Model } from '#lib/bindings.js';

class Models {
	list = $state<Model[]>([]);
	asking = $state<{ engine: Engine; resolve: (ready: boolean) => void } | null>(null);

	start() {
		void this.refresh();
		return events.easelModels(() => void this.refresh());
	}

	async refresh() {
		this.list = await commands.aiModels();
		const asking = this.asking;
		if (asking && this.find(asking.engine)?.installed) {
			this.asking = null;
			asking.resolve(true);
		}
	}

	find(engine: Engine) {
		return this.list.find((model) => model.engine === engine);
	}

	async ensure(engine: Engine) {
		await this.refresh();
		if (this.find(engine)?.installed) return true;
		return new Promise<boolean>((resolve) => (this.asking = { engine, resolve }));
	}

	decline() {
		const asking = this.asking;
		if (!asking) return;
		this.asking = null;
		void commands.aiCancel({ engine: asking.engine });
		asking.resolve(false);
	}
}

export const models = new Models();
