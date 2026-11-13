export const GLASS_SCHEMA = 'com.lantharos.kestrel.glass';

export type GlassStyle = 'luca' | 'maris';

export type Glass = {
	taskbar: GlassStyle;
	surfaces: GlassStyle;
	windows: GlassStyle;
	'maris-on-power-saver': boolean;
};

export function glassSummary(glass: Partial<Glass>): GlassStyle | 'mixed' {
	const styles = new Set([glass.taskbar ?? 'luca', glass.surfaces ?? 'luca', glass.windows ?? 'luca']);
	return styles.size === 1 ? [...styles][0] : 'mixed';
}
