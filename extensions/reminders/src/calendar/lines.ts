const LONGEST_LINE = 74;

export interface Property {
  name: string;
  params: Map<string, string>;
  value: string;
}

/** The lines of a calendar file with folded ones put back together. */
export function unfolded(text: string): string[] {
  const lines: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length) lines[lines.length - 1] += line.slice(1);
    else if (line) lines.push(line);
  }
  return lines;
}

export function property(line: string): Property {
  const colon = line.indexOf(':');
  const [name, ...params] = line.slice(0, colon).split(';') as [string, ...string[]];
  return {
    name: name.toUpperCase(),
    params: new Map(params.map(param => {
      const [key, value] = param.split('=') as [string, string];
      return [key.toUpperCase(), value];
    })),
    value: line.slice(colon + 1),
  };
}

export const unescaped = (value: string) => value.replace(/\\([nN,;\\])/g, (_match, letter: string) => (letter.toLowerCase() === 'n' ? '\n' : letter));

export const escaped = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Folds a line the way the format asks, at 75 bytes, without cutting a character in two. */
export function folded(line: string): string {
  const encoder = new TextEncoder();
  const pieces: string[] = [];
  let piece = '';
  let size = 0;
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (size + bytes > LONGEST_LINE) {
      pieces.push(piece);
      piece = ' ';
      size = 1;
    }
    piece += character;
    size += bytes;
  }
  pieces.push(piece);
  return pieces.join('\r\n');
}
