import { fileUrl, invoke, isAvailable, listen, type InvokeOptions } from '@lantharos/sabine';

export const isDesktop = isAvailable;

export function call<T>(name: string, params: Record<string, unknown> = {}, options?: InvokeOptions): Promise<T> {
	if (isAvailable()) return invoke<T>(name, params, options);
	return fetch(`/__preview/${name}`, { method: 'POST', body: JSON.stringify(params) }).then((response) =>
		response.ok ? (response.json() as Promise<T>) : Promise.reject(new Error(response.statusText))
	);
}

export function on<T>(name: string, callback: (payload: T) => void): () => void {
	return isAvailable() ? listen<T>(name, callback) : () => {};
}

export function fileSource(path: string, version: number = 0) {
	return isAvailable() ? `${fileUrl(path)}?v=${version}` : `/__preview/file?path=${encodeURIComponent(path)}&v=${version}`;
}
