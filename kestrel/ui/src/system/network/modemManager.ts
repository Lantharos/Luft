import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';
import { lookup3gppMccMnc, lookupCdmaSid } from './mobileProviders.js';

interface ModemRemote {
  readonly SignalQuality: [number, boolean];
}

interface Modem3gppRemote {
  readonly OperatorName: string | null;
  readonly OperatorCode: string | null;
}

interface ModemCdmaRemote {
  readonly Sid: number | null;
}

const MODEM_MANAGER = 'org.freedesktop.ModemManager1';

const ModemProxy = Gio.DBusProxy.makeProxyWrapper<ModemRemote>(loadInterfaceXML('org.freedesktop.ModemManager1.Modem'));
const Modem3gppProxy = Gio.DBusProxy.makeProxyWrapper<Modem3gppRemote>(loadInterfaceXML('org.freedesktop.ModemManager1.Modem.Modem3gpp'));
const ModemCdmaProxy = Gio.DBusProxy.makeProxyWrapper<ModemCdmaRemote>(loadInterfaceXML('org.freedesktop.ModemManager1.Modem.ModemCdma'));

function findProviderForMccMnc(operatorName: string | null, operatorCode: string | null): string | null {
  if (operatorName) {
    if (operatorName.length > 6 || operatorName.length < 5) return operatorName;
    if (isNaN(parseInt(operatorName))) return operatorName;
  }

  if (!operatorName && operatorCode) return lookup3gppMccMnc(operatorCode);
  if (operatorName?.length === 6 || operatorName?.length === 5) return lookup3gppMccMnc(operatorName);
  return null;
}

function findProviderForSid(sid: number | null): string | null {
  return sid ? lookupCdmaSid(sid) : null;
}

export const BroadbandModem = GObject.registerClass({
  Properties: {
    'operator-name': GObject.ParamSpec.string('operator-name', null, null, GObject.ParamFlags.READABLE, null),
    'signal-quality': GObject.ParamSpec.int('signal-quality', null, null, GObject.ParamFlags.READABLE, 0, 100, 0),
  },
}, class BroadbandModem extends GObject.Object {
  private operatorNameValue: string | null = null;
  private signalQualityValue = 0;
  private operatorName3gpp: string | null = null;
  private operatorNameCdma: string | null = null;
  private readonly proxy: ModemRemote & Gio.DBusProxy;
  private readonly proxy3gpp: Modem3gppRemote & Gio.DBusProxy;
  private readonly proxyCdma: ModemCdmaRemote & Gio.DBusProxy;

  constructor(path: string) {
    super();
    this.proxy = ModemProxy(Gio.DBus.system, MODEM_MANAGER, path);
    this.proxy3gpp = Modem3gppProxy(Gio.DBus.system, MODEM_MANAGER, path);
    this.proxyCdma = ModemCdmaProxy(Gio.DBus.system, MODEM_MANAGER, path);

    this.proxy.connect('g-properties-changed', (_proxy, properties: GLib.Variant) => {
      if (properties.lookup_value('SignalQuality', null)) this.reloadSignalQuality();
    });
    this.reloadSignalQuality();

    this.proxy3gpp.connect('g-properties-changed', (_proxy, properties: GLib.Variant) => {
      const unpacked = properties.deepUnpack<Record<string, GLib.Variant>>();
      if ('OperatorName' in unpacked || 'OperatorCode' in unpacked) this.reload3gppOperatorName();
    });
    this.reload3gppOperatorName();

    this.proxyCdma.connect('g-properties-changed', (_proxy, properties: GLib.Variant) => {
      const unpacked = properties.deepUnpack<Record<string, GLib.Variant>>();
      if ('Nid' in unpacked || 'Sid' in unpacked) this.reloadCdmaOperatorName();
    });
    this.reloadCdmaOperatorName();
  }

  get operatorName(): string | null {
    return this.operatorNameValue;
  }

  get signalQuality(): number {
    return this.signalQualityValue;
  }

  private setOperatorName(operatorName: string): void {
    if (this.operatorNameValue === operatorName) return;
    this.operatorNameValue = operatorName;
    this.notify('operator-name');
  }

  private reloadSignalQuality(): void {
    const [quality] = this.proxy.SignalQuality;
    if (this.signalQualityValue === quality) return;
    this.signalQualityValue = quality;
    this.notify('signal-quality');
  }

  private reloadOperatorName(): void {
    this.setOperatorName([this.operatorName3gpp, this.operatorNameCdma].filter(name => name).join(', '));
  }

  private reload3gppOperatorName(): void {
    this.operatorName3gpp = findProviderForMccMnc(this.proxy3gpp.OperatorName, this.proxy3gpp.OperatorCode);
    this.reloadOperatorName();
  }

  private reloadCdmaOperatorName(): void {
    this.operatorNameCdma = findProviderForSid(this.proxyCdma.Sid);
    this.reloadOperatorName();
  }
});
export type BroadbandModem = InstanceType<typeof BroadbandModem>;
