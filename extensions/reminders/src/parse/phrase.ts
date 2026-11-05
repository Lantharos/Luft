/** Text being read: each phrase understood is taken out, and what's left at the end is the title. */
export class Phrase {
  constructor(private text: string) {}

  /** Takes the first match out of the text and returns it. */
  take(pattern: RegExp): RegExpExecArray | null {
    const found = pattern.exec(this.text);
    if (found) this.text = `${this.text.slice(0, found.index)} ${this.text.slice(found.index + found[0].length)}`;
    return found;
  }

  has(pattern: RegExp): boolean {
    return pattern.test(this.text);
  }

  get rest(): string {
    return this.text;
  }
}
