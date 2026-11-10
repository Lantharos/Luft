import { NativeVideo } from '@lantharos/sabine';

export function canPlayNatively() {
	return NativeVideo.isSupported();
}

export function decodeFailed(media: HTMLMediaElement) {
	const code = media.error?.code;
	return code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || code === MediaError.MEDIA_ERR_DECODE;
}
