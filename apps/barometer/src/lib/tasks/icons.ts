const PSEUDO = 'unit:';
const SABINE_RUNTIME = 'sabine:runtime';
const SABINE = 'com.lantharos.sabine';

export function desktopId(app: string | null | undefined) {
	if (app === SABINE_RUNTIME) return SABINE;
	return app && !app.startsWith(PSEUDO) ? app : undefined;
}
