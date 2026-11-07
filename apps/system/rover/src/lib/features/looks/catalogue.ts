import Archive from '@lucide/svelte/icons/archive';
import Baby from '@lucide/svelte/icons/baby';
import BookOpen from '@lucide/svelte/icons/book-open';
import Bookmark from '@lucide/svelte/icons/bookmark';
import Briefcase from '@lucide/svelte/icons/briefcase';
import Building2 from '@lucide/svelte/icons/building-2';
import Calendar from '@lucide/svelte/icons/calendar';
import Camera from '@lucide/svelte/icons/camera';
import Car from '@lucide/svelte/icons/car';
import Cat from '@lucide/svelte/icons/cat';
import Cloud from '@lucide/svelte/icons/cloud';
import Code from '@lucide/svelte/icons/code';
import Coffee from '@lucide/svelte/icons/coffee';
import Dog from '@lucide/svelte/icons/dog';
import Download from '@lucide/svelte/icons/download';
import Dumbbell from '@lucide/svelte/icons/dumbbell';
import FileText from '@lucide/svelte/icons/file-text';
import Film from '@lucide/svelte/icons/film';
import FlaskConical from '@lucide/svelte/icons/flask-conical';
import Folder from '@lucide/svelte/icons/folder';
import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
import Gift from '@lucide/svelte/icons/gift';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import Headphones from '@lucide/svelte/icons/headphones';
import Heart from '@lucide/svelte/icons/heart';
import House from '@lucide/svelte/icons/house';
import ImageIcon from '@lucide/svelte/icons/image';
import Leaf from '@lucide/svelte/icons/leaf';
import Lightbulb from '@lucide/svelte/icons/lightbulb';
import Lock from '@lucide/svelte/icons/lock';
import MapIcon from '@lucide/svelte/icons/map';
import Monitor from '@lucide/svelte/icons/monitor';
import Mountain from '@lucide/svelte/icons/mountain';
import Music from '@lucide/svelte/icons/music';
import Palette from '@lucide/svelte/icons/palette';
import PenTool from '@lucide/svelte/icons/pen-tool';
import Plane from '@lucide/svelte/icons/plane';
import Receipt from '@lucide/svelte/icons/receipt';
import Rocket from '@lucide/svelte/icons/rocket';
import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
import Star from '@lucide/svelte/icons/star';
import Sun from '@lucide/svelte/icons/sun';
import Terminal from '@lucide/svelte/icons/terminal';
import Trophy from '@lucide/svelte/icons/trophy';
import Users from '@lucide/svelte/icons/users';
import Utensils from '@lucide/svelte/icons/utensils';
import Video from '@lucide/svelte/icons/video';
import Wallet from '@lucide/svelte/icons/wallet';
import type { Component } from 'svelte';
import type { UserDirs } from '#lib/bindings.js';

export type UserFolder = Exclude<keyof UserDirs, 'home'>;

export const ICONS: Record<string, { icon: Component; label: string }> = {
	folder: { icon: Folder, label: 'Folder' },
	star: { icon: Star, label: 'Star' },
	heart: { icon: Heart, label: 'Heart' },
	bookmark: { icon: Bookmark, label: 'Bookmark' },
	'file-text': { icon: FileText, label: 'Documents' },
	download: { icon: Download, label: 'Downloads' },
	image: { icon: ImageIcon, label: 'Pictures' },
	video: { icon: Video, label: 'Videos' },
	music: { icon: Music, label: 'Music' },
	monitor: { icon: Monitor, label: 'Desktop' },
	briefcase: { icon: Briefcase, label: 'Work' },
	'graduation-cap': { icon: GraduationCap, label: 'School' },
	'book-open': { icon: BookOpen, label: 'Reading' },
	code: { icon: Code, label: 'Code' },
	terminal: { icon: Terminal, label: 'Terminal' },
	'flask-conical': { icon: FlaskConical, label: 'Science' },
	lightbulb: { icon: Lightbulb, label: 'Ideas' },
	palette: { icon: Palette, label: 'Art' },
	'pen-tool': { icon: PenTool, label: 'Design' },
	camera: { icon: Camera, label: 'Photos' },
	film: { icon: Film, label: 'Films' },
	headphones: { icon: Headphones, label: 'Podcasts' },
	'gamepad-2': { icon: Gamepad2, label: 'Games' },
	trophy: { icon: Trophy, label: 'Trophy' },
	dumbbell: { icon: Dumbbell, label: 'Fitness' },
	plane: { icon: Plane, label: 'Travel' },
	map: { icon: MapIcon, label: 'Maps' },
	mountain: { icon: Mountain, label: 'Outdoors' },
	car: { icon: Car, label: 'Car' },
	house: { icon: House, label: 'Home' },
	'building-2': { icon: Building2, label: 'Office' },
	wallet: { icon: Wallet, label: 'Money' },
	receipt: { icon: Receipt, label: 'Receipts' },
	'shopping-bag': { icon: ShoppingBag, label: 'Shopping' },
	gift: { icon: Gift, label: 'Gifts' },
	calendar: { icon: Calendar, label: 'Plans' },
	users: { icon: Users, label: 'Family' },
	baby: { icon: Baby, label: 'Kids' },
	dog: { icon: Dog, label: 'Dog' },
	cat: { icon: Cat, label: 'Cat' },
	leaf: { icon: Leaf, label: 'Garden' },
	sun: { icon: Sun, label: 'Summer' },
	coffee: { icon: Coffee, label: 'Coffee' },
	utensils: { icon: Utensils, label: 'Recipes' },
	rocket: { icon: Rocket, label: 'Projects' },
	cloud: { icon: Cloud, label: 'Cloud' },
	archive: { icon: Archive, label: 'Archive' },
	lock: { icon: Lock, label: 'Private' }
};

export const COLORS: { name: string; label: string }[] = [
	{ name: 'red', label: 'Red' },
	{ name: 'orange', label: 'Orange' },
	{ name: 'yellow', label: 'Yellow' },
	{ name: 'green', label: 'Green' },
	{ name: 'teal', label: 'Teal' },
	{ name: 'blue', label: 'Blue' },
	{ name: 'purple', label: 'Purple' },
	{ name: 'pink', label: 'Pink' }
];

export const USER_FOLDER_ICONS: Record<UserFolder, string> = {
	documents: 'file-text',
	downloads: 'download',
	music: 'music',
	pictures: 'image',
	videos: 'video'
};

export function iconNamed(name: string | null | undefined) {
	return (name && ICONS[name]?.icon) || Folder;
}

export function tint(color: string | null | undefined) {
	return color && COLORS.some((known) => known.name === color) ? `var(--look-${color})` : null;
}
