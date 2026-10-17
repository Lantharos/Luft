import St from 'gi://St';

import { themedIcon } from '../icons.js';
import type { SearchItem } from '../item.js';
import { evaluate } from './expression.js';
import { convert } from './units.js';

class Format {
  private readonly shown: Intl.NumberFormat;
  private readonly copied: Intl.NumberFormat;

  constructor(digits: number) {
    this.shown = new Intl.NumberFormat(undefined, { maximumSignificantDigits: digits });
    this.copied = new Intl.NumberFormat(undefined, { maximumSignificantDigits: digits, useGrouping: false });
  }

  show(value: number): string { return this.shown.format(value); }
  copy(value: number): string { return this.copied.format(value); }
}

const CALCULATION = new Format(12);
const CONVERSION = new Format(6);

export class Calculator {
  constructor(private readonly close: () => void) {}

  find(text: string): SearchItem | null {
    const conversion = convert(text);
    if (conversion) {
      const { value, from, to, amount } = conversion;
      return this.item(`${CONVERSION.show(value)} ${to.symbol}`, `${CONVERSION.copy(value)} ${to.symbol}`,
        `${CONVERSION.show(amount)} ${from.symbol} in ${to.symbol}`);
    }
    const value = evaluate(text, true);
    return value === null ? null : this.item(CALCULATION.show(value), CALCULATION.copy(value), text.trim());
  }

  private item(result: string, copy: string, expression: string): SearchItem {
    return {
      key: 'calculation', title: `= ${result}`, description: `${expression}, press Enter to copy`,
      icon: themedIcon('accessories-calculator-symbolic'),
      activate: () => {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, copy);
        this.close();
      },
    };
  }
}
