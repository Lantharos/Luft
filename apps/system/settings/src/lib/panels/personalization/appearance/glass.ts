export const GLASS_SCHEMA = 'com.lantharos.kestrel.glass';

export type GlassStyle = 'luca' | 'maris' | 'niko' | 'vesa';
export type GlassKind = 'taskbar' | 'surfaces' | 'windows';
export type GlassBlurs = 'everything' | 'wallpaper';

export type Glass = {
	taskbar: GlassStyle;
	surfaces: GlassStyle;
	windows: GlassStyle;
	'see-through': GlassStyle;
	blurs: GlassBlurs;
	'wallpaper-on-power-saver': boolean;
};

export function glassSummary(glass: Partial<Glass>): GlassStyle | 'mixed' {
	const styles = new Set([glass.taskbar ?? 'niko', glass.surfaces ?? 'niko', glass.windows ?? 'niko']);
	return styles.size === 1 ? [...styles][0] : 'mixed';
}
