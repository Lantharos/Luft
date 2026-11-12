
import Mtk from 'gi://Mtk';

import type { Context } from '../context.js';
import { AppearanceService } from '../appearance/service.js';
import { FontRefresh } from '../appearance/fonts.js';
import { SystemPrompts } from '../auth/keyring/prompts.js';
import { PasskeyPrompts } from '../auth/passkeys/service.js';
import { LoginWallpaper } from '../desktop/wallpaper/loginWallpaper.js';
import { LaunchFeedback } from '../desktop/windows/launchFeedback.js';
import { ActivationTokens } from '../desktop/windows/activationTokens.js';
import { OpenWindows } from '../desktop/windows/openWindows.js';
import { SteamGames } from '../desktop/windows/steamGames.js';
import { TitleBars } from '../desktop/windows/titleBars/titleBars.js';
import { VariableRefresh } from '../desktop/windows/variableRefresh.js';
import { SeeThroughWindows } from '../desktop/windows/seeThrough/seeThrough.js';
import { OuterEdges } from '../desktop/windows/edges/outerEdges.js';
import { PortalBackend } from '../portal/backend.js';
import { Farewell } from '../session/farewell.js';
import { LoginDisplays } from '../session/loginScreen/displays.js';
import { LoginNumLock } from '../session/loginScreen/numLock.js';
import { Health } from './status/health/health.js';
import { notifyAboutIncidents } from './status/health/incidents.js';
import { MemoryNotices } from './status/health/memoryNotices.js';
import { confirmStartupOnceSettled } from './status/health/startup.js';
import { AppQuestions } from './connectivity/firewall/appQuestions.js';
import { SharingService } from './capture/privacy/sharing/service.js';
import { DesktopPolicy } from './capture/peek/access/desktop.js';
import { PeekService } from './capture/peek/service.js';
import { MonitorWake } from './hardware/display/relight/monitorWake.js';
import { MediaKeys } from './input/mediaKeys/mediaKeys.js';
import { BatteryWarnings } from './hardware/power/batteryWarnings.js';
import { PenService } from './hardware/pens/service.js';
import { ChargerSound } from './sound/sounds/charger.js';
import { DeviceSounds } from './sound/sounds/devices.js';
import { RecordingSounds } from './sound/sounds/recording.js';
import { ShareService } from './connectivity/send/service.js';
import { SoundService } from './sound/sounds/service.js';
import { playSound } from './sound/sounds/sounds.js';
import { UpdateNotices } from './status/updates/updateNotices.js';
import { CrashReports } from './status/crashReports/crashReports.js';
import { ChangesService } from './changes/service.js';

export class SystemServices {
  private readonly memoryNotices = new MemoryNotices();
  private readonly updateNotices = new UpdateNotices();
  private readonly crashReports = new CrashReports();
  private readonly changes = new ChangesService();
  private readonly health = new Health();
  private readonly batteryWarnings = new BatteryWarnings();
  private readonly chargerSound = new ChargerSound();
  private readonly deviceSounds = new DeviceSounds();
  private readonly recordingSounds = new RecordingSounds();
  private readonly soundService = new SoundService();
  private readonly penService = new PenService();
  private readonly shareService = new ShareService();
  private readonly launchFeedback = new LaunchFeedback();
  private readonly steamGames = new SteamGames();
  private readonly openWindows = new OpenWindows();
  private readonly activationTokens = new ActivationTokens();
  private readonly variableRefresh = new VariableRefresh();
  private readonly monitorWake = new MonitorWake();
  private readonly seeThrough = new SeeThroughWindows();
  private readonly outerEdges = new OuterEdges();
  private readonly titleBars: TitleBars;
  private readonly loginScreen = [new LoginWallpaper(), new LoginDisplays(), new LoginNumLock()];
  private readonly farewell = new Farewell();
  private readonly fontRefresh = new FontRefresh();
  private readonly portal: PortalBackend;
  private readonly passkeys: PasskeyPrompts;
  readonly appearance: AppearanceService;
  private readonly keyring: SystemPrompts;
  private readonly mediaKeys: MediaKeys;
  private readonly peek: PeekService;
  private readonly firewallQuestions: AppQuestions;
  private readonly sharing = new SharingService();

  constructor(context: Context, openStart: () => void) {
    this.titleBars = new TitleBars((window, x, y) =>
      context.showWindowMenu(window, new Mtk.Rectangle({ x: Math.round(x), y: Math.round(y), width: 0, height: 0 })));
    this.portal = PortalBackend.forSession(context);
    this.passkeys = new PasskeyPrompts();
    this.appearance = new AppearanceService(color => this.portal.setAccent(color));
    this.keyring = new SystemPrompts();
    this.mediaKeys = new MediaKeys(context, openStart);
    this.peek = new PeekService(context, context.activateWindow, new DesktopPolicy());
    this.firewallQuestions = new AppQuestions();
    confirmStartupOnceSettled(context.layoutManager);
    const startup = context.layoutManager.connect('startup-complete', () => {
      context.layoutManager.disconnect(startup);
      playSound('sign-in');
      void notifyAboutIncidents();
    });
  }

  destroy(): void {
    this.peek.destroy();
    this.sharing.destroy();
    this.firewallQuestions.destroy();
    this.crashReports.destroy();
    this.changes.destroy();
    this.keyring.destroy();
    this.appearance.destroy();
    for (const sync of this.loginScreen) sync.destroy();
    this.farewell.destroy();
    this.fontRefresh.destroy();
    this.mediaKeys.destroy();
    this.memoryNotices.destroy();
    this.updateNotices.destroy();
    this.health.destroy();
    this.batteryWarnings.destroy();
    this.chargerSound.destroy();
    this.deviceSounds.destroy();
    this.recordingSounds.destroy();
    this.soundService.destroy();
    this.penService.destroy();
    this.shareService.destroy();
    this.launchFeedback.destroy();
    this.steamGames.destroy();
    this.openWindows.destroy();
    this.activationTokens.destroy();
    this.variableRefresh.destroy();
    this.monitorWake.destroy();
    this.seeThrough.destroy();
    this.outerEdges.destroy();
    this.titleBars.destroy();
    this.portal.destroy();
    this.passkeys.destroy();
  }
}
