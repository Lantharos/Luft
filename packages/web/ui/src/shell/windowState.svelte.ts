import { appWindow } from '@lantharos/sabine';

/**
 * Keeps what `read` returns, every time it changes, for Luft to open the
 * window again with after the session ends while the window is open.
 */
export function keepWindowState(read: () => unknown): void {
	$effect.root(() => {
		$effect(() => appWindow.keepState($state.snapshot(read())));
	});
}
