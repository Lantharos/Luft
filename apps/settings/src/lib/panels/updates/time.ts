const RECENT_DAYS = 7;

export const recently = (seconds: number) => Date.now() / 1000 - seconds < RECENT_DAYS * 24 * 60 * 60;
