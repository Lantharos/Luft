import { documentState } from '$lib/document/state.svelte';
import { library } from '$lib/library/library.svelte';
import { player } from '$lib/music/player.svelte';
import { activePhoto } from '$lib/photo/active.svelte';
import { copyImage } from '$lib/photo/clipboard';
import { slideshow } from '$lib/photo/slideshow.svelte';
import { volume } from '$lib/playback/volume.svelte';
import { openFile } from './actions';
import { chrome } from './chrome.svelte';
import { viewHandled } from './keys';

const SEEK_STEP = 5;
const VOLUME_STEP = 0.05;

function typing(event: KeyboardEvent) {
	return event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]') !== null;
}

function escape() {
	if (slideshow.running) return slideshow.stop();
	if (documentState.finding) return documentState.closeFind();
	if (chrome.fullscreen) return chrome.setFullscreen(false);
	chrome.details = false;
}

function togglePanel() {
	if (chrome.mode === 'library') chrome.toggleSidebar();
	else if (library.group === 'visual') chrome.toggleStrip();
	else chrome.panel = !chrome.panel;
}

function common(event: KeyboardEvent, primary: boolean) {
	const { key } = event;
	if (key === 'Escape') escape();
	else if (key === 'F11' || (key === 'f' && !primary)) chrome.setFullscreen(!chrome.fullscreen);
	else if (key === 'F9') togglePanel();
	else if (primary && key === 'o') void openFile();
	else if (key === 'PageDown' && library.group !== 'document') library.step(1);
	else if (key === 'PageUp' && library.group !== 'document') library.step(-1);
	else if (event.altKey && key === 'Enter' && library.current?.kind === 'image') chrome.details = !chrome.details;
	else return false;
	return true;
}

function photo(event: KeyboardEvent, primary: boolean) {
	const viewport = activePhoto.viewport;
	const { key } = event;
	if (key === 'ArrowRight' || key === 'ArrowLeft') library.step(key === 'ArrowRight' ? 1 : -1, slideshow.running);
	else if (primary && key === 'c' && activePhoto.source) void copyImage(activePhoto.source).then(() => chrome.notify('Copied'));
	else if (key === 'F5') slideshow.start();
	else if (!viewport) return false;
	else if (key === '+' || key === '=') viewport.zoomIn();
	else if (key === '-') viewport.zoomOut();
	else if (key === '0') viewport.fit();
	else if (key === '1') viewport.zoomTo(1);
	else if (key === 'r') viewport.rotate(1);
	else if (key === 'R') viewport.rotate(-1);
	else if (key === 'h') viewport.flip();
	else return false;
	return true;
}

function music(event: KeyboardEvent, primary: boolean) {
	const { key } = event;
	if (key === ' ') player.toggle();
	else if (primary && key === 'ArrowRight') player.next();
	else if (primary && key === 'ArrowLeft') player.previous();
	else if (key === 'ArrowRight') player.seek(player.time + SEEK_STEP);
	else if (key === 'ArrowLeft') player.seek(player.time - SEEK_STEP);
	else if (key === 'ArrowUp') volume.level = Math.min(1, volume.level + VOLUME_STEP);
	else if (key === 'ArrowDown') volume.level = Math.max(0, volume.level - VOLUME_STEP);
	else if (key === 'm') volume.muted = !volume.muted;
	else if (key === 's') player.setShuffle(!player.shuffle);
	else return false;
	return true;
}

function pdf(event: KeyboardEvent, primary: boolean) {
	const { key } = event;
	if (primary && key === 'f') documentState.finding = true;
	else if (key === '+' || key === '=') documentState.zoom(1);
	else if (key === '-') documentState.zoom(-1);
	else if (key === '0') documentState.setFit('page-width');
	else return false;
	return true;
}

function font(event: KeyboardEvent) {
	const { key } = event;
	if (key !== 'ArrowRight' && key !== 'ArrowLeft') return false;
	library.step(key === 'ArrowRight' ? 1 : -1);
	return true;
}

export function handleKeydown(event: KeyboardEvent) {
	if (event.defaultPrevented) return;
	const primary = event.ctrlKey || event.metaKey;
	if (typing(event) && event.key !== 'Escape') return;
	const handled =
		viewHandled(event) ||
		common(event, primary) ||
		(library.current?.kind === 'image' && photo(event, primary)) ||
		(library.group === 'audio' && music(event, primary)) ||
		(library.group === 'document' && pdf(event, primary)) ||
		(library.group === 'font' && font(event));
	if (handled) event.preventDefault();
}
