import type { Mark } from './marks';

const COMBINING: Record<Exclude<Mark, 'bar'>, string[]> = {
	caron: ['̌'],
	circumflex: ['̂'],
	acute: ['́'],
	grave: ['̀'],
	dash: ['̈', '̄'],
	dot: ['̇', '̈'],
	cedilla: ['̧', '̨']
};

const BARRED: Record<string, string> = { d: 'đ', D: 'Đ', h: 'ħ', H: 'Ħ', l: 'ł', L: 'Ł', t: 'ŧ', T: 'Ŧ', g: 'ǥ', G: 'Ǥ', o: 'ø', O: 'Ø' };

const LETTERS: Record<string, string> = {
	sr: 'čćšžđ',
	hr: 'čćšžđ',
	bs: 'čćšžđ',
	sl: 'čšž',
	mk: 'ѓќ',
	de: 'äöüß',
	sq: 'ëç',
	fr: 'àâæçéèêëîïôœùûüÿ',
	es: 'áéíñóúü',
	it: 'àèéìíîòóùú',
	pt: 'áâãàçéêíóôõú',
	cs: 'áčďéěíňóřšťúůýž',
	sk: 'áäčďéíĺľňóôŕšťúýž',
	pl: 'ąćęłńóśźż',
	hu: 'áéíóöőúüű',
	ro: 'ăâîșț',
	tr: 'çğıöşü',
	nl: 'éëïö',
	da: 'æøå',
	nb: 'æøå',
	nn: 'æøå',
	sv: 'åäö',
	fi: 'äö',
	is: 'áðéíóúýþæö',
	lt: 'ąčęėįšųūž',
	lv: 'āčēģīķļņšūž',
	et: 'äõöüšž',
	mt: 'ċġħż',
	ca: 'àçéèíïóòúü',
	ga: 'áéíóú'
};

export function lettersOf(languages: readonly string[], seen = ''): Set<string> {
	const letters = new Set<string>();
	for (const language of languages) for (const letter of LETTERS[language.split('-')[0].toLowerCase()] ?? '') letters.add(letter);
	for (const letter of seen) if (letter.normalize('NFD').length > 1 || letter === 'ß') letters.add(letter.toLowerCase());
	return letters;
}

const base = (letter: string) => letter.normalize('NFD')[0];

export function withMark(letter: string, mark: Mark): string[] {
	const plain = base(letter);
	if (mark === 'bar') return BARRED[plain] ? [BARRED[plain]] : [];
	return COMBINING[mark].map((combining) => (plain + combining).normalize('NFC')).filter((made) => made.length === 1 && made !== letter);
}

const isLower = (letter: string | undefined) => !!letter && letter !== letter.toUpperCase();

export function placeMark(text: string, nearest: number[], mark: Mark, letters: Set<string>): { index: number; letter: string } | null {
	let best: { index: number; letter: string } | null = null;
	let lowest = Infinity;
	for (const [rank, index] of nearest.entries()) {
		const letter = text[index];
		const made = withMark(letter, mark);
		if (letter === 'B' && isLower(text[index - 1]) && (isLower(text[index + 1]) || !text[index + 1]?.trim())) made.push('ß');
		for (const [order, result] of made.entries()) {
			const cost = rank + order * 0.25 + (letters.has(result.toLowerCase()) ? 0 : 1.5);
			if (cost < lowest) [lowest, best] = [cost, { index, letter: result }];
		}
	}
	return best;
}
