/** Cyrillic letters the recognizer reads Latin handwriting as, by what they look like when written. */
const LOOKALIKES: Record<string, string> = {
	а: 'a', е: 'e', ё: 'ë', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', к: 'k', м: 'm', т: 't', и: 'u', й: 'ŭ', п: 'n', з: 'z', г: 'r', і: 'i', ї: 'ï', ј: 'j', ѕ: 's', ԁ: 'd',
	А: 'A', В: 'B', Е: 'E', Ё: 'Ë', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', У: 'Y', Х: 'X', І: 'I', Ј: 'J', Ѕ: 'S'
};

const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATIN = /\p{Script=Latin}/u;

const base = (letter: string) => letter.normalize('NFD')[0];

/**
 * Tidies what the recognizer read for someone who writes in Latin letters:
 * words it read as look-alike Cyrillic come back as Latin, and an accent none
 * of the person's languages use becomes the one they do when that letter has
 * only one accented form in them, like ē or ė for ë in Albanian.
 */
export function tidy(text: string, letters: Set<string>, cyrillic: boolean): string {
	const words = text.split(' ').map((word) => {
		if (cyrillic || !CYRILLIC.test(word) || ![...word].every((letter) => !CYRILLIC.test(letter) || LOOKALIKES[letter])) return word;
		return [...word].map((letter) => LOOKALIKES[letter] ?? letter).join('');
	});
	return words
		.map((word) =>
			[...word]
				.map((letter) => {
					if (!LATIN.test(letter) || letter.normalize('NFD').length === 1 || letters.has(letter.toLowerCase())) return letter;
					const plain = base(letter);
					const ours = [...letters].filter((candidate) => base(candidate) === plain.toLowerCase());
					if (ours.length !== 1) return letter;
					return plain === plain.toLowerCase() ? ours[0] : ours[0].toUpperCase();
				})
				.join('')
		)
		.join(' ');
}
