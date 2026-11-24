export type SignalLevel = 'none' | 'weak' | 'ok' | 'good' | 'excellent';

const LEVELS: [least: number, level: SignalLevel][] = [
	[65, 'excellent'],
	[45, 'good'],
	[25, 'ok'],
	[5, 'weak'],
];

export const signalLevel = (strength: number): SignalLevel => LEVELS.find(([least]) => strength >= least)?.[1] ?? 'none';
