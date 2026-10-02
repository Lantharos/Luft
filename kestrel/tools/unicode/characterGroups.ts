export type Range = readonly [first: number, last: number];

export interface SectionSource {
  readonly title: string;
  readonly characters?: string;
  readonly ranges?: readonly Range[];
  readonly categories?: RegExp;
  readonly names?: RegExp;
  readonly labels?: Readonly<Record<string, string>>;
}

export interface TabSource {
  readonly id: string;
  readonly title: string;
  readonly glyph: string;
  readonly sections: readonly SectionSource[];
}

const LETTERS = /^L/;

export const TABS: readonly TabSource[] = [
  {
    id: 'common', title: 'Common symbols', glyph: '©', sections: [
      { title: 'Signs', characters: '©®™℠℗°№§¶†‡•‣※⁂℮℅℞⌀¦‖' },
      { title: 'Marks', characters: '✓✔✗✘☐☑☒★☆✦✧♠♣♥♦♤♧♡♢♩♪♫♬♭♮♯♀♂☚☛☜☞✂✎✏✉☎☏⚐⚑' },
      { title: 'Numbers', ranges: [[0x00B2, 0x00B3], [0x00B9, 0x00B9], [0x00BC, 0x00BE], [0x2070, 0x209F], [0x2150, 0x218B]] },
      { title: 'Units', characters: '‰‱′″‴℃℉µΩ℧Åℓ℔℥' },
      { title: 'Keyboard', characters: '⌘⌥⌃⇧⇪⌫⌦⏎↵⎋⇥⇤⏏⌤⌨⎀⇞⇟⌧⎈⌂⏻⏼⏽⭘␣' },
    ],
  },
  {
    id: 'arrows', title: 'Arrows', glyph: '→', sections: [
      { title: 'Arrows', ranges: [[0x2190, 0x21FF]] },
      { title: 'Long arrows', ranges: [[0x27F0, 0x27FF]] },
      { title: 'More arrows', ranges: [[0x2900, 0x297F]] },
      { title: 'Decorative arrows', ranges: [[0x2794, 0x27BF], [0x2B00, 0x2BFF], [0x1F800, 0x1F8FF]], names: /ARROW/ },
    ],
  },
  {
    id: 'math', title: 'Math', glyph: '∑', sections: [
      { title: 'Common', characters: '+−×÷±∓=≠≈≡<>≤≥≪≫∞√∛∜∑∏∫∬∮∂∆∇¬∧∨∈∉∋∩∪⊂⊃⊆⊇∀∃∄∅∝∠⊥∥∴∵⋅∘⊕⊗' },
      { title: 'Sets and letters', characters: 'ℕℤℚℝℂℙℍℵℶℷℸℏℎ℘ℑℜⅅⅆⅇⅈⅉ' },
      { title: 'Operators', ranges: [[0x2200, 0x22FF]] },
      { title: 'More operators', ranges: [[0x2A00, 0x2AFF]] },
      { title: 'Brackets and other symbols', ranges: [[0x2308, 0x230B], [0x27C0, 0x27EF], [0x2980, 0x29FF]] },
    ],
  },
  {
    id: 'currency', title: 'Currency', glyph: '€', sections: [
      { title: 'Currency', characters: '$€£¥¢₹₽₩₿', ranges: [[0x0000, 0xFFFF]], categories: /^Sc$/, names: /^(?!FULLWIDTH|SMALL)/ },
    ],
  },
  {
    id: 'punctuation', title: 'Punctuation', glyph: '“', sections: [
      { title: 'Dashes', ranges: [[0x002D, 0x002D], [0x2010, 0x2E7F]], categories: /^Pd$/ },
      { title: 'Quotes', characters: '‘’‚‛“”„‟‹›«»「」『』❛❜❝❞' },
      { title: 'Punctuation', characters: '…·¡¿‽⸘', ranges: [[0x2010, 0x205E], [0x2E00, 0x2E5D]], categories: /^Po$/ },
      { title: 'Brackets', characters: '⟨⟩⟦⟧⟪⟫⦃⦄⦅⦆⌈⌉⌊⌋〈〉《》【】〔〕〖〗〘〙〚〛' },
      {
        title: 'Spaces and invisible characters', labels: {
          ' ': 'No-break', ' ': 'Narrow no-break', ' ': 'En', ' ': 'Em', ' ': 'Third em',
          ' ': 'Quarter em', ' ': 'Sixth em', ' ': 'Figure', ' ': 'Punctuation', ' ': 'Thin',
          ' ': 'Hair', ' ': 'Math', '　': 'Ideographic', '​': 'Zero width', '⁠': 'Word joiner',
          '‌': 'Non-joiner', '‍': 'Joiner', '­': 'Soft hyphen', '‎': 'Left to right', '‏': 'Right to left',
        },
      },
    ],
  },
  {
    id: 'latin', title: 'Latin', glyph: 'é', sections: [
      { title: 'Accented letters', ranges: [[0x00C0, 0x017F]], categories: LETTERS },
      { title: 'Extended Latin', ranges: [[0x0180, 0x024F], [0x1E00, 0x1EFF], [0x2C60, 0x2C7F]], categories: LETTERS },
      { title: 'Phonetic', ranges: [[0x0250, 0x02FF]], categories: /^(L|Sk)/ },
    ],
  },
  {
    id: 'greek', title: 'Greek', glyph: 'α', sections: [
      { title: 'Greek', characters: 'αβγδεζηθικλμνξοπρςστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ', ranges: [[0x0370, 0x03FF]], categories: LETTERS, names: /^GREEK/ },
      { title: 'Polytonic Greek', ranges: [[0x1F00, 0x1FFF]], categories: LETTERS },
    ],
  },
  {
    id: 'shapes', title: 'Shapes', glyph: '◆', sections: [
      { title: 'Geometric shapes', ranges: [[0x25A0, 0x25FF]] },
      { title: 'More shapes', ranges: [[0x2B00, 0x2BFF], [0x1F780, 0x1F7FF]] },
      { title: 'Box drawing', ranges: [[0x2500, 0x257F]] },
      { title: 'Blocks', ranges: [[0x2580, 0x259F]] },
    ],
  },
  {
    id: 'others', title: 'Other symbols', glyph: '♞', sections: [
      { title: 'Miscellaneous symbols', ranges: [[0x2600, 0x26FF]] },
      { title: 'Dingbats', ranges: [[0x2700, 0x27BF]] },
      { title: 'Technical', ranges: [[0x2300, 0x23FF]] },
      { title: 'Letterlike symbols', ranges: [[0x2100, 0x214F]] },
      { title: 'Enclosed numbers and letters', ranges: [[0x2460, 0x24FF]] },
      { title: 'Braille', ranges: [[0x2800, 0x28FF]] },
    ],
  },
];
