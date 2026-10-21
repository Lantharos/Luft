import { words } from './text.js';

export type SpanUnit = 'days' | 'weeks' | 'months' | 'years';
export type Unit = SpanUnit | 'hours' | 'minutes';

export const PHRASE_LOCALES = ['en', 'de', 'sq', 'hr', 'bs', 'sr-Latn'];

export const UNIT_WORDS: Record<Unit, Set<string>> = {
  minutes: words('minute minutes min mins minuten minut minuta minutash'),
  hours: words('hour hours hr hrs h stunde stunden std ore ora oresh sat sata sati cas casa casova'),
  days: words('day days d tag tage tagen dite dita ditet ditesh dan dana dani danu'),
  weeks: words('week weeks wk wks woche wochen jave java javet javesh tjedan tjedna tjedana tjedni sedmica sedmice sedmicu',
    'nedelja nedelje nedelju nedjelja nedjelje nedjelju'),
  months: words('month months mo mos monat monate monaten muaj muaji muajsh mjesec mjeseca mjeseci mesec meseca meseci'),
  years: words('year years yr yrs y jahr jahre jahren vit vite vjet vjete vitesh godina godine godinu godinama'),
};

export const WEEKDAY_WORDS = words('weekday wochentag dite dan');

export const FILLERS = words(
  'how many much long what whats which when is was will be it its the are there of on for does did left remain remaining date',
  'wie viele viel lange welcher welche welches was ist sind es noch der die das den dem des zum zur am war wird sein datum fur',
  'sa cfare cila cili eshte jane ka kane mbeten mbetur te ne me qe ishte data dates',
  'koliko je su ima jos ostalo li koji koja koje bio bila bilo datum',
);

export const PAST_HINTS = words('was did war ishte bio bila bilo');

export const UNTIL = words('until till til to bis deri do');
export const SINCE = words('since seit nga od');
export const BETWEEN = words('between zwischen midis ndermjet mes izmedju izmedu');
export const AND = words('and und dhe i');
export const RANGE_START = words('from von vom nga od');
export const RANGE_END = words('to until till bis deri do');
export const AFTER = words('after from nach ab pas nga od nakon posle poslije');
export const BEFORE = words('before vor para prije pre pred');
export const AGO = words('ago pare unazad');
export const AGO_BEFORE = words('vor prije pre pred');
export const WITHIN = words('in within za per pas');
export const NEXT = words('next coming nachsten nachster nachste kommenden kommender tjeter ardhshme sljedeci sljedeca sljedece iduci iduca iduce sledeci sledeca sledece');
export const LAST = words('last previous letzten letzter vergangenen kaluar kaluare prosli prosla prosle protekli');
export const TODAY = words('today now heute jetzt sot tani danas sada sad');
export const TOMORROW = words('tomorrow morgen neser sutra');
export const YESTERDAY = words('yesterday gestern dje juce jucer');
export const TIME_WORDS = words('time clock uhrzeit zeit spat ora sati sat vrijeme vreme vremena');
export const AT_PLACE = words('in im at u');
export const INTO_PLACE = words('in to into nach u na');
export const CLOCK_SUFFIX = words('uhr h oclock sati sat');
export const AM = words('am');
export const PM = words('pm');
export const NOON = words('noon mittag mitdita podne');
export const MIDNIGHT = words('midnight mitternacht mesnate ponoc');
export const ORDINAL = words('st nd rd th');
export const OF_WORDS = words('von nga od prej');

export const HOLIDAYS: readonly [words: string[], month: number, day: number][] = [
  ...['christmas', 'xmas', 'weihnachten', 'krishtlindje', 'krishtlindjet', 'krishtlindjeve', 'bozic', 'bozica'].map(word => [[word], 12, 25] as [string[], number, number]),
  ...['new year', 'new years', 'neujahr', 'nova godina', 'nove godine', 'novu godinu', 'viti i ri', 'vitit ri'].map(phrase => [phrase.split(' '), 1, 1] as [string[], number, number]),
  [['new', 'years', 'eve'], 12, 31], [['silvester'], 12, 31],
];

export const NUMBER_WORDS: ReadonlyMap<string, number> = new Map([
  ...['a', 'an', 'one', 'ein', 'eine', 'einen', 'einem', 'nje', 'jedan', 'jedna', 'jednu', 'jedne'].map(word => [word, 1] as const),
  ...['two', 'zwei', 'dy', 'dva', 'dvije', 'dve'].map(word => [word, 2] as const),
  ...['three', 'drei', 'tre', 'tri'].map(word => [word, 3] as const),
  ...['four', 'vier', 'kater', 'cetiri'].map(word => [word, 4] as const),
  ...['five', 'funf', 'pese', 'pet'].map(word => [word, 5] as const),
  ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9], ['ten', 10], ['eleven', 11], ['twelve', 12],
]);

export const PERCENT_WORDS = 'percent|percentage|prozent|perqind|posto|postotak|postotku|postocima|procenat|procenata|procentima|procent';
