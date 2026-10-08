import Gio from 'gi://Gio';

const RECENT_LIMIT = 9;

export class EmojiPreferences {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

  constructor(recentChanged: () => void) {
    this.settings.connect('changed::emoji-recent', recentChanged);
  }

  get tone(): number {
    return this.settings.get_enum('emoji-skin-tone');
  }

  set tone(tone: number) {
    this.settings.set_enum('emoji-skin-tone', tone);
  }

  get recent(): string[] {
    return this.settings.get_strv('emoji-recent');
  }

  remember(text: string): void {
    this.settings.set_strv('emoji-recent', [text, ...this.recent.filter(recent => recent !== text)].slice(0, RECENT_LIMIT));
  }
}
