import type { Attachment } from "svelte/attachments";

export function surfaceFocus(surface: string, selector: string): Attachment<HTMLElement> {
  return (element) => {
    const focus = () => element.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
    const open = (event: Event) => {
      if ((event as CustomEvent<{ surface?: string }>).detail?.surface === surface) focus();
    };
    focus();
    window.addEventListener("sabine:luft.surface-open", open);
    return () => window.removeEventListener("sabine:luft.surface-open", open);
  };
}

export function menuKeydown(event: KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const menu = event.currentTarget as HTMLElement;
  const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
  const current = items.findIndex((item) => item === document.activeElement);
  const index = event.key === "Home" ? 0
    : event.key === "End" ? items.length - 1
    : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
  event.preventDefault();
  items[index]?.focus();
}

export function containTabFocus(event: KeyboardEvent, root: HTMLElement | null) {
  if (event.key !== "Tab" || !root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
  )).filter((item) => item.tabIndex >= 0 && !item.closest('[inert], [aria-hidden="true"]'));
  const first = items[0];
  const last = items.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}
