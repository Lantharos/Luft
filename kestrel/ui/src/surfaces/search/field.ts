import St from 'gi://St';

import type { ContextMenus } from '../../desktop/menus/contextMenus.js';
import { blinkCaret } from '../../shared/input/caret.js';
import { t } from '../../shared/i18n/index.js';

export function searchField(menus: ContextMenus, styleClass: string, iconSize: number): St.Entry {
  const field = new St.Entry({
    style_class: styleClass, hint_text: t('start-search-placeholder'),
    can_focus: true, x_expand: true,
    primary_icon: new St.Icon({ icon_name: 'edit-find-symbolic', icon_size: iconSize }),
  });
  blinkCaret(field);
  menus.bind(field, () => {
    const text = field.clutter_text;
    const clipboard = St.Clipboard.get_default();
    const copy = () => clipboard.set_text(St.ClipboardType.CLIPBOARD, text.get_selection());
    return [
      { label: t('start-search-cut'), enabled: text.get_selection().length > 0, run: () => { copy(); text.delete_selection(); } },
      { label: t('start-search-copy'), enabled: text.get_selection().length > 0, run: copy },
      { label: t('start-search-paste'), run: () => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, value) => {
        if (value) { text.delete_selection(); text.insert_text(value, text.cursor_position); }
      }) },
      { label: t('start-search-select-all'), run: () => text.set_selection(0, -1) },
    ];
  });
  return field;
}
