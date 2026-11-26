import type { FloodRequest, FloodResult } from './flood.worker';
import FloodWorker from './flood.worker?worker';

let worker: Worker | null = null;

export function floodFill(request: FloodRequest) {
	worker ??= new FloodWorker();
	const running = worker;
	return new Promise<FloodResult>((resolve) => {
		running.onmessage = (event: MessageEvent<FloodResult>) => resolve(event.data);
		running.postMessage(request, [...request.tiles.values()].map((tile) => tile.buffer));
	});
}
