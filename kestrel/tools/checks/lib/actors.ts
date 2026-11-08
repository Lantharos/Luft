import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {ModalDialog} from 'resource:///com/lantharos/kestrel/kestrel.js';

export function descendants(actor: Clutter.Actor): Clutter.Actor[] {
  return [actor, ...actor.get_children().flatMap(descendants)];
}

export function named(name: string, root: Clutter.Actor = global.stage): Clutter.Actor | null {
  if (root.name === name || root.accessible_name === name) return root;
  for (const child of root.get_children()) {
    const found = named(name, child);
    if (found) return found;
  }
  return null;
}

export function existing(name: string, root: Clutter.Actor = global.stage): Clutter.Actor {
  const actor = named(name, root);
  if (!actor) throw new Error(`No actor named ${name}`);
  return actor;
}

export function ofType<T extends Clutter.Actor>(actor: Clutter.Actor | null, type: abstract new (...args: never[]) => T): T {
  if (!(actor instanceof type)) throw new Error(`${actor?.name ?? 'The actor'} is not a ${type.name}`);
  return actor;
}

const hasStyle = (actor: Clutter.Actor, name: string): actor is St.Widget =>
  actor instanceof St.Widget && actor.has_style_class_name(name);

export function textOf(actor: Clutter.Actor | null): string | null {
  if (actor instanceof St.Label || actor instanceof St.Entry || actor instanceof Clutter.Text) return actor.text;
  return null;
}

export const labelOf = (actor: Clutter.Actor): string | null => actor instanceof St.Button ? actor.label : null;

export function styled(name: string, root: Clutter.Actor = global.stage): St.Widget[] {
  return descendants(root).filter(actor => hasStyle(actor, name));
}

export function firstStyled(name: string, root: Clutter.Actor = global.stage): St.Widget | null {
  return descendants(root).find(actor => hasStyle(actor, name)) ?? null;
}

export function shownStyled(name: string, root: Clutter.Actor = global.stage): St.Widget | null {
  return styled(name, root).find(actor => actor.mapped) ?? null;
}

/** A shown dialog with this style once it takes input, which system prompts don't for a moment after they show. */
export function answerable(name: string): St.Widget | null {
  const dialog = shownStyled(name);
  for (let actor: Clutter.Actor | null = dialog; actor; actor = actor.get_parent())
    if (actor instanceof ModalDialog) return actor.answerable ? dialog : null;
  return null;
}

export function labelled(text: string, root: Clutter.Actor = global.stage): Clutter.Actor | null {
  return descendants(root).find(actor => labelOf(actor) === text || actor.accessible_name === text || textOf(actor) === text) ?? null;
}

export function showsText(text: string, root: Clutter.Actor = global.stage): boolean {
  return descendants(root).some(actor => textOf(actor) === text && actor.mapped && actor.opacity > 0);
}

export function shown(actor: Clutter.Actor | null | undefined): actor is Clutter.Actor {
  return !!actor?.mapped && actor.opacity > 0;
}
