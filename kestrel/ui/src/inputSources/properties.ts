import IBus from 'gi://IBus';
import { getIBusManager } from 'resource:///org/gnome/shell/misc/ibusManager.js';

import type { MenuEntry } from '../menus/contextMenus.js';

const MODE_KEY = 'InputMode';
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function visibleProperties(list: IBus.PropList | null): IBus.Property[] {
  const properties: IBus.Property[] = [];
  for (let index = 0, property; list && (property = list.get(index) as IBus.Property | null); index++)
    if (property.get_visible()) properties.push(property);
  return properties;
}

export function modeSymbol(list: IBus.PropList | null): string | null {
  for (const property of visibleProperties(list)) {
    if (property.get_key() === MODE_KEY) {
      const symbol = property.get_symbol().get_text();
      const graphemes = [...segmenter.segment(symbol)].length;
      return graphemes > 0 && graphemes < 3 ? symbol : null;
    }
    if (property.get_prop_type() === IBus.PropType.MENU) {
      const nested = modeSymbol(property.get_sub_props());
      if (nested) return nested;
    }
  }
  return null;
}

function activate(property: IBus.Property, state: IBus.PropState): void {
  property.set_state(state);
  getIBusManager().activateProperty(property.get_key(), state);
}

function selectRadio(selected: IBus.Property, group: IBus.Property[]): void {
  if (selected.get_state() === IBus.PropState.CHECKED) return;
  for (const property of group)
    activate(property, property === selected ? IBus.PropState.CHECKED : IBus.PropState.UNCHECKED);
}

export function propertyEntries(list: IBus.PropList | null): MenuEntry[] {
  const properties = visibleProperties(list);
  const radios = properties.filter(property => property.get_prop_type() === IBus.PropType.RADIO);
  return properties.map((property): MenuEntry => {
    const label = property.get_label().get_text();
    const enabled = property.get_sensitive();
    const checked = property.get_state() === IBus.PropState.CHECKED;
    switch (property.get_prop_type()) {
      case IBus.PropType.MENU:
        return { label, enabled, children: propertyEntries(property.get_sub_props()) };
      case IBus.PropType.RADIO:
        return { label, enabled, checked, run: () => selectRadio(property, radios) };
      case IBus.PropType.TOGGLE:
        return { label, enabled, checked, run: () => activate(property, checked ? IBus.PropState.UNCHECKED : IBus.PropState.CHECKED) };
      case IBus.PropType.SEPARATOR:
        return 'separator';
      default:
        return { label, enabled, run: () => getIBusManager().activateProperty(property.get_key(), property.get_state()) };
    }
  });
}
