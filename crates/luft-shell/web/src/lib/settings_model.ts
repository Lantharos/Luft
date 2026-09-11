export type InputConfig = {
  num_lock: boolean;
  keyboard_layout: string;
  keyboard_variant: string;
  keyboard_options: string;
  repeat_delay: number;
  repeat_rate: number;
  tap_to_click: boolean;
  natural_scroll: boolean;
  disable_while_typing: boolean;
  pointer_acceleration: number;
};

export type OutputConfig = {
  enabled: boolean;
  scale: number | null;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  refresh_millihertz: number | null;
  transform: string;
  adaptive_sync: boolean;
};

export type SettingsConfig = {
  compositor: { backend: string; xwayland: boolean; background_image: string | null };
  display: { primary: string | null; default_scale: number; [name: string]: OutputConfig | string | number | null };
  input: InputConfig;
  cursor: { theme: string; size: number; path: string | null };
  session: {
    lock_command: string;
    reboot_command: string;
    poweroff_command: string;
    startup_apps: string[];
    idle_lock_seconds: number | null;
    idle_suspend_seconds: number | null;
  };
  default_apps: { terminal: string; file_manager: string; browser: string; settings: string; launcher: string };
  [section: string]: unknown;
};

export type ConnectedOutput = {
  name: string;
  make: string;
  model: string;
  width: number;
  height: number;
  refresh_millihertz: number;
  scale: number;
  primary: boolean;
  enabled: boolean;
};

export type SettingsResult = { config: SettingsConfig; confirmation: { id: number; remaining_ms: number } | null; outputs: ConnectedOutput[]; outputs_error: string | null };

export const settingsPages = [
  { id: "appearance", label: "Appearance", icon: "palette" },
  { id: "display", label: "Displays", icon: "monitor" },
  { id: "input", label: "Keyboard & pointer", icon: "keyboard" },
  { id: "power", label: "Power & session", icon: "power" },
  { id: "apps", label: "Applications", icon: "app" },
  { id: "network", label: "Network & Bluetooth", icon: "network" },
  { id: "audio", label: "Sound", icon: "volume" },
] as const;

export type SettingsPage = typeof settingsPages[number]["id"];

export function initialSettingsPage(): SettingsPage {
  const value = new URLSearchParams(window.location.search).get("page");
  return settingsPages.find((page) => page.id === value)?.id ?? "appearance";
}

export function defaultOutput(): OutputConfig {
  return { enabled: true, scale: null, x: null, y: null, width: null, height: null, refresh_millihertz: null, transform: "normal", adaptive_sync: false };
}
