import { isAvailable, NativeVideo } from '@lantharos/sabine';

/** Whether this window can play video natively when Chromium cannot decode it. */
export function canPlayNatively() {
	return isAvailable() && NativeVideo.isSupported();
}

/** Whether a media element failed because Chromium cannot decode its source. */
export function decodeFailed(media: HTMLMediaElement) {
	const code = media.error?.code;
	return code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || code === MediaError.MEDIA_ERR_DECODE;
}
