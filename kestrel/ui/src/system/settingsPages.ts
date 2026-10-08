import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

export type SettingsPageId =
  | 'network' | 'bluetooth' | 'display' | 'sound' | 'power' | 'appearance' | 'appearance/taskbar' | 'notifications'
  | 'keyboard' | 'mouse' | 'accessibility' | 'apps' | 'privacy' | 'security' | 'datetime' | 'users' | 'login' | 'updates' | 'about';

export interface SettingsPage {
  id: SettingsPageId;
  title: string;
  icon: string;
  keywords: string[];
}

export const SETTINGS_PAGES: SettingsPage[] = [
  { id: 'network', title: 'Network', icon: 'network-wireless-symbolic', keywords: ['wifi', 'wireless', 'ethernet', 'vpn', 'internet', 'airplane'] },
  { id: 'bluetooth', title: 'Bluetooth', icon: 'bluetooth-active-symbolic', keywords: ['devices', 'pair', 'headphones'] },
  { id: 'display', title: 'Displays', icon: 'video-display-symbolic', keywords: ['monitor', 'screen', 'resolution', 'scale', 'refresh rate', 'night light'] },
  { id: 'sound', title: 'Sound', icon: 'audio-speakers-symbolic', keywords: ['audio', 'volume', 'speakers', 'microphone', 'output', 'input'] },
  { id: 'power', title: 'Power & Battery', icon: 'battery-full-charging-symbolic', keywords: ['battery', 'sleep', 'suspend', 'power mode', 'screen blank'] },
  { id: 'appearance', title: 'Appearance', icon: 'preferences-desktop-appearance-symbolic', keywords: ['wallpaper', 'background', 'dark', 'light', 'accent', 'app icons', 'tinted', 'text size'] },
  { id: 'appearance/taskbar', title: 'Taskbar', icon: 'user-desktop-symbolic', keywords: ['panel', 'dock', 'auto-hide', 'hide taskbar', 'floating', 'pinned apps', 'alignment', 'transparent'] },
  { id: 'notifications', title: 'Notifications', icon: 'preferences-system-notifications-symbolic', keywords: ['do not disturb', 'banners', 'lock screen'] },
  { id: 'keyboard', title: 'Keyboard', icon: 'input-keyboard-symbolic', keywords: ['input sources', 'layout', 'shortcuts', 'language'] },
  { id: 'mouse', title: 'Mouse & Touchpad', icon: 'input-mouse-symbolic', keywords: ['pointer', 'scroll', 'touchpad', 'tap to click'] },
  { id: 'accessibility', title: 'Accessibility', icon: 'preferences-desktop-accessibility-symbolic', keywords: ['a11y', 'screen reader', 'zoom', 'magnifier', 'large text', 'high contrast', 'on-screen keyboard', 'sticky keys', 'mouse keys', 'visual alerts'] },
  { id: 'apps', title: 'Apps', icon: 'view-app-grid-symbolic', keywords: ['default apps', 'browser', 'startup', 'autostart'] },
  { id: 'privacy', title: 'Privacy', icon: 'preferences-system-privacy-symbolic', keywords: ['screen lock', 'location', 'camera', 'microphone', 'history'] },
  { id: 'security', title: 'Security', icon: 'security-high-symbolic', keywords: ['secure boot', 'tpm', 'encryption', 'recovery key', 'usb', 'passwords', 'passkeys'] },
  { id: 'datetime', title: 'Date & Time', icon: 'preferences-system-time-symbolic', keywords: ['time zone', 'clock', '24-hour'] },
  { id: 'users', title: 'Users', icon: 'system-users-symbolic', keywords: ['account', 'name', 'picture', 'avatar'] },
  { id: 'login', title: 'Login Screen', icon: 'system-lock-screen-symbolic', keywords: ['sign in', 'automatic login', 'session', 'wallpaper'] },
  { id: 'updates', title: 'Updates', icon: 'software-update-available-symbolic', keywords: ['software updates', 'system updates', 'upgrade', 'firmware', 'kernel', 'restart and install', 'security updates'] },
  { id: 'about', title: 'About', icon: 'help-about-symbolic', keywords: ['device name', 'system', 'hardware', 'memory'] },
];

export function openSettings(page: SettingsPageId | null = null): void {
  Gio.AppInfo.launch_default_for_uri(`kestrel-settings:${page ?? ''}`, (global as unknown as Shell.Global).create_app_launch_context(0, -1));
}
