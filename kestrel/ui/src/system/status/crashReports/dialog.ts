import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { MessageDialogContent } from '../../../shared/dialogs/dialog.js';
import { ModalDialog } from '../../../shared/dialogs/modalDialog.js';
import { t } from '../../../shared/i18n/index.js';
import { CheckBox } from '../../../shared/widgets/checkBox.js';
import { closedTitle } from './programs.js';

export interface Waiting {
  id: string;
  program: string;
  summary: string;
  body: string;
}

export interface Answer {
  send: boolean;
  remember: boolean;
}

const ICON = 'dialog-warning-symbolic';

function openContents(body: string): void {
  const modal = new ModalDialog({ styleClass: 'access-dialog kestrel-crash-report-contents' });
  modal.contentLayout.add_child(new MessageDialogContent({
    title: t('crash-reports-contents-title'),
    description: t('crash-reports-contents-body'),
  }));
  const text = new St.Label({ text: body, style_class: 'kestrel-crash-report-json' });
  text.clutter_text.set_selectable(true);
  text.clutter_text.set_line_wrap(true);
  text.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);
  text.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
  const lines = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  lines.add_child(text);
  modal.contentLayout.add_child(new St.ScrollView({ style_class: 'kestrel-crash-report-scroll', child: lines }));
  modal.addButton({ label: t('crash-reports-close'), action: () => modal.close(), default: true });
  if (!modal.open()) modal.destroy();
}

const escaped = () => Clutter.get_current_event()?.get_key_symbol() === Clutter.KEY_Escape;

/** Asks whether to send a report of one crash, and whether to do the same next time. Escape only leaves this one unsent. */
export function openCrashDialog(waiting: Waiting, answer: (answer: Answer) => void): ModalDialog | null {
  const modal = new ModalDialog({ styleClass: 'kestrel-crash-report-dialog', prompt: true });
  const content = new MessageDialogContent({
    title: closedTitle(waiting.program),
    description: t('crash-reports-body'),
    iconName: ICON,
  });
  const remember = new CheckBox(t('crash-reports-remember'));
  content.add_child(remember);
  modal.contentLayout.add_child(content);
  const respond = (send: boolean) => {
    answer({ send, remember: remember.checked && (send || !escaped()) });
    modal.close();
  };
  modal.addButton({ label: t('crash-reports-contents'), action: () => openContents(waiting.body) });
  modal.addButton({ label: t('crash-reports-dont-send'), action: () => respond(false), key: Clutter.KEY_Escape });
  modal.addButton({ label: t('crash-reports-send'), action: () => respond(true), default: true });
  if (modal.open()) return modal;
  modal.destroy();
  return null;
}
