import St from 'gi://St';

import { formatsLocale, t } from '../../../shared/i18n/index.js';
import { themedIcon } from '../icons.js';
import type { SearchItem } from '../item.js';
import { evaluate, type Decimal } from './expression.js';
import { convert, type Unit } from './units.js';

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

const decimalOf = (locale: string) =>
  new Intl.NumberFormat(locale).formatToParts(1.5).find(({ type }) => type === 'decimal')?.value === ',' ? ',' : '.';

export class Calculator {
  private readonly locale = formatsLocale();
  private readonly decimal: Decimal = decimalOf(this.locale);
  private readonly calculation = new Format(this.locale, 12);
  private readonly conversion = new Format(this.locale, 6);
  private readonly money = new Map<string, Intl.NumberFormat>();
  private readonly cents = new Intl.NumberFormat(this.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });

  constructor(private readonly close: () => void) {}

  find(text: string): SearchItem | null {
    const conversion = convert(text, this.decimal);
    if (conversion) {
      const { value, from, to, amount } = conversion;
      return this.item(this.shown(value, to), this.copied(value, to),
        t('start-search-conversion', { amount: this.conversion.show(amount), from: from.symbol, to: to.symbol }));
    }
    const value = evaluate(text, true, this.decimal);
    return value === null ? null : this.item(this.calculation.show(value), this.calculation.copy(value), text.trim());
  }

  private shown(value: number, unit: Unit): string {
    if (unit.dimension !== 'currency') return `${this.conversion.show(value)} ${unit.symbol}`;
    let format = this.money.get(unit.symbol);
    if (!format) {
      format = new Intl.NumberFormat(this.locale, { style: 'currency', currency: unit.symbol });
      this.money.set(unit.symbol, format);
    }
    return format.format(value);
  }

  private copied(value: number, unit: Unit): string {
    return unit.dimension === 'currency' ? this.cents.format(value) : `${this.conversion.copy(value)} ${unit.symbol}`;
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
