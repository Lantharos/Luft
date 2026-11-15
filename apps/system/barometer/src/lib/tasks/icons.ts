const SABINE_RUNTIME = 'sabine:runtime';
const SABINE = 'com.lantharos.sabine';

export const isDesktopApp = (key: string) => !key.includes(':');

export function desktopId(app: string | null | undefined) {
	if (app === SABINE_RUNTIME) return SABINE;
	return app && isDesktopApp(app) ? app : undefined;
}
