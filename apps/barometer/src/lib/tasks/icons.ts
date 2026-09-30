const PSEUDO = 'unit:';

export function desktopId(app: string | null | undefined) {
	return app && !app.startsWith(PSEUDO) ? app : undefined;
}
