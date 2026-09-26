import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

const HISTORY_LIMIT = 25;
const TEXT_LIMIT = 20000;
const SENSITIVE_MIME_TYPE = 'x-kde-passwordManagerHint';
const TEXT_MIME_TYPES = ['text/plain;charset=utf-8', 'UTF8_STRING', 'text/plain', 'STRING'];

export class ClipboardHistory {
  private items: string[] = [];
  private readonly selection = (global as unknown as Shell.Global).display.get_selection();
  private readonly ownerChanged: number;

  constructor(private readonly changed: () => void) {
    this.ownerChanged = this.selection.connect('owner-changed', (_selection, type: Meta.SelectionType, source: Meta.SelectionSource | null) => {
      if (type !== Meta.SelectionType.SELECTION_CLIPBOARD || !source) return;
      const mimeTypes = source.get_mimetypes();
      if (mimeTypes.includes(SENSITIVE_MIME_TYPE) || !mimeTypes.some(type => TEXT_MIME_TYPES.includes(type))) return;
      St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
        if (text?.trim()) this.remember(text.slice(0, TEXT_LIMIT));
      });
    });
  }

  get entries(): readonly string[] {
    return this.items;
  }

  remove(text: string): void {
    this.items = this.items.filter(item => item !== text);
    this.changed();
  }

  clear(): void {
    this.items = [];
    this.changed();
  }

  private remember(text: string): void {
    this.items = [text, ...this.items.filter(item => item !== text)].slice(0, HISTORY_LIMIT);
    this.changed();
  }

  destroy(): void {
    this.selection.disconnect(this.ownerChanged);
  }
}
