// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface FenestraBridge {
		invoke<T>(name: string, params?: Record<string, unknown>): Promise<T>;
	}

	interface Window {
		fenestra?: {
			bridge?: FenestraBridge;
		};
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
