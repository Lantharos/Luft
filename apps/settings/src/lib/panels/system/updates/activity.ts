import type { Activity, Elsewhere } from './api';

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function elsewhere({ by, change }: Elsewhere) {
	switch (change) {
		case 'refresh':
			return by ? capitalized(`${by} is looking for updates`) : 'Looking for updates…';
		case 'download':
			return by ? `Updates are being downloaded by ${by}` : 'Downloading updates…';
		case 'update':
			return by ? `Updates are being installed by ${by}` : 'Updates are being installed';
		case 'install':
			return by ? `Software is being installed by ${by}` : 'Software is being installed';
		case 'remove':
			return by ? `Software is being removed by ${by}` : 'Software is being removed';
		default:
			return by ? `Software is being changed by ${by}` : 'Software is being changed';
	}
}

export function describe(activity: Activity) {
	switch (activity.running) {
		case 'check':
			return 'Looking for updates…';
		case 'download':
			return 'Downloading updates…';
		case 'elsewhere':
			return activity.elsewhere ? elsewhere(activity.elsewhere) : null;
		default:
			return null;
	}
}

export const fractionOf = (activity: Activity) => activity.progress?.fraction ?? null;

export const showsProgress = (activity: Activity) => activity.running === 'download' || activity.running === 'elsewhere';
