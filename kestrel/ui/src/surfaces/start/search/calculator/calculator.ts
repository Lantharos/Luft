import St from 'gi://St';

import { formatsLocale, t } from '../../../../shared/i18n/index.js';
import { themedIcon } from '../icons.js';
import type { SearchItem } from '../item.js';
import { evaluate } from './expression.js';
import { convert } from './units.js';

class Format {
  private readonly shown: Intl.NumberFormat;
  private readonly copied: Intl.NumberFormat;

  constructor(locale: string, digits: number) {
    this.shown = new Intl.NumberFormat(locale, { maximumSignificantDigits: digits });
    this.copied = new Intl.NumberFormat(locale, { maximumSignificantDigits: digits, useGrouping: false });
  }

  show(value: number): string { return this.shown.format(value); }
  copy(value: number): string { return this.copied.format(value); }
}

export class Calculator {
  private readonly calculation = new Format(formatsLocale(), 12);
  private readonly conversion = new Format(formatsLocale(), 6);

  constructor(private readonly close: () => void) {}

  find(text: string): SearchItem | null {
    const conversion = convert(text);
    if (conversion) {
      const { value, from, to, amount } = conversion;
      return this.item(`${this.conversion.show(value)} ${to.symbol}`, `${this.conversion.copy(value)} ${to.symbol}`,
        t('start-search-conversion', { amount: this.conversion.show(amount), from: from.symbol, to: to.symbol }));
    }
    const value = evaluate(text, true);
    return value === null ? null : this.item(this.calculation.show(value), this.calculation.copy(value), text.trim());
  }

  private item(result: string, copy: string, expression: string): SearchItem {
    return {
      key: 'calculation', title: `= ${result}`, description: t('start-search-calculation', { expression }),
      icon: themedIcon('accessories-calculator-symbolic'),
      activate: () => {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, copy);
        this.close();
      },
    };
  }
}
