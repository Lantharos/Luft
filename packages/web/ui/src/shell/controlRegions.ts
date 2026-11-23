import { appWindow, type WindowControlRegion } from '@lantharos/sabine';
import type { Attachment } from 'svelte/attachments';

type Action = WindowControlRegion['action'];

let owner: HTMLElement | null = null;
let sent = '';

function send(regions: WindowControlRegion[]) {
	const key = JSON.stringify(regions);
	if (key === sent) return;
	sent = key;
	void appWindow.setControlRegions(regions);
}

export function controlRegions(actions: Action[]): Attachment<HTMLElement> {
	return (controls) => {
		const measure = () => {
			owner = controls;
			send(
				actions.flatMap((action) => {
					const button = controls.querySelector(`[data-action='${action}']`);
					if (!button) return [];
					const { left, top, width, height } = button.getBoundingClientRect();
					return [{ action, x: Math.round(left - window.innerWidth), y: Math.round(top), width: Math.round(width), height: Math.round(height) }];
				})
			);
		};
		const resizes = new ResizeObserver(measure);
		resizes.observe(controls.parentElement ?? controls);
		return () => {
			resizes.disconnect();
			if (owner !== controls) return;
			owner = null;
			send([]);
		};
	};
}
