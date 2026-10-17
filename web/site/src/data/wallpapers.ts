import type { ImageMetadata } from 'astro';
import credits from '../../../../os/image/files/usr/share/backgrounds/luft/CREDITS?raw';

export interface Wallpaper {
	name: string;
	photographer: string;
	url: string;
	image: ImageMetadata;
}

const images = import.meta.glob<ImageMetadata>('../../../../os/image/files/usr/share/backgrounds/luft/*.jpg', {
	eager: true,
	import: 'default'
});
const imageOf = (name: string) => images[`../../../../os/image/files/usr/share/backgrounds/luft/${name}.jpg`];

export const wallpapers: Wallpaper[] = credits
	.split('\n')
	.map((line) => line.match(/^(\S+)\s+(.+?)\s+\(@\S+\)\s+(https:\S+)$/))
	.filter((match) => match !== null)
	.map(([, name, photographer, url]) => ({ name, photographer, url, image: imageOf(name) }));

export const wallpaper = (name: string) => wallpapers.find((entry) => entry.name === name)!;
