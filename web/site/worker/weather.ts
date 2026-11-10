import { refused, shared } from './shared';

const FORECAST =
	'https://api.open-meteo.com/v1/forecast?timeformat=unixtime&timezone=auto&forecast_days=1' +
	'&current=temperature_2m,precipitation,weather_code,wind_speed_10m,is_day&daily=sunrise,sunset';
const TENTHS = /^-?\d{1,3}\.\d$/;
const SHARED_SECONDS = 15 * 60;

interface Forecast {
	current: { time: number; temperature_2m: number; precipitation: number; weather_code: number; wind_speed_10m: number; is_day: number };
	daily: { sunrise: number[]; sunset: number[] };
}

function degrees(text: string | null, furthest: number) {
	if (!text || !TENTHS.test(text) || Math.abs(Number(text)) > furthest) return null;
	return Number(text).toFixed(1);
}

async function report(latitude: string, longitude: string) {
	const response = await fetch(`${FORECAST}&latitude=${latitude}&longitude=${longitude}`);
	if (!response.ok) return null;
	const { current, daily }: Forecast = await response.json();
	const numbers = {
		time: current.time,
		code: current.weather_code,
		temperature: current.temperature_2m,
		precipitation: current.precipitation,
		wind: current.wind_speed_10m,
		sunrise: daily.sunrise[0],
		sunset: daily.sunset[0]
	};
	if (!Object.values(numbers).every(Number.isFinite)) return null;
	return { ...numbers, day: current.is_day === 1 };
}

export function weather(url: URL, context: ExecutionContext) {
	const latitude = degrees(url.searchParams.get('lat'), 90);
	const longitude = degrees(url.searchParams.get('lon'), 180);
	if (!latitude || !longitude) return refused(400, 'lat and lon are degrees with one decimal, such as lat=48.2&lon=16.4.');
	return shared(`${url.origin}/api/weather?lat=${latitude}&lon=${longitude}`, SHARED_SECONDS, context, () => report(latitude, longitude));
}
