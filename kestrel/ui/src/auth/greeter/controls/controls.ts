import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { InputSourceIndicator } from '../../../system/inputSources/indicator.js';
import type { ContextMenus, MenuEntry } from '../../../desktop/menus/contextMenus.js';
import { ControlRow } from '../../../desktop/menus/controlRow.js';
import { Accessibility } from './accessibility.js';
import { PowerActions } from './power.js';
import type { Session } from '../sessions.js';

export class GreeterControls {
  private readonly row: ControlRow;
  readonly accessibility = new Accessibility();
  private readonly power = new PowerActions();
  private readonly sessionLabel = new St.Label({ style_class: 'kestrel-login-label', y_align: Clutter.ActorAlign.CENTER });
  private readonly inputSource: InputSourceIndicator;
  private current: Session | null = null;

  constructor(menus: ContextMenus, private readonly sessions: Session[], private readonly chooseSession: (session: Session) => void) {
    this.row = new ControlRow(menus, 'kestrel-greeter-controls');
    this.row.button('kestrel-greeter-session', 'Session', this.sessionLabel, () => this.sessionEntries()).visible = sessions.length > 1;
    this.inputSource = new InputSourceIndicator(menus, () => []);
    this.row.add(this.inputSource.actor);
    this.row.button('kestrel-greeter-accessibility', 'Accessibility', this.row.icon('preferences-desktop-accessibility-symbolic'), () => this.accessibility.entries());
    this.row.button('kestrel-greeter-power', 'Power', this.row.icon('system-shutdown-symbolic'), () => this.power.entries());
    void this.power.load();
  }

  get actor(): St.BoxLayout {
    return this.row.actor;
  }

  showSession(session: Session | null): void {
    this.current = session;
    this.sessionLabel.text = session?.name ?? '';
  }

  private sessionEntries(): MenuEntry[] {
    return this.sessions.map(session => ({
      label: session.name,
      checked: session === this.current,
      run: () => this.chooseSession(session),
    }));
  }

  shutdown(): void {
    this.inputSource.shutdown();
    this.accessibility.shutdown();
  }
}
