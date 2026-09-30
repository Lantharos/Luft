import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { InputSourceIndicator } from '../inputSources/indicator.js';
import type { ContextMenus, MenuEntry } from '../menus/contextMenus.js';
import { Accessibility } from './accessibility.js';
import { PowerActions } from './power.js';
import type { Session } from './sessions.js';

export class GreeterControls {
  readonly actor = new St.BoxLayout({ name: 'kestrel-greeter-controls', style_class: 'kestrel-greeter-controls' });
  readonly accessibility = new Accessibility();
  private readonly power = new PowerActions();
  private readonly sessionLabel = new St.Label({ style_class: 'kestrel-greeter-session-label', y_align: Clutter.ActorAlign.CENTER });
  private readonly inputSource: InputSourceIndicator;
  private current: Session | null = null;

  constructor(private readonly menus: ContextMenus, private readonly sessions: Session[], private readonly chooseSession: (session: Session) => void) {
    this.button('kestrel-greeter-session', 'Session', this.sessionLabel, () => this.sessionEntries()).visible = sessions.length > 1;
    this.inputSource = new InputSourceIndicator(menus, () => []);
    this.actor.add_child(this.inputSource.actor);
    this.button('kestrel-greeter-accessibility', 'Accessibility', this.icon('preferences-desktop-accessibility-symbolic'), () => this.accessibility.entries());
    this.button('kestrel-greeter-power', 'Power', this.icon('system-shutdown-symbolic'), () => this.power.entries());
    void this.power.load();
  }

  showSession(session: Session | null): void {
    this.current = session;
    this.sessionLabel.text = session?.name ?? '';
  }

  private sessionEntries(): MenuEntry[] {
    return this.sessions.map(session => ({
      label: session.type === 'x11' ? `${session.name} (X11)` : session.name,
      checked: session === this.current,
      run: () => this.chooseSession(session),
    }));
  }

  private icon(name: string): St.Icon {
    return new St.Icon({ icon_name: name, icon_size: 16, y_align: Clutter.ActorAlign.CENTER });
  }

  private button(name: string, label: string, child: St.Widget, entries: () => MenuEntry[]): St.Button {
    const button = new St.Button({
      name, style_class: 'kestrel-status-button kestrel-greeter-control', child,
      accessible_name: label, can_focus: true, track_hover: true,
    });
    button.connect('clicked', () => {
      const [x, y] = button.get_transformed_position();
      this.menus.open(button, entries(), Math.round(x + button.width / 2), Math.round(y));
    });
    this.actor.add_child(button);
    return button;
  }

  shutdown(): void {
    this.inputSource.shutdown();
    this.accessibility.shutdown();
  }
}
