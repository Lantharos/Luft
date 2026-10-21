const TOKEN = /\s*(\d{1,3}(?:[.,'\u00a0\u202f]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?|[.,]\d+|\*\*|[-+*/^%×÷()√π]|[a-z]+)/y;
const ALIASES: Record<string, string> = { ',': '.', '×': '*', '÷': '/', '**': '^', x: '*' };
const FUNCTIONS: Record<string, (value: number) => number> = {
  sqrt: Math.sqrt, '√': Math.sqrt, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil, ln: Math.log, log: Math.log10,
};
const CONSTANTS: Record<string, number> = { pi: Math.PI, π: Math.PI, e: Math.E };
const BINARY: Record<string, { precedence: number; rightAssociative: boolean }> = {
  '+': { precedence: 1, rightAssociative: false }, '-': { precedence: 1, rightAssociative: false },
  '*': { precedence: 2, rightAssociative: false }, '/': { precedence: 2, rightAssociative: false },
  mod: { precedence: 2, rightAssociative: false }, of: { precedence: 2, rightAssociative: false },
  '^': { precedence: 4, rightAssociative: true },
};
const IMPLICIT = '*';
const UNARY = 3;

interface Value {
  number: number;
  percent: boolean;
}

const plain = (number: number): Value => ({ number, percent: false });

export type Decimal = '.' | ',';

const MARKS = /[.,'\u00a0\u202f]/g;

function decimalMark(token: string, decimal: Decimal): number {
  const marks = [...token.matchAll(MARKS)];
  const last = marks[marks.length - 1];
  if (!last) return -1;
  if (new Set(marks.map(([mark]) => mark)).size > 1) return last.index;
  if (marks.length > 1) return -1;
  const thousands = /^\d{1,3}.\d{3}$/.test(token);
  return last[0] === decimal || !thousands ? last.index : -1;
}

function plainNumber(token: string, decimal: Decimal): string {
  const mark = decimalMark(token, decimal);
  return [...token].map((character, index) => index === mark ? '.' : /\d/.test(character) ? character : '').join('');
}

function tokenize(text: string, decimal: Decimal): string[] | null {
  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < text.length) {
    const start = TOKEN.lastIndex;
    const match = TOKEN.exec(text);
    if (!match) return text.slice(start).trim() ? null : tokens;
    const token = match[1];
    tokens.push(/^[\d.,]/.test(token) ? plainNumber(token, decimal) : ALIASES[token] ?? token);
  }
  return tokens;
}

function combine(operator: string, left: Value, right: Value): Value | null {
  const [a, b] = [left.number, right.number];
  switch (operator) {
    case '+': return plain(right.percent ? a * (1 + b) : a + b);
    case '-': return plain(right.percent ? a * (1 - b) : a - b);
    case '*': return plain(a * b);
    case '/': return plain(a / b);
    case 'mod': return plain(a % b);
    case 'of': return left.percent ? plain(a * b) : null;
    default: return plain(a ** b);
  }
}

class Parser {
  private index = 0;
  operations = 0;

  constructor(private readonly tokens: string[]) {}

  parse(): number | null {
    const value = this.expression(0);
    return value && this.index === this.tokens.length ? value.number : null;
  }

  private multipliesImplicitly(token: string | undefined): boolean {
    return token !== undefined && (token === '(' || token in FUNCTIONS || token in CONSTANTS);
  }

  private expression(minimum: number): Value | null {
    let left = this.prefix();
    while (left) {
      const token = this.tokens[this.index];
      const operator = token !== undefined && token in BINARY ? token : this.multipliesImplicitly(token) ? IMPLICIT : null;
      if (!operator || BINARY[operator].precedence < minimum) break;
      if (operator === token) this.index++;
      const { precedence, rightAssociative } = BINARY[operator];
      const right = this.expression(rightAssociative ? precedence : precedence + 1);
      left = right && combine(operator, left, right);
      this.operations++;
    }
    return left;
  }

  private prefix(): Value | null {
    const token = this.tokens[this.index];
    if (token === '-' || token === '+') {
      this.index++;
      const value = this.expression(UNARY);
      return value && { ...value, number: token === '-' ? -value.number : value.number };
    }
    if (token !== undefined && token in FUNCTIONS) {
      this.index++;
      const value = this.atom();
      this.operations++;
      return value && plain(FUNCTIONS[token](value.number));
    }
    return this.atom();
  }

  private atom(): Value | null {
    const token = this.tokens[this.index++];
    let value: Value | null = null;
    if (token === '(') {
      value = this.expression(0);
      if (this.tokens[this.index++] !== ')') return null;
    } else if (token !== undefined && token in CONSTANTS) {
      value = plain(CONSTANTS[token]);
    } else if (token !== undefined && /^[\d.]/.test(token)) {
      value = plain(Number(token));
    }
    while (value && this.tokens[this.index] === '%') {
      this.index++;
      this.operations++;
      value = { number: value.number / 100, percent: true };
    }
    return value;
  }
}

export function evaluate(text: string, requireOperation: boolean, decimal: Decimal = '.'): number | null {
  const tokens = tokenize(text.toLocaleLowerCase(), decimal);
  if (!tokens?.length) return null;
  const parser = new Parser(tokens);
  const value = parser.parse();
  if (value === null || !Number.isFinite(value)) return null;
  return requireOperation && parser.operations === 0 ? null : value;
}
