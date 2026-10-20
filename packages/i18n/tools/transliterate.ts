import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LATIN: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n',
	њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š'
};
const UPPER_DIGRAPHS: Record<string, string> = { Љ: 'Lj', Њ: 'Nj', Џ: 'Dž' };

export function serbianLatin(text: string): string {
	return text.replace(/[Ѐ-ӿ]/g, (letter, offset: number) => {
		const lower = letter.toLowerCase();
		const latin = LATIN[lower];
		if (!latin) return letter;
		if (letter === lower) return latin;
		const shouting = /[Ѐ-Я]/.test(text[offset + 1] ?? '') || /[Ѐ-Я]/.test(text[offset - 1] ?? '');
		return shouting ? latin.toUpperCase() : (UPPER_DIGRAPHS[letter] ?? latin.toUpperCase());
	});
}

const ROOT = join(import.meta.dir, '../../..');
const components: { mask: string }[] = JSON.parse(readFileSync(join(import.meta.dir, '../components.json'), 'utf8'));

export const latinFileOf = (mask: string) => join(ROOT, mask.replace('*', 'sr-Latn'));
export const cyrillicFileOf = (mask: string) => join(ROOT, mask.replace('*', 'sr'));

if (import.meta.main) {
	for (const { mask } of components) writeFileSync(latinFileOf(mask), serbianLatin(readFileSync(cyrillicFileOf(mask), 'utf8')));
}
