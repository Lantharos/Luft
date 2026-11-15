import { t } from '@luft/i18n';

export type LineEnding = 'lf' | 'crlf';

export const LINE_BREAKS: Record<LineEnding, string> = { lf: '\n', crlf: '\r\n' };

type Region =
	| 'western'
	| 'central-european'
	| 'cyrillic'
	| 'greek'
	| 'turkish'
	| 'hebrew'
	| 'arabic'
	| 'baltic'
	| 'vietnamese'
	| 'japanese'
	| 'chinese-simplified'
	| 'chinese-traditional'
	| 'korean';

interface Encoding {
	label: string;
	code: string;
	region?: Region;
}

export const ENCODINGS: readonly Encoding[] = [
	{ label: 'utf-8', code: 'UTF-8' },
	{ label: 'utf-16le', code: 'UTF-16 LE' },
	{ label: 'utf-16be', code: 'UTF-16 BE' },
	{ label: 'windows-1252', code: 'Windows 1252', region: 'western' },
	{ label: 'iso-8859-15', code: 'ISO 8859-15', region: 'western' },
	{ label: 'windows-1250', code: 'Windows 1250', region: 'central-european' },
	{ label: 'iso-8859-2', code: 'ISO 8859-2', region: 'central-european' },
	{ label: 'windows-1251', code: 'Windows 1251', region: 'cyrillic' },
	{ label: 'koi8-r', code: 'KOI8-R', region: 'cyrillic' },
	{ label: 'windows-1253', code: 'Windows 1253', region: 'greek' },
	{ label: 'windows-1254', code: 'Windows 1254', region: 'turkish' },
	{ label: 'windows-1255', code: 'Windows 1255', region: 'hebrew' },
	{ label: 'windows-1256', code: 'Windows 1256', region: 'arabic' },
	{ label: 'windows-1257', code: 'Windows 1257', region: 'baltic' },
	{ label: 'windows-1258', code: 'Windows 1258', region: 'vietnamese' },
	{ label: 'shift_jis', code: 'Shift JIS', region: 'japanese' },
	{ label: 'euc-jp', code: 'EUC-JP', region: 'japanese' },
	{ label: 'gbk', code: 'GBK', region: 'chinese-simplified' },
	{ label: 'gb18030', code: 'GB 18030', region: 'chinese-simplified' },
	{ label: 'big5', code: 'Big5', region: 'chinese-traditional' },
	{ label: 'euc-kr', code: 'EUC-KR', region: 'korean' }
];

function regionTitle(region: Region, code: string) {
	switch (region) {
		case 'western':
			return t('draft-encoding-western', { code });
		case 'central-european':
			return t('draft-encoding-central-european', { code });
		case 'cyrillic':
			return t('draft-encoding-cyrillic', { code });
		case 'greek':
			return t('draft-encoding-greek', { code });
		case 'turkish':
			return t('draft-encoding-turkish', { code });
		case 'hebrew':
			return t('draft-encoding-hebrew', { code });
		case 'arabic':
			return t('draft-encoding-arabic', { code });
		case 'baltic':
			return t('draft-encoding-baltic', { code });
		case 'vietnamese':
			return t('draft-encoding-vietnamese', { code });
		case 'japanese':
			return t('draft-encoding-japanese', { code });
		case 'chinese-simplified':
			return t('draft-encoding-chinese-simplified', { code });
		case 'chinese-traditional':
			return t('draft-encoding-chinese-traditional', { code });
		case 'korean':
			return t('draft-encoding-korean', { code });
	}
}

export const encodingTitle = ({ code, region }: Encoding) => (region ? regionTitle(region, code) : code);

export function encodingName(label: string, bom = false) {
	const name = ENCODINGS.find((encoding) => encoding.label === label)?.code ?? label.toUpperCase();
	return bom ? t('draft-status-encoding-bom', { encoding: name }) : name;
}
