import type { ImageMetadata } from 'astro';

const files = import.meta.glob<ImageMetadata>('../assets/shots/*.webp', { eager: true, import: 'default' });

export interface ShotPair {
	dark: ImageMetadata;
	light?: ImageMetadata;
}

export function shot(name: string): ShotPair {
	const dark = files[`../assets/shots/${name}-dark.webp`] ?? files[`../assets/shots/${name}.webp`];
	if (!dark) throw new Error(`No screenshot named ${name}`);
	return { dark, light: files[`../assets/shots/${name}-light.webp`] };
}

export const hasShot = (name: string) => `../assets/shots/${name}-dark.webp` in files;
