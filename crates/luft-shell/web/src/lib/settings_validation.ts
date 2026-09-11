import type { ConnectedOutput, SettingsConfig } from "./settings_model";

export function settingsError(config: SettingsConfig, outputs: ConnectedOutput[]): string | undefined {
  const input = config.input;
  if (!input.keyboard_layout.trim()) return "Enter a keyboard layout.";
  if (!Number.isInteger(input.repeat_delay) || input.repeat_delay < 0 || input.repeat_delay > 5000) return "Repeat delay must be between 0 and 5000 ms.";
  if (!Number.isInteger(input.repeat_rate) || input.repeat_rate < 0 || input.repeat_rate > 200) return "Repeat rate must be between 0 and 200 keys per second.";
  if (!Number.isFinite(input.pointer_acceleration) || Math.abs(input.pointer_acceleration) > 1) return "Pointer acceleration must be between −1 and 1.";
  if (!config.cursor.theme.trim()) return "Enter a cursor theme.";
  if (!Number.isInteger(config.cursor.size) || config.cursor.size < 1 || config.cursor.size > 256) return "Cursor size must be between 1 and 256 px.";
  if (!validScale(config.display.default_scale)) return "Default display scale must be between 0.5 and 4.";
  for (const [name, output] of Object.entries(config.display)) {
    if (!output || typeof output !== "object") continue;
    if (output.scale !== null && !validScale(output.scale)) return `${name}: scale must be between 0.5 and 4.`;
    if ((output.width === null) !== (output.height === null)) return `${name}: enter both width and height, or leave both empty.`;
    for (const value of [output.width, output.height, output.refresh_millihertz]) {
      if (value !== null && (!Number.isInteger(value) || value < 1)) return `${name}: resolution and refresh rate must be positive numbers.`;
    }
    for (const value of [output.x, output.y]) {
      if (value !== null && !Number.isInteger(value)) return `${name}: display positions must be whole numbers.`;
    }
  }
  if (outputs.length && outputs.every(({ name }) => {
    const output = config.display[name];
    return output && typeof output === "object" && !output.enabled;
  })) return "Keep at least one connected display enabled.";
  for (const value of [config.session.idle_lock_seconds, config.session.idle_suspend_seconds]) {
    if (value !== null && (!Number.isInteger(value) || value < 1)) return "Idle timeouts must be positive whole seconds, or empty to disable.";
  }
  if (!config.session.lock_command.trim()) return "Enter a lock screen command.";
  return undefined;
}

function validScale(value: number) {
  return Number.isFinite(value) && value >= 0.5 && value <= 4;
}
