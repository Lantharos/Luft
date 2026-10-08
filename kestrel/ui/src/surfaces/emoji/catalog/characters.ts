import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

const WORD_BASE = 0x80;

interface StoredSection {
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

interface CharacterTable {
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

export interface CharacterSection {
  readonly title: string;
  readonly characters: Character[];
}

export interface CharacterTab {
  readonly id: string;
  readonly title: string;
  readonly glyph: string;
  readonly sections: CharacterSection[];
}

function decoder(words: readonly string[]): (encoded: string) => string {
  return encoded => {
    let name = words[encoded.charCodeAt(0) - WORD_BASE];
    for (let index = 1; index < encoded.length; index++) name += ` ${words[encoded.charCodeAt(index) - WORD_BASE]}`;
    return name;
  };
}

export function codepointOf(text: string): string {
  return `U+${text.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
}

export function loadCharacters(): CharacterTab[] {
  const path = `${(global as unknown as Shell.Global).datadir}/characters.json`;
  const table: CharacterTable = JSON.parse(new TextDecoder().decode(GLib.file_get_contents(path)[1]));
  const decode = decoder(table.words.split(' '));
  return table.tabs.map(({ sections, ...tab }) => ({
    ...tab,
    sections: sections.map(section => {
      const names = section.names.split('\n');
      return {
        title: section.title,
        characters: Array.from(section.characters, (text, index) => (
          { text, name: decode(names[index]), label: section.labels?.[index] ?? null, aliases: table.aliases[text] ?? [] }
        )),
      };
    }),
  }));
}
