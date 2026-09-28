import { invoke, listen } from '$lib/bridge';

export interface Clock {
	timezone: string;
	automatic: boolean;
	canAutomatic: boolean;
}

export interface Zone {
	id: string;
	country: string | null;
}

export const clock = () => invoke<Clock>('datetime_clock');
export const zones = () => invoke<Zone[]>('datetime_zones');
export const setTimezone = (timezone: string) => invoke<void>('datetime_set_timezone', { timezone });
export const setAutomatic = (enabled: boolean) => invoke<void>('datetime_set_automatic', { enabled });
export const setTime = (usec: number) => invoke<void>('datetime_set_time', { usec });
export const onClockChanged = (callback: (clock: Clock) => void) => listen<Clock>('datetime.changed', callback);
