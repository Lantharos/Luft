export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Matches a month by name or three-letter short form. */
export const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
/** Matches a weekday by name or short form. */
export const WEEKDAY = '(mon(?:day)?|tue(?:s(?:day)?)?|wed(?:s|nesday)?|thu(?:rs?(?:day)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)';
/** Matches a weekday spelled out, which reads as a date on its own, unlike "sat" or "sun". */
export const FULL_WEEKDAY = '(monday|tuesday|wednesday|thursday|friday|saturday|sunday)';
export const ORDINAL = '(\\d{1,2})(?:st|nd|rd|th)';
export const COUNT = '(\\d+|an?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';

const COUNTS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export const countOf = (word: string) => (/^an?$/i.test(word) ? 1 : Number(word) || COUNTS.indexOf(word.toLowerCase()) + 1);

/** 1 to 12. */
export const monthOf = (word: string) => MONTHS.findIndex(month => month.startsWith(word.toLowerCase().slice(0, 3))) + 1;

/** 0 for Sunday. */
export const weekdayIn = (word: string) => WEEKDAYS.findIndex(weekday => weekday.startsWith(word.toLowerCase().slice(0, 3)));

const ORDER = ['first', 'second', 'third', 'fourth'];

/** 1 to 4 for the first to the fourth, -1 for the last. */
export const orderOf = (word: string) => (word.toLowerCase() === 'last' ? -1 : ORDER.indexOf(word.toLowerCase()) + 1 || Number.parseInt(word, 10));
