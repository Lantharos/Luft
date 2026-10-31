import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';

import { mutterObject, mutterProperty } from '../../../portal/sharing/mutter.js';
import { relight } from './relight.js';

const NAME = 'org.gnome.Mutter.DisplayConfig';
const DISPLAY_CONFIG = mutterObject(NAME, '/org/gnome/Mutter/DisplayConfig', NAME);
const REMEMBERED = 'monitors-needing-wake';
const POWER_ON = 0;

const settings = () => new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

function identity(monitor: Meta.Monitor): string {
  return `${monitor.get_vendor()}:${monitor.get_product()}:${monitor.get_serial()}`;
}

function activeMonitors(): Meta.Monitor[] {
  return global.backend.get_monitor_manager().get_monitors()?.filter(monitor => monitor.is_active()) ?? [];
}

/** Lights every screen again, and remembers the HDMI monitors among them so they wake through a slower mode from now on. */
export async function recoverDisplays(): Promise<void> {
  const relit = await relight();
  const hdmi = activeMonitors().filter(monitor => relit.includes(monitor.get_connector()) && monitor.get_connector().startsWith('HDMI'));
  if (!hdmi.length) return;
  const remembered = settings();
  const known = remembered.get_strv(REMEMBERED);
  remembered.set_strv(REMEMBERED, [...new Set([...known, ...hdmi.map(identity)])]);
}

export class MonitorWake {
  private readonly settings = settings();
  private readonly manager = global.backend.get_monitor_manager();
  private lit = new Set(activeMonitors().map(monitor => monitor.get_connector()));
  private powerSaveMode = POWER_ON;

  constructor() {
    this.manager.connectObject(
      'monitors-changed', () => this.monitorsChanged(),
      'power-save-mode-changed', () => this.powerSaveChanged().catch(logError),
      this);
  }

  private remembered(monitors: Meta.Monitor[]): string[] {
    const known = this.settings.get_strv(REMEMBERED);
    return monitors.filter(monitor => known.includes(identity(monitor))).map(monitor => monitor.get_connector());
  }

  private monitorsChanged(): void {
    const active = activeMonitors();
    const appeared = active.filter(monitor => !this.lit.has(monitor.get_connector()));
    this.lit = new Set(active.map(monitor => monitor.get_connector()));
    this.wake(this.remembered(appeared));
  }

  private async powerSaveChanged(): Promise<void> {
    const before = this.powerSaveMode;
    this.powerSaveMode = await mutterProperty<number>(DISPLAY_CONFIG, 'PowerSaveMode');
    if (before !== POWER_ON && this.powerSaveMode === POWER_ON) this.wake(this.remembered(activeMonitors()));
  }

  private wake(connectors: string[]): void {
    if (connectors.length) relight(connectors).catch(logError);
  }

  destroy(): void {
    this.manager.disconnectObject(this);
  }
}
