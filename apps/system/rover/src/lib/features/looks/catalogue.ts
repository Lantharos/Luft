import Archive from '@luft/symbols/icons/archive';
import Baby from '@luft/symbols/icons/baby';
import BookOpen from '@luft/symbols/icons/book-open';
import Bookmark from '@luft/symbols/icons/bookmark';
import Briefcase from '@luft/symbols/icons/briefcase';
import Building2 from '@luft/symbols/icons/building-2';
import Calendar from '@luft/symbols/icons/calendar';
import Camera from '@luft/symbols/icons/camera';
import Car from '@luft/symbols/icons/car';
import Cat from '@luft/symbols/icons/cat';
import Cloud from '@luft/symbols/icons/cloud';
import Code from '@luft/symbols/icons/code';
import Coffee from '@luft/symbols/icons/coffee';
import Dog from '@luft/symbols/icons/dog';
import Download from '@luft/symbols/icons/download';
import Dumbbell from '@luft/symbols/icons/dumbbell';
import FileText from '@luft/symbols/icons/file-text';
import Film from '@luft/symbols/icons/film';
import FlaskConical from '@luft/symbols/icons/flask-conical';
import Folder from '@luft/symbols/icons/folder';
import Gamepad2 from '@luft/symbols/icons/gamepad-2';
import Gift from '@luft/symbols/icons/gift';
import GraduationCap from '@luft/symbols/icons/graduation-cap';
import Headphones from '@luft/symbols/icons/headphones';
import Heart from '@luft/symbols/icons/heart';
import House from '@luft/symbols/icons/house';
import ImageIcon from '@luft/symbols/icons/image';
import Leaf from '@luft/symbols/icons/leaf';
import Lightbulb from '@luft/symbols/icons/lightbulb';
import Lock from '@luft/symbols/icons/lock';
import MapIcon from '@luft/symbols/icons/map';
import Monitor from '@luft/symbols/icons/monitor';
import Mountain from '@luft/symbols/icons/mountain';
import Music from '@luft/symbols/icons/music';
import Palette from '@luft/symbols/icons/palette';
import PenTool from '@luft/symbols/icons/pen-tool';
import Plane from '@luft/symbols/icons/plane';
import Receipt from '@luft/symbols/icons/receipt';
import Rocket from '@luft/symbols/icons/rocket';
import ShoppingBag from '@luft/symbols/icons/shopping-bag';
import Star from '@luft/symbols/icons/star';
import Sun from '@luft/symbols/icons/sun';
import Terminal from '@luft/symbols/icons/terminal';
import Trophy from '@luft/symbols/icons/trophy';
import Users from '@luft/symbols/icons/users';
import Utensils from '@luft/symbols/icons/utensils';
import Video from '@luft/symbols/icons/video';
import Wallet from '@luft/symbols/icons/wallet';
import type { Component } from 'svelte';
import type { UserDirs } from '#lib/bindings.js';

export type UserFolder = Exclude<keyof UserDirs, 'home'>;

export const ICONS: Record<string, { icon: Component; label: string }> = {
	folder: { icon: Folder, label: 'rover-look-icon-folder' },
	star: { icon: Star, label: 'rover-look-icon-star' },
	heart: { icon: Heart, label: 'rover-look-icon-heart' },
	bookmark: { icon: Bookmark, label: 'rover-look-icon-bookmark' },
	'file-text': { icon: FileText, label: 'rover-look-icon-file-text' },
	download: { icon: Download, label: 'rover-look-icon-download' },
	image: { icon: ImageIcon, label: 'rover-look-icon-image' },
	video: { icon: Video, label: 'rover-look-icon-video' },
	music: { icon: Music, label: 'rover-look-icon-music' },
	monitor: { icon: Monitor, label: 'rover-look-icon-monitor' },
	briefcase: { icon: Briefcase, label: 'rover-look-icon-briefcase' },
	'graduation-cap': { icon: GraduationCap, label: 'rover-look-icon-graduation-cap' },
	'book-open': { icon: BookOpen, label: 'rover-look-icon-book-open' },
	code: { icon: Code, label: 'rover-look-icon-code' },
	terminal: { icon: Terminal, label: 'rover-look-icon-terminal' },
	'flask-conical': { icon: FlaskConical, label: 'rover-look-icon-flask-conical' },
	lightbulb: { icon: Lightbulb, label: 'rover-look-icon-lightbulb' },
	palette: { icon: Palette, label: 'rover-look-icon-palette' },
	'pen-tool': { icon: PenTool, label: 'rover-look-icon-pen-tool' },
	camera: { icon: Camera, label: 'rover-look-icon-camera' },
	film: { icon: Film, label: 'rover-look-icon-film' },
	headphones: { icon: Headphones, label: 'rover-look-icon-headphones' },
	'gamepad-2': { icon: Gamepad2, label: 'rover-look-icon-gamepad-2' },
	trophy: { icon: Trophy, label: 'rover-look-icon-trophy' },
	dumbbell: { icon: Dumbbell, label: 'rover-look-icon-dumbbell' },
	plane: { icon: Plane, label: 'rover-look-icon-plane' },
	map: { icon: MapIcon, label: 'rover-look-icon-map' },
	mountain: { icon: Mountain, label: 'rover-look-icon-mountain' },
	car: { icon: Car, label: 'rover-look-icon-car' },
	house: { icon: House, label: 'rover-look-icon-house' },
	'building-2': { icon: Building2, label: 'rover-look-icon-building-2' },
	wallet: { icon: Wallet, label: 'rover-look-icon-wallet' },
	receipt: { icon: Receipt, label: 'rover-look-icon-receipt' },
	'shopping-bag': { icon: ShoppingBag, label: 'rover-look-icon-shopping-bag' },
	gift: { icon: Gift, label: 'rover-look-icon-gift' },
	calendar: { icon: Calendar, label: 'rover-look-icon-calendar' },
	users: { icon: Users, label: 'rover-look-icon-users' },
	baby: { icon: Baby, label: 'rover-look-icon-baby' },
	dog: { icon: Dog, label: 'rover-look-icon-dog' },
	cat: { icon: Cat, label: 'rover-look-icon-cat' },
	leaf: { icon: Leaf, label: 'rover-look-icon-leaf' },
	sun: { icon: Sun, label: 'rover-look-icon-sun' },
	coffee: { icon: Coffee, label: 'rover-look-icon-coffee' },
	utensils: { icon: Utensils, label: 'rover-look-icon-utensils' },
	rocket: { icon: Rocket, label: 'rover-look-icon-rocket' },
	cloud: { icon: Cloud, label: 'rover-look-icon-cloud' },
	archive: { icon: Archive, label: 'rover-look-icon-archive' },
	lock: { icon: Lock, label: 'rover-look-icon-lock' }
};

export const COLORS: { name: string; label: string }[] = [
	{ name: 'red', label: 'rover-look-color-red' },
	{ name: 'orange', label: 'rover-look-color-orange' },
	{ name: 'yellow', label: 'rover-look-color-yellow' },
	{ name: 'green', label: 'rover-look-color-green' },
	{ name: 'teal', label: 'rover-look-color-teal' },
	{ name: 'blue', label: 'rover-look-color-blue' },
	{ name: 'purple', label: 'rover-look-color-purple' },
	{ name: 'pink', label: 'rover-look-color-pink' }
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
