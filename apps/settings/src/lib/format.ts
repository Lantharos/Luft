import { i18n } from '@luft/i18n';

function formatter(options: Intl.NumberFormatOptions) {
	let locale = '';
	let format: Intl.NumberFormat;
	return () => {
		if (locale !== i18n.formats) {
			locale = i18n.formats;
			format = new Intl.NumberFormat(locale, options);
		}
		return format;
	};
}

const gigabytes = formatter({ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 0 });
const percents = formatter({ style: 'percent' });

export const binaryBytes = (value: number) => gigabytes().format(value / 1024 ** 3);

export const percent = (value: number) => percents().format(value);
