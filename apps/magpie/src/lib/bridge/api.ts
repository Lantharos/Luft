import { invoke, listen } from '@lantharos/sabine';
import { activationToken, type Appearance } from '@luft/ui';

export type Kind = 'image' | 'video' | 'audio' | 'document' | 'font';

export interface Item {
	path: string;
	name: string;
	kind: Kind;
	native: boolean;
	modified: number;
	size: number;
}

export interface Folder {
	path: string;
	name: string;
}

export interface Listing {
	folder: string;
	items: Item[];
	folders: Folder[];
}

export type Place = 'pictures' | 'videos' | 'music' | 'documents';

export interface Location {
	place: Place;
	path: string;
}

export interface AppState extends Appearance {
	launchPaths: string[];
}

export type ThumbnailSize = 'normal' | 'large' | 'x-large' | 'xx-large';

export interface ThumbnailBatch {
	items: { path: string; thumbnail: string | null; modified: number }[];
}

export interface Pixels {
	path: string;
	width: number;
	height: number;
	channels: 3 | 4;
}

export interface ImageDetails {
	width: number | null;
	height: number | null;
	camera: string | null;
	lens: string | null;
	exposure: number | null;
	aperture: number | null;
	iso: number | null;
	focalLength: number | null;
	taken: string | null;
	location: { latitude: number; longitude: number; altitude: number | null } | null;
}

export interface Tags {
	path: string;
	title: string | null;
	artist: string | null;
	album: string | null;
	albumArtist: string | null;
	track: number | null;
	disc: number | null;
	year: number | null;
	genre: string | null;
	duration: number | null;
	art: string | null;
}

export interface SubtitleTrack {
	id: string;
	label: string | null;
	language: string | null;
	path: string | null;
}

export interface VideoInfo {
	video: string | null;
	audio: string | null;
	subtitles: SubtitleTrack[];
}

export interface Cue {
	start: number;
	end: number;
	text: string;
}

export interface App {
	id: string;
	name: string;
	icon: string | null;
}

export type Status = 'Playing' | 'Paused' | 'Stopped';
export type Repeat = 'None' | 'Track' | 'Playlist';

export interface Playback {
	track: number;
	status: Status;
	title: string | null;
	artist: string | null;
	album: string | null;
	art: string | null;
	path: string | null;
	length: number | null;
	position: number;
	rate: number;
	volume: number;
	shuffle: boolean;
	repeat: Repeat;
	canNext: boolean;
	canPrevious: boolean;
}

export type MediaAction =
	| { action: 'play' | 'pause' | 'toggle' | 'stop' | 'next' | 'previous' | 'raise' }
	| { action: 'seek' | 'position' | 'volume' | 'rate'; value: number }
	| { action: 'shuffle'; value: boolean }
	| { action: 'repeat'; value: Repeat };

export interface FontAxis {
	tag: string;
	name: string;
	min: number;
	default: number;
	max: number;
}

export interface FontInstance {
	name: string;
	coordinates: [string, number][];
}

export interface FontFace {
	index: number;
	family: string;
	style: string;
	postscript: string | null;
	fullName: string | null;
	weight: number;
	italic: boolean;
	version: string | null;
	designer: string | null;
	manufacturer: string | null;
	license: string | null;
	licenseUrl: string | null;
	copyright: string | null;
	sample: string | null;
	glyphs: number;
	monospace: boolean;
	characters: [number, number][];
	axes: FontAxis[];
	instances: FontInstance[];
}

export interface FontFile {
	format: string;
	faces: FontFace[];
}

export type FontStatus = 'missing' | 'system' | 'user';
export type FontRole = 'interface' | 'monospace';

export interface Activation {
	arguments: string[];
	workingDirectory: string | null;
}

export const appState = () => invoke<AppState>('app_state');
export const resolveArguments = (activation: Activation) => invoke<string[]>('resolve_arguments', { ...activation });
export const chooseFolder = () => invoke<string | null>('choose_folder', {}, { timeoutMs: 24 * 60 * 60 * 1000 });
export const places = () => invoke<Location[]>('places');
export const chooseFile = () => invoke<string | null>('choose_file', {}, { timeoutMs: 24 * 60 * 60 * 1000 });

export const openFolder = (path: string) => invoke<Listing>('open_folder', { path });
export const requestThumbnails = (paths: string[], size: ThumbnailSize) => invoke<void>('request_thumbnails', { paths, size });
export const imageDetails = (path: string) => invoke<ImageDetails>('image_details', { path });
export const decodeImage = (path: string) => invoke<Pixels>('decode_image', { path });
export const setWallpaper = (path: string) => invoke<'light' | 'dark'>('set_wallpaper', { path });
export const otherApps = (path: string) => invoke<App[]>('other_apps', { path });
export const openWith = async (path: string, app: string) => invoke<void>('open_with', { path, app, token: await activationToken() });
export const openUri = async (uri: string) => invoke<void>('open_uri', { uri, token: await activationToken() });
export const showInFolder = async (path: string) => invoke<void>('show_in_folder', { path, token: await activationToken() });

export const fontInfo = (path: string) => invoke<FontFile>('font_info', { path });
export const fontSource = (path: string, index: number) => invoke<string>('font_source', { path, index });
export const fontStatus = (path: string) => invoke<FontStatus>('font_status', { path });
export const installFont = (path: string) => invoke<FontStatus>('font_install', { path });
export const removeFont = (path: string) => invoke<FontStatus>('font_remove', { path });
export const useFont = (path: string, role: FontRole) => invoke<FontStatus>('font_use', { path, role });

export const audioTags = (paths: string[]) => invoke<Tags[]>('audio_tags', { paths });
export const videoInfo = (path: string) => invoke<VideoInfo>('video_info', { path });
export const subtitleCues = (path: string, id: string) => invoke<Cue[]>('subtitle_cues', { path, id }, { timeoutMs: 5 * 60 * 1000 });
export const mediaUpdate = (playback: Playback) => invoke<void>('media_update', { ...playback });
export const mediaClear = () => invoke<void>('media_clear', {});

export const events = {
	folder: (callback: (listing: Listing) => void) => listen('magpie.folder', callback),
	thumbnails: (callback: (batch: ThumbnailBatch) => void) => listen('magpie.thumbnails', callback),
	media: (callback: (action: MediaAction) => void) => listen('magpie.media', callback),
	activation: (callback: (activation: Activation) => void) => listen('singleInstance.activate', callback)
};
