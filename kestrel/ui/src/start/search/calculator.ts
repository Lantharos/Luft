const OPERATOR = /[+\-*/%^×÷]/;
const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };

function tokenize(expression: string): string[] | null {
  const tokens = expression.replaceAll('×', '*').replaceAll('÷', '/').replaceAll(',', '.').match(/\d*\.?\d+|[()+\-*/%^]|\S/g);
  return tokens && tokens.every(token => /^(\d*\.?\d+|[()+\-*/%^])$/.test(token)) ? tokens : null;
}

class Parser {
  private index = 0;

  constructor(private readonly tokens: string[]) {}

  parse(): number | null {
    const value = this.expression(1);
    return value !== null && this.index === this.tokens.length ? value : null;
  }

  private expression(minimum: number): number | null {
    let left = this.unary();
    while (left !== null) {
      const operator = this.tokens[this.index];
      const precedence = PRECEDENCE[operator];
      if (!precedence || precedence < minimum) break;
      this.index++;
      const right = this.expression(operator === '^' ? precedence : precedence + 1);
      if (right === null) return null;
      left = operator === '+' ? left + right : operator === '-' ? left - right : operator === '*' ? left * right
        : operator === '/' ? left / right : operator === '%' ? left % right : left ** right;
    }
    return left;
  }

  private unary(): number | null {
    const token = this.tokens[this.index++];
    if (token === '-') {
      const value = this.unary();
      return value === null ? null : -value;
    }
    if (token === '(') {
      const value = this.expression(1);
      return this.tokens[this.index++] === ')' ? value : null;
    }
    return token !== undefined && /\d/.test(token) ? Number(token) : null;
  }
}

export function calculate(expression: string): string | null {
  if (!OPERATOR.test(expression) || !/\d/.test(expression)) return null;
  const tokens = tokenize(expression);
  const value = tokens && tokens.length > 2 ? new Parser(tokens).parse() : null;
  if (value === null || !Number.isFinite(value)) return null;
  return String(Number(value.toPrecision(12)));
}
