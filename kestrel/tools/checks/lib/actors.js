export function descendants(actor) {
  return [actor, ...actor.get_children().flatMap(descendants)];
}

export function named(name, root = global.stage) {
  if (root.name === name || root.accessible_name === name) return root;
  for (const child of root.get_children()) {
    const found = named(name, child);
    if (found) return found;
  }
  return null;
}

export function styled(name, root = global.stage) {
  return descendants(root).filter(actor => actor.has_style_class_name?.(name));
}

export function firstStyled(name, root = global.stage) {
  return descendants(root).find(actor => actor.has_style_class_name?.(name)) ?? null;
}

export function shownStyled(name, root = global.stage) {
  return descendants(root).find(actor => actor.has_style_class_name?.(name) && actor.mapped) ?? null;
}

export function labelled(text, root = global.stage) {
  return descendants(root).find(actor => actor.label === text || actor.accessible_name === text || actor.text === text) ?? null;
}

export function showsText(text, root = global.stage) {
  return descendants(root).some(actor => actor.text === text && actor.mapped && actor.opacity > 0);
}

export function shown(actor) {
  return !!actor?.mapped && actor.opacity > 0;
}
