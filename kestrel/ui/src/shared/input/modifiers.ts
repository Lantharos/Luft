import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

const POLL_MS = 20;
const WAIT_MS = 1000;

const ANY_MODIFIER = Clutter.ModifierType.SHIFT_MASK | Clutter.ModifierType.CONTROL_MASK | Clutter.ModifierType.MOD1_MASK |
  Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK;

/** Runs `run` once none of `held` are down any more, or after a second, so text sent right after a shortcut isn't taken as part of it. */
export function afterModifiersAreReleased(run: () => void, held: Clutter.ModifierType = ANY_MODIFIER): void {
  const deadline = GLib.get_monotonic_time() + WAIT_MS * 1000;
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, POLL_MS, () => {
    const [, , modifiers] = global.get_pointer();
    if (modifiers & held && GLib.get_monotonic_time() < deadline) return GLib.SOURCE_CONTINUE;
    run();
    return GLib.SOURCE_REMOVE;
  });
}
