import type Gio from 'gi://Gio';

import type { Context } from '../context.js';
import { AppearanceService } from '../appearance/service.js';
import { FontRefresh } from '../appearance/fonts.js';
import { SystemPrompts } from '../auth/keyring/prompts.js';
import { PasskeyPrompts } from '../auth/passkeys/service.js';
import { LoginWallpaper } from '../desktop/wallpaper/loginWallpaper.js';
import { LaunchFeedback } from '../desktop/windows/launchFeedback.js';
import { VariableRefresh } from '../desktop/windows/variableRefresh.js';
import { PortalBackend } from '../portal/backend.js';
import { Farewell } from '../session/farewell.js';
import { LoginDisplays } from '../session/loginScreen/displays.js';
import { LoginNumLock } from '../session/loginScreen/numLock.js';
import { loadKestrelStylesheets } from '../shared/stylesheet.js';
import { Health } from './health/health.js';
import { notifyAboutIncidents } from './health/incidents.js';
import { OomNotifier } from './health/oomNotifier.js';
import { confirmStartup, notifyAboutFailedStartup } from './health/startup.js';
import { LookService } from './look/service.js';
import { MediaKeys } from './mediaKeys/mediaKeys.js';
import { BatteryWarnings } from './power/batteryWarnings.js';
import { PlugSounds } from './power/plugSounds.js';

export class SystemServices {
  private readonly oomNotifier = new OomNotifier();
  private readonly health = new Health();
  private readonly batteryWarnings = new BatteryWarnings();
  private readonly plugSounds = new PlugSounds();
  private readonly launchFeedback = new LaunchFeedback();
  private readonly variableRefresh = new VariableRefresh();
  private readonly loginScreen: { destroy(): void }[];
  private readonly farewell = new Farewell();
  private readonly fontRefresh = new FontRefresh();
  private readonly portal: PortalBackend;
  private readonly passkeys: PasskeyPrompts;
  readonly appearance: AppearanceService;
  private readonly keyring: SystemPrompts;
  private readonly stylesheetMonitors: Gio.FileMonitor[];
  private readonly mediaKeys: MediaKeys;
  private readonly look: LookService;

  constructor(context: Context, ownsTheScreen: boolean, openStart: () => void) {
    this.loginScreen = ownsTheScreen ? [new LoginWallpaper(), new LoginDisplays(), new LoginNumLock()] : [];
    this.portal = new PortalBackend(context);
    this.passkeys = new PasskeyPrompts(context);
    this.appearance = new AppearanceService(color => this.portal.setAccent(color));
    this.keyring = new SystemPrompts(context);
    this.stylesheetMonitors = loadKestrelStylesheets();
    this.mediaKeys = new MediaKeys(context, openStart);
    this.look = new LookService(context);
    const startup = context.layoutManager.connect('startup-complete', () => {
      context.layoutManager.disconnect(startup);
      void notifyAboutIncidents();
      if (ownsTheScreen) void confirmStartup().then(notifyAboutFailedStartup);
    });
  }

  destroy(): void {
    this.look.destroy();
    this.keyring.destroy();
    this.appearance.destroy();
    for (const sync of this.loginScreen) sync.destroy();
    this.farewell.destroy();
    this.fontRefresh.destroy();
    this.mediaKeys.destroy();
    this.oomNotifier.destroy();
    this.health.destroy();
    this.batteryWarnings.destroy();
    this.plugSounds.destroy();
    this.launchFeedback.destroy();
    this.variableRefresh.destroy();
    this.portal.destroy();
    this.passkeys.destroy();
    for (const monitor of this.stylesheetMonitors) monitor.cancel();
  }
}
