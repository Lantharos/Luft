export type LineEnding = 'lf' | 'crlf';

export const LINE_BREAKS: Record<LineEnding, string> = { lf: '\n', crlf: '\r\n' };

export const ENCODINGS = [
	{ label: 'utf-8', name: 'UTF-8' },
	{ label: 'utf-16le', name: 'UTF-16 LE' },
	{ label: 'utf-16be', name: 'UTF-16 BE' },
	{ label: 'windows-1252', name: 'Western (Windows 1252)' },
	{ label: 'iso-8859-15', name: 'Western (ISO 8859-15)' },
	{ label: 'windows-1250', name: 'Central European (Windows 1250)' },
	{ label: 'iso-8859-2', name: 'Central European (ISO 8859-2)' },
	{ label: 'windows-1251', name: 'Cyrillic (Windows 1251)' },
	{ label: 'koi8-r', name: 'Cyrillic (KOI8-R)' },
	{ label: 'windows-1253', name: 'Greek (Windows 1253)' },
	{ label: 'windows-1254', name: 'Turkish (Windows 1254)' },
	{ label: 'windows-1255', name: 'Hebrew (Windows 1255)' },
	{ label: 'windows-1256', name: 'Arabic (Windows 1256)' },
	{ label: 'windows-1257', name: 'Baltic (Windows 1257)' },
	{ label: 'windows-1258', name: 'Vietnamese (Windows 1258)' },
	{ label: 'shift_jis', name: 'Japanese (Shift JIS)' },
	{ label: 'euc-jp', name: 'Japanese (EUC-JP)' },
	{ label: 'gbk', name: 'Chinese Simplified (GBK)' },
	{ label: 'gb18030', name: 'Chinese Simplified (GB 18030)' },
	{ label: 'big5', name: 'Chinese Traditional (Big5)' },
	{ label: 'euc-kr', name: 'Korean (EUC-KR)' }
] as const;

export function encodingName(label: string, bom = false) {
	const name = ENCODINGS.find((encoding) => encoding.label === label)?.name.replace(/^.*\((.+)\)$/, '$1') ?? label.toUpperCase();
	return bom ? `${name} BOM` : name;
}
