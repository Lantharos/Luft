const WORD_BASE = 0x80;

export interface StoredSection {
  readonly title: string;
  readonly characters: string;
  readonly names: string;
  readonly labels?: readonly string[];
}

interface StoredTab {
  readonly id: string;
  readonly title: string;
  readonly glyph: string;
  readonly sections: readonly StoredSection[];
}

export interface CharacterTable {
  readonly words: string;
  readonly tabs: readonly StoredTab[];
  readonly aliases: Readonly<Record<string, string[]>>;
}

export interface Character {
  readonly text: string;
  readonly name: string;
  readonly label: string | null;
  readonly aliases: string[];
}

export function codepointOf(text: string): string {
  return `U+${text.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
}

export function characterDecoder(table: CharacterTable): (section: StoredSection) => Character[] {
  const words = table.words.split(' ');
  const decode = (encoded: string) => {
    let name = words[encoded.charCodeAt(0) - WORD_BASE];
    for (let index = 1; index < encoded.length; index++) name += ` ${words[encoded.charCodeAt(index) - WORD_BASE]}`;
    return name;
  };
  return section => {
    const names = section.names.split('\n');
    return Array.from(section.characters, (text, index) => (
      { text, name: decode(names[index]), label: section.labels?.[index] ?? null, aliases: table.aliases[text] ?? [] }
    ));
  };
}
