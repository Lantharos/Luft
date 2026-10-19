import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import NM from 'gi://NM';

import {loadInterfaceXML} from './fileUtils.js';
import {lookup3gppMccMnc, lookupCdmaSid} from './mobileProviders.js';

// _findProviderForMccMnc:
// @operatorName: operator name
// @operatorCode: operator code
//
// Given an operator name string (which may not be a real operator name) and an
// operator code string, tries to find a proper operator name to display.
//
function _findProviderForMccMnc(operatorName, operatorCode) {
    if (operatorName) {
        if (operatorName.length !== 0 &&
            (operatorName.length > 6 || operatorName.length < 5)) {
            // this looks like a valid name, i.e. not an MCCMNC (that some
            // devices return when not yet connected
            return operatorName;
        }

        if (isNaN(parseInt(operatorName))) {
            // name is definitely not a MCCMNC, so it may be a name
            // after all; return that
            return operatorName;
        }
    }

    let needle;
    if ((!operatorName || operatorName.length === 0) && operatorCode)
        needle = operatorCode;
    else if (operatorName && (operatorName.length === 6 || operatorName.length === 5))
        needle = operatorName;
    else // nothing to search
        return null;

    return lookup3gppMccMnc(needle);
}

// _findProviderForSid:
// @sid: System Identifier of the serving CDMA network
//
// Tries to find the operator name corresponding to the given SID
//
function _findProviderForSid(sid) {
    if (!sid)
        return null;

    return lookupCdmaSid(sid);
}

const ModemBase = GObject.registerClass({
    GTypeFlags: GObject.TypeFlags.ABSTRACT,
    Properties: {
        'operator-name': GObject.ParamSpec.string(
            'operator-name', null, null,
            GObject.ParamFlags.READABLE,
            null),
        'signal-quality': GObject.ParamSpec.int(
            'signal-quality', null, null,
            GObject.ParamFlags.READABLE,
            0, 100, 0),
    },
}, class ModemBase extends GObject.Object {
    _init() {
        super._init();
        this._operatorName = null;
        this._signalQuality = 0;
    }

    get operatorName() {
        return this._operatorName;
    }

    get signalQuality() {
        return this._signalQuality;
    }

    _setOperatorName(operatorName) {
        if (this._operatorName === operatorName)
            return;
        this._operatorName = operatorName;
        this.notify('operator-name');
    }

    _setSignalQuality(signalQuality) {
        if (this._signalQuality === signalQuality)
            return;
        this._signalQuality = signalQuality;
        this.notify('signal-quality');
    }
});

const BroadbandModemInterface = loadInterfaceXML('org.freedesktop.ModemManager1.Modem');
const BroadbandModemProxy = Gio.DBusProxy.makeProxyWrapper(BroadbandModemInterface);

const BroadbandModem3gppInterface = loadInterfaceXML('org.freedesktop.ModemManager1.Modem.Modem3gpp');
const BroadbandModem3gppProxy = Gio.DBusProxy.makeProxyWrapper(BroadbandModem3gppInterface);

const BroadbandModemCdmaInterface = loadInterfaceXML('org.freedesktop.ModemManager1.Modem.ModemCdma');
const BroadbandModemCdmaProxy = Gio.DBusProxy.makeProxyWrapper(BroadbandModemCdmaInterface);

export const BroadbandModem = GObject.registerClass({
    Properties: {
        'capabilities': GObject.ParamSpec.flags(
            'capabilities', null, null,
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            NM.DeviceModemCapabilities.$gtype,
            NM.DeviceModemCapabilities.NONE),
    },
}, class BroadbandModem extends ModemBase {
    _init(path, capabilities) {
        super._init({capabilities});
        this._proxy = new BroadbandModemProxy(Gio.DBus.system, 'org.freedesktop.ModemManager1', path);
        this._proxy_3gpp = new BroadbandModem3gppProxy(Gio.DBus.system, 'org.freedesktop.ModemManager1', path);
        this._proxy_cdma = new BroadbandModemCdmaProxy(Gio.DBus.system, 'org.freedesktop.ModemManager1', path);

        this._proxy.connect('g-properties-changed', (proxy, properties) => {
            const signalQualityChanged = !!properties.lookup_value('SignalQuality', null);
            if (signalQualityChanged)
                this._reloadSignalQuality();
        });
        this._reloadSignalQuality();

        this._proxy_3gpp.connect('g-properties-changed', (proxy, properties) => {
            const unpacked = properties.deepUnpack();
            if ('OperatorName' in unpacked || 'OperatorCode' in unpacked)
                this._reload3gppOperatorName();
        });
        this._reload3gppOperatorName();

        this._proxy_cdma.connect('g-properties-changed', (proxy, properties) => {
            const unpacked = properties.deepUnpack();
            if ('Nid' in unpacked || 'Sid' in unpacked)
                this._reloadCdmaOperatorName();
        });
        this._reloadCdmaOperatorName();
    }

    _reloadSignalQuality() {
        const [quality, recent_] = this._proxy.SignalQuality;
        this._setSignalQuality(quality);
    }

    _reloadOperatorName() {
        let newName = '';
        if (this.operator_name_3gpp && this.operator_name_3gpp.length > 0)
            newName += this.operator_name_3gpp;

        if (this.operator_name_cdma && this.operator_name_cdma.length > 0) {
            if (newName !== '')
                newName += ', ';
            newName += this.operator_name_cdma;
        }

        this._setOperatorName(newName);
    }

    _reload3gppOperatorName() {
        const name = this._proxy_3gpp.OperatorName;
        const code = this._proxy_3gpp.OperatorCode;
        this.operator_name_3gpp = _findProviderForMccMnc(name, code);
        this._reloadOperatorName();
    }

    _reloadCdmaOperatorName() {
        const sid = this._proxy_cdma.Sid;
        this.operator_name_cdma = _findProviderForSid(sid);
        this._reloadOperatorName();
    }
});
