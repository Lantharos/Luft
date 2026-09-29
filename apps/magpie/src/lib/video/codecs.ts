import type { VideoInfo } from '$lib/api';

const PROBES: Record<string, string> = {
	'H.264': 'video/mp4; codecs="avc1.640028"',
	HEVC: 'video/mp4; codecs="hvc1.1.6.L120.90"',
	'Dolby Vision': 'video/mp4; codecs="dvh1.05.06"',
	AV1: 'video/mp4; codecs="av01.0.08M.08"',
	VP9: 'video/webm; codecs="vp9"',
	VP8: 'video/webm; codecs="vp8"',
	Theora: 'video/ogg; codecs="theora"',
	AAC: 'audio/mp4; codecs="mp4a.40.2"',
	Opus: 'audio/webm; codecs="opus"',
	Vorbis: 'audio/webm; codecs="vorbis"',
	FLAC: 'audio/mp4; codecs="flac"',
	MP3: 'audio/mpeg',
	PCM: 'audio/wav; codecs="1"',
	'Dolby Digital': 'audio/mp4; codecs="ac-3"',
	'Dolby Digital Plus': 'audio/mp4; codecs="ec-3"'
};

function supported(codec: string) {
	const probe = PROBES[codec];
	return probe ? document.createElement('video').canPlayType(probe) !== '' : false;
}

function unsupported(info: VideoInfo | null) {
	return [info?.video, info?.audio].filter((codec): codec is string => Boolean(codec) && !supported(codec!));
}

/** Whether Chromium can decode every stream Magpie found in the file. */
export function playable(info: VideoInfo) {
	return unsupported(info).length === 0;
}

export function explain(info: VideoInfo | null) {
	const unplayable = unsupported(info);
	if (!unplayable.length) return "This video can't be played.";
	return `This video uses ${unplayable.join(' and ')}, which Magpie can't play.`;
}
