/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://NM?version=1.0' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export abstract class NM {
    static readonly '80211Mode': typeof NM.__80211Mode;
    static readonly '80211ApFlags': typeof NM.__80211ApFlags;
    static readonly '80211ApSecurityFlags': typeof NM.__80211ApSecurityFlags;
}

export namespace NM {

    /**
     * NM-1.0
     */


    export namespace __80211Mode {
        export const $gtype: GObject.GType<__80211Mode>;
    }

    enum __80211Mode {
        UNKNOWN = 0,
        ADHOC = 1,
        INFRA = 2,
        AP = 3,
        MESH = 4,
    }


    export namespace ActiveConnectionState {
        export const $gtype: GObject.GType<ActiveConnectionState>;
    }

    enum ActiveConnectionState {
        UNKNOWN = 0,
        ACTIVATING = 1,
        ACTIVATED = 2,
        DEACTIVATING = 3,
        DEACTIVATED = 4,
    }


    export namespace ActiveConnectionStateReason {
        export const $gtype: GObject.GType<ActiveConnectionStateReason>;
    }

    enum ActiveConnectionStateReason {
        UNKNOWN = 0,
        NONE = 1,
        USER_DISCONNECTED = 2,
        DEVICE_DISCONNECTED = 3,
        SERVICE_STOPPED = 4,
        IP_CONFIG_INVALID = 5,
        CONNECT_TIMEOUT = 6,
        SERVICE_START_TIMEOUT = 7,
        SERVICE_START_FAILED = 8,
        NO_SECRETS = 9,
        LOGIN_FAILED = 10,
        CONNECTION_REMOVED = 11,
        DEPENDENCY_FAILED = 12,
        DEVICE_REALIZE_FAILED = 13,
        DEVICE_REMOVED = 14,
    }


    class AgentManagerError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static PERMISSIONDENIED: number;

        static INVALIDIDENTIFIER: number;

        static NOTREGISTERED: number;

        static NOSECRETS: number;

        static USERCANCELED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace Capability {
        export const $gtype: GObject.GType<Capability>;
    }

    enum Capability {
        TEAM = 1,
        OVS = 2,
    }


    class ClientError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static MANAGER_NOT_RUNNING: number;

        static OBJECT_CREATION_FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace ClientPermission {
        export const $gtype: GObject.GType<ClientPermission>;
    }

    enum ClientPermission {
        NONE = 0,
        ENABLE_DISABLE_NETWORK = 1,
        ENABLE_DISABLE_WIFI = 2,
        ENABLE_DISABLE_WWAN = 3,
        ENABLE_DISABLE_WIMAX = 4,
        SLEEP_WAKE = 5,
        NETWORK_CONTROL = 6,
        WIFI_SHARE_PROTECTED = 7,
        WIFI_SHARE_OPEN = 8,
        SETTINGS_MODIFY_SYSTEM = 9,
        SETTINGS_MODIFY_OWN = 10,
        SETTINGS_MODIFY_HOSTNAME = 11,
        SETTINGS_MODIFY_GLOBAL_DNS = 12,
        RELOAD = 13,
        CHECKPOINT_ROLLBACK = 14,
        ENABLE_DISABLE_STATISTICS = 15,
        ENABLE_DISABLE_CONNECTIVITY_CHECK = 16,
        WIFI_SCAN = 17,
        LAST = 17,
    }


    export namespace ClientPermissionResult {
        export const $gtype: GObject.GType<ClientPermissionResult>;
    }

    enum ClientPermissionResult {
        UNKNOWN = 0,
        YES = 1,
        AUTH = 2,
        NO = 3,
    }


    class ConnectionError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static SETTINGNOTFOUND: number;

        static PROPERTYNOTFOUND: number;

        static PROPERTYNOTSECRET: number;

        static MISSINGSETTING: number;

        static INVALIDSETTING: number;

        static MISSINGPROPERTY: number;

        static INVALIDPROPERTY: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace ConnectionMultiConnect {
        export const $gtype: GObject.GType<ConnectionMultiConnect>;
    }

    enum ConnectionMultiConnect {
        DEFAULT = 0,
        SINGLE = 1,
        MANUAL_MULTIPLE = 2,
        MULTIPLE = 3,
    }


    export namespace ConnectivityState {
        export const $gtype: GObject.GType<ConnectivityState>;
    }

    enum ConnectivityState {
        UNKNOWN = 0,
        NONE = 1,
        PORTAL = 2,
        LIMITED = 3,
        FULL = 4,
    }


    class CryptoError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static INVALID_DATA: number;

        static INVALID_PASSWORD: number;

        static UNKNOWN_CIPHER: number;

        static DECRYPTION_FAILED: number;

        static ENCRYPTION_FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    class DeviceError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static CREATIONFAILED: number;

        static INVALIDCONNECTION: number;

        static INCOMPATIBLECONNECTION: number;

        static NOTACTIVE: number;

        static NOTSOFTWARE: number;

        static NOTALLOWED: number;

        static SPECIFICOBJECTNOTFOUND: number;

        static VERSIONIDMISMATCH: number;

        static MISSINGDEPENDENCIES: number;

        static INVALIDARGUMENT: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace DeviceManaged {
        export const $gtype: GObject.GType<DeviceManaged>;
    }

    enum DeviceManaged {
        NO = 0,
        YES = 1,
        RESET = 2,
    }


    export namespace DeviceState {
        export const $gtype: GObject.GType<DeviceState>;
    }

    enum DeviceState {
        UNKNOWN = 0,
        UNMANAGED = 10,
        UNAVAILABLE = 20,
        DISCONNECTED = 30,
        PREPARE = 40,
        CONFIG = 50,
        NEED_AUTH = 60,
        IP_CONFIG = 70,
        IP_CHECK = 80,
        SECONDARIES = 90,
        ACTIVATED = 100,
        DEACTIVATING = 110,
        FAILED = 120,
    }


    export namespace DeviceStateReason {
        export const $gtype: GObject.GType<DeviceStateReason>;
    }

    enum DeviceStateReason {
        NONE = 0,
        UNKNOWN = 1,
        NOW_MANAGED = 2,
        NOW_UNMANAGED = 3,
        CONFIG_FAILED = 4,
        IP_CONFIG_UNAVAILABLE = 5,
        IP_CONFIG_EXPIRED = 6,
        NO_SECRETS = 7,
        SUPPLICANT_DISCONNECT = 8,
        SUPPLICANT_CONFIG_FAILED = 9,
        SUPPLICANT_FAILED = 10,
        SUPPLICANT_TIMEOUT = 11,
        PPP_START_FAILED = 12,
        PPP_DISCONNECT = 13,
        PPP_FAILED = 14,
        DHCP_START_FAILED = 15,
        DHCP_ERROR = 16,
        DHCP_FAILED = 17,
        SHARED_START_FAILED = 18,
        SHARED_FAILED = 19,
        AUTOIP_START_FAILED = 20,
        AUTOIP_ERROR = 21,
        AUTOIP_FAILED = 22,
        MODEM_BUSY = 23,
        MODEM_NO_DIAL_TONE = 24,
        MODEM_NO_CARRIER = 25,
        MODEM_DIAL_TIMEOUT = 26,
        MODEM_DIAL_FAILED = 27,
        MODEM_INIT_FAILED = 28,
        GSM_APN_FAILED = 29,
        GSM_REGISTRATION_NOT_SEARCHING = 30,
        GSM_REGISTRATION_DENIED = 31,
        GSM_REGISTRATION_TIMEOUT = 32,
        GSM_REGISTRATION_FAILED = 33,
        GSM_PIN_CHECK_FAILED = 34,
        FIRMWARE_MISSING = 35,
        REMOVED = 36,
        SLEEPING = 37,
        CONNECTION_REMOVED = 38,
        USER_REQUESTED = 39,
        CARRIER = 40,
        CONNECTION_ASSUMED = 41,
        SUPPLICANT_AVAILABLE = 42,
        MODEM_NOT_FOUND = 43,
        BT_FAILED = 44,
        GSM_SIM_NOT_INSERTED = 45,
        GSM_SIM_PIN_REQUIRED = 46,
        GSM_SIM_PUK_REQUIRED = 47,
        GSM_SIM_WRONG = 48,
        INFINIBAND_MODE = 49,
        DEPENDENCY_FAILED = 50,
        BR2684_FAILED = 51,
        MODEM_MANAGER_UNAVAILABLE = 52,
        SSID_NOT_FOUND = 53,
        SECONDARY_CONNECTION_FAILED = 54,
        DCB_FCOE_FAILED = 55,
        TEAMD_CONTROL_FAILED = 56,
        MODEM_FAILED = 57,
        MODEM_AVAILABLE = 58,
        SIM_PIN_INCORRECT = 59,
        NEW_ACTIVATION = 60,
        PARENT_CHANGED = 61,
        PARENT_MANAGED_CHANGED = 62,
        OVSDB_FAILED = 63,
        IP_ADDRESS_DUPLICATE = 64,
        IP_METHOD_UNSUPPORTED = 65,
        SRIOV_CONFIGURATION_FAILED = 66,
        PEER_NOT_FOUND = 67,
        DEVICE_HANDLER_FAILED = 68,
        UNMANAGED_BY_DEFAULT = 69,
        UNMANAGED_EXTERNAL_DOWN = 70,
        UNMANAGED_LINK_NOT_INIT = 71,
        UNMANAGED_QUITTING = 72,
        UNMANAGED_SLEEPING = 73,
        UNMANAGED_MANAGER_DISABLED = 73,
        UNMANAGED_USER_CONF = 74,
        UNMANAGED_USER_EXPLICIT = 75,
        UNMANAGED_USER_SETTINGS = 76,
        UNMANAGED_USER_UDEV = 77,
        NETWORKING_OFF = 78,
        MODEM_NO_OPERATOR_CODE = 79,
    }


    export namespace DeviceType {
        export const $gtype: GObject.GType<DeviceType>;
    }

    enum DeviceType {
        UNKNOWN = 0,
        ETHERNET = 1,
        WIFI = 2,
        UNUSED1 = 3,
        UNUSED2 = 4,
        BT = 5,
        OLPC_MESH = 6,
        WIMAX = 7,
        MODEM = 8,
        INFINIBAND = 9,
        BOND = 10,
        VLAN = 11,
        ADSL = 12,
        BRIDGE = 13,
        GENERIC = 14,
        TEAM = 15,
        TUN = 16,
        IP_TUNNEL = 17,
        MACVLAN = 18,
        VXLAN = 19,
        VETH = 20,
        MACSEC = 21,
        DUMMY = 22,
        PPP = 23,
        OVS_INTERFACE = 24,
        OVS_PORT = 25,
        OVS_BRIDGE = 26,
        WPAN = 27,
        "6LOWPAN" = 28,
        WIREGUARD = 29,
        WIFI_P2P = 30,
        VRF = 31,
        LOOPBACK = 32,
        HSR = 33,
        IPVLAN = 34,
        GENEVE = 35,
    }


    export namespace IPTunnelMode {
        export const $gtype: GObject.GType<IPTunnelMode>;
    }

    enum IPTunnelMode {
        UNKNOWN = 0,
        IPIP = 1,
        GRE = 2,
        SIT = 3,
        ISATAP = 4,
        VTI = 5,
        IP6IP6 = 6,
        IPIP6 = 7,
        IP6GRE = 8,
        VTI6 = 9,
        GRETAP = 10,
        IP6GRETAP = 11,
    }


    export namespace KeyfileHandlerType {
        export const $gtype: GObject.GType<KeyfileHandlerType>;
    }

    enum KeyfileHandlerType {
        WARN = 1,
        WRITE_CERT = 2,
    }


    export namespace KeyfileWarnSeverity {
        export const $gtype: GObject.GType<KeyfileWarnSeverity>;
    }

    enum KeyfileWarnSeverity {
        DEBUG = 1000,
        INFO = 2000,
        INFO_MISSING_FILE = 2901,
        WARN = 3000,
    }


    class ManagerError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static PERMISSIONDENIED: number;

        static UNKNOWNCONNECTION: number;

        static UNKNOWNDEVICE: number;

        static CONNECTIONNOTAVAILABLE: number;

        static CONNECTIONNOTACTIVE: number;

        static CONNECTIONALREADYACTIVE: number;

        static DEPENDENCYFAILED: number;

        static ALREADYASLEEPORAWAKE: number;

        static ALREADYENABLEDORDISABLED: number;

        static UNKNOWNLOGLEVEL: number;

        static UNKNOWNLOGDOMAIN: number;

        static INVALIDARGUMENTS: number;

        static MISSINGPLUGIN: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace Metered {
        export const $gtype: GObject.GType<Metered>;
    }

    enum Metered {
        UNKNOWN = 0,
        YES = 1,
        NO = 2,
        GUESS_YES = 3,
        GUESS_NO = 4,
    }


    enum RollbackResult {
        OK = 0,
        ERR_NO_DEVICE = 1,
        ERR_DEVICE_UNMANAGED = 2,
        ERR_FAILED = 3,
    }


    class SecretAgentError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static PERMISSIONDENIED: number;

        static INVALIDCONNECTION: number;

        static USERCANCELED: number;

        static AGENTCANCELED: number;

        static NOSECRETS: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace Setting8021xCKFormat {
        export const $gtype: GObject.GType<Setting8021xCKFormat>;
    }

    enum Setting8021xCKFormat {
        UNKNOWN = 0,
        X509 = 1,
        RAW_KEY = 2,
        PKCS12 = 3,
    }


    export namespace Setting8021xCKScheme {
        export const $gtype: GObject.GType<Setting8021xCKScheme>;
    }

    enum Setting8021xCKScheme {
        UNKNOWN = 0,
        BLOB = 1,
        PATH = 2,
        PKCS11 = 3,
    }


    export namespace SettingCompareFlags {
        export const $gtype: GObject.GType<SettingCompareFlags>;
    }

    enum SettingCompareFlags {
        EXACT = 0,
        FUZZY = 1,
        IGNORE_ID = 2,
        IGNORE_SECRETS = 4,
        IGNORE_AGENT_OWNED_SECRETS = 8,
        IGNORE_NOT_SAVED_SECRETS = 16,
        DIFF_RESULT_WITH_DEFAULT = 32,
        DIFF_RESULT_NO_DEFAULT = 64,
        IGNORE_TIMESTAMP = 128,
    }


    export namespace SettingConnectionAutoconnectSlaves {
        export const $gtype: GObject.GType<SettingConnectionAutoconnectSlaves>;
    }

    enum SettingConnectionAutoconnectSlaves {
        DEFAULT = -1,
        NO = 0,
        YES = 1,
    }


    export namespace SettingConnectionDnsOverTls {
        export const $gtype: GObject.GType<SettingConnectionDnsOverTls>;
    }

    enum SettingConnectionDnsOverTls {
        DEFAULT = -1,
        NO = 0,
        OPPORTUNISTIC = 1,
        YES = 2,
    }


    export namespace SettingConnectionDnssec {
        export const $gtype: GObject.GType<SettingConnectionDnssec>;
    }

    enum SettingConnectionDnssec {
        DEFAULT = -1,
        NO = 0,
        ALLOW_DOWNGRADE = 1,
        YES = 2,
    }


    export namespace SettingConnectionDownOnPoweroff {
        export const $gtype: GObject.GType<SettingConnectionDownOnPoweroff>;
    }

    enum SettingConnectionDownOnPoweroff {
        DEFAULT = -1,
        NO = 0,
        YES = 1,
    }


    export namespace SettingConnectionLldp {
        export const $gtype: GObject.GType<SettingConnectionLldp>;
    }

    enum SettingConnectionLldp {
        DEFAULT = -1,
        DISABLE = 0,
        ENABLE_RX = 1,
    }


    export namespace SettingConnectionLlmnr {
        export const $gtype: GObject.GType<SettingConnectionLlmnr>;
    }

    enum SettingConnectionLlmnr {
        DEFAULT = -1,
        NO = 0,
        RESOLVE = 1,
        YES = 2,
    }


    export namespace SettingConnectionMdns {
        export const $gtype: GObject.GType<SettingConnectionMdns>;
    }

    enum SettingConnectionMdns {
        DEFAULT = -1,
        NO = 0,
        RESOLVE = 1,
        YES = 2,
    }


    export namespace SettingDiffResult {
        export const $gtype: GObject.GType<SettingDiffResult>;
    }

    enum SettingDiffResult {
        UNKNOWN = 0,
        IN_A = 1,
        IN_B = 2,
        IN_A_DEFAULT = 4,
        IN_B_DEFAULT = 8,
    }


    export namespace SettingGeneveDf {
        export const $gtype: GObject.GType<SettingGeneveDf>;
    }

    enum SettingGeneveDf {
        UNSET = 0,
        SET = 1,
        INHERIT = 2,
    }


    export namespace SettingHsrProtocolVersion {
        export const $gtype: GObject.GType<SettingHsrProtocolVersion>;
    }

    enum SettingHsrProtocolVersion {
        DEFAULT = -1,
        HSR_2010 = 0,
        HSR_2012 = 1,
    }


    export namespace SettingIP4DhcpIpv6OnlyPreferred {
        export const $gtype: GObject.GType<SettingIP4DhcpIpv6OnlyPreferred>;
    }

    enum SettingIP4DhcpIpv6OnlyPreferred {
        DEFAULT = -1,
        NO = 0,
        YES = 1,
        AUTO = 2,
    }


    export namespace SettingIP4LinkLocal {
        export const $gtype: GObject.GType<SettingIP4LinkLocal>;
    }

    enum SettingIP4LinkLocal {
        DEFAULT = 0,
        AUTO = 1,
        DISABLED = 2,
        ENABLED = 3,
        FALLBACK = 4,
    }


    export namespace SettingIP6ConfigAddrGenMode {
        export const $gtype: GObject.GType<SettingIP6ConfigAddrGenMode>;
    }

    enum SettingIP6ConfigAddrGenMode {
        EUI64 = 0,
        STABLE_PRIVACY = 1,
        DEFAULT_OR_EUI64 = 2,
        DEFAULT = 3,
    }


    export namespace SettingIP6ConfigPrivacy {
        export const $gtype: GObject.GType<SettingIP6ConfigPrivacy>;
    }

    enum SettingIP6ConfigPrivacy {
        UNKNOWN = -1,
        DISABLED = 0,
        PREFER_PUBLIC_ADDR = 1,
        PREFER_TEMP_ADDR = 2,
    }


    export namespace SettingIPConfigForwarding {
        export const $gtype: GObject.GType<SettingIPConfigForwarding>;
    }

    enum SettingIPConfigForwarding {
        DEFAULT = -1,
        NO = 0,
        YES = 1,
        AUTO = 2,
    }


    export namespace SettingIPConfigRoutedDns {
        export const $gtype: GObject.GType<SettingIPConfigRoutedDns>;
    }

    enum SettingIPConfigRoutedDns {
        DEFAULT = -1,
        NO = 0,
        YES = 1,
    }


    export namespace SettingIp4ConfigClat {
        export const $gtype: GObject.GType<SettingIp4ConfigClat>;
    }

    enum SettingIp4ConfigClat {
        DEFAULT = -1,
        NO = 0,
        AUTO = 1,
        FORCE = 2,
    }


    export namespace SettingIpvlanMode {
        export const $gtype: GObject.GType<SettingIpvlanMode>;
    }

    enum SettingIpvlanMode {
        UNKNOWN = 0,
        L2 = 1,
        L3 = 2,
        L3S = 3,
    }


    export namespace SettingMacRandomization {
        export const $gtype: GObject.GType<SettingMacRandomization>;
    }

    enum SettingMacRandomization {
        DEFAULT = 0,
        NEVER = 1,
        ALWAYS = 2,
    }


    export namespace SettingMacsecMode {
        export const $gtype: GObject.GType<SettingMacsecMode>;
    }

    enum SettingMacsecMode {
        PSK = 0,
        EAP = 1,
    }


    export namespace SettingMacsecOffload {
        export const $gtype: GObject.GType<SettingMacsecOffload>;
    }

    enum SettingMacsecOffload {
        DEFAULT = -1,
        OFF = 0,
        PHY = 1,
        MAC = 2,
    }


    export namespace SettingMacsecValidation {
        export const $gtype: GObject.GType<SettingMacsecValidation>;
    }

    enum SettingMacsecValidation {
        DISABLE = 0,
        CHECK = 1,
        STRICT = 2,
    }


    export namespace SettingMacvlanMode {
        export const $gtype: GObject.GType<SettingMacvlanMode>;
    }

    enum SettingMacvlanMode {
        UNKNOWN = 0,
        VEPA = 1,
        BRIDGE = 2,
        PRIVATE = 3,
        PASSTHRU = 4,
        SOURCE = 5,
    }


    export namespace SettingOvsDpdkLscInterrupt {
        export const $gtype: GObject.GType<SettingOvsDpdkLscInterrupt>;
    }

    enum SettingOvsDpdkLscInterrupt {
        IGNORE = -1,
        DISABLED = 0,
        ENABLED = 1,
    }


    export namespace SettingProxyMethod {
        export const $gtype: GObject.GType<SettingProxyMethod>;
    }

    enum SettingProxyMethod {
        NONE = 0,
        AUTO = 1,
    }


    export namespace SettingSerialParity {
        export const $gtype: GObject.GType<SettingSerialParity>;
    }

    enum SettingSerialParity {
        NONE = 0,
        EVEN = 1,
        ODD = 2,
    }


    export namespace SettingTunMode {
        export const $gtype: GObject.GType<SettingTunMode>;
    }

    enum SettingTunMode {
        UNKNOWN = 0,
        TUN = 1,
        TAP = 2,
    }


    export namespace SettingWirelessChannelWidth {
        export const $gtype: GObject.GType<SettingWirelessChannelWidth>;
    }

    enum SettingWirelessChannelWidth {
        AUTO = 0,
        "20MHZ" = 20,
        "40MHZ" = 40,
        "80MHZ" = 80,
    }


    export namespace SettingWirelessPowersave {
        export const $gtype: GObject.GType<SettingWirelessPowersave>;
    }

    enum SettingWirelessPowersave {
        DEFAULT = 0,
        IGNORE = 1,
        DISABLE = 2,
        ENABLE = 3,
    }


    export namespace SettingWirelessSecurityFils {
        export const $gtype: GObject.GType<SettingWirelessSecurityFils>;
    }

    enum SettingWirelessSecurityFils {
        DEFAULT = 0,
        DISABLE = 1,
        OPTIONAL = 2,
        REQUIRED = 3,
    }


    export namespace SettingWirelessSecurityPmf {
        export const $gtype: GObject.GType<SettingWirelessSecurityPmf>;
    }

    enum SettingWirelessSecurityPmf {
        DEFAULT = 0,
        DISABLE = 1,
        OPTIONAL = 2,
        REQUIRED = 3,
    }


    class SettingsError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static PERMISSIONDENIED: number;

        static NOTSUPPORTED: number;

        static INVALIDCONNECTION: number;

        static READONLYCONNECTION: number;

        static UUIDEXISTS: number;

        static INVALIDHOSTNAME: number;

        static INVALIDARGUMENTS: number;

        static VERSIONIDMISMATCH: number;

        static NOTSUPPORTEDBYPLUGIN: number;

        static FEATUREDISABLED: number;

        static FEATUREREMOVED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace SriovEswitchEncapMode {
        export const $gtype: GObject.GType<SriovEswitchEncapMode>;
    }

    enum SriovEswitchEncapMode {
        PRESERVE = -1,
        NONE = 0,
        BASIC = 1,
    }


    export namespace SriovEswitchInlineMode {
        export const $gtype: GObject.GType<SriovEswitchInlineMode>;
    }

    enum SriovEswitchInlineMode {
        PRESERVE = -1,
        NONE = 0,
        LINK = 1,
        NETWORK = 2,
        TRANSPORT = 3,
    }


    export namespace SriovEswitchMode {
        export const $gtype: GObject.GType<SriovEswitchMode>;
    }

    enum SriovEswitchMode {
        PRESERVE = -1,
        LEGACY = 0,
        SWITCHDEV = 1,
    }


    export namespace SriovPreserveOnDown {
        export const $gtype: GObject.GType<SriovPreserveOnDown>;
    }

    enum SriovPreserveOnDown {
        DEFAULT = -1,
        NO = 0,
        YES = 1,
    }


    export namespace SriovVFVlanProtocol {
        export const $gtype: GObject.GType<SriovVFVlanProtocol>;
    }

    enum SriovVFVlanProtocol {
        "1Q" = 0,
        "1AD" = 1,
    }


    export namespace State {
        export const $gtype: GObject.GType<State>;
    }

    enum State {
        UNKNOWN = 0,
        ASLEEP = 10,
        DISABLED = 10,
        DISCONNECTED = 20,
        DISCONNECTING = 30,
        CONNECTING = 40,
        CONNECTED_LOCAL = 50,
        CONNECTED_SITE = 60,
        CONNECTED_GLOBAL = 70,
    }


    export namespace Ternary {
        export const $gtype: GObject.GType<Ternary>;
    }

    enum Ternary {
        DEFAULT = -1,
        FALSE = 0,
        TRUE = 1,
    }


    export namespace UtilsSecurityType {
        export const $gtype: GObject.GType<UtilsSecurityType>;
    }

    enum UtilsSecurityType {
        INVALID = 0,
        NONE = 1,
        STATIC_WEP = 2,
        LEAP = 3,
        DYNAMIC_WEP = 4,
        WPA_PSK = 5,
        WPA_ENTERPRISE = 6,
        WPA2_PSK = 7,
        WPA2_ENTERPRISE = 8,
        SAE = 9,
        OWE = 10,
        WPA3_SUITE_B_192 = 11,
    }


    export namespace VersionInfoCapability {
        export const $gtype: GObject.GType<VersionInfoCapability>;
    }

    enum VersionInfoCapability {
        SYNC_ROUTE_WITH_TABLE = 0,
        IP4_FORWARDING = 1,
        SRIOV_PRESERVE_ON_DOWN = 2,
    }


    export namespace VlanPriorityMap {
        export const $gtype: GObject.GType<VlanPriorityMap>;
    }

    enum VlanPriorityMap {
        INGRESS_MAP = 0,
        EGRESS_MAP = 1,
    }


    export namespace VpnConnectionState {
        export const $gtype: GObject.GType<VpnConnectionState>;
    }

    enum VpnConnectionState {
        UNKNOWN = 0,
        PREPARE = 1,
        NEED_AUTH = 2,
        CONNECT = 3,
        IP_CONFIG_GET = 4,
        ACTIVATED = 5,
        FAILED = 6,
        DISCONNECTED = 7,
    }


    export namespace VpnConnectionStateReason {
        export const $gtype: GObject.GType<VpnConnectionStateReason>;
    }

    enum VpnConnectionStateReason {
        UNKNOWN = 0,
        NONE = 1,
        USER_DISCONNECTED = 2,
        DEVICE_DISCONNECTED = 3,
        SERVICE_STOPPED = 4,
        IP_CONFIG_INVALID = 5,
        CONNECT_TIMEOUT = 6,
        SERVICE_START_TIMEOUT = 7,
        SERVICE_START_FAILED = 8,
        NO_SECRETS = 9,
        LOGIN_FAILED = 10,
        CONNECTION_REMOVED = 11,
    }


    class VpnPluginError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static STARTINGINPROGRESS: number;

        static ALREADYSTARTED: number;

        static STOPPINGINPROGRESS: number;

        static ALREADYSTOPPED: number;

        static WRONGSTATE: number;

        static BADARGUMENTS: number;

        static LAUNCHFAILED: number;

        static INVALIDCONNECTION: number;

        static INTERACTIVENOTSUPPORTED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace VpnPluginFailure {
        export const $gtype: GObject.GType<VpnPluginFailure>;
    }

    enum VpnPluginFailure {
        LOGIN_FAILED = 0,
        CONNECT_FAILED = 1,
        BAD_IP_CONFIG = 2,
    }


    export namespace VpnServiceState {
        export const $gtype: GObject.GType<VpnServiceState>;
    }

    enum VpnServiceState {
        UNKNOWN = 0,
        INIT = 1,
        SHUTDOWN = 2,
        STARTING = 3,
        STARTED = 4,
        STOPPING = 5,
        STOPPED = 6,
    }


    export namespace WepKeyType {
        export const $gtype: GObject.GType<WepKeyType>;
    }

    enum WepKeyType {
        UNKNOWN = 0,
        KEY = 1,
        PASSPHRASE = 2,
    }


    export namespace WifiBand {
        export const $gtype: GObject.GType<WifiBand>;
    }

    enum WifiBand {
        UNKNOWN = 0,
        "2_4_GHZ" = 1,
        "5_GHZ" = 2,
        "6_GHZ" = 3,
    }


    export namespace WimaxNspNetworkType {
        export const $gtype: GObject.GType<WimaxNspNetworkType>;
    }

    enum WimaxNspNetworkType {
        UNKNOWN = 0,
        HOME = 1,
        PARTNER = 2,
        ROAMING_PARTNER = 3,
    }


    const ACCESS_POINT_BANDWIDTH: string;

    const ACCESS_POINT_BSSID: string;

    const ACCESS_POINT_FLAGS: string;

    const ACCESS_POINT_FREQUENCY: string;

    const ACCESS_POINT_HW_ADDRESS: string;

    const ACCESS_POINT_LAST_SEEN: string;

    const ACCESS_POINT_MAX_BITRATE: string;

    const ACCESS_POINT_MODE: string;

    const ACCESS_POINT_RSN_FLAGS: string;

    const ACCESS_POINT_SSID: string;

    const ACCESS_POINT_STRENGTH: string;

    const ACCESS_POINT_WPA_FLAGS: string;

    const ACTIVE_CONNECTION_CONNECTION: string;

    const ACTIVE_CONNECTION_CONTROLLER: string;

    const ACTIVE_CONNECTION_DEFAULT: string;

    const ACTIVE_CONNECTION_DEFAULT6: string;

    const ACTIVE_CONNECTION_DEVICES: string;

    const ACTIVE_CONNECTION_DHCP4_CONFIG: string;

    const ACTIVE_CONNECTION_DHCP6_CONFIG: string;

    const ACTIVE_CONNECTION_ID: string;

    const ACTIVE_CONNECTION_IP4_CONFIG: string;

    const ACTIVE_CONNECTION_IP6_CONFIG: string;

    const ACTIVE_CONNECTION_MASTER: string;

    const ACTIVE_CONNECTION_SPECIFIC_OBJECT_PATH: string;

    const ACTIVE_CONNECTION_STATE: string;

    const ACTIVE_CONNECTION_STATE_FLAGS: string;

    const ACTIVE_CONNECTION_TYPE: string;

    const ACTIVE_CONNECTION_UUID: string;

    const ACTIVE_CONNECTION_VPN: string;

    const BRIDGE_VLAN_VID_MAX: number;

    const BRIDGE_VLAN_VID_MIN: number;

    const CHECKPOINT_CREATED: string;

    const CHECKPOINT_DEVICES: string;

    const CHECKPOINT_ROLLBACK_TIMEOUT: string;

    const CLIENT_ACTIVATING_CONNECTION: string;

    const CLIENT_ACTIVE_CONNECTIONS: string;

    const CLIENT_ACTIVE_CONNECTION_ADDED: string;

    const CLIENT_ACTIVE_CONNECTION_REMOVED: string;

    const CLIENT_ALL_DEVICES: string;

    const CLIENT_ANY_DEVICE_ADDED: string;

    const CLIENT_ANY_DEVICE_REMOVED: string;

    const CLIENT_CAN_MODIFY: string;

    const CLIENT_CAPABILITIES: string;

    const CLIENT_CHECKPOINTS: string;

    const CLIENT_CONNECTIONS: string;

    const CLIENT_CONNECTION_ADDED: string;

    const CLIENT_CONNECTION_REMOVED: string;

    const CLIENT_CONNECTIVITY: string;

    const CLIENT_CONNECTIVITY_CHECK_AVAILABLE: string;

    const CLIENT_CONNECTIVITY_CHECK_ENABLED: string;

    const CLIENT_CONNECTIVITY_CHECK_URI: string;

    const CLIENT_DBUS_CONNECTION: string;

    const CLIENT_DBUS_NAME_OWNER: string;

    const CLIENT_DEVICES: string;

    const CLIENT_DEVICE_ADDED: string;

    const CLIENT_DEVICE_REMOVED: string;

    const CLIENT_DNS_CONFIGURATION: string;

    const CLIENT_DNS_MODE: string;

    const CLIENT_DNS_RC_MANAGER: string;

    const CLIENT_HOSTNAME: string;

    const CLIENT_INSTANCE_FLAGS: string;

    const CLIENT_METERED: string;

    const CLIENT_NETWORKING_ENABLED: string;

    const CLIENT_NM_RUNNING: string;

    const CLIENT_PERMISSIONS_STATE: string;

    const CLIENT_PERMISSION_CHANGED: string;

    const CLIENT_PRIMARY_CONNECTION: string;

    const CLIENT_RADIO_FLAGS: string;

    const CLIENT_STARTUP: string;

    const CLIENT_STATE: string;

    const CLIENT_VERSION: string;

    const CLIENT_VERSION_INFO: string;

    const CLIENT_WIMAX_ENABLED: string;

    const CLIENT_WIMAX_HARDWARE_ENABLED: string;

    const CLIENT_WIRELESS_ENABLED: string;

    const CLIENT_WIRELESS_HARDWARE_ENABLED: string;

    const CLIENT_WWAN_ENABLED: string;

    const CLIENT_WWAN_HARDWARE_ENABLED: string;

    const CONNECTION_CHANGED: string;

    const CONNECTION_NORMALIZE_PARAM_IP4_CONFIG_METHOD: string;

    const CONNECTION_NORMALIZE_PARAM_IP6_CONFIG_METHOD: string;

    const CONNECTION_SECRETS_CLEARED: string;

    const CONNECTION_SECRETS_UPDATED: string;

    const DBUS_INTERFACE: string;

    const DBUS_INTERFACE_DNS_MANAGER: string;

    const DBUS_INTERFACE_SETTINGS: string;

    const DBUS_INTERFACE_SETTINGS_CONNECTION: string;

    const DBUS_INTERFACE_SETTINGS_CONNECTION_SECRETS: string;

    const DBUS_INTERFACE_VPN: string;

    const DBUS_INTERFACE_VPN_CONNECTION: string;

    const DBUS_INVALID_VPN_CONNECTION: string;

    const DBUS_NO_ACTIVE_VPN_CONNECTION: string;

    const DBUS_NO_VPN_CONNECTIONS: string;

    const DBUS_PATH: string;

    const DBUS_PATH_AGENT_MANAGER: string;

    const DBUS_PATH_DNS_MANAGER: string;

    const DBUS_PATH_SECRET_AGENT: string;

    const DBUS_PATH_SETTINGS: string;

    const DBUS_PATH_SETTINGS_CONNECTION: string;

    const DBUS_PATH_VPN: string;

    const DBUS_PATH_VPN_CONNECTION: string;

    const DBUS_SERVICE: string;

    const DBUS_VPN_ALREADY_STARTED: string;

    const DBUS_VPN_ALREADY_STOPPED: string;

    const DBUS_VPN_BAD_ARGUMENTS: string;

    const DBUS_VPN_ERROR_PREFIX: string;

    const DBUS_VPN_INTERACTIVE_NOT_SUPPORTED: string;

    const DBUS_VPN_SIGNAL_CONNECT_FAILED: string;

    const DBUS_VPN_SIGNAL_IP4_CONFIG: string;

    const DBUS_VPN_SIGNAL_IP_CONFIG_BAD: string;

    const DBUS_VPN_SIGNAL_LAUNCH_FAILED: string;

    const DBUS_VPN_SIGNAL_LOGIN_BANNER: string;

    const DBUS_VPN_SIGNAL_LOGIN_FAILED: string;

    const DBUS_VPN_SIGNAL_STATE_CHANGE: string;

    const DBUS_VPN_SIGNAL_VPN_CONFIG_BAD: string;

    const DBUS_VPN_STARTING_IN_PROGRESS: string;

    const DBUS_VPN_STOPPING_IN_PROGRESS: string;

    const DBUS_VPN_WRONG_STATE: string;

    const DEVICE_6LOWPAN_HW_ADDRESS: string;

    const DEVICE_6LOWPAN_PARENT: string;

    const DEVICE_ACTIVE_CONNECTION: string;

    const DEVICE_ADSL_CARRIER: string;

    const DEVICE_AUTOCONNECT: string;

    const DEVICE_AVAILABLE_CONNECTIONS: string;

    const DEVICE_BOND_CARRIER: string;

    const DEVICE_BOND_HW_ADDRESS: string;

    const DEVICE_BOND_SLAVES: string;

    const DEVICE_BRIDGE_CARRIER: string;

    const DEVICE_BRIDGE_HW_ADDRESS: string;

    const DEVICE_BRIDGE_SLAVES: string;

    const DEVICE_BT_CAPABILITIES: string;

    const DEVICE_BT_HW_ADDRESS: string;

    const DEVICE_BT_NAME: string;

    const DEVICE_CAPABILITIES: string;

    const DEVICE_DEVICE_TYPE: string;

    const DEVICE_DHCP4_CONFIG: string;

    const DEVICE_DHCP6_CONFIG: string;

    const DEVICE_DRIVER: string;

    const DEVICE_DRIVER_VERSION: string;

    const DEVICE_DUMMY_HW_ADDRESS: string;

    const DEVICE_ETHERNET_CARRIER: string;

    const DEVICE_ETHERNET_HW_ADDRESS: string;

    const DEVICE_ETHERNET_PERMANENT_HW_ADDRESS: string;

    const DEVICE_ETHERNET_S390_SUBCHANNELS: string;

    const DEVICE_ETHERNET_SPEED: string;

    const DEVICE_FIRMWARE_MISSING: string;

    const DEVICE_FIRMWARE_VERSION: string;

    const DEVICE_GENERIC_HW_ADDRESS: string;

    const DEVICE_GENERIC_TYPE_DESCRIPTION: string;

    const DEVICE_GENEVE_DF: string;

    const DEVICE_GENEVE_DST_PORT: string;

    const DEVICE_GENEVE_ID: string;

    const DEVICE_GENEVE_REMOTE: string;

    const DEVICE_GENEVE_TOS: string;

    const DEVICE_GENEVE_TTL: string;

    const DEVICE_HSR_MULTICAST_SPEC: string;

    const DEVICE_HSR_PORT1: string;

    const DEVICE_HSR_PORT2: string;

    const DEVICE_HSR_PRP: string;

    const DEVICE_HSR_SUPERVISION_ADDRESS: string;

    const DEVICE_HW_ADDRESS: string;

    const DEVICE_INFINIBAND_CARRIER: string;

    const DEVICE_INFINIBAND_HW_ADDRESS: string;

    const DEVICE_INTERFACE: string;

    const DEVICE_INTERFACE_FLAGS: string;

    const DEVICE_IP4_CONFIG: string;

    const DEVICE_IP4_CONNECTIVITY: string;

    const DEVICE_IP6_CONFIG: string;

    const DEVICE_IP6_CONNECTIVITY: string;

    const DEVICE_IPVLAN_MODE: string;

    const DEVICE_IPVLAN_PARENT: string;

    const DEVICE_IPVLAN_PRIVATE: string;

    const DEVICE_IPVLAN_VEPA: string;

    const DEVICE_IP_INTERFACE: string;

    const DEVICE_IP_TUNNEL_ENCAPSULATION_LIMIT: string;

    const DEVICE_IP_TUNNEL_FLAGS: string;

    const DEVICE_IP_TUNNEL_FLOW_LABEL: string;

    const DEVICE_IP_TUNNEL_FWMARK: string;

    const DEVICE_IP_TUNNEL_INPUT_KEY: string;

    const DEVICE_IP_TUNNEL_LOCAL: string;

    const DEVICE_IP_TUNNEL_MODE: string;

    const DEVICE_IP_TUNNEL_OUTPUT_KEY: string;

    const DEVICE_IP_TUNNEL_PARENT: string;

    const DEVICE_IP_TUNNEL_PATH_MTU_DISCOVERY: string;

    const DEVICE_IP_TUNNEL_REMOTE: string;

    const DEVICE_IP_TUNNEL_TOS: string;

    const DEVICE_IP_TUNNEL_TTL: string;

    const DEVICE_LLDP_NEIGHBORS: string;

    const DEVICE_MACSEC_CIPHER_SUITE: string;

    const DEVICE_MACSEC_ENCODING_SA: string;

    const DEVICE_MACSEC_ENCRYPT: string;

    const DEVICE_MACSEC_ES: string;

    const DEVICE_MACSEC_HW_ADDRESS: string;

    const DEVICE_MACSEC_ICV_LENGTH: string;

    const DEVICE_MACSEC_INCLUDE_SCI: string;

    const DEVICE_MACSEC_PARENT: string;

    const DEVICE_MACSEC_PROTECT: string;

    const DEVICE_MACSEC_REPLAY_PROTECT: string;

    const DEVICE_MACSEC_SCB: string;

    const DEVICE_MACSEC_SCI: string;

    const DEVICE_MACSEC_VALIDATION: string;

    const DEVICE_MACSEC_WINDOW: string;

    const DEVICE_MACVLAN_HW_ADDRESS: string;

    const DEVICE_MACVLAN_MODE: string;

    const DEVICE_MACVLAN_NO_PROMISC: string;

    const DEVICE_MACVLAN_PARENT: string;

    const DEVICE_MACVLAN_TAP: string;

    const DEVICE_MANAGED: string;

    const DEVICE_METERED: string;

    const DEVICE_MODEM_APN: string;

    const DEVICE_MODEM_CURRENT_CAPABILITIES: string;

    const DEVICE_MODEM_DEVICE_ID: string;

    const DEVICE_MODEM_MODEM_CAPABILITIES: string;

    const DEVICE_MODEM_OPERATOR_CODE: string;

    const DEVICE_MTU: string;

    const DEVICE_NM_PLUGIN_MISSING: string;

    const DEVICE_OLPC_MESH_ACTIVE_CHANNEL: string;

    const DEVICE_OLPC_MESH_COMPANION: string;

    const DEVICE_OLPC_MESH_HW_ADDRESS: string;

    const DEVICE_OVS_BRIDGE_SLAVES: string;

    const DEVICE_OVS_PORT_SLAVES: string;

    const DEVICE_PATH: string;

    const DEVICE_PHYSICAL_PORT_ID: string;

    const DEVICE_PORTS: string;

    const DEVICE_PRODUCT: string;

    const DEVICE_REAL: string;

    const DEVICE_STATE: string;

    const DEVICE_STATE_REASON: string;

    const DEVICE_TEAM_CARRIER: string;

    const DEVICE_TEAM_CONFIG: string;

    const DEVICE_TEAM_HW_ADDRESS: string;

    const DEVICE_TEAM_SLAVES: string;

    const DEVICE_TUN_GROUP: string;

    const DEVICE_TUN_HW_ADDRESS: string;

    const DEVICE_TUN_MODE: string;

    const DEVICE_TUN_MULTI_QUEUE: string;

    const DEVICE_TUN_NO_PI: string;

    const DEVICE_TUN_OWNER: string;

    const DEVICE_TUN_VNET_HDR: string;

    const DEVICE_UDI: string;

    const DEVICE_VENDOR: string;

    const DEVICE_VETH_PEER: string;

    const DEVICE_VLAN_CARRIER: string;

    const DEVICE_VLAN_HW_ADDRESS: string;

    const DEVICE_VLAN_PARENT: string;

    const DEVICE_VLAN_VLAN_ID: string;

    const DEVICE_VRF_TABLE: string;

    const DEVICE_VXLAN_AGEING: string;

    const DEVICE_VXLAN_CARRIER: string;

    const DEVICE_VXLAN_DST_PORT: string;

    const DEVICE_VXLAN_GROUP: string;

    const DEVICE_VXLAN_HW_ADDRESS: string;

    const DEVICE_VXLAN_ID: string;

    const DEVICE_VXLAN_L2MISS: string;

    const DEVICE_VXLAN_L3MISS: string;

    const DEVICE_VXLAN_LEARNING: string;

    const DEVICE_VXLAN_LIMIT: string;

    const DEVICE_VXLAN_LOCAL: string;

    const DEVICE_VXLAN_PARENT: string;

    const DEVICE_VXLAN_PROXY: string;

    const DEVICE_VXLAN_RSC: string;

    const DEVICE_VXLAN_SRC_PORT_MAX: string;

    const DEVICE_VXLAN_SRC_PORT_MIN: string;

    const DEVICE_VXLAN_TOS: string;

    const DEVICE_VXLAN_TTL: string;

    const DEVICE_WIFI_ACCESS_POINTS: string;

    const DEVICE_WIFI_ACTIVE_ACCESS_POINT: string;

    const DEVICE_WIFI_BITRATE: string;

    const DEVICE_WIFI_CAPABILITIES: string;

    const DEVICE_WIFI_HW_ADDRESS: string;

    const DEVICE_WIFI_LAST_SCAN: string;

    const DEVICE_WIFI_MODE: string;

    const DEVICE_WIFI_P2P_HW_ADDRESS: string;

    const DEVICE_WIFI_P2P_PEERS: string;

    const DEVICE_WIFI_P2P_WFDIES: string;

    const DEVICE_WIFI_PERMANENT_HW_ADDRESS: string;

    const DEVICE_WIMAX_ACTIVE_NSP: string;

    const DEVICE_WIMAX_BSID: string;

    const DEVICE_WIMAX_CENTER_FREQUENCY: string;

    const DEVICE_WIMAX_CINR: string;

    const DEVICE_WIMAX_HW_ADDRESS: string;

    const DEVICE_WIMAX_NSPS: string;

    const DEVICE_WIMAX_RSSI: string;

    const DEVICE_WIMAX_TX_POWER: string;

    const DEVICE_WIREGUARD_FWMARK: string;

    const DEVICE_WIREGUARD_LISTEN_PORT: string;

    const DEVICE_WIREGUARD_PUBLIC_KEY: string;

    const DEVICE_WPAN_HW_ADDRESS: string;

    const DHCP_CONFIG_FAMILY: string;

    const DHCP_CONFIG_OPTIONS: string;

    const ETHTOOL_OPTNAME_CHANNELS_COMBINED: string;

    const ETHTOOL_OPTNAME_CHANNELS_OTHER: string;

    const ETHTOOL_OPTNAME_CHANNELS_RX: string;

    const ETHTOOL_OPTNAME_CHANNELS_TX: string;

    const ETHTOOL_OPTNAME_COALESCE_ADAPTIVE_RX: string;

    const ETHTOOL_OPTNAME_COALESCE_ADAPTIVE_TX: string;

    const ETHTOOL_OPTNAME_COALESCE_PKT_RATE_HIGH: string;

    const ETHTOOL_OPTNAME_COALESCE_PKT_RATE_LOW: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_FRAMES: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_FRAMES_HIGH: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_FRAMES_IRQ: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_FRAMES_LOW: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_USECS: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_USECS_HIGH: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_USECS_IRQ: string;

    const ETHTOOL_OPTNAME_COALESCE_RX_USECS_LOW: string;

    const ETHTOOL_OPTNAME_COALESCE_SAMPLE_INTERVAL: string;

    const ETHTOOL_OPTNAME_COALESCE_STATS_BLOCK_USECS: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_FRAMES: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_FRAMES_HIGH: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_FRAMES_IRQ: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_FRAMES_LOW: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_USECS: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_USECS_HIGH: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_USECS_IRQ: string;

    const ETHTOOL_OPTNAME_COALESCE_TX_USECS_LOW: string;

    const ETHTOOL_OPTNAME_EEE_ENABLED: string;

    const ETHTOOL_OPTNAME_FEATURE_ESP_HW_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_ESP_TX_CSUM_HW_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_FCOE_MTU: string;

    const ETHTOOL_OPTNAME_FEATURE_GRO: string;

    const ETHTOOL_OPTNAME_FEATURE_GSO: string;

    const ETHTOOL_OPTNAME_FEATURE_HIGHDMA: string;

    const ETHTOOL_OPTNAME_FEATURE_HW_TC_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_L2_FWD_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_LOOPBACK: string;

    const ETHTOOL_OPTNAME_FEATURE_LRO: string;

    const ETHTOOL_OPTNAME_FEATURE_MACSEC_HW_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_NTUPLE: string;

    const ETHTOOL_OPTNAME_FEATURE_RX: string;

    const ETHTOOL_OPTNAME_FEATURE_RXHASH: string;

    const ETHTOOL_OPTNAME_FEATURE_RXVLAN: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_ALL: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_FCS: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_GRO_HW: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_GRO_LIST: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_UDP_GRO_FORWARDING: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_UDP_TUNNEL_PORT_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_VLAN_FILTER: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_VLAN_STAG_FILTER: string;

    const ETHTOOL_OPTNAME_FEATURE_RX_VLAN_STAG_HW_PARSE: string;

    const ETHTOOL_OPTNAME_FEATURE_SG: string;

    const ETHTOOL_OPTNAME_FEATURE_TLS_HW_RECORD: string;

    const ETHTOOL_OPTNAME_FEATURE_TLS_HW_RX_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_TLS_HW_TX_OFFLOAD: string;

    const ETHTOOL_OPTNAME_FEATURE_TSO: string;

    const ETHTOOL_OPTNAME_FEATURE_TX: string;

    const ETHTOOL_OPTNAME_FEATURE_TXVLAN: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_CHECKSUM_FCOE_CRC: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_CHECKSUM_IPV4: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_CHECKSUM_IPV6: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_CHECKSUM_IP_GENERIC: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_CHECKSUM_SCTP: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_ESP_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_FCOE_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_GRE_CSUM_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_GRE_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_GSO_LIST: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_GSO_PARTIAL: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_GSO_ROBUST: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_IPXIP4_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_IPXIP6_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_NOCACHE_COPY: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_SCATTER_GATHER: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_SCATTER_GATHER_FRAGLIST: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_SCTP_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_TCP6_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_TCP_ECN_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_TCP_MANGLEID_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_TCP_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_TUNNEL_REMCSUM_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_UDP_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_UDP_TNL_CSUM_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_UDP_TNL_SEGMENTATION: string;

    const ETHTOOL_OPTNAME_FEATURE_TX_VLAN_STAG_HW_INSERT: string;

    const ETHTOOL_OPTNAME_FEC_MODE: string;

    const ETHTOOL_OPTNAME_PAUSE_AUTONEG: string;

    const ETHTOOL_OPTNAME_PAUSE_RX: string;

    const ETHTOOL_OPTNAME_PAUSE_TX: string;

    const ETHTOOL_OPTNAME_RING_RX: string;

    const ETHTOOL_OPTNAME_RING_RX_JUMBO: string;

    const ETHTOOL_OPTNAME_RING_RX_MINI: string;

    const ETHTOOL_OPTNAME_RING_TX: string;

    const IP_ADDRESS_ATTRIBUTE_LABEL: string;

    const IP_CONFIG_ADDRESSES: string;

    const IP_CONFIG_CLAT_ADDRESS: string;

    const IP_CONFIG_CLAT_PREF64: string;

    const IP_CONFIG_DOMAINS: string;

    const IP_CONFIG_FAMILY: string;

    const IP_CONFIG_GATEWAY: string;

    const IP_CONFIG_NAMESERVERS: string;

    const IP_CONFIG_ROUTES: string;

    const IP_CONFIG_SEARCHES: string;

    const IP_CONFIG_WINS_SERVERS: string;

    const IP_ROUTE_ATTRIBUTE_ADVMSS: string;

    const IP_ROUTE_ATTRIBUTE_CWND: string;

    const IP_ROUTE_ATTRIBUTE_FROM: string;

    const IP_ROUTE_ATTRIBUTE_INITCWND: string;

    const IP_ROUTE_ATTRIBUTE_INITRWND: string;

    const IP_ROUTE_ATTRIBUTE_LOCK_ADVMSS: string;

    const IP_ROUTE_ATTRIBUTE_LOCK_CWND: string;

    const IP_ROUTE_ATTRIBUTE_LOCK_INITCWND: string;

    const IP_ROUTE_ATTRIBUTE_LOCK_INITRWND: string;

    const IP_ROUTE_ATTRIBUTE_LOCK_MTU: string;

    const IP_ROUTE_ATTRIBUTE_LOCK_WINDOW: string;

    const IP_ROUTE_ATTRIBUTE_MTU: string;

    const IP_ROUTE_ATTRIBUTE_ONLINK: string;

    const IP_ROUTE_ATTRIBUTE_QUICKACK: string;

    const IP_ROUTE_ATTRIBUTE_RTO_MIN: string;

    const IP_ROUTE_ATTRIBUTE_SCOPE: string;

    const IP_ROUTE_ATTRIBUTE_SRC: string;

    const IP_ROUTE_ATTRIBUTE_TABLE: string;

    const IP_ROUTE_ATTRIBUTE_TOS: string;

    const IP_ROUTE_ATTRIBUTE_TYPE: string;

    const IP_ROUTE_ATTRIBUTE_WEIGHT: string;

    const IP_ROUTE_ATTRIBUTE_WINDOW: string;

    const LLDP_ATTR_CHASSIS_ID: string;

    const LLDP_ATTR_CHASSIS_ID_TYPE: string;

    const LLDP_ATTR_DESTINATION: string;

    const LLDP_ATTR_IEEE_802_1_PPVID: string;

    const LLDP_ATTR_IEEE_802_1_PPVIDS: string;

    const LLDP_ATTR_IEEE_802_1_PPVID_FLAGS: string;

    const LLDP_ATTR_IEEE_802_1_PVID: string;

    const LLDP_ATTR_IEEE_802_1_VID: string;

    const LLDP_ATTR_IEEE_802_1_VLANS: string;

    const LLDP_ATTR_IEEE_802_1_VLAN_NAME: string;

    const LLDP_ATTR_IEEE_802_3_MAC_PHY_CONF: string;

    const LLDP_ATTR_IEEE_802_3_MAX_FRAME_SIZE: string;

    const LLDP_ATTR_IEEE_802_3_POWER_VIA_MDI: string;

    const LLDP_ATTR_MANAGEMENT_ADDRESSES: string;

    const LLDP_ATTR_MUD_URL: string;

    const LLDP_ATTR_PORT_DESCRIPTION: string;

    const LLDP_ATTR_PORT_ID: string;

    const LLDP_ATTR_PORT_ID_TYPE: string;

    const LLDP_ATTR_RAW: string;

    const LLDP_ATTR_SYSTEM_CAPABILITIES: string;

    const LLDP_ATTR_SYSTEM_DESCRIPTION: string;

    const LLDP_ATTR_SYSTEM_NAME: string;

    const LLDP_DEST_NEAREST_BRIDGE: string;

    const LLDP_DEST_NEAREST_CUSTOMER_BRIDGE: string;

    const LLDP_DEST_NEAREST_NON_TPMR_BRIDGE: string;

    const MAJOR_VERSION: number;

    const MICRO_VERSION: number;

    const MINOR_VERSION: number;

    const OBJECT_CLIENT: string;

    const OBJECT_PATH: string;

    const REMOTE_CONNECTION_DBUS_CONNECTION: string;

    const REMOTE_CONNECTION_FILENAME: string;

    const REMOTE_CONNECTION_FLAGS: string;

    const REMOTE_CONNECTION_PATH: string;

    const REMOTE_CONNECTION_UNSAVED: string;

    const REMOTE_CONNECTION_VERSION_ID: string;

    const REMOTE_CONNECTION_VISIBLE: string;

    const SECRET_AGENT_OLD_AUTO_REGISTER: string;

    const SECRET_AGENT_OLD_CAPABILITIES: string;

    const SECRET_AGENT_OLD_DBUS_CONNECTION: string;

    const SECRET_AGENT_OLD_IDENTIFIER: string;

    const SECRET_AGENT_OLD_REGISTERED: string;

    const SECRET_TAG_DYNAMIC_CHALLENGE: string;

    const SECRET_TAG_DYNAMIC_CHALLENGE_ECHO: string;

    const SECRET_TAG_VPN_MSG: string;

    const SETTING_6LOWPAN_PARENT: string;

    const SETTING_6LOWPAN_SETTING_NAME: string;

    const SETTING_802_1X_ALTSUBJECT_MATCHES: string;

    const SETTING_802_1X_ANONYMOUS_IDENTITY: string;

    const SETTING_802_1X_AUTH_TIMEOUT: string;

    const SETTING_802_1X_CA_CERT: string;

    const SETTING_802_1X_CA_CERT_PASSWORD: string;

    const SETTING_802_1X_CA_CERT_PASSWORD_FLAGS: string;

    const SETTING_802_1X_CA_PATH: string;

    const SETTING_802_1X_CERT_SCHEME_PREFIX_PATH: string;

    const SETTING_802_1X_CERT_SCHEME_PREFIX_PKCS11: string;

    const SETTING_802_1X_CLIENT_CERT: string;

    const SETTING_802_1X_CLIENT_CERT_PASSWORD: string;

    const SETTING_802_1X_CLIENT_CERT_PASSWORD_FLAGS: string;

    const SETTING_802_1X_DOMAIN_MATCH: string;

    const SETTING_802_1X_DOMAIN_SUFFIX_MATCH: string;

    const SETTING_802_1X_EAP: string;

    const SETTING_802_1X_IDENTITY: string;

    const SETTING_802_1X_OPENSSL_CIPHERS: string;

    const SETTING_802_1X_OPTIONAL: string;

    const SETTING_802_1X_PAC_FILE: string;

    const SETTING_802_1X_PASSWORD: string;

    const SETTING_802_1X_PASSWORD_FLAGS: string;

    const SETTING_802_1X_PASSWORD_RAW: string;

    const SETTING_802_1X_PASSWORD_RAW_FLAGS: string;

    const SETTING_802_1X_PHASE1_AUTH_FLAGS: string;

    const SETTING_802_1X_PHASE1_FAST_PROVISIONING: string;

    const SETTING_802_1X_PHASE1_PEAPLABEL: string;

    const SETTING_802_1X_PHASE1_PEAPVER: string;

    const SETTING_802_1X_PHASE2_ALTSUBJECT_MATCHES: string;

    const SETTING_802_1X_PHASE2_AUTH: string;

    const SETTING_802_1X_PHASE2_AUTHEAP: string;

    const SETTING_802_1X_PHASE2_CA_CERT: string;

    const SETTING_802_1X_PHASE2_CA_CERT_PASSWORD: string;

    const SETTING_802_1X_PHASE2_CA_CERT_PASSWORD_FLAGS: string;

    const SETTING_802_1X_PHASE2_CA_PATH: string;

    const SETTING_802_1X_PHASE2_CLIENT_CERT: string;

    const SETTING_802_1X_PHASE2_CLIENT_CERT_PASSWORD: string;

    const SETTING_802_1X_PHASE2_CLIENT_CERT_PASSWORD_FLAGS: string;

    const SETTING_802_1X_PHASE2_DOMAIN_MATCH: string;

    const SETTING_802_1X_PHASE2_DOMAIN_SUFFIX_MATCH: string;

    const SETTING_802_1X_PHASE2_PRIVATE_KEY: string;

    const SETTING_802_1X_PHASE2_PRIVATE_KEY_PASSWORD: string;

    const SETTING_802_1X_PHASE2_PRIVATE_KEY_PASSWORD_FLAGS: string;

    const SETTING_802_1X_PHASE2_SUBJECT_MATCH: string;

    const SETTING_802_1X_PIN: string;

    const SETTING_802_1X_PIN_FLAGS: string;

    const SETTING_802_1X_PRIVATE_KEY: string;

    const SETTING_802_1X_PRIVATE_KEY_PASSWORD: string;

    const SETTING_802_1X_PRIVATE_KEY_PASSWORD_FLAGS: string;

    const SETTING_802_1X_SETTING_NAME: string;

    const SETTING_802_1X_SUBJECT_MATCH: string;

    const SETTING_802_1X_SYSTEM_CA_CERTS: string;

    const SETTING_ADSL_ENCAPSULATION: string;

    const SETTING_ADSL_ENCAPSULATION_LLC: string;

    const SETTING_ADSL_ENCAPSULATION_VCMUX: string;

    const SETTING_ADSL_PASSWORD: string;

    const SETTING_ADSL_PASSWORD_FLAGS: string;

    const SETTING_ADSL_PROTOCOL: string;

    const SETTING_ADSL_PROTOCOL_IPOATM: string;

    const SETTING_ADSL_PROTOCOL_PPPOA: string;

    const SETTING_ADSL_PROTOCOL_PPPOE: string;

    const SETTING_ADSL_SETTING_NAME: string;

    const SETTING_ADSL_USERNAME: string;

    const SETTING_ADSL_VCI: string;

    const SETTING_ADSL_VPI: string;

    const SETTING_BLUETOOTH_BDADDR: string;

    const SETTING_BLUETOOTH_SETTING_NAME: string;

    const SETTING_BLUETOOTH_TYPE: string;

    const SETTING_BLUETOOTH_TYPE_DUN: string;

    const SETTING_BLUETOOTH_TYPE_NAP: string;

    const SETTING_BLUETOOTH_TYPE_PANU: string;

    const SETTING_BOND_OPTIONS: string;

    const SETTING_BOND_OPTION_ACTIVE_SLAVE: string;

    const SETTING_BOND_OPTION_AD_ACTOR_SYSTEM: string;

    const SETTING_BOND_OPTION_AD_ACTOR_SYS_PRIO: string;

    const SETTING_BOND_OPTION_AD_SELECT: string;

    const SETTING_BOND_OPTION_AD_USER_PORT_KEY: string;

    const SETTING_BOND_OPTION_ALL_SLAVES_ACTIVE: string;

    const SETTING_BOND_OPTION_ARP_ALL_TARGETS: string;

    const SETTING_BOND_OPTION_ARP_INTERVAL: string;

    const SETTING_BOND_OPTION_ARP_IP_TARGET: string;

    const SETTING_BOND_OPTION_ARP_MISSED_MAX: string;

    const SETTING_BOND_OPTION_ARP_VALIDATE: string;

    const SETTING_BOND_OPTION_BALANCE_SLB: string;

    const SETTING_BOND_OPTION_DOWNDELAY: string;

    const SETTING_BOND_OPTION_FAIL_OVER_MAC: string;

    const SETTING_BOND_OPTION_LACP_ACTIVE: string;

    const SETTING_BOND_OPTION_LACP_RATE: string;

    const SETTING_BOND_OPTION_LP_INTERVAL: string;

    const SETTING_BOND_OPTION_MIIMON: string;

    const SETTING_BOND_OPTION_MIN_LINKS: string;

    const SETTING_BOND_OPTION_MODE: string;

    const SETTING_BOND_OPTION_NS_IP6_TARGET: string;

    const SETTING_BOND_OPTION_NUM_GRAT_ARP: string;

    const SETTING_BOND_OPTION_NUM_UNSOL_NA: string;

    const SETTING_BOND_OPTION_PACKETS_PER_SLAVE: string;

    const SETTING_BOND_OPTION_PEER_NOTIF_DELAY: string;

    const SETTING_BOND_OPTION_PRIMARY: string;

    const SETTING_BOND_OPTION_PRIMARY_RESELECT: string;

    const SETTING_BOND_OPTION_RESEND_IGMP: string;

    const SETTING_BOND_OPTION_TLB_DYNAMIC_LB: string;

    const SETTING_BOND_OPTION_UPDELAY: string;

    const SETTING_BOND_OPTION_USE_CARRIER: string;

    const SETTING_BOND_OPTION_XMIT_HASH_POLICY: string;

    const SETTING_BOND_PORT_PRIO: string;

    const SETTING_BOND_PORT_QUEUE_ID: string;

    const SETTING_BOND_PORT_SETTING_NAME: string;

    const SETTING_BOND_SETTING_NAME: string;

    const SETTING_BRIDGE_AGEING_TIME: string;

    const SETTING_BRIDGE_FORWARD_DELAY: string;

    const SETTING_BRIDGE_GROUP_ADDRESS: string;

    const SETTING_BRIDGE_GROUP_FORWARD_MASK: string;

    const SETTING_BRIDGE_HELLO_TIME: string;

    const SETTING_BRIDGE_MAC_ADDRESS: string;

    const SETTING_BRIDGE_MAX_AGE: string;

    const SETTING_BRIDGE_MULTICAST_HASH_MAX: string;

    const SETTING_BRIDGE_MULTICAST_LAST_MEMBER_COUNT: string;

    const SETTING_BRIDGE_MULTICAST_LAST_MEMBER_INTERVAL: string;

    const SETTING_BRIDGE_MULTICAST_MEMBERSHIP_INTERVAL: string;

    const SETTING_BRIDGE_MULTICAST_QUERIER: string;

    const SETTING_BRIDGE_MULTICAST_QUERIER_INTERVAL: string;

    const SETTING_BRIDGE_MULTICAST_QUERY_INTERVAL: string;

    const SETTING_BRIDGE_MULTICAST_QUERY_RESPONSE_INTERVAL: string;

    const SETTING_BRIDGE_MULTICAST_QUERY_USE_IFADDR: string;

    const SETTING_BRIDGE_MULTICAST_ROUTER: string;

    const SETTING_BRIDGE_MULTICAST_SNOOPING: string;

    const SETTING_BRIDGE_MULTICAST_STARTUP_QUERY_COUNT: string;

    const SETTING_BRIDGE_MULTICAST_STARTUP_QUERY_INTERVAL: string;

    const SETTING_BRIDGE_PORT_HAIRPIN_MODE: string;

    const SETTING_BRIDGE_PORT_PATH_COST: string;

    const SETTING_BRIDGE_PORT_PRIORITY: string;

    const SETTING_BRIDGE_PORT_SETTING_NAME: string;

    const SETTING_BRIDGE_PORT_VLANS: string;

    const SETTING_BRIDGE_PRIORITY: string;

    const SETTING_BRIDGE_SETTING_NAME: string;

    const SETTING_BRIDGE_STP: string;

    const SETTING_BRIDGE_VLANS: string;

    const SETTING_BRIDGE_VLAN_DEFAULT_PVID: string;

    const SETTING_BRIDGE_VLAN_FILTERING: string;

    const SETTING_BRIDGE_VLAN_PROTOCOL: string;

    const SETTING_BRIDGE_VLAN_STATS_ENABLED: string;

    const SETTING_CDMA_MTU: string;

    const SETTING_CDMA_NUMBER: string;

    const SETTING_CDMA_PASSWORD: string;

    const SETTING_CDMA_PASSWORD_FLAGS: string;

    const SETTING_CDMA_SETTING_NAME: string;

    const SETTING_CDMA_USERNAME: string;

    const SETTING_CONNECTION_AUTH_RETRIES: string;

    const SETTING_CONNECTION_AUTOCONNECT: string;

    const SETTING_CONNECTION_AUTOCONNECT_PORTS: string;

    const SETTING_CONNECTION_AUTOCONNECT_PRIORITY: string;

    const SETTING_CONNECTION_AUTOCONNECT_PRIORITY_DEFAULT: number;

    const SETTING_CONNECTION_AUTOCONNECT_PRIORITY_MAX: number;

    const SETTING_CONNECTION_AUTOCONNECT_PRIORITY_MIN: number;

    const SETTING_CONNECTION_AUTOCONNECT_RETRIES: string;

    const SETTING_CONNECTION_AUTOCONNECT_SLAVES: string;

    const SETTING_CONNECTION_CONTROLLER: string;

    const SETTING_CONNECTION_DNSSEC: string;

    const SETTING_CONNECTION_DNS_OVER_TLS: string;

    const SETTING_CONNECTION_DOWN_ON_POWEROFF: string;

    const SETTING_CONNECTION_GATEWAY_PING_TIMEOUT: string;

    const SETTING_CONNECTION_ID: string;

    const SETTING_CONNECTION_INTERFACE_NAME: string;

    const SETTING_CONNECTION_IP_PING_ADDRESSES: string;

    const SETTING_CONNECTION_IP_PING_ADDRESSES_REQUIRE_ALL: string;

    const SETTING_CONNECTION_IP_PING_TIMEOUT: string;

    const SETTING_CONNECTION_LLDP: string;

    const SETTING_CONNECTION_LLMNR: string;

    const SETTING_CONNECTION_MASTER: string;

    const SETTING_CONNECTION_MDNS: string;

    const SETTING_CONNECTION_METERED: string;

    const SETTING_CONNECTION_MPTCP_FLAGS: string;

    const SETTING_CONNECTION_MUD_URL: string;

    const SETTING_CONNECTION_MULTI_CONNECT: string;

    const SETTING_CONNECTION_PERMISSIONS: string;

    const SETTING_CONNECTION_PORT_TYPE: string;

    const SETTING_CONNECTION_READ_ONLY: string;

    const SETTING_CONNECTION_SECONDARIES: string;

    const SETTING_CONNECTION_SETTING_NAME: string;

    const SETTING_CONNECTION_SLAVE_TYPE: string;

    const SETTING_CONNECTION_STABLE_ID: string;

    const SETTING_CONNECTION_TIMESTAMP: string;

    const SETTING_CONNECTION_TYPE: string;

    const SETTING_CONNECTION_UUID: string;

    const SETTING_CONNECTION_WAIT_ACTIVATION_DELAY: string;

    const SETTING_CONNECTION_WAIT_DEVICE_TIMEOUT: string;

    const SETTING_CONNECTION_ZONE: string;

    const SETTING_DCB_APP_FCOE_FLAGS: string;

    const SETTING_DCB_APP_FCOE_MODE: string;

    const SETTING_DCB_APP_FCOE_PRIORITY: string;

    const SETTING_DCB_APP_FIP_FLAGS: string;

    const SETTING_DCB_APP_FIP_PRIORITY: string;

    const SETTING_DCB_APP_ISCSI_FLAGS: string;

    const SETTING_DCB_APP_ISCSI_PRIORITY: string;

    const SETTING_DCB_FCOE_MODE_FABRIC: string;

    const SETTING_DCB_FCOE_MODE_VN2VN: string;

    const SETTING_DCB_PRIORITY_BANDWIDTH: string;

    const SETTING_DCB_PRIORITY_FLOW_CONTROL: string;

    const SETTING_DCB_PRIORITY_FLOW_CONTROL_FLAGS: string;

    const SETTING_DCB_PRIORITY_GROUP_BANDWIDTH: string;

    const SETTING_DCB_PRIORITY_GROUP_FLAGS: string;

    const SETTING_DCB_PRIORITY_GROUP_ID: string;

    const SETTING_DCB_PRIORITY_STRICT_BANDWIDTH: string;

    const SETTING_DCB_PRIORITY_TRAFFIC_CLASS: string;

    const SETTING_DCB_SETTING_NAME: string;

    const SETTING_DNS_OPTION_ATTEMPTS: string;

    const SETTING_DNS_OPTION_DEBUG: string;

    const SETTING_DNS_OPTION_EDNS0: string;

    const SETTING_DNS_OPTION_INET6: string;

    const SETTING_DNS_OPTION_INTERNAL_NO_ADD_EDNS0: string;

    const SETTING_DNS_OPTION_INTERNAL_NO_ADD_TRUST_AD: string;

    const SETTING_DNS_OPTION_IP6_BYTESTRING: string;

    const SETTING_DNS_OPTION_IP6_DOTINT: string;

    const SETTING_DNS_OPTION_NDOTS: string;

    const SETTING_DNS_OPTION_NO_AAAA: string;

    const SETTING_DNS_OPTION_NO_CHECK_NAMES: string;

    const SETTING_DNS_OPTION_NO_IP6_DOTINT: string;

    const SETTING_DNS_OPTION_NO_RELOAD: string;

    const SETTING_DNS_OPTION_NO_TLD_QUERY: string;

    const SETTING_DNS_OPTION_ROTATE: string;

    const SETTING_DNS_OPTION_SINGLE_REQUEST: string;

    const SETTING_DNS_OPTION_SINGLE_REQUEST_REOPEN: string;

    const SETTING_DNS_OPTION_TIMEOUT: string;

    const SETTING_DNS_OPTION_TRUST_AD: string;

    const SETTING_DNS_OPTION_USE_VC: string;

    const SETTING_DUMMY_SETTING_NAME: string;

    const SETTING_ETHTOOL_SETTING_NAME: string;

    const SETTING_GENERIC_DEVICE_HANDLER: string;

    const SETTING_GENERIC_SETTING_NAME: string;

    const SETTING_GENEVE_DESTINATION_PORT: string;

    const SETTING_GENEVE_DF: string;

    const SETTING_GENEVE_ID: string;

    const SETTING_GENEVE_REMOTE: string;

    const SETTING_GENEVE_SETTING_NAME: string;

    const SETTING_GENEVE_TOS: string;

    const SETTING_GENEVE_TTL: string;

    const SETTING_GSM_APN: string;

    const SETTING_GSM_AUTO_CONFIG: string;

    const SETTING_GSM_DEVICE_ID: string;

    const SETTING_GSM_DEVICE_UID: string;

    const SETTING_GSM_HOME_ONLY: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_APN: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_CONFIGURE: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_NOAUTH: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_PASSWORD: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_PASSWORD_FLAGS: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_REFUSE_CHAP: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_REFUSE_EAP: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_REFUSE_MSCHAP: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_REFUSE_MSCHAPV2: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_REFUSE_PAP: string;

    const SETTING_GSM_INITIAL_EPS_BEARER_USERNAME: string;

    const SETTING_GSM_MTU: string;

    const SETTING_GSM_NETWORK_ID: string;

    const SETTING_GSM_NUMBER: string;

    const SETTING_GSM_PASSWORD: string;

    const SETTING_GSM_PASSWORD_FLAGS: string;

    const SETTING_GSM_PIN: string;

    const SETTING_GSM_PIN_FLAGS: string;

    const SETTING_GSM_SETTING_NAME: string;

    const SETTING_GSM_SIM_ID: string;

    const SETTING_GSM_SIM_OPERATOR_ID: string;

    const SETTING_GSM_USERNAME: string;

    const SETTING_HOSTNAME_FROM_DHCP: string;

    const SETTING_HOSTNAME_FROM_DNS_LOOKUP: string;

    const SETTING_HOSTNAME_ONLY_FROM_DEFAULT: string;

    const SETTING_HOSTNAME_PRIORITY: string;

    const SETTING_HOSTNAME_SETTING_NAME: string;

    const SETTING_HSR_INTERLINK: string;

    const SETTING_HSR_MULTICAST_SPEC: string;

    const SETTING_HSR_PORT1: string;

    const SETTING_HSR_PORT2: string;

    const SETTING_HSR_PROTOCOL_VERSION: string;

    const SETTING_HSR_PRP: string;

    const SETTING_HSR_SETTING_NAME: string;

    const SETTING_INFINIBAND_MAC_ADDRESS: string;

    const SETTING_INFINIBAND_MTU: string;

    const SETTING_INFINIBAND_PARENT: string;

    const SETTING_INFINIBAND_P_KEY: string;

    const SETTING_INFINIBAND_SETTING_NAME: string;

    const SETTING_INFINIBAND_TRANSPORT_MODE: string;

    const SETTING_IP4_CONFIG_CLAT: string;

    const SETTING_IP4_CONFIG_DHCP_CLIENT_ID: string;

    const SETTING_IP4_CONFIG_DHCP_FQDN: string;

    const SETTING_IP4_CONFIG_DHCP_IPV6_ONLY_PREFERRED: string;

    const SETTING_IP4_CONFIG_DHCP_VENDOR_CLASS_IDENTIFIER: string;

    const SETTING_IP4_CONFIG_LINK_LOCAL: string;

    const SETTING_IP4_CONFIG_METHOD_AUTO: string;

    const SETTING_IP4_CONFIG_METHOD_DISABLED: string;

    const SETTING_IP4_CONFIG_METHOD_LINK_LOCAL: string;

    const SETTING_IP4_CONFIG_METHOD_MANUAL: string;

    const SETTING_IP4_CONFIG_METHOD_SHARED: string;

    const SETTING_IP4_CONFIG_SETTING_NAME: string;

    const SETTING_IP6_CONFIG_ADDR_GEN_MODE: string;

    const SETTING_IP6_CONFIG_DHCP_DUID: string;

    const SETTING_IP6_CONFIG_DHCP_PD_HINT: string;

    const SETTING_IP6_CONFIG_IP6_PRIVACY: string;

    const SETTING_IP6_CONFIG_METHOD_AUTO: string;

    const SETTING_IP6_CONFIG_METHOD_DHCP: string;

    const SETTING_IP6_CONFIG_METHOD_DISABLED: string;

    const SETTING_IP6_CONFIG_METHOD_IGNORE: string;

    const SETTING_IP6_CONFIG_METHOD_LINK_LOCAL: string;

    const SETTING_IP6_CONFIG_METHOD_MANUAL: string;

    const SETTING_IP6_CONFIG_METHOD_SHARED: string;

    const SETTING_IP6_CONFIG_MTU: string;

    const SETTING_IP6_CONFIG_RA_TIMEOUT: string;

    const SETTING_IP6_CONFIG_SETTING_NAME: string;

    const SETTING_IP6_CONFIG_TEMP_PREFERRED_LIFETIME: string;

    const SETTING_IP6_CONFIG_TEMP_VALID_LIFETIME: string;

    const SETTING_IP6_CONFIG_TOKEN: string;

    const SETTING_IPVLAN_MODE: string;

    const SETTING_IPVLAN_PARENT: string;

    const SETTING_IPVLAN_PRIVATE: string;

    const SETTING_IPVLAN_SETTING_NAME: string;

    const SETTING_IPVLAN_VEPA: string;

    const SETTING_IP_CONFIG_ADDRESSES: string;

    const SETTING_IP_CONFIG_AUTO_ROUTE_EXT_GW: string;

    const SETTING_IP_CONFIG_DAD_TIMEOUT: string;

    const SETTING_IP_CONFIG_DAD_TIMEOUT_MAX: number;

    const SETTING_IP_CONFIG_DHCP_DSCP: string;

    const SETTING_IP_CONFIG_DHCP_HOSTNAME: string;

    const SETTING_IP_CONFIG_DHCP_HOSTNAME_FLAGS: string;

    const SETTING_IP_CONFIG_DHCP_IAID: string;

    const SETTING_IP_CONFIG_DHCP_REJECT_SERVERS: string;

    const SETTING_IP_CONFIG_DHCP_SEND_HOSTNAME: string;

    const SETTING_IP_CONFIG_DHCP_SEND_HOSTNAME_V2: string;

    const SETTING_IP_CONFIG_DHCP_SEND_RELEASE: string;

    const SETTING_IP_CONFIG_DHCP_TIMEOUT: string;

    const SETTING_IP_CONFIG_DNS: string;

    const SETTING_IP_CONFIG_DNS_OPTIONS: string;

    const SETTING_IP_CONFIG_DNS_PRIORITY: string;

    const SETTING_IP_CONFIG_DNS_SEARCH: string;

    const SETTING_IP_CONFIG_FORWARDING: string;

    const SETTING_IP_CONFIG_GATEWAY: string;

    const SETTING_IP_CONFIG_IGNORE_AUTO_DNS: string;

    const SETTING_IP_CONFIG_IGNORE_AUTO_ROUTES: string;

    const SETTING_IP_CONFIG_MAY_FAIL: string;

    const SETTING_IP_CONFIG_METHOD: string;

    const SETTING_IP_CONFIG_NEVER_DEFAULT: string;

    const SETTING_IP_CONFIG_REPLACE_LOCAL_RULE: string;

    const SETTING_IP_CONFIG_REQUIRED_TIMEOUT: string;

    const SETTING_IP_CONFIG_ROUTED_DNS: string;

    const SETTING_IP_CONFIG_ROUTES: string;

    const SETTING_IP_CONFIG_ROUTE_METRIC: string;

    const SETTING_IP_CONFIG_ROUTE_TABLE: string;

    const SETTING_IP_CONFIG_ROUTING_RULES: string;

    const SETTING_IP_CONFIG_SHARED_DHCP_LEASE_TIME: string;

    const SETTING_IP_CONFIG_SHARED_DHCP_RANGE: string;

    const SETTING_IP_TUNNEL_ENCAPSULATION_LIMIT: string;

    const SETTING_IP_TUNNEL_FLAGS: string;

    const SETTING_IP_TUNNEL_FLOW_LABEL: string;

    const SETTING_IP_TUNNEL_FWMARK: string;

    const SETTING_IP_TUNNEL_INPUT_KEY: string;

    const SETTING_IP_TUNNEL_LOCAL: string;

    const SETTING_IP_TUNNEL_MODE: string;

    const SETTING_IP_TUNNEL_MTU: string;

    const SETTING_IP_TUNNEL_OUTPUT_KEY: string;

    const SETTING_IP_TUNNEL_PARENT: string;

    const SETTING_IP_TUNNEL_PATH_MTU_DISCOVERY: string;

    const SETTING_IP_TUNNEL_REMOTE: string;

    const SETTING_IP_TUNNEL_SETTING_NAME: string;

    const SETTING_IP_TUNNEL_TOS: string;

    const SETTING_IP_TUNNEL_TTL: string;

    const SETTING_LINK_GRO_MAX_SIZE: string;

    const SETTING_LINK_GSO_MAX_SEGMENTS: string;

    const SETTING_LINK_GSO_MAX_SIZE: string;

    const SETTING_LINK_SETTING_NAME: string;

    const SETTING_LINK_TX_QUEUE_LENGTH: string;

    const SETTING_LOOPBACK_MTU: string;

    const SETTING_LOOPBACK_SETTING_NAME: string;

    const SETTING_MACSEC_ENCRYPT: string;

    const SETTING_MACSEC_MKA_CAK: string;

    const SETTING_MACSEC_MKA_CAK_FLAGS: string;

    const SETTING_MACSEC_MKA_CAK_LENGTH: number;

    const SETTING_MACSEC_MKA_CKN: string;

    const SETTING_MACSEC_MKA_CKN_LENGTH: number;

    const SETTING_MACSEC_MODE: string;

    const SETTING_MACSEC_OFFLOAD: string;

    const SETTING_MACSEC_PARENT: string;

    const SETTING_MACSEC_PORT: string;

    const SETTING_MACSEC_SEND_SCI: string;

    const SETTING_MACSEC_SETTING_NAME: string;

    const SETTING_MACSEC_VALIDATION: string;

    const SETTING_MACVLAN_MODE: string;

    const SETTING_MACVLAN_PARENT: string;

    const SETTING_MACVLAN_PROMISCUOUS: string;

    const SETTING_MACVLAN_SETTING_NAME: string;

    const SETTING_MACVLAN_TAP: string;

    const SETTING_MATCH_DRIVER: string;

    const SETTING_MATCH_INTERFACE_NAME: string;

    const SETTING_MATCH_KERNEL_COMMAND_LINE: string;

    const SETTING_MATCH_PATH: string;

    const SETTING_MATCH_SETTING_NAME: string;

    const SETTING_NAME: string;

    const SETTING_OLPC_MESH_CHANNEL: string;

    const SETTING_OLPC_MESH_DHCP_ANYCAST_ADDRESS: string;

    const SETTING_OLPC_MESH_SETTING_NAME: string;

    const SETTING_OLPC_MESH_SSID: string;

    const SETTING_OVS_BRIDGE_DATAPATH_TYPE: string;

    const SETTING_OVS_BRIDGE_FAIL_MODE: string;

    const SETTING_OVS_BRIDGE_MCAST_SNOOPING_ENABLE: string;

    const SETTING_OVS_BRIDGE_RSTP_ENABLE: string;

    const SETTING_OVS_BRIDGE_SETTING_NAME: string;

    const SETTING_OVS_BRIDGE_STP_ENABLE: string;

    const SETTING_OVS_DPDK_DEVARGS: string;

    const SETTING_OVS_DPDK_LSC_INTERRUPT: string;

    const SETTING_OVS_DPDK_N_RXQ: string;

    const SETTING_OVS_DPDK_N_RXQ_DESC: string;

    const SETTING_OVS_DPDK_N_TXQ_DESC: string;

    const SETTING_OVS_DPDK_SETTING_NAME: string;

    const SETTING_OVS_EXTERNAL_IDS_DATA: string;

    const SETTING_OVS_EXTERNAL_IDS_SETTING_NAME: string;

    const SETTING_OVS_INTERFACE_OFPORT_REQUEST: string;

    const SETTING_OVS_INTERFACE_SETTING_NAME: string;

    const SETTING_OVS_INTERFACE_TYPE: string;

    const SETTING_OVS_OTHER_CONFIG_DATA: string;

    const SETTING_OVS_OTHER_CONFIG_SETTING_NAME: string;

    const SETTING_OVS_PATCH_PEER: string;

    const SETTING_OVS_PATCH_SETTING_NAME: string;

    const SETTING_OVS_PORT_BOND_DOWNDELAY: string;

    const SETTING_OVS_PORT_BOND_MODE: string;

    const SETTING_OVS_PORT_BOND_UPDELAY: string;

    const SETTING_OVS_PORT_LACP: string;

    const SETTING_OVS_PORT_SETTING_NAME: string;

    const SETTING_OVS_PORT_TAG: string;

    const SETTING_OVS_PORT_TRUNKS: string;

    const SETTING_OVS_PORT_VLAN_MODE: string;

    const SETTING_PARAM_FUZZY_IGNORE: number;

    const SETTING_PARAM_REQUIRED: number;

    const SETTING_PARAM_SECRET: number;

    const SETTING_PPPOE_PARENT: string;

    const SETTING_PPPOE_PASSWORD: string;

    const SETTING_PPPOE_PASSWORD_FLAGS: string;

    const SETTING_PPPOE_SERVICE: string;

    const SETTING_PPPOE_SETTING_NAME: string;

    const SETTING_PPPOE_USERNAME: string;

    const SETTING_PPP_BAUD: string;

    const SETTING_PPP_CRTSCTS: string;

    const SETTING_PPP_LCP_ECHO_FAILURE: string;

    const SETTING_PPP_LCP_ECHO_INTERVAL: string;

    const SETTING_PPP_MPPE_STATEFUL: string;

    const SETTING_PPP_MRU: string;

    const SETTING_PPP_MTU: string;

    const SETTING_PPP_NOAUTH: string;

    const SETTING_PPP_NOBSDCOMP: string;

    const SETTING_PPP_NODEFLATE: string;

    const SETTING_PPP_NO_VJ_COMP: string;

    const SETTING_PPP_REFUSE_CHAP: string;

    const SETTING_PPP_REFUSE_EAP: string;

    const SETTING_PPP_REFUSE_MSCHAP: string;

    const SETTING_PPP_REFUSE_MSCHAPV2: string;

    const SETTING_PPP_REFUSE_PAP: string;

    const SETTING_PPP_REQUIRE_MPPE: string;

    const SETTING_PPP_REQUIRE_MPPE_128: string;

    const SETTING_PPP_SETTING_NAME: string;

    const SETTING_PREFIX_DELEGATION_SETTING_NAME: string;

    const SETTING_PREFIX_DELEGATION_SUBNET_ID: string;

    const SETTING_PROXY_BROWSER_ONLY: string;

    const SETTING_PROXY_METHOD: string;

    const SETTING_PROXY_PAC_SCRIPT: string;

    const SETTING_PROXY_PAC_URL: string;

    const SETTING_PROXY_SETTING_NAME: string;

    const SETTING_SERIAL_BAUD: string;

    const SETTING_SERIAL_BITS: string;

    const SETTING_SERIAL_PARITY: string;

    const SETTING_SERIAL_SEND_DELAY: string;

    const SETTING_SERIAL_SETTING_NAME: string;

    const SETTING_SERIAL_STOPBITS: string;

    const SETTING_SRIOV_AUTOPROBE_DRIVERS: string;

    const SETTING_SRIOV_ESWITCH_ENCAP_MODE: string;

    const SETTING_SRIOV_ESWITCH_INLINE_MODE: string;

    const SETTING_SRIOV_ESWITCH_MODE: string;

    const SETTING_SRIOV_PRESERVE_ON_DOWN: string;

    const SETTING_SRIOV_SETTING_NAME: string;

    const SETTING_SRIOV_TOTAL_VFS: string;

    const SETTING_SRIOV_VFS: string;

    const SETTING_TC_CONFIG_QDISCS: string;

    const SETTING_TC_CONFIG_SETTING_NAME: string;

    const SETTING_TC_CONFIG_TFILTERS: string;

    const SETTING_TEAM_CONFIG: string;

    const SETTING_TEAM_LINK_WATCHERS: string;

    const SETTING_TEAM_MCAST_REJOIN_COUNT: string;

    const SETTING_TEAM_MCAST_REJOIN_INTERVAL: string;

    const SETTING_TEAM_NOTIFY_MCAST_COUNT_ACTIVEBACKUP_DEFAULT: number;

    const SETTING_TEAM_NOTIFY_PEERS_COUNT: string;

    const SETTING_TEAM_NOTIFY_PEERS_COUNT_ACTIVEBACKUP_DEFAULT: number;

    const SETTING_TEAM_NOTIFY_PEERS_INTERVAL: string;

    const SETTING_TEAM_PORT_CONFIG: string;

    const SETTING_TEAM_PORT_LACP_KEY: string;

    const SETTING_TEAM_PORT_LACP_PRIO: string;

    const SETTING_TEAM_PORT_LACP_PRIO_DEFAULT: number;

    const SETTING_TEAM_PORT_LINK_WATCHERS: string;

    const SETTING_TEAM_PORT_PRIO: string;

    const SETTING_TEAM_PORT_QUEUE_ID: string;

    const SETTING_TEAM_PORT_QUEUE_ID_DEFAULT: number;

    const SETTING_TEAM_PORT_SETTING_NAME: string;

    const SETTING_TEAM_PORT_STICKY: string;

    const SETTING_TEAM_RUNNER: string;

    const SETTING_TEAM_RUNNER_ACTIVE: string;

    const SETTING_TEAM_RUNNER_ACTIVEBACKUP: string;

    const SETTING_TEAM_RUNNER_AGG_SELECT_POLICY: string;

    const SETTING_TEAM_RUNNER_AGG_SELECT_POLICY_BANDWIDTH: string;

    const SETTING_TEAM_RUNNER_AGG_SELECT_POLICY_COUNT: string;

    const SETTING_TEAM_RUNNER_AGG_SELECT_POLICY_LACP_PRIO: string;

    const SETTING_TEAM_RUNNER_AGG_SELECT_POLICY_LACP_PRIO_STABLE: string;

    const SETTING_TEAM_RUNNER_AGG_SELECT_POLICY_PORT_CONFIG: string;

    const SETTING_TEAM_RUNNER_BROADCAST: string;

    const SETTING_TEAM_RUNNER_FAST_RATE: string;

    const SETTING_TEAM_RUNNER_HWADDR_POLICY: string;

    const SETTING_TEAM_RUNNER_HWADDR_POLICY_BY_ACTIVE: string;

    const SETTING_TEAM_RUNNER_HWADDR_POLICY_ONLY_ACTIVE: string;

    const SETTING_TEAM_RUNNER_HWADDR_POLICY_SAME_ALL: string;

    const SETTING_TEAM_RUNNER_LACP: string;

    const SETTING_TEAM_RUNNER_LOADBALANCE: string;

    const SETTING_TEAM_RUNNER_MIN_PORTS: string;

    const SETTING_TEAM_RUNNER_RANDOM: string;

    const SETTING_TEAM_RUNNER_ROUNDROBIN: string;

    const SETTING_TEAM_RUNNER_SYS_PRIO: string;

    const SETTING_TEAM_RUNNER_SYS_PRIO_DEFAULT: number;

    const SETTING_TEAM_RUNNER_TX_BALANCER: string;

    const SETTING_TEAM_RUNNER_TX_BALANCER_INTERVAL: string;

    const SETTING_TEAM_RUNNER_TX_BALANCER_INTERVAL_DEFAULT: number;

    const SETTING_TEAM_RUNNER_TX_HASH: string;

    const SETTING_TEAM_SETTING_NAME: string;

    const SETTING_TUN_GROUP: string;

    const SETTING_TUN_MODE: string;

    const SETTING_TUN_MULTI_QUEUE: string;

    const SETTING_TUN_OWNER: string;

    const SETTING_TUN_PI: string;

    const SETTING_TUN_SETTING_NAME: string;

    const SETTING_TUN_VNET_HDR: string;

    const SETTING_USER_DATA: string;

    const SETTING_USER_SETTING_NAME: string;

    const SETTING_VETH_PEER: string;

    const SETTING_VETH_SETTING_NAME: string;

    const SETTING_VLAN_EGRESS_PRIORITY_MAP: string;

    const SETTING_VLAN_FLAGS: string;

    const SETTING_VLAN_ID: string;

    const SETTING_VLAN_INGRESS_PRIORITY_MAP: string;

    const SETTING_VLAN_PARENT: string;

    const SETTING_VLAN_PROTOCOL: string;

    const SETTING_VLAN_SETTING_NAME: string;

    const SETTING_VPN_DATA: string;

    const SETTING_VPN_PERSISTENT: string;

    const SETTING_VPN_SECRETS: string;

    const SETTING_VPN_SERVICE_TYPE: string;

    const SETTING_VPN_SETTING_NAME: string;

    const SETTING_VPN_TIMEOUT: string;

    const SETTING_VPN_USER_NAME: string;

    const SETTING_VRF_SETTING_NAME: string;

    const SETTING_VRF_TABLE: string;

    const SETTING_VXLAN_AGEING: string;

    const SETTING_VXLAN_DESTINATION_PORT: string;

    const SETTING_VXLAN_ID: string;

    const SETTING_VXLAN_L2_MISS: string;

    const SETTING_VXLAN_L3_MISS: string;

    const SETTING_VXLAN_LEARNING: string;

    const SETTING_VXLAN_LIMIT: string;

    const SETTING_VXLAN_LOCAL: string;

    const SETTING_VXLAN_PARENT: string;

    const SETTING_VXLAN_PROXY: string;

    const SETTING_VXLAN_REMOTE: string;

    const SETTING_VXLAN_RSC: string;

    const SETTING_VXLAN_SETTING_NAME: string;

    const SETTING_VXLAN_SOURCE_PORT_MAX: string;

    const SETTING_VXLAN_SOURCE_PORT_MIN: string;

    const SETTING_VXLAN_TOS: string;

    const SETTING_VXLAN_TTL: string;

    const SETTING_WIFI_P2P_PEER: string;

    const SETTING_WIFI_P2P_SETTING_NAME: string;

    const SETTING_WIFI_P2P_WFD_IES: string;

    const SETTING_WIFI_P2P_WPS_METHOD: string;

    const SETTING_WIMAX_MAC_ADDRESS: string;

    const SETTING_WIMAX_NETWORK_NAME: string;

    const SETTING_WIMAX_SETTING_NAME: string;

    const SETTING_WIRED_ACCEPT_ALL_MAC_ADDRESSES: string;

    const SETTING_WIRED_AUTO_NEGOTIATE: string;

    const SETTING_WIRED_CLONED_MAC_ADDRESS: string;

    const SETTING_WIRED_DUPLEX: string;

    const SETTING_WIRED_GENERATE_MAC_ADDRESS_MASK: string;

    const SETTING_WIRED_MAC_ADDRESS: string;

    const SETTING_WIRED_MAC_ADDRESS_BLACKLIST: string;

    const SETTING_WIRED_MAC_ADDRESS_DENYLIST: string;

    const SETTING_WIRED_MTU: string;

    const SETTING_WIRED_PORT: string;

    const SETTING_WIRED_S390_NETTYPE: string;

    const SETTING_WIRED_S390_OPTIONS: string;

    const SETTING_WIRED_S390_SUBCHANNELS: string;

    const SETTING_WIRED_SETTING_NAME: string;

    const SETTING_WIRED_SPEED: string;

    const SETTING_WIRED_WAKE_ON_LAN: string;

    const SETTING_WIRED_WAKE_ON_LAN_PASSWORD: string;

    const SETTING_WIREGUARD_FWMARK: string;

    const SETTING_WIREGUARD_IP4_AUTO_DEFAULT_ROUTE: string;

    const SETTING_WIREGUARD_IP6_AUTO_DEFAULT_ROUTE: string;

    const SETTING_WIREGUARD_LISTEN_PORT: string;

    const SETTING_WIREGUARD_MTU: string;

    const SETTING_WIREGUARD_PEERS: string;

    const SETTING_WIREGUARD_PEER_ROUTES: string;

    const SETTING_WIREGUARD_PRIVATE_KEY: string;

    const SETTING_WIREGUARD_PRIVATE_KEY_FLAGS: string;

    const SETTING_WIREGUARD_SETTING_NAME: string;

    const SETTING_WIRELESS_AP_ISOLATION: string;

    const SETTING_WIRELESS_BAND: string;

    const SETTING_WIRELESS_BSSID: string;

    const SETTING_WIRELESS_CHANNEL: string;

    const SETTING_WIRELESS_CHANNEL_WIDTH: string;

    const SETTING_WIRELESS_CLONED_MAC_ADDRESS: string;

    const SETTING_WIRELESS_GENERATE_MAC_ADDRESS_MASK: string;

    const SETTING_WIRELESS_HIDDEN: string;

    const SETTING_WIRELESS_MAC_ADDRESS: string;

    const SETTING_WIRELESS_MAC_ADDRESS_BLACKLIST: string;

    const SETTING_WIRELESS_MAC_ADDRESS_DENYLIST: string;

    const SETTING_WIRELESS_MAC_ADDRESS_RANDOMIZATION: string;

    const SETTING_WIRELESS_MODE: string;

    const SETTING_WIRELESS_MODE_ADHOC: string;

    const SETTING_WIRELESS_MODE_AP: string;

    const SETTING_WIRELESS_MODE_INFRA: string;

    const SETTING_WIRELESS_MODE_MESH: string;

    const SETTING_WIRELESS_MTU: string;

    const SETTING_WIRELESS_POWERSAVE: string;

    const SETTING_WIRELESS_RATE: string;

    const SETTING_WIRELESS_SECURITY_AUTH_ALG: string;

    const SETTING_WIRELESS_SECURITY_FILS: string;

    const SETTING_WIRELESS_SECURITY_GROUP: string;

    const SETTING_WIRELESS_SECURITY_KEY_MGMT: string;

    const SETTING_WIRELESS_SECURITY_LEAP_PASSWORD: string;

    const SETTING_WIRELESS_SECURITY_LEAP_PASSWORD_FLAGS: string;

    const SETTING_WIRELESS_SECURITY_LEAP_USERNAME: string;

    const SETTING_WIRELESS_SECURITY_PAIRWISE: string;

    const SETTING_WIRELESS_SECURITY_PMF: string;

    const SETTING_WIRELESS_SECURITY_PROTO: string;

    const SETTING_WIRELESS_SECURITY_PSK: string;

    const SETTING_WIRELESS_SECURITY_PSK_FLAGS: string;

    const SETTING_WIRELESS_SECURITY_SETTING_NAME: string;

    const SETTING_WIRELESS_SECURITY_WEP_KEY0: string;

    const SETTING_WIRELESS_SECURITY_WEP_KEY1: string;

    const SETTING_WIRELESS_SECURITY_WEP_KEY2: string;

    const SETTING_WIRELESS_SECURITY_WEP_KEY3: string;

    const SETTING_WIRELESS_SECURITY_WEP_KEY_FLAGS: string;

    const SETTING_WIRELESS_SECURITY_WEP_KEY_TYPE: string;

    const SETTING_WIRELESS_SECURITY_WEP_TX_KEYIDX: string;

    const SETTING_WIRELESS_SECURITY_WPS_METHOD: string;

    const SETTING_WIRELESS_SEEN_BSSIDS: string;

    const SETTING_WIRELESS_SETTING_NAME: string;

    const SETTING_WIRELESS_SSID: string;

    const SETTING_WIRELESS_TX_POWER: string;

    const SETTING_WIRELESS_WAKE_ON_WLAN: string;

    const SETTING_WPAN_CHANNEL: string;

    const SETTING_WPAN_CHANNEL_DEFAULT: number;

    const SETTING_WPAN_MAC_ADDRESS: string;

    const SETTING_WPAN_PAGE: string;

    const SETTING_WPAN_PAGE_DEFAULT: number;

    const SETTING_WPAN_PAN_ID: string;

    const SETTING_WPAN_SETTING_NAME: string;

    const SETTING_WPAN_SHORT_ADDRESS: string;

    const SRIOV_VF_ATTRIBUTE_MAC: string;

    const SRIOV_VF_ATTRIBUTE_MAX_TX_RATE: string;

    const SRIOV_VF_ATTRIBUTE_MIN_TX_RATE: string;

    const SRIOV_VF_ATTRIBUTE_SPOOF_CHECK: string;

    const SRIOV_VF_ATTRIBUTE_TRUST: string;

    const TEAM_LINK_WATCHER_ARP_PING: string;

    const TEAM_LINK_WATCHER_ETHTOOL: string;

    const TEAM_LINK_WATCHER_NSNA_PING: string;

    const UTILS_HWADDR_LEN_MAX: number;

    const VLAN_FLAGS_ALL: number;

    const VPN_CONNECTION_BANNER: string;

    const VPN_CONNECTION_VPN_STATE: string;

    const VPN_DBUS_PLUGIN_INTERFACE: string;

    const VPN_DBUS_PLUGIN_PATH: string;

    const VPN_EDITOR_PLUGIN_DESCRIPTION: string;

    const VPN_EDITOR_PLUGIN_NAME: string;

    const VPN_EDITOR_PLUGIN_SERVICE: string;

    const VPN_PLUGIN_CAN_PERSIST: string;

    const VPN_PLUGIN_CONFIG_BANNER: string;

    const VPN_PLUGIN_CONFIG_EXT_GATEWAY: string;

    const VPN_PLUGIN_CONFIG_HAS_IP4: string;

    const VPN_PLUGIN_CONFIG_HAS_IP6: string;

    const VPN_PLUGIN_CONFIG_MTU: string;

    const VPN_PLUGIN_CONFIG_PROXY_PAC: string;

    const VPN_PLUGIN_CONFIG_TUNDEV: string;

    const VPN_PLUGIN_INFO_FILENAME: string;

    const VPN_PLUGIN_INFO_KEYFILE: string;

    const VPN_PLUGIN_INFO_KF_GROUP_CONNECTION: string;

    const VPN_PLUGIN_INFO_KF_GROUP_GNOME: string;

    const VPN_PLUGIN_INFO_KF_GROUP_LIBNM: string;

    const VPN_PLUGIN_INFO_NAME: string;

    const VPN_PLUGIN_IP4_CONFIG_ADDRESS: string;

    const VPN_PLUGIN_IP4_CONFIG_DNS: string;

    const VPN_PLUGIN_IP4_CONFIG_DOMAIN: string;

    const VPN_PLUGIN_IP4_CONFIG_DOMAINS: string;

    const VPN_PLUGIN_IP4_CONFIG_INT_GATEWAY: string;

    const VPN_PLUGIN_IP4_CONFIG_MSS: string;

    const VPN_PLUGIN_IP4_CONFIG_NBNS: string;

    const VPN_PLUGIN_IP4_CONFIG_NEVER_DEFAULT: string;

    const VPN_PLUGIN_IP4_CONFIG_PREFIX: string;

    const VPN_PLUGIN_IP4_CONFIG_PRESERVE_ROUTES: string;

    const VPN_PLUGIN_IP4_CONFIG_PTP: string;

    const VPN_PLUGIN_IP4_CONFIG_ROUTES: string;

    const VPN_PLUGIN_IP6_CONFIG_ADDRESS: string;

    const VPN_PLUGIN_IP6_CONFIG_DNS: string;

    const VPN_PLUGIN_IP6_CONFIG_DOMAIN: string;

    const VPN_PLUGIN_IP6_CONFIG_DOMAINS: string;

    const VPN_PLUGIN_IP6_CONFIG_INT_GATEWAY: string;

    const VPN_PLUGIN_IP6_CONFIG_MSS: string;

    const VPN_PLUGIN_IP6_CONFIG_NEVER_DEFAULT: string;

    const VPN_PLUGIN_IP6_CONFIG_PREFIX: string;

    const VPN_PLUGIN_IP6_CONFIG_PRESERVE_ROUTES: string;

    const VPN_PLUGIN_IP6_CONFIG_PTP: string;

    const VPN_PLUGIN_IP6_CONFIG_ROUTES: string;

    const VPN_PLUGIN_OLD_DBUS_SERVICE_NAME: string;

    const VPN_PLUGIN_OLD_STATE: string;

    const VPN_SERVICE_PLUGIN_DBUS_SERVICE_NAME: string;

    const VPN_SERVICE_PLUGIN_DBUS_WATCH_PEER: string;

    const VPN_SERVICE_PLUGIN_STATE: string;

    const WIFI_P2P_PEER_FLAGS: string;

    const WIFI_P2P_PEER_HW_ADDRESS: string;

    const WIFI_P2P_PEER_LAST_SEEN: string;

    const WIFI_P2P_PEER_MANUFACTURER: string;

    const WIFI_P2P_PEER_MODEL: string;

    const WIFI_P2P_PEER_MODEL_NUMBER: string;

    const WIFI_P2P_PEER_NAME: string;

    const WIFI_P2P_PEER_SERIAL: string;

    const WIFI_P2P_PEER_STRENGTH: string;

    const WIFI_P2P_PEER_WFD_IES: string;

    const WIMAX_NSP_NAME: string;

    const WIMAX_NSP_NETWORK_TYPE: string;

    const WIMAX_NSP_SIGNAL_QUALITY: string;

    const WIREGUARD_PEER_ATTR_ALLOWED_IPS: string;

    const WIREGUARD_PEER_ATTR_ENDPOINT: string;

    const WIREGUARD_PEER_ATTR_PERSISTENT_KEEPALIVE: string;

    const WIREGUARD_PEER_ATTR_PRESHARED_KEY: string;

    const WIREGUARD_PEER_ATTR_PRESHARED_KEY_FLAGS: string;

    const WIREGUARD_PEER_ATTR_PUBLIC_KEY: string;

    const WIREGUARD_PUBLIC_KEY_LEN: number;

    const WIREGUARD_SYMMETRIC_KEY_LEN: number;

    function agent_manager_error_quark(): GLib.Quark;

    function bridge_vlan_from_str(str: string): BridgeVlan;

    function client_error_quark(): GLib.Quark;

    function conn_wireguard_import(filename: string): Connection;

    function connection_error_quark(): GLib.Quark;

    function crypto_error_quark(): GLib.Quark;

    function device_error_quark(): GLib.Quark;

    function dns_server_validate(str: string, family: number): boolean;

    function ethtool_optname_is_channels(optname: string | null): boolean;

    function ethtool_optname_is_coalesce(optname: string | null): boolean;

    function ethtool_optname_is_eee(optname: string | null): boolean;

    function ethtool_optname_is_feature(optname: string | null): boolean;

    function ethtool_optname_is_fec(optname: string | null): boolean;

    function ethtool_optname_is_pause(optname: string | null): boolean;

    function ethtool_optname_is_ring(optname: string | null): boolean;

    function ip_route_attribute_validate(name: string, value: GLib.Variant, family: number): [boolean, boolean];

    function ip_route_get_variant_attribute_spec(): VariantAttributeSpec;

    function ip_routing_rule_from_string(str: string, to_string_flags: IPRoutingRuleAsStringFlags, extra_args: never | null): IPRoutingRule;

    function keyfile_read(keyfile: GLib.KeyFile, base_dir: string, handler_flags: KeyfileHandlerFlags, handler: KeyfileReadHandler | null): Connection;

    function keyfile_write(connection: Connection, handler_flags: KeyfileHandlerFlags, handler: KeyfileWriteHandler | null): GLib.KeyFile;

    function manager_error_quark(): GLib.Quark;

    function range_from_str(str: string): Range;

    function secret_agent_error_quark(): GLib.Quark;

    function settings_error_quark(): GLib.Quark;

    function sriov_vf_attribute_validate(name: string, value: GLib.Variant): [boolean, boolean];

    function utils_ap_mode_security_valid(type: UtilsSecurityType, wifi_caps: DeviceWifiCapabilities): boolean;

    function utils_base64secret_decode(base64_key: string, required_key_len: bigint | number): [boolean, number];

    function utils_bin2hexstr(src: Uint8Array | string, final_len: number): string;

    function utils_bond_mode_int_to_string(mode: number): string;

    function utils_bond_mode_string_to_int(mode: string): number;

    function utils_check_virtual_device_compatibility(virtual_type: GObject.GType, other_type: GObject.GType): boolean;

    function utils_copy_cert_as_user(filename: string, user: string): string;

    function utils_ensure_gtypes(): void;

    function utils_enum_from_str(type: GObject.GType, str: string): [boolean, number, string];

    function utils_enum_get_values(type: GObject.GType, from: number, to: number): string[];

    function utils_enum_to_str(type: GObject.GType, value: number): string;

    function utils_escape_ssid(ssid: Uint8Array | string): string;

    function utils_file_is_certificate(filename: string): boolean;

    function utils_file_is_pkcs12(filename: string): boolean;

    function utils_file_is_private_key(filename: string): [boolean, boolean];

    function utils_file_search_in_paths(progname: string, try_first: string | null, paths: string | null, file_test_flags: GLib.FileTest, predicate: UtilsFileSearchInPathsPredicate): string;

    function utils_format_variant_attributes(attributes: { [key: string]: GLib.Variant }, attr_separator: number, key_value_separator: number): string;

    function utils_get_timestamp_msec(): number;

    function utils_hexstr2bin(hex: string): GLib.Bytes;

    function utils_hwaddr_atoba(asc: string, length: bigint | number): Uint8Array;

    function utils_hwaddr_aton(asc: string, buffer: Uint8Array | string): number;

    function utils_hwaddr_canonical(asc: string, length: bigint | number): string;

    function utils_hwaddr_len(type: number): number;

    function utils_hwaddr_matches(hwaddr1: null, hwaddr1_len: bigint | number, hwaddr2: null, hwaddr2_len: bigint | number): boolean;

    function utils_hwaddr_ntoa(addr: Uint8Array | string): string;

    function utils_hwaddr_valid(asc: string, length: bigint | number): boolean;

    function utils_iface_valid_name(name: string | null): boolean;

    function utils_ip4_addresses_from_variant(value: GLib.Variant): [IPAddress[], string];

    function utils_ip4_addresses_to_variant(addresses: IPAddress[], gateway: string | null): GLib.Variant;

    function utils_ip4_dns_from_variant(value: GLib.Variant): string;

    function utils_ip4_dns_to_variant(dns: string): GLib.Variant;

    function utils_ip4_get_default_prefix(ip: number): number;

    function utils_ip4_netmask_to_prefix(netmask: number): number;

    function utils_ip4_prefix_to_netmask(prefix: number): number;

    function utils_ip4_routes_from_variant(value: GLib.Variant): IPRoute[];

    function utils_ip4_routes_to_variant(routes: IPRoute[]): GLib.Variant;

    function utils_ip6_addresses_from_variant(value: GLib.Variant): [IPAddress[], string];

    function utils_ip6_addresses_to_variant(addresses: IPAddress[], gateway: string | null): GLib.Variant;

    function utils_ip6_dns_from_variant(value: GLib.Variant): string;

    function utils_ip6_dns_to_variant(dns: string): GLib.Variant;

    function utils_ip6_routes_from_variant(value: GLib.Variant): IPRoute[];

    function utils_ip6_routes_to_variant(routes: IPRoute[]): GLib.Variant;

    function utils_ip_addresses_from_variant(value: GLib.Variant, family: number): IPAddress[];

    function utils_ip_addresses_to_variant(addresses: IPAddress[]): GLib.Variant;

    function utils_ip_routes_from_variant(value: GLib.Variant, family: number): IPRoute[];

    function utils_ip_routes_to_variant(routes: IPRoute[]): GLib.Variant;

    function utils_ipaddr_valid(family: number, ip: string): boolean;

    function utils_is_empty_ssid(ssid: Uint8Array | string): boolean;

    function utils_is_json_object(str: string): boolean;

    function utils_is_uuid(str: string | null): boolean;

    function utils_is_valid_iface_name(name: string | null): boolean;

    function utils_parse_variant_attributes(string: string, attr_separator: number, key_value_separator: number, ignore_unknown: boolean, spec: VariantAttributeSpec): { [key: string]: GLib.Variant };

    function utils_print(output_mode: number, msg: string): void;

    function utils_same_ssid(ssid1: Uint8Array | string, ssid2: Uint8Array | string, ignore_trailing_null: boolean): boolean;

    function utils_security_valid(type: UtilsSecurityType, wifi_caps: DeviceWifiCapabilities, have_ap: boolean, adhoc: boolean, ap_flags: __80211ApFlags, ap_wpa: __80211ApSecurityFlags, ap_rsn: __80211ApSecurityFlags): boolean;

    function utils_sriov_vf_from_str(str: string): SriovVF;

    function utils_sriov_vf_to_str(vf: SriovVF, omit_index: boolean): string;

    function utils_ssid_to_utf8(ssid: Uint8Array | string): string;

    function utils_tc_action_from_str(str: string): TCAction;

    function utils_tc_action_to_str(action: TCAction): string;

    function utils_tc_qdisc_from_str(str: string): TCQdisc;

    function utils_tc_qdisc_to_str(qdisc: TCQdisc): string;

    function utils_tc_tfilter_from_str(str: string): TCTfilter;

    function utils_tc_tfilter_to_str(tfilter: TCTfilter): string;

    function utils_uuid_generate(): string;

    function utils_version(): number;

    function utils_wep_key_valid(key: string, wep_type: WepKeyType): boolean;

    function utils_wifi_2ghz_freqs(): number;

    function utils_wifi_5ghz_freqs(): number;

    function utils_wifi_6ghz_freqs(): number;

    function utils_wifi_channel_to_freq(channel: number, band: string): number;

    function utils_wifi_find_next_channel(channel: number, direction: number, band: string): number;

    function utils_wifi_freq_to_band(freq: number): WifiBand;

    function utils_wifi_freq_to_channel(freq: number): number;

    function utils_wifi_is_channel_valid(channel: number, band: string): boolean;

    function utils_wifi_strength_bars(strength: number): string;

    function utils_wpa_psk_valid(psk: string): boolean;

    function vpn_editor_plugin_load(plugin_name: string, check_service: string): VpnEditorPlugin;

    function vpn_editor_plugin_load_from_file(plugin_name: string, check_service: string, check_owner: number, check_file: UtilsCheckFilePredicate): VpnEditorPlugin;

    function vpn_plugin_error_quark(): GLib.Quark;

    interface KeyfileReadHandler {
        (keyfile: GLib.KeyFile, connection: Connection, handler_type: KeyfileHandlerType, handler_data: KeyfileHandlerData): boolean;
    }

    interface KeyfileWriteHandler {
        (connection: Connection, keyfile: GLib.KeyFile, handler_type: KeyfileHandlerType, handler_data: KeyfileHandlerData): boolean;
    }

    interface SecretAgentOldDeleteSecretsFunc {
        (agent: SecretAgentOld, connection: Connection, error: GLib.Error | null): void;
    }

    interface SecretAgentOldGetSecretsFunc {
        (agent: SecretAgentOld, connection: Connection, secrets: GLib.Variant | null, error: GLib.Error | null): void;
    }

    interface SecretAgentOldSaveSecretsFunc {
        (agent: SecretAgentOld, connection: Connection, error: GLib.Error | null): void;
    }

    interface SettingClearSecretsWithFlagsFn {
        (setting: Setting, secret: string, flags: SettingSecretFlags): boolean;
    }

    interface SettingValueIterFn {
        (setting: Setting, key: string, value: unknown, flags: GObject.ParamFlags): void;
    }

    interface UtilsCheckFilePredicate {
        (filename: string, stat: null): boolean;
    }

    interface UtilsFileSearchInPathsPredicate {
        (filename: string): boolean;
    }

    interface UtilsPredicateStr {
        (str: string): boolean;
    }

    interface VpnIterFunc {
        (key: string, value: string): void;
    }

    export namespace __80211ApFlags {
        export const $gtype: GObject.GType<__80211ApFlags>;
    }

    enum __80211ApFlags {
        NONE = 0,
        PRIVACY = 1,
        WPS = 2,
        WPS_PBC = 4,
        WPS_PIN = 8,
    }


    export namespace __80211ApSecurityFlags {
        export const $gtype: GObject.GType<__80211ApSecurityFlags>;
    }

    enum __80211ApSecurityFlags {
        NONE = 0,
        PAIR_WEP40 = 1,
        PAIR_WEP104 = 2,
        PAIR_TKIP = 4,
        PAIR_CCMP = 8,
        GROUP_WEP40 = 16,
        GROUP_WEP104 = 32,
        GROUP_TKIP = 64,
        GROUP_CCMP = 128,
        KEY_MGMT_PSK = 256,
        KEY_MGMT_802_1X = 512,
        KEY_MGMT_SAE = 1024,
        KEY_MGMT_OWE = 2048,
        KEY_MGMT_OWE_TM = 4096,
        KEY_MGMT_EAP_SUITE_B_192 = 8192,
    }


    export namespace ActivationStateFlags {
        export const $gtype: GObject.GType<ActivationStateFlags>;
    }

    enum ActivationStateFlags {
        NONE = 0,
        IS_CONTROLLER = 1,
        IS_PORT = 2,
        LAYER2_READY = 4,
        IP4_READY = 8,
        IP6_READY = 16,
        CONTROLLER_HAS_PORTS = 32,
        LIFETIME_BOUND_TO_PROFILE_VISIBILITY = 64,
        EXTERNAL = 128,
    }


    export namespace BluetoothCapabilities {
        export const $gtype: GObject.GType<BluetoothCapabilities>;
    }

    enum BluetoothCapabilities {
        NONE = 0,
        DUN = 1,
        NAP = 2,
    }


    export namespace CheckpointCreateFlags {
        export const $gtype: GObject.GType<CheckpointCreateFlags>;
    }

    enum CheckpointCreateFlags {
        NONE = 0,
        DESTROY_ALL = 1,
        DELETE_NEW_CONNECTIONS = 2,
        DISCONNECT_NEW_DEVICES = 4,
        ALLOW_OVERLAPPING = 8,
        NO_PRESERVE_EXTERNAL_PORTS = 16,
        TRACK_INTERNAL_GLOBAL_DNS = 32,
    }


    export namespace ClientInstanceFlags {
        export const $gtype: GObject.GType<ClientInstanceFlags>;
    }

    enum ClientInstanceFlags {
        NONE = 0,
        NO_AUTO_FETCH_PERMISSIONS = 1,
        INITIALIZED_GOOD = 2,
        INITIALIZED_BAD = 4,
    }


    export namespace ConnectionSerializationFlags {
        export const $gtype: GObject.GType<ConnectionSerializationFlags>;
    }

    enum ConnectionSerializationFlags {
        ALL = 0,
        WITH_NON_SECRET = 1,
        NO_SECRETS = 1,
        WITH_SECRETS = 2,
        ONLY_SECRETS = 2,
        WITH_SECRETS_AGENT_OWNED = 4,
        WITH_SECRETS_SYSTEM_OWNED = 8,
        WITH_SECRETS_NOT_SAVED = 16,
    }


    export namespace DeviceCapabilities {
        export const $gtype: GObject.GType<DeviceCapabilities>;
    }

    enum DeviceCapabilities {
        NONE = 0,
        NM_SUPPORTED = 1,
        CARRIER_DETECT = 2,
        IS_SOFTWARE = 4,
        SRIOV = 8,
    }


    export namespace DeviceInterfaceFlags {
        export const $gtype: GObject.GType<DeviceInterfaceFlags>;
    }

    enum DeviceInterfaceFlags {
        UP = 1,
        LOWER_UP = 2,
        PROMISC = 4,
        CARRIER = 65536,
        LLDP_CLIENT_ENABLED = 131072,
    }


    export namespace DeviceManagedFlags {
        export const $gtype: GObject.GType<DeviceManagedFlags>;
    }

    enum DeviceManagedFlags {
        NONE = 0,
        RUNTIME = 1,
        PERMANENT = 2,
        PERMANENT_BY_NAME = 4,
        PERMANENT_BY_MAC = 8,
        SET_ADMIN_STATE = 16,
        ALL = 31,
    }


    export namespace DeviceModemCapabilities {
        export const $gtype: GObject.GType<DeviceModemCapabilities>;
    }

    enum DeviceModemCapabilities {
        NONE = 0,
        POTS = 1,
        CDMA_EVDO = 2,
        GSM_UMTS = 4,
        LTE = 8,
        "5GNR" = 64,
    }


    export namespace DeviceReapplyFlags {
        export const $gtype: GObject.GType<DeviceReapplyFlags>;
    }

    enum DeviceReapplyFlags {
        NONE = 0,
        PRESERVE_EXTERNAL_IP = 1,
    }


    export namespace DeviceWifiCapabilities {
        export const $gtype: GObject.GType<DeviceWifiCapabilities>;
    }

    enum DeviceWifiCapabilities {
        NONE = 0,
        CIPHER_WEP40 = 1,
        CIPHER_WEP104 = 2,
        CIPHER_TKIP = 4,
        CIPHER_CCMP = 8,
        WPA = 16,
        RSN = 32,
        AP = 64,
        ADHOC = 128,
        FREQ_VALID = 256,
        FREQ_2GHZ = 512,
        FREQ_5GHZ = 1024,
        FREQ_6GHZ = 2048,
        MESH = 4096,
        IBSS_RSN = 8192,
    }


    export namespace DhcpHostnameFlags {
        export const $gtype: GObject.GType<DhcpHostnameFlags>;
    }

    enum DhcpHostnameFlags {
        NONE = 0,
        FQDN_SERV_UPDATE = 1,
        FQDN_ENCODED = 2,
        FQDN_NO_UPDATE = 4,
        FQDN_CLEAR_FLAGS = 8,
    }


    export namespace IPAddressCmpFlags {
        export const $gtype: GObject.GType<IPAddressCmpFlags>;
    }

    enum IPAddressCmpFlags {
        NONE = 0,
        WITH_ATTRS = 1,
    }


    export namespace IPRoutingRuleAsStringFlags {
        export const $gtype: GObject.GType<IPRoutingRuleAsStringFlags>;
    }

    enum IPRoutingRuleAsStringFlags {
        NONE = 0,
        AF_INET = 1,
        AF_INET6 = 2,
        VALIDATE = 4,
    }


    export namespace IPTunnelFlags {
        export const $gtype: GObject.GType<IPTunnelFlags>;
    }

    enum IPTunnelFlags {
        NONE = 0,
        IP6_IGN_ENCAP_LIMIT = 1,
        IP6_USE_ORIG_TCLASS = 2,
        IP6_USE_ORIG_FLOWLABEL = 4,
        IP6_MIP6_DEV = 8,
        IP6_RCV_DSCP_COPY = 16,
        IP6_USE_ORIG_FWMARK = 32,
    }


    export namespace KeyfileHandlerFlags {
        export const $gtype: GObject.GType<KeyfileHandlerFlags>;
    }

    enum KeyfileHandlerFlags {
        NONE = 0,
    }


    export namespace ManagerReloadFlags {
        export const $gtype: GObject.GType<ManagerReloadFlags>;
    }

    enum ManagerReloadFlags {
        CONF = 1,
        DNS_RC = 2,
        DNS_FULL = 4,
    }


    export namespace MptcpFlags {
        export const $gtype: GObject.GType<MptcpFlags>;
    }

    enum MptcpFlags {
        NONE = 0,
        DISABLED = 1,
        ENABLED = 2,
        ALSO_WITHOUT_SYSCTL = 4,
        ALSO_WITHOUT_DEFAULT_ROUTE = 8,
        SIGNAL = 16,
        SUBFLOW = 32,
        BACKUP = 64,
        FULLMESH = 128,
        LAMINAR = 256,
    }


    export namespace RadioFlags {
        export const $gtype: GObject.GType<RadioFlags>;
    }

    enum RadioFlags {
        NONE = 0,
        WLAN_AVAILABLE = 1,
        WWAN_AVAILABLE = 2,
    }


    export namespace SecretAgentCapabilities {
        export const $gtype: GObject.GType<SecretAgentCapabilities>;
    }

    enum SecretAgentCapabilities {
        NONE = 0,
        VPN_HINTS = 1,
        LAST = 1,
    }


    export namespace SecretAgentGetSecretsFlags {
        export const $gtype: GObject.GType<SecretAgentGetSecretsFlags>;
    }

    enum SecretAgentGetSecretsFlags {
        NONE = 0,
        ALLOW_INTERACTION = 1,
        REQUEST_NEW = 2,
        USER_REQUESTED = 4,
        WPS_PBC_ACTIVE = 8,
        ONLY_SYSTEM = 2147483648,
        NO_ERRORS = 1073741824,
    }


    export namespace Setting8021xAuthFlags {
        export const $gtype: GObject.GType<Setting8021xAuthFlags>;
    }

    enum Setting8021xAuthFlags {
        NONE = 0,
        TLS_1_0_DISABLE = 1,
        TLS_1_1_DISABLE = 2,
        TLS_1_2_DISABLE = 4,
        TLS_DISABLE_TIME_CHECKS = 8,
        TLS_1_3_DISABLE = 16,
        TLS_1_0_ENABLE = 32,
        TLS_1_1_ENABLE = 64,
        TLS_1_2_ENABLE = 128,
        TLS_1_3_ENABLE = 256,
        ALL = 511,
    }


    export namespace SettingDcbFlags {
        export const $gtype: GObject.GType<SettingDcbFlags>;
    }

    enum SettingDcbFlags {
        NONE = 0,
        ENABLE = 1,
        ADVERTISE = 2,
        WILLING = 4,
    }


    export namespace SettingEthtoolFecMode {
        export const $gtype: GObject.GType<SettingEthtoolFecMode>;
    }

    enum SettingEthtoolFecMode {
        AUTO = 2,
        OFF = 4,
        RS = 8,
        BASER = 16,
        LLRS = 32,
    }


    export namespace SettingSecretFlags {
        export const $gtype: GObject.GType<SettingSecretFlags>;
    }

    enum SettingSecretFlags {
        NONE = 0,
        AGENT_OWNED = 1,
        NOT_SAVED = 2,
        NOT_REQUIRED = 4,
    }


    export namespace SettingWiredWakeOnLan {
        export const $gtype: GObject.GType<SettingWiredWakeOnLan>;
    }

    enum SettingWiredWakeOnLan {
        PHY = 2,
        UNICAST = 4,
        MULTICAST = 8,
        BROADCAST = 16,
        ARP = 32,
        MAGIC = 64,
        DEFAULT = 1,
        IGNORE = 32768,
    }


    export namespace SettingWirelessSecurityWpsMethod {
        export const $gtype: GObject.GType<SettingWirelessSecurityWpsMethod>;
    }

    enum SettingWirelessSecurityWpsMethod {
        DEFAULT = 0,
        DISABLED = 1,
        AUTO = 2,
        PBC = 4,
        PIN = 8,
    }


    export namespace SettingWirelessWakeOnWLan {
        export const $gtype: GObject.GType<SettingWirelessWakeOnWLan>;
    }

    enum SettingWirelessWakeOnWLan {
        ANY = 2,
        DISCONNECT = 4,
        MAGIC = 8,
        GTK_REKEY_FAILURE = 16,
        EAP_IDENTITY_REQUEST = 32,
        "4WAY_HANDSHAKE" = 64,
        RFKILL_RELEASE = 128,
        TCP = 256,
        ALL = 510,
        DEFAULT = 1,
        IGNORE = 32768,
    }


    export namespace SettingsAddConnection2Flags {
        export const $gtype: GObject.GType<SettingsAddConnection2Flags>;
    }

    enum SettingsAddConnection2Flags {
        NONE = 0,
        TO_DISK = 1,
        IN_MEMORY = 2,
        BLOCK_AUTOCONNECT = 32,
    }


    export namespace SettingsConnectionFlags {
        export const $gtype: GObject.GType<SettingsConnectionFlags>;
    }

    enum SettingsConnectionFlags {
        NONE = 0,
        UNSAVED = 1,
        NM_GENERATED = 2,
        VOLATILE = 4,
        EXTERNAL = 8,
    }


    export namespace SettingsUpdate2Flags {
        export const $gtype: GObject.GType<SettingsUpdate2Flags>;
    }

    enum SettingsUpdate2Flags {
        NONE = 0,
        TO_DISK = 1,
        IN_MEMORY = 2,
        IN_MEMORY_DETACHED = 4,
        IN_MEMORY_ONLY = 8,
        VOLATILE = 16,
        BLOCK_AUTOCONNECT = 32,
        NO_REAPPLY = 64,
    }


    export namespace TeamLinkWatcherArpPingFlags {
        export const $gtype: GObject.GType<TeamLinkWatcherArpPingFlags>;
    }

    enum TeamLinkWatcherArpPingFlags {
        VALIDATE_ACTIVE = 2,
        VALIDATE_INACTIVE = 4,
        SEND_ALWAYS = 8,
    }


    export namespace VlanFlags {
        export const $gtype: GObject.GType<VlanFlags>;
    }

    enum VlanFlags {
        REORDER_HEADERS = 1,
        GVRP = 2,
        LOOSE_BINDING = 4,
        MVRP = 8,
    }


    export namespace VpnEditorPluginCapability {
        export const $gtype: GObject.GType<VpnEditorPluginCapability>;
    }

    enum VpnEditorPluginCapability {
        NONE = 0,
        IMPORT = 1,
        EXPORT = 2,
        IPV6 = 4,
        NO_EDITOR = 8,
    }


    namespace AccessPoint {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::bandwidth": (pspec: GObject.ParamSpec) => void;
            "notify::bssid": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::frequency": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::last-seen": (pspec: GObject.ParamSpec) => void;
            "notify::max-bitrate": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::rsn-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ssid": (pspec: GObject.ParamSpec) => void;
            "notify::strength": (pspec: GObject.ParamSpec) => void;
            "notify::wpa-flags": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            bandwidth: number;
            bssid: string;
            flags: __80211ApFlags;
            frequency: number;
            hw_address: string;
            hwAddress: string;
            last_seen: number;
            lastSeen: number;
            max_bitrate: number;
            maxBitrate: number;
            mode: __80211Mode;
            rsn_flags: __80211ApSecurityFlags;
            rsnFlags: __80211ApSecurityFlags;
            ssid: GLib.Bytes | Uint8Array;
            strength: number;
            wpa_flags: __80211ApSecurityFlags;
            wpaFlags: __80211ApSecurityFlags;
        }
    }

    class AccessPoint extends Object {
        static $gtype: GObject.GType<AccessPoint>;

        // Properties
        get bandwidth(): number;

        get bssid(): string;

        get flags(): __80211ApFlags;

        get frequency(): number;

        get hw_address(): string;

        get hwAddress(): string;

        get last_seen(): number;

        get lastSeen(): number;

        get max_bitrate(): number;

        get maxBitrate(): number;

        get mode(): __80211Mode;

        get rsn_flags(): __80211ApSecurityFlags;

        get rsnFlags(): __80211ApSecurityFlags;

        get ssid(): GLib.Bytes;

        get strength(): number;

        get wpa_flags(): __80211ApSecurityFlags;

        get wpaFlags(): __80211ApSecurityFlags;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AccessPoint.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AccessPoint.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AccessPoint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AccessPoint.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AccessPoint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AccessPoint.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AccessPoint.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AccessPoint.SignalSignatures[K]>): void;

        // Methods
        connection_valid(connection: Connection): boolean;

        filter_connections(connections: Connection[]): Connection[];

        get_bandwidth(): number;

        get_bssid(): string;

        get_flags(): __80211ApFlags;

        get_frequency(): number;

        get_last_seen(): number;

        get_max_bitrate(): number;

        get_mode(): __80211Mode;

        get_rsn_flags(): __80211ApSecurityFlags;

        get_ssid(): GLib.Bytes;

        get_strength(): number;

        get_wpa_flags(): __80211ApSecurityFlags;
    }


    namespace ActiveConnection {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "state-changed": (state: number, reason: number) => void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::controller": (pspec: GObject.ParamSpec) => void;
            "notify::default": (pspec: GObject.ParamSpec) => void;
            "notify::default6": (pspec: GObject.ParamSpec) => void;
            "notify::devices": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::master": (pspec: GObject.ParamSpec) => void;
            "notify::specific-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-flags": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
            "notify::uuid": (pspec: GObject.ParamSpec) => void;
            "notify::vpn": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            connection: RemoteConnection;
            controller: Device;
            "default": boolean;
            default6: boolean;
            devices: Device[];
            dhcp4_config: DhcpConfig;
            dhcp4Config: DhcpConfig;
            dhcp6_config: DhcpConfig;
            dhcp6Config: DhcpConfig;
            id: string;
            ip4_config: IPConfig;
            ip4Config: IPConfig;
            ip6_config: IPConfig;
            ip6Config: IPConfig;
            master: Device;
            specific_object_path: string;
            specificObjectPath: string;
            state: ActiveConnectionState;
            state_flags: number;
            stateFlags: number;
            type: string;
            uuid: string;
            vpn: boolean;
        }
    }

    class ActiveConnection extends Object {
        static $gtype: GObject.GType<ActiveConnection>;

        // Properties
        get connection(): RemoteConnection;

        get controller(): Device;

        get "default"(): boolean;

        get default6(): boolean;

        get devices(): Device[];

        get dhcp4_config(): DhcpConfig;

        get dhcp4Config(): DhcpConfig;

        get dhcp6_config(): DhcpConfig;

        get dhcp6Config(): DhcpConfig;

        get id(): string;

        get ip4_config(): IPConfig;

        get ip4Config(): IPConfig;

        get ip6_config(): IPConfig;

        get ip6Config(): IPConfig;

        get master(): Device;

        get specific_object_path(): string;

        get specificObjectPath(): string;

        get state(): ActiveConnectionState;

        get state_flags(): number;

        get stateFlags(): number;

        get type(): string;

        get uuid(): string;

        get vpn(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ActiveConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ActiveConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ActiveConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActiveConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ActiveConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActiveConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ActiveConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ActiveConnection.SignalSignatures[K]>): void;

        // Methods
        get_connection(): RemoteConnection;

        get_connection_type(): string;

        get_controller(): Device;

        get_default(): boolean;

        get_default6(): boolean;

        get_devices(): Device[];

        get_dhcp4_config(): DhcpConfig;

        get_dhcp6_config(): DhcpConfig;

        get_id(): string;

        get_ip4_config(): IPConfig;

        get_ip6_config(): IPConfig;

        get_master(): Device;

        get_specific_object_path(): string;

        get_state(): ActiveConnectionState;

        get_state_flags(): ActivationStateFlags;

        get_state_reason(): ActiveConnectionStateReason;

        get_uuid(): string;

        get_vpn(): boolean;
    }


    namespace Checkpoint {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::created": (pspec: GObject.ParamSpec) => void;
            "notify::devices": (pspec: GObject.ParamSpec) => void;
            "notify::rollback-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            created: bigint | number;
            devices: Device[];
            rollback_timeout: number;
            rollbackTimeout: number;
        }
    }

    class Checkpoint extends Object {
        static $gtype: GObject.GType<Checkpoint>;

        // Properties
        get created(): number;

        get devices(): Device[];

        get rollback_timeout(): number;

        get rollbackTimeout(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Checkpoint.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Checkpoint.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Checkpoint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Checkpoint.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Checkpoint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Checkpoint.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Checkpoint.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Checkpoint.SignalSignatures[K]>): void;

        // Methods
        get_created(): number;

        get_devices(): Device[];

        get_rollback_timeout(): number;
    }


    namespace Client {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "active-connection-added": (active_connection: ActiveConnection) => void;
            /** @signal */
            "active-connection-removed": (active_connection: ActiveConnection) => void;
            /** @signal */
            "any-device-added": (device: Device) => void;
            /** @signal */
            "any-device-removed": (device: Device) => void;
            /** @signal */
            "connection-added": (connection: RemoteConnection) => void;
            /** @signal */
            "connection-removed": (connection: RemoteConnection) => void;
            /** @signal */
            "device-added": (device: Device) => void;
            /** @signal */
            "device-removed": (device: Device) => void;
            /** @signal */
            "permission-changed": (permission: number, result: number) => void;
            "notify::activating-connection": (pspec: GObject.ParamSpec) => void;
            "notify::active-connections": (pspec: GObject.ParamSpec) => void;
            "notify::all-devices": (pspec: GObject.ParamSpec) => void;
            "notify::can-modify": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::checkpoints": (pspec: GObject.ParamSpec) => void;
            "notify::connections": (pspec: GObject.ParamSpec) => void;
            "notify::connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::connectivity-check-available": (pspec: GObject.ParamSpec) => void;
            "notify::connectivity-check-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::connectivity-check-uri": (pspec: GObject.ParamSpec) => void;
            "notify::dbus-connection": (pspec: GObject.ParamSpec) => void;
            "notify::dbus-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::devices": (pspec: GObject.ParamSpec) => void;
            "notify::dns-configuration": (pspec: GObject.ParamSpec) => void;
            "notify::dns-mode": (pspec: GObject.ParamSpec) => void;
            "notify::dns-rc-manager": (pspec: GObject.ParamSpec) => void;
            "notify::hostname": (pspec: GObject.ParamSpec) => void;
            "notify::instance-flags": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::networking-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::nm-running": (pspec: GObject.ParamSpec) => void;
            "notify::permissions-state": (pspec: GObject.ParamSpec) => void;
            "notify::primary-connection": (pspec: GObject.ParamSpec) => void;
            "notify::radio-flags": (pspec: GObject.ParamSpec) => void;
            "notify::startup": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::version": (pspec: GObject.ParamSpec) => void;
            "notify::version-info": (pspec: GObject.ParamSpec) => void;
            "notify::wimax-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::wimax-hardware-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::wireless-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::wireless-hardware-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::wwan-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::wwan-hardware-enabled": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.Initable.ConstructorProps {
            activating_connection: ActiveConnection;
            activatingConnection: ActiveConnection;
            active_connections: ActiveConnection[];
            activeConnections: ActiveConnection[];
            all_devices: Device[];
            allDevices: Device[];
            can_modify: boolean;
            canModify: boolean;
            capabilities: number[];
            checkpoints: Checkpoint[];
            connections: RemoteConnection[];
            connectivity: ConnectivityState;
            connectivity_check_available: boolean;
            connectivityCheckAvailable: boolean;
            connectivity_check_enabled: boolean;
            connectivityCheckEnabled: boolean;
            connectivity_check_uri: string;
            connectivityCheckUri: string;
            dbus_connection: Gio.DBusConnection;
            dbusConnection: Gio.DBusConnection;
            dbus_name_owner: string;
            dbusNameOwner: string;
            devices: Device[];
            dns_configuration: DnsEntry[];
            dnsConfiguration: DnsEntry[];
            dns_mode: string;
            dnsMode: string;
            dns_rc_manager: string;
            dnsRcManager: string;
            hostname: string;
            instance_flags: number;
            instanceFlags: number;
            metered: number;
            networking_enabled: boolean;
            networkingEnabled: boolean;
            nm_running: boolean;
            nmRunning: boolean;
            permissions_state: Ternary;
            permissionsState: Ternary;
            primary_connection: ActiveConnection;
            primaryConnection: ActiveConnection;
            radio_flags: number;
            radioFlags: number;
            startup: boolean;
            state: State;
            version: string;
            version_info: number[];
            versionInfo: number[];
            wimax_enabled: boolean;
            wimaxEnabled: boolean;
            wimax_hardware_enabled: boolean;
            wimaxHardwareEnabled: boolean;
            wireless_enabled: boolean;
            wirelessEnabled: boolean;
            wireless_hardware_enabled: boolean;
            wirelessHardwareEnabled: boolean;
            wwan_enabled: boolean;
            wwanEnabled: boolean;
            wwan_hardware_enabled: boolean;
            wwanHardwareEnabled: boolean;
        }
    }

    class Client extends GObject.Object implements Gio.AsyncInitable<Client>, Gio.Initable {
        static $gtype: GObject.GType<Client>;

        // Properties
        get activating_connection(): ActiveConnection;

        get activatingConnection(): ActiveConnection;

        get active_connections(): ActiveConnection[];

        get activeConnections(): ActiveConnection[];

        get all_devices(): Device[];

        get allDevices(): Device[];

        get can_modify(): boolean;

        get canModify(): boolean;

        get capabilities(): number[];

        get checkpoints(): Checkpoint[];

        get connections(): RemoteConnection[];

        get connectivity(): ConnectivityState;

        get connectivity_check_available(): boolean;

        get connectivityCheckAvailable(): boolean;

        get connectivity_check_enabled(): boolean;
        set connectivity_check_enabled(val: boolean);

        get connectivityCheckEnabled(): boolean;
        set connectivityCheckEnabled(val: boolean);

        get connectivity_check_uri(): string;

        get connectivityCheckUri(): string;

        get dbus_connection(): Gio.DBusConnection;

        get dbusConnection(): Gio.DBusConnection;

        get dbus_name_owner(): string;

        get dbusNameOwner(): string;

        get devices(): Device[];

        get dns_configuration(): DnsEntry[];

        get dnsConfiguration(): DnsEntry[];

        get dns_mode(): string;

        get dnsMode(): string;

        get dns_rc_manager(): string;

        get dnsRcManager(): string;

        get hostname(): string;

        get instance_flags(): number;
        set instance_flags(val: number);

        get instanceFlags(): number;
        set instanceFlags(val: number);

        get metered(): number;

        get networking_enabled(): boolean;
        set networking_enabled(val: boolean);

        get networkingEnabled(): boolean;
        set networkingEnabled(val: boolean);

        get nm_running(): boolean;

        get nmRunning(): boolean;

        get permissions_state(): Ternary;

        get permissionsState(): Ternary;

        get primary_connection(): ActiveConnection;

        get primaryConnection(): ActiveConnection;

        get radio_flags(): number;

        get radioFlags(): number;

        get startup(): boolean;

        get state(): State;

        get version(): string;

        get version_info(): number[];

        get versionInfo(): number[];

        get wimax_enabled(): boolean;
        set wimax_enabled(val: boolean);

        get wimaxEnabled(): boolean;
        set wimaxEnabled(val: boolean);

        get wimax_hardware_enabled(): boolean;

        get wimaxHardwareEnabled(): boolean;

        get wireless_enabled(): boolean;
        set wireless_enabled(val: boolean);

        get wirelessEnabled(): boolean;
        set wirelessEnabled(val: boolean);

        get wireless_hardware_enabled(): boolean;

        get wirelessHardwareEnabled(): boolean;

        get wwan_enabled(): boolean;
        set wwan_enabled(val: boolean);

        get wwanEnabled(): boolean;
        set wwanEnabled(val: boolean);

        get wwan_hardware_enabled(): boolean;

        get wwanHardwareEnabled(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Client.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Client.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](cancellable: Gio.Cancellable | null): Client;

        static new_finish(result: Gio.AsyncResult): Client;

        // Conflicted with Gio.AsyncInitable.new_finish
        static new_finish(...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Client.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Client.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Client.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Client.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Client.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Client.SignalSignatures[K]>): void;

        // Static methods
        static new_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Client> | null): void;

        static wait_shutdown_finish(result: Gio.AsyncResult): boolean;

        // Methods
        activate_connection_async(connection: Connection | null, device: Device | null, specific_object: string | null, cancellable: Gio.Cancellable | null): globalThis.Promise<ActiveConnection>;

        activate_connection_async(connection: Connection | null, device: Device | null, specific_object: string | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        activate_connection_async(connection: Connection | null, device: Device | null, specific_object: string | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<ActiveConnection> | void;

        activate_connection_finish(result: Gio.AsyncResult): ActiveConnection;

        add_and_activate_connection2(partial: Connection | null, device: Device | null, specific_object: string | null, options: GLib.Variant, cancellable: Gio.Cancellable | null): globalThis.Promise<[ActiveConnection, GLib.Variant | null]>;

        add_and_activate_connection2(partial: Connection | null, device: Device | null, specific_object: string | null, options: GLib.Variant, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        add_and_activate_connection2(partial: Connection | null, device: Device | null, specific_object: string | null, options: GLib.Variant, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[ActiveConnection, GLib.Variant | null]> | void;

        add_and_activate_connection2_finish(result: Gio.AsyncResult): [ActiveConnection, GLib.Variant | null];

        add_and_activate_connection_async(partial: Connection | null, device: Device | null, specific_object: string | null, cancellable: Gio.Cancellable | null): globalThis.Promise<ActiveConnection>;

        add_and_activate_connection_async(partial: Connection | null, device: Device | null, specific_object: string | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        add_and_activate_connection_async(partial: Connection | null, device: Device | null, specific_object: string | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<ActiveConnection> | void;

        add_and_activate_connection_finish(result: Gio.AsyncResult): ActiveConnection;

        add_connection2(settings: GLib.Variant, flags: SettingsAddConnection2Flags, args: GLib.Variant | null, ignore_out_result: boolean, cancellable: Gio.Cancellable | null): globalThis.Promise<[RemoteConnection, GLib.Variant | null]>;

        add_connection2(settings: GLib.Variant, flags: SettingsAddConnection2Flags, args: GLib.Variant | null, ignore_out_result: boolean, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        add_connection2(settings: GLib.Variant, flags: SettingsAddConnection2Flags, args: GLib.Variant | null, ignore_out_result: boolean, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[RemoteConnection, GLib.Variant | null]> | void;

        add_connection2_finish(result: Gio.AsyncResult): [RemoteConnection, GLib.Variant | null];

        add_connection_async(connection: Connection, save_to_disk: boolean, cancellable: Gio.Cancellable | null): globalThis.Promise<RemoteConnection>;

        add_connection_async(connection: Connection, save_to_disk: boolean, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        add_connection_async(connection: Connection, save_to_disk: boolean, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<RemoteConnection> | void;

        add_connection_finish(result: Gio.AsyncResult): RemoteConnection;

        check_connectivity(cancellable: Gio.Cancellable | null): ConnectivityState;

        check_connectivity_async(cancellable: Gio.Cancellable | null): globalThis.Promise<ConnectivityState>;

        check_connectivity_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        check_connectivity_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<ConnectivityState> | void;

        check_connectivity_finish(result: Gio.AsyncResult): ConnectivityState;

        checkpoint_adjust_rollback_timeout(checkpoint_path: string, add_timeout: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        checkpoint_adjust_rollback_timeout(checkpoint_path: string, add_timeout: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        checkpoint_adjust_rollback_timeout(checkpoint_path: string, add_timeout: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        checkpoint_adjust_rollback_timeout_finish(result: Gio.AsyncResult): boolean;

        checkpoint_create(devices: Device[], rollback_timeout: number, flags: CheckpointCreateFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<Checkpoint>;

        checkpoint_create(devices: Device[], rollback_timeout: number, flags: CheckpointCreateFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        checkpoint_create(devices: Device[], rollback_timeout: number, flags: CheckpointCreateFlags, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Checkpoint> | void;

        checkpoint_create_finish(result: Gio.AsyncResult): Checkpoint;

        checkpoint_destroy(checkpoint_path: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        checkpoint_destroy(checkpoint_path: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        checkpoint_destroy(checkpoint_path: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        checkpoint_destroy_finish(result: Gio.AsyncResult): boolean;

        checkpoint_rollback(checkpoint_path: string, cancellable: Gio.Cancellable | null): globalThis.Promise<{ [key: string]: number }>;

        checkpoint_rollback(checkpoint_path: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        checkpoint_rollback(checkpoint_path: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<{ [key: string]: number }> | void;

        checkpoint_rollback_finish(result: Gio.AsyncResult): { [key: string]: number };

        connectivity_check_get_available(): boolean;

        connectivity_check_get_enabled(): boolean;

        connectivity_check_get_uri(): string;

        connectivity_check_set_enabled(enabled: boolean): void;

        dbus_call(object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        dbus_call(object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        dbus_call(object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        dbus_call_finish(result: Gio.AsyncResult): GLib.Variant;

        dbus_set_property(object_path: string, interface_name: string, property_name: string, value: GLib.Variant, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        dbus_set_property(object_path: string, interface_name: string, property_name: string, value: GLib.Variant, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        dbus_set_property(object_path: string, interface_name: string, property_name: string, value: GLib.Variant, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        dbus_set_property_finish(result: Gio.AsyncResult): boolean;

        deactivate_connection(active: ActiveConnection, cancellable: Gio.Cancellable | null): boolean;

        deactivate_connection_async(active: ActiveConnection, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        deactivate_connection_async(active: ActiveConnection, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        deactivate_connection_async(active: ActiveConnection, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        deactivate_connection_finish(result: Gio.AsyncResult): boolean;

        get_activating_connection(): ActiveConnection;

        get_active_connections(): ActiveConnection[];

        get_all_devices(): Device[];

        get_capabilities(): number[];

        get_checkpoints(): Checkpoint[];

        get_connection_by_id(id: string): RemoteConnection;

        get_connection_by_path(path: string): RemoteConnection;

        get_connection_by_uuid(uuid: string): RemoteConnection;

        get_connections(): RemoteConnection[];

        get_connectivity(): ConnectivityState;

        get_context_busy_watcher<T = GObject.Object>(): T;

        get_dbus_connection(): Gio.DBusConnection;

        get_dbus_name_owner(): string;

        get_device_by_iface(iface: string): Device;

        get_device_by_path(object_path: string): Device;

        get_devices(): Device[];

        get_dns_configuration(): DnsEntry[];

        get_dns_mode(): string;

        get_dns_rc_manager(): string;

        get_instance_flags(): ClientInstanceFlags;

        get_logging(): [boolean, string, string];

        get_main_context(): GLib.MainContext;

        get_metered(): Metered;

        get_nm_running(): boolean;

        get_object_by_path(dbus_path: string): Object;

        get_permission_result(permission: ClientPermission): ClientPermissionResult;

        get_permissions_state(): Ternary;

        get_primary_connection(): ActiveConnection;

        get_radio_flags(): RadioFlags;

        get_startup(): boolean;

        get_state(): State;

        get_version(): string;

        get_version_info(): number[];

        load_connections(filenames: string[], cancellable: Gio.Cancellable | null): [boolean, string];

        load_connections_async(filenames: string[], cancellable: Gio.Cancellable | null): globalThis.Promise<string[]>;

        load_connections_async(filenames: string[], cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_connections_async(filenames: string[], cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<string[]> | void;

        load_connections_finish(result: Gio.AsyncResult): [boolean, string[]];

        networking_get_enabled(): boolean;

        networking_set_enabled(enabled: boolean): boolean;

        reload(flags: ManagerReloadFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        reload(flags: ManagerReloadFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        reload(flags: ManagerReloadFlags, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        reload_connections(cancellable: Gio.Cancellable | null): boolean;

        reload_connections_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        reload_connections_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        reload_connections_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        reload_connections_finish(result: Gio.AsyncResult): boolean;

        reload_finish(result: Gio.AsyncResult): boolean;

        save_hostname(hostname: string | null, cancellable: Gio.Cancellable | null): boolean;

        save_hostname_async(hostname: string | null, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        save_hostname_async(hostname: string | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        save_hostname_async(hostname: string | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        save_hostname_finish(result: Gio.AsyncResult): boolean;

        set_logging(level: string | null, domains: string | null): boolean;

        wait_shutdown(integrate_maincontext: boolean, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        wimax_get_enabled(): boolean;

        wimax_hardware_get_enabled(): boolean;

        wimax_set_enabled(enabled: boolean): void;

        wireless_get_enabled(): boolean;

        wireless_hardware_get_enabled(): boolean;

        wireless_set_enabled(enabled: boolean): void;

        wwan_get_enabled(): boolean;

        wwan_hardware_get_enabled(): boolean;

        wwan_set_enabled(enabled: boolean): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Client;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Device {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "state-changed": (new_state: number, old_state: number, reason: number) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            active_connection: ActiveConnection;
            activeConnection: ActiveConnection;
            autoconnect: boolean;
            available_connections: RemoteConnection[];
            availableConnections: RemoteConnection[];
            capabilities: DeviceCapabilities;
            device_type: DeviceType;
            deviceType: DeviceType;
            dhcp4_config: DhcpConfig;
            dhcp4Config: DhcpConfig;
            dhcp6_config: DhcpConfig;
            dhcp6Config: DhcpConfig;
            driver: string;
            driver_version: string;
            driverVersion: string;
            firmware_missing: boolean;
            firmwareMissing: boolean;
            firmware_version: string;
            firmwareVersion: string;
            hw_address: string;
            hwAddress: string;
            "interface": string;
            interface_flags: number;
            interfaceFlags: number;
            ip_interface: string;
            ipInterface: string;
            ip4_config: IPConfig;
            ip4Config: IPConfig;
            ip4_connectivity: ConnectivityState;
            ip4Connectivity: ConnectivityState;
            ip6_config: IPConfig;
            ip6Config: IPConfig;
            ip6_connectivity: ConnectivityState;
            ip6Connectivity: ConnectivityState;
            lldp_neighbors: never[];
            lldpNeighbors: never[];
            managed: boolean;
            metered: number;
            mtu: number;
            nm_plugin_missing: boolean;
            nmPluginMissing: boolean;
            path: string;
            physical_port_id: string;
            physicalPortId: string;
            ports: never[];
            product: string;
            real: boolean;
            state: DeviceState;
            state_reason: number;
            stateReason: number;
            udi: string;
            vendor: string;
        }
    }

    abstract class Device extends Object {
        static $gtype: GObject.GType<Device>;

        // Properties
        get active_connection(): ActiveConnection;

        get activeConnection(): ActiveConnection;

        get autoconnect(): boolean;
        set autoconnect(val: boolean);

        get available_connections(): RemoteConnection[];

        get availableConnections(): RemoteConnection[];

        get capabilities(): DeviceCapabilities;

        get device_type(): DeviceType;

        get deviceType(): DeviceType;

        get dhcp4_config(): DhcpConfig;

        get dhcp4Config(): DhcpConfig;

        get dhcp6_config(): DhcpConfig;

        get dhcp6Config(): DhcpConfig;

        get driver(): string;

        get driver_version(): string;

        get driverVersion(): string;

        get firmware_missing(): boolean;

        get firmwareMissing(): boolean;

        get firmware_version(): string;

        get firmwareVersion(): string;

        get hw_address(): string;

        get hwAddress(): string;

        get "interface"(): string;

        get interface_flags(): number;

        get interfaceFlags(): number;

        get ip_interface(): string;

        get ipInterface(): string;

        get ip4_config(): IPConfig;

        get ip4Config(): IPConfig;

        get ip4_connectivity(): ConnectivityState;

        get ip4Connectivity(): ConnectivityState;

        get ip6_config(): IPConfig;

        get ip6Config(): IPConfig;

        get ip6_connectivity(): ConnectivityState;

        get ip6Connectivity(): ConnectivityState;

        get lldp_neighbors(): null[];

        get lldpNeighbors(): null[];

        get managed(): boolean;

        get metered(): number;

        get mtu(): number;

        get nm_plugin_missing(): boolean;

        get nmPluginMissing(): boolean;

        get path(): string;

        get physical_port_id(): string;

        get physicalPortId(): string;

        get ports(): null[];

        get product(): string;

        get real(): boolean;

        get state(): DeviceState;

        get state_reason(): number;

        get stateReason(): number;

        get udi(): string;

        get vendor(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Device.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Device.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Device.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Device.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Device.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Device.SignalSignatures[K]>): void;

        // Static methods
        static disambiguate_names(devices: Device[]): string[];

        // Methods
        connection_compatible(connection: Connection): boolean;

        connection_valid(connection: Connection): boolean;

        ["delete"](cancellable: Gio.Cancellable | null): boolean;

        delete_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        delete_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        delete_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        delete_finish(result: Gio.AsyncResult): boolean;

        disconnect(cancellable: Gio.Cancellable | null): boolean;

    // Conflicted with GObject.Object.disconnect
        disconnect(...args: never[]): any;

        disconnect_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        disconnect_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        disconnect_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        disconnect_finish(result: Gio.AsyncResult): boolean;

        filter_connections(connections: Connection[]): Connection[];

        get_active_connection(): ActiveConnection;

        get_applied_connection(flags: number, cancellable: Gio.Cancellable | null): [Connection, number];

        get_applied_connection_async(flags: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Connection, number]>;

        get_applied_connection_async(flags: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_applied_connection_async(flags: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Connection, number]> | void;

        get_applied_connection_finish(result: Gio.AsyncResult): [Connection, number];

        get_autoconnect(): boolean;

        get_available_connections(): RemoteConnection[];

        get_capabilities(): DeviceCapabilities;

        get_connectivity(addr_family: number): ConnectivityState;

        get_description(): string;

        get_device_type(): DeviceType;

        get_dhcp4_config(): DhcpConfig;

        get_dhcp6_config(): DhcpConfig;

        get_driver(): string;

        get_driver_version(): string;

        get_firmware_missing(): boolean;

        get_firmware_version(): string;

        get_hw_address(): string;

        get_iface(): string;

        get_interface_flags(): DeviceInterfaceFlags;

        get_ip4_config(): IPConfig;

        get_ip6_config(): IPConfig;

        get_ip_iface(): string;

        get_lldp_neighbors(): LldpNeighbor[];

        get_managed(): boolean;

        get_metered(): Metered;

        get_mtu(): number;

        get_nm_plugin_missing(): boolean;

        get_path(): string;

        get_physical_port_id(): string;

        get_ports(): Device[];

        get_product(): string;

        get_setting_type(): GObject.GType;

        get_state(): DeviceState;

        get_state_reason(): DeviceStateReason;

        get_type_description(): string;

        get_udi(): string;

        get_vendor(): string;

        is_real(): boolean;

        is_software(): boolean;

        reapply(connection: Connection | null, version_id: bigint | number, flags: number, cancellable: Gio.Cancellable | null): boolean;

        reapply_async(connection: Connection | null, version_id: bigint | number, flags: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        reapply_async(connection: Connection | null, version_id: bigint | number, flags: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        reapply_async(connection: Connection | null, version_id: bigint | number, flags: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        reapply_finish(result: Gio.AsyncResult): boolean;

        set_autoconnect(autoconnect: boolean): void;

        set_managed(managed: boolean): void;

        set_managed_async(managed: DeviceManaged, flags: DeviceManagedFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_managed_async(managed: DeviceManaged, flags: DeviceManagedFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_managed_async(managed: DeviceManaged, flags: DeviceManagedFlags, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_managed_finish(result: Gio.AsyncResult): boolean;
    }


    namespace Device6Lowpan {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            parent: Device;
        }
    }

    class Device6Lowpan extends Device {
        static $gtype: GObject.GType<Device6Lowpan>;

        // Properties
        get parent(): Device;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Device6Lowpan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Device6Lowpan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Device6Lowpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device6Lowpan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Device6Lowpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device6Lowpan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Device6Lowpan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Device6Lowpan.SignalSignatures[K]>): void;

        // Methods
        get_parent(): Device;
    }


    namespace DeviceAdsl {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
        }
    }

    class DeviceAdsl extends Device {
        static $gtype: GObject.GType<DeviceAdsl>;

        // Properties
        get carrier(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceAdsl.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceAdsl.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceAdsl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceAdsl.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceAdsl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceAdsl.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceAdsl.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceAdsl.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;
    }


    namespace DeviceBond {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::slaves": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
            slaves: Device[];
        }
    }

    class DeviceBond extends Device {
        static $gtype: GObject.GType<DeviceBond>;

        // Properties
        get carrier(): boolean;

        get slaves(): Device[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceBond.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceBond.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceBond.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceBond.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceBond.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceBond.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceBond.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceBond.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;

        get_slaves(): Device[];
    }


    namespace DeviceBridge {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::slaves": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
            slaves: Device[];
        }
    }

    class DeviceBridge extends Device {
        static $gtype: GObject.GType<DeviceBridge>;

        // Properties
        get carrier(): boolean;

        get slaves(): Device[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceBridge.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceBridge.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceBridge.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceBridge.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceBridge.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceBridge.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;

        get_slaves(): Device[];
    }


    namespace DeviceBt {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::bt-capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            bt_capabilities: BluetoothCapabilities;
            btCapabilities: BluetoothCapabilities;
            name: string;
        }
    }

    class DeviceBt extends Device {
        static $gtype: GObject.GType<DeviceBt>;

        // Properties
        get bt_capabilities(): BluetoothCapabilities;

        get btCapabilities(): BluetoothCapabilities;

        get name(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceBt.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceBt.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceBt.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceBt.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceBt.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceBt.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceBt.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceBt.SignalSignatures[K]>): void;

        // Methods
        get_capabilities(): BluetoothCapabilities;

    // Conflicted with NM.Device.get_capabilities
        get_capabilities(...args: never[]): any;

        get_name(): string;
    }


    namespace DeviceDummy {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceDummy extends Device {
        static $gtype: GObject.GType<DeviceDummy>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceDummy.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceDummy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceDummy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceDummy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceDummy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceDummy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceDummy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceDummy.SignalSignatures[K]>): void;
    }


    namespace DeviceEthernet {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::perm-hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::s390-subchannels": (pspec: GObject.ParamSpec) => void;
            "notify::speed": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
            perm_hw_address: string;
            permHwAddress: string;
            s390_subchannels: string[];
            s390Subchannels: string[];
            speed: number;
        }
    }

    class DeviceEthernet extends Device {
        static $gtype: GObject.GType<DeviceEthernet>;

        // Properties
        get carrier(): boolean;

        get perm_hw_address(): string;

        get permHwAddress(): string;

        get s390_subchannels(): string[];

        get s390Subchannels(): string[];

        get speed(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceEthernet.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceEthernet.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceEthernet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceEthernet.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceEthernet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceEthernet.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceEthernet.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceEthernet.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;

        get_permanent_hw_address(): string;

        get_s390_subchannels(): string[];

        get_speed(): number;
    }


    namespace DeviceGeneric {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::type-description": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            type_description: string;
            typeDescription: string;
        }
    }

    class DeviceGeneric extends Device {
        static $gtype: GObject.GType<DeviceGeneric>;

        // Properties
        get type_description(): string;

        get typeDescription(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceGeneric.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceGeneric.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceGeneric.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceGeneric.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceGeneric.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceGeneric.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceGeneric.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceGeneric.SignalSignatures[K]>): void;
    }


    namespace DeviceGeneve {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::df": (pspec: GObject.ParamSpec) => void;
            "notify::dst-port": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::remote": (pspec: GObject.ParamSpec) => void;
            "notify::tos": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            df: number;
            dst_port: number;
            dstPort: number;
            id: number;
            remote: string;
            tos: number;
            ttl: number;
        }
    }

    class DeviceGeneve extends Device {
        static $gtype: GObject.GType<DeviceGeneve>;

        // Properties
        get df(): number;

        get dst_port(): number;

        get dstPort(): number;

        get id(): number;

        get remote(): string;

        get tos(): number;

        get ttl(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceGeneve.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceGeneve.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceGeneve.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceGeneve.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceGeneve.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceGeneve.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceGeneve.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceGeneve.SignalSignatures[K]>): void;

        // Methods
        get_df(): number;

        get_dst_port(): number;

        get_id(): number;

        get_remote(): string;

        get_tos(): number;

        get_ttl(): number;
    }


    namespace DeviceHsr {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::multicast-spec": (pspec: GObject.ParamSpec) => void;
            "notify::port1": (pspec: GObject.ParamSpec) => void;
            "notify::port2": (pspec: GObject.ParamSpec) => void;
            "notify::prp": (pspec: GObject.ParamSpec) => void;
            "notify::supervision-address": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            multicast_spec: number;
            multicastSpec: number;
            port1: Device;
            port2: Device;
            prp: boolean;
            supervision_address: string;
            supervisionAddress: string;
        }
    }

    class DeviceHsr extends Device {
        static $gtype: GObject.GType<DeviceHsr>;

        // Properties
        get multicast_spec(): number;

        get multicastSpec(): number;

        get port1(): Device;

        get port2(): Device;

        get prp(): boolean;

        get supervision_address(): string;

        get supervisionAddress(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceHsr.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceHsr.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceHsr.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceHsr.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceHsr.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceHsr.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceHsr.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceHsr.SignalSignatures[K]>): void;

        // Methods
        get_multicast_spec(): number;

        get_port1(): Device;

        get_port2(): Device;

        get_prp(): boolean;

        get_supervision_address(): string;
    }


    namespace DeviceIPTunnel {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::encapsulation-limit": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::flow-label": (pspec: GObject.ParamSpec) => void;
            "notify::fwmark": (pspec: GObject.ParamSpec) => void;
            "notify::input-key": (pspec: GObject.ParamSpec) => void;
            "notify::local": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::output-key": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::path-mtu-discovery": (pspec: GObject.ParamSpec) => void;
            "notify::remote": (pspec: GObject.ParamSpec) => void;
            "notify::tos": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            encapsulation_limit: number;
            encapsulationLimit: number;
            flags: number;
            flow_label: number;
            flowLabel: number;
            fwmark: number;
            input_key: string;
            inputKey: string;
            local: string;
            mode: number;
            output_key: string;
            outputKey: string;
            parent: Device;
            path_mtu_discovery: boolean;
            pathMtuDiscovery: boolean;
            remote: string;
            tos: number;
            ttl: number;
        }
    }

    class DeviceIPTunnel extends Device {
        static $gtype: GObject.GType<DeviceIPTunnel>;

        // Properties
        get encapsulation_limit(): number;

        get encapsulationLimit(): number;

        get flags(): number;

        get flow_label(): number;

        get flowLabel(): number;

        get fwmark(): number;

        get input_key(): string;

        get inputKey(): string;

        get local(): string;

        get mode(): number;

        get output_key(): string;

        get outputKey(): string;

        get parent(): Device;

        get path_mtu_discovery(): boolean;

        get pathMtuDiscovery(): boolean;

        get remote(): string;

        get tos(): number;

        get ttl(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceIPTunnel.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceIPTunnel.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceIPTunnel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceIPTunnel.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceIPTunnel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceIPTunnel.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceIPTunnel.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceIPTunnel.SignalSignatures[K]>): void;

        // Methods
        get_encapsulation_limit(): number;

        get_flags(): IPTunnelFlags;

        get_flow_label(): number;

        get_fwmark(): number;

        get_input_key(): string;

        get_local(): string;

        get_mode(): IPTunnelMode;

        get_output_key(): string;

        get_parent(): Device;

        get_path_mtu_discovery(): boolean;

        get_remote(): string;

        get_tos(): number;

        get_ttl(): number;
    }


    namespace DeviceInfiniband {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
        }
    }

    class DeviceInfiniband extends Device {
        static $gtype: GObject.GType<DeviceInfiniband>;

        // Properties
        get carrier(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceInfiniband.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceInfiniband.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceInfiniband.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceInfiniband.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceInfiniband.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceInfiniband.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceInfiniband.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceInfiniband.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;
    }


    namespace DeviceIpvlan {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::private": (pspec: GObject.ParamSpec) => void;
            "notify::vepa": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            mode: string;
            parent: Device;
            "private": boolean;
            vepa: boolean;
        }
    }

    class DeviceIpvlan extends Device {
        static $gtype: GObject.GType<DeviceIpvlan>;

        // Properties
        get mode(): string;

        get parent(): Device;

        get "private"(): boolean;

        get vepa(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceIpvlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceIpvlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceIpvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceIpvlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceIpvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceIpvlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceIpvlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceIpvlan.SignalSignatures[K]>): void;

        // Methods
        get_mode(): string;

        get_parent(): Device;

        get_private(): boolean;

        get_vepa(): boolean;
    }


    namespace DeviceLoopback {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceLoopback extends Device {
        static $gtype: GObject.GType<DeviceLoopback>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceLoopback.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceLoopback.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceLoopback.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceLoopback.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceLoopback.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceLoopback.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceLoopback.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceLoopback.SignalSignatures[K]>): void;
    }


    namespace DeviceMacsec {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::cipher-suite": (pspec: GObject.ParamSpec) => void;
            "notify::encoding-sa": (pspec: GObject.ParamSpec) => void;
            "notify::encrypt": (pspec: GObject.ParamSpec) => void;
            "notify::es": (pspec: GObject.ParamSpec) => void;
            "notify::icv-length": (pspec: GObject.ParamSpec) => void;
            "notify::include-sci": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::protect": (pspec: GObject.ParamSpec) => void;
            "notify::replay-protect": (pspec: GObject.ParamSpec) => void;
            "notify::scb": (pspec: GObject.ParamSpec) => void;
            "notify::sci": (pspec: GObject.ParamSpec) => void;
            "notify::validation": (pspec: GObject.ParamSpec) => void;
            "notify::window": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            cipher_suite: bigint | number;
            cipherSuite: bigint | number;
            encoding_sa: number;
            encodingSa: number;
            encrypt: boolean;
            es: boolean;
            icv_length: number;
            icvLength: number;
            include_sci: boolean;
            includeSci: boolean;
            parent: Device;
            protect: boolean;
            replay_protect: boolean;
            replayProtect: boolean;
            scb: boolean;
            sci: bigint | number;
            validation: string;
            window: number;
        }
    }

    class DeviceMacsec extends Device {
        static $gtype: GObject.GType<DeviceMacsec>;

        // Properties
        get cipher_suite(): number;

        get cipherSuite(): number;

        get encoding_sa(): number;

        get encodingSa(): number;

        get encrypt(): boolean;

        get es(): boolean;

        get icv_length(): number;

        get icvLength(): number;

        get include_sci(): boolean;

        get includeSci(): boolean;

        get parent(): Device;

        get protect(): boolean;

        get replay_protect(): boolean;

        get replayProtect(): boolean;

        get scb(): boolean;

        get sci(): number;

        get validation(): string;

        get window(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceMacsec.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceMacsec.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceMacsec.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceMacsec.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceMacsec.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceMacsec.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceMacsec.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceMacsec.SignalSignatures[K]>): void;

        // Methods
        get_cipher_suite(): number;

        get_encoding_sa(): number;

        get_encrypt(): boolean;

        get_es(): boolean;

        get_icv_length(): number;

        get_include_sci(): boolean;

        get_parent(): Device;

        get_protect(): boolean;

        get_replay_protect(): boolean;

        get_scb(): boolean;

        get_sci(): number;

        get_validation(): string;

        get_window(): number;
    }


    namespace DeviceMacvlan {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::no-promisc": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::tap": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            mode: string;
            no_promisc: boolean;
            noPromisc: boolean;
            parent: Device;
            tap: boolean;
        }
    }

    class DeviceMacvlan extends Device {
        static $gtype: GObject.GType<DeviceMacvlan>;

        // Properties
        get mode(): string;

        get no_promisc(): boolean;

        get noPromisc(): boolean;

        get parent(): Device;

        get tap(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceMacvlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceMacvlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceMacvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceMacvlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceMacvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceMacvlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceMacvlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceMacvlan.SignalSignatures[K]>): void;

        // Methods
        get_mode(): string;

        get_no_promisc(): boolean;

        get_parent(): Device;

        get_tap(): boolean;
    }


    namespace DeviceModem {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::apn": (pspec: GObject.ParamSpec) => void;
            "notify::current-capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-id": (pspec: GObject.ParamSpec) => void;
            "notify::modem-capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::operator-code": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            apn: string;
            current_capabilities: DeviceModemCapabilities;
            currentCapabilities: DeviceModemCapabilities;
            device_id: string;
            deviceId: string;
            modem_capabilities: DeviceModemCapabilities;
            modemCapabilities: DeviceModemCapabilities;
            operator_code: string;
            operatorCode: string;
        }
    }

    class DeviceModem extends Device {
        static $gtype: GObject.GType<DeviceModem>;

        // Properties
        get apn(): string;

        get current_capabilities(): DeviceModemCapabilities;

        get currentCapabilities(): DeviceModemCapabilities;

        get device_id(): string;

        get deviceId(): string;

        get modem_capabilities(): DeviceModemCapabilities;

        get modemCapabilities(): DeviceModemCapabilities;

        get operator_code(): string;

        get operatorCode(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceModem.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceModem.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceModem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceModem.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceModem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceModem.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceModem.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceModem.SignalSignatures[K]>): void;

        // Methods
        get_apn(): string;

        get_current_capabilities(): DeviceModemCapabilities;

        get_device_id(): string;

        get_modem_capabilities(): DeviceModemCapabilities;

        get_operator_code(): string;
    }


    namespace DeviceOlpcMesh {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::active-channel": (pspec: GObject.ParamSpec) => void;
            "notify::companion": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            active_channel: number;
            activeChannel: number;
            companion: DeviceWifi;
        }
    }

    class DeviceOlpcMesh extends Device {
        static $gtype: GObject.GType<DeviceOlpcMesh>;

        // Properties
        get active_channel(): number;

        get activeChannel(): number;

        get companion(): DeviceWifi;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceOlpcMesh.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceOlpcMesh.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceOlpcMesh.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOlpcMesh.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceOlpcMesh.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOlpcMesh.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceOlpcMesh.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceOlpcMesh.SignalSignatures[K]>): void;

        // Methods
        get_active_channel(): number;

        get_companion(): DeviceWifi;
    }


    namespace DeviceOvsBridge {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::slaves": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            slaves: Device[];
        }
    }

    class DeviceOvsBridge extends Device {
        static $gtype: GObject.GType<DeviceOvsBridge>;

        // Properties
        get slaves(): Device[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceOvsBridge.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceOvsBridge.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceOvsBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOvsBridge.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceOvsBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOvsBridge.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceOvsBridge.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceOvsBridge.SignalSignatures[K]>): void;

        // Methods
        get_slaves(): Device[];
    }


    namespace DeviceOvsInterface {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceOvsInterface extends Device {
        static $gtype: GObject.GType<DeviceOvsInterface>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceOvsInterface.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceOvsInterface.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceOvsInterface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOvsInterface.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceOvsInterface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOvsInterface.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceOvsInterface.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceOvsInterface.SignalSignatures[K]>): void;
    }


    namespace DeviceOvsPort {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::slaves": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            slaves: Device[];
        }
    }

    class DeviceOvsPort extends Device {
        static $gtype: GObject.GType<DeviceOvsPort>;

        // Properties
        get slaves(): Device[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceOvsPort.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceOvsPort.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceOvsPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOvsPort.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceOvsPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceOvsPort.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceOvsPort.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceOvsPort.SignalSignatures[K]>): void;

        // Methods
        get_slaves(): Device[];
    }


    namespace DevicePpp {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DevicePpp extends Device {
        static $gtype: GObject.GType<DevicePpp>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DevicePpp.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DevicePpp.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DevicePpp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DevicePpp.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DevicePpp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DevicePpp.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DevicePpp.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DevicePpp.SignalSignatures[K]>): void;
    }


    namespace DeviceTeam {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::config": (pspec: GObject.ParamSpec) => void;
            "notify::slaves": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
            config: string;
            slaves: Device[];
        }
    }

    class DeviceTeam extends Device {
        static $gtype: GObject.GType<DeviceTeam>;

        // Properties
        get carrier(): boolean;

        get config(): string;

        get slaves(): Device[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceTeam.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceTeam.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceTeam.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceTeam.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceTeam.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceTeam.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceTeam.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceTeam.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;

        get_config(): string;

        get_slaves(): Device[];
    }


    namespace DeviceTun {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::group": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::multi-queue": (pspec: GObject.ParamSpec) => void;
            "notify::no-pi": (pspec: GObject.ParamSpec) => void;
            "notify::owner": (pspec: GObject.ParamSpec) => void;
            "notify::vnet-hdr": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            group: bigint | number;
            mode: string;
            multi_queue: boolean;
            multiQueue: boolean;
            no_pi: boolean;
            noPi: boolean;
            owner: bigint | number;
            vnet_hdr: boolean;
            vnetHdr: boolean;
        }
    }

    class DeviceTun extends Device {
        static $gtype: GObject.GType<DeviceTun>;

        // Properties
        get group(): number;

        get mode(): string;

        get multi_queue(): boolean;

        get multiQueue(): boolean;

        get no_pi(): boolean;

        get noPi(): boolean;

        get owner(): number;

        get vnet_hdr(): boolean;

        get vnetHdr(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceTun.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceTun.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceTun.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceTun.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceTun.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceTun.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceTun.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceTun.SignalSignatures[K]>): void;

        // Methods
        get_group(): number;

        get_mode(): string;

        get_multi_queue(): boolean;

        get_no_pi(): boolean;

        get_owner(): number;

        get_vnet_hdr(): boolean;
    }


    namespace DeviceVeth {
        // Signal signatures
        interface SignalSignatures extends DeviceEthernet.SignalSignatures {
            "notify::peer": (pspec: GObject.ParamSpec) => void;
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::perm-hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::s390-subchannels": (pspec: GObject.ParamSpec) => void;
            "notify::speed": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends DeviceEthernet.ConstructorProps {
            peer: Device;
        }
    }

    class DeviceVeth extends DeviceEthernet {
        static $gtype: GObject.GType<DeviceVeth>;

        // Properties
        get peer(): Device;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceVeth.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceVeth.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceVeth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVeth.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceVeth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVeth.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceVeth.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceVeth.SignalSignatures[K]>): void;

        // Methods
        get_peer(): Device;
    }


    namespace DeviceVlan {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::vlan-id": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            carrier: boolean;
            parent: Device;
            vlan_id: number;
            vlanId: number;
        }
    }

    class DeviceVlan extends Device {
        static $gtype: GObject.GType<DeviceVlan>;

        // Properties
        get carrier(): boolean;

        get parent(): Device;

        get vlan_id(): number;

        get vlanId(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceVlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceVlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceVlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceVlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceVlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceVlan.SignalSignatures[K]>): void;

        // Methods
        get_carrier(): boolean;

        get_parent(): Device;

        get_vlan_id(): number;
    }


    namespace DeviceVrf {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::table": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            table: number;
        }
    }

    class DeviceVrf extends Device {
        static $gtype: GObject.GType<DeviceVrf>;

        // Properties
        get table(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceVrf.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceVrf.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceVrf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVrf.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceVrf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVrf.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceVrf.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceVrf.SignalSignatures[K]>): void;

        // Methods
        get_table(): number;
    }


    namespace DeviceVxlan {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::ageing": (pspec: GObject.ParamSpec) => void;
            "notify::carrier": (pspec: GObject.ParamSpec) => void;
            "notify::dst-port": (pspec: GObject.ParamSpec) => void;
            "notify::group": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::l2miss": (pspec: GObject.ParamSpec) => void;
            "notify::l3miss": (pspec: GObject.ParamSpec) => void;
            "notify::learning": (pspec: GObject.ParamSpec) => void;
            "notify::limit": (pspec: GObject.ParamSpec) => void;
            "notify::local": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::proxy": (pspec: GObject.ParamSpec) => void;
            "notify::rsc": (pspec: GObject.ParamSpec) => void;
            "notify::src-port-max": (pspec: GObject.ParamSpec) => void;
            "notify::src-port-min": (pspec: GObject.ParamSpec) => void;
            "notify::tos": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            ageing: number;
            carrier: boolean;
            dst_port: number;
            dstPort: number;
            group: string;
            id: number;
            l2miss: boolean;
            l3miss: boolean;
            learning: boolean;
            limit: number;
            local: string;
            parent: Device;
            proxy: boolean;
            rsc: boolean;
            src_port_max: number;
            srcPortMax: number;
            src_port_min: number;
            srcPortMin: number;
            tos: number;
            ttl: number;
        }
    }

    class DeviceVxlan extends Device {
        static $gtype: GObject.GType<DeviceVxlan>;

        // Properties
        get ageing(): number;

        get carrier(): boolean;

        get dst_port(): number;

        get dstPort(): number;

        get group(): string;

        get id(): number;

        get l2miss(): boolean;

        get l3miss(): boolean;

        get learning(): boolean;

        get limit(): number;

        get local(): string;

        get parent(): Device;

        get proxy(): boolean;

        get rsc(): boolean;

        get src_port_max(): number;

        get srcPortMax(): number;

        get src_port_min(): number;

        get srcPortMin(): number;

        get tos(): number;

        get ttl(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceVxlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceVxlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceVxlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVxlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceVxlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceVxlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceVxlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceVxlan.SignalSignatures[K]>): void;

        // Methods
        get_ageing(): number;

        get_carrier(): boolean;

        get_dst_port(): number;

        get_group(): string;

        get_id(): number;

        get_l2miss(): boolean;

        get_l3miss(): boolean;

        get_learning(): boolean;

        get_limit(): number;

        get_local(): string;

        get_parent(): Device;

        get_proxy(): boolean;

        get_rsc(): boolean;

        get_src_port_max(): number;

        get_src_port_min(): number;

        get_tos(): number;

        get_ttl(): number;
    }


    namespace DeviceWifi {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            /** @signal */
            "access-point-added": (ap: GObject.Object) => void;
            /** @signal */
            "access-point-removed": (ap: GObject.Object) => void;
            "notify::access-points": (pspec: GObject.ParamSpec) => void;
            "notify::active-access-point": (pspec: GObject.ParamSpec) => void;
            "notify::bitrate": (pspec: GObject.ParamSpec) => void;
            "notify::last-scan": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::perm-hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::wireless-capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            access_points: AccessPoint[];
            accessPoints: AccessPoint[];
            active_access_point: AccessPoint;
            activeAccessPoint: AccessPoint;
            bitrate: number;
            last_scan: bigint | number;
            lastScan: bigint | number;
            mode: __80211Mode;
            perm_hw_address: string;
            permHwAddress: string;
            wireless_capabilities: DeviceWifiCapabilities;
            wirelessCapabilities: DeviceWifiCapabilities;
        }
    }

    class DeviceWifi extends Device {
        static $gtype: GObject.GType<DeviceWifi>;

        // Properties
        get access_points(): AccessPoint[];

        get accessPoints(): AccessPoint[];

        get active_access_point(): AccessPoint;

        get activeAccessPoint(): AccessPoint;

        get bitrate(): number;

        get last_scan(): number;

        get lastScan(): number;

        get mode(): __80211Mode;

        get perm_hw_address(): string;

        get permHwAddress(): string;

        get wireless_capabilities(): DeviceWifiCapabilities;

        get wirelessCapabilities(): DeviceWifiCapabilities;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceWifi.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceWifi.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceWifi.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWifi.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceWifi.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWifi.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceWifi.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceWifi.SignalSignatures[K]>): void;

        // Methods
        get_access_point_by_path(path: string): AccessPoint;

        get_access_points(): AccessPoint[];

        get_active_access_point(): AccessPoint;

        get_bitrate(): number;

        get_capabilities(): DeviceWifiCapabilities;

    // Conflicted with NM.Device.get_capabilities
        get_capabilities(...args: never[]): any;

        get_last_scan(): number;

        get_mode(): __80211Mode;

        get_permanent_hw_address(): string;

        request_scan(cancellable: Gio.Cancellable | null): boolean;

        request_scan_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        request_scan_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        request_scan_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        request_scan_finish(result: Gio.AsyncResult): boolean;

        request_scan_options(options: GLib.Variant, cancellable: Gio.Cancellable | null): boolean;

        request_scan_options_async(options: GLib.Variant, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;
    }


    namespace DeviceWifiP2P {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            /** @signal */
            "peer-added": (peer: GObject.Object) => void;
            /** @signal */
            "peer-removed": (peer: GObject.Object) => void;
            "notify::peers": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            peers: WifiP2PPeer[];
        }
    }

    class DeviceWifiP2P extends Device {
        static $gtype: GObject.GType<DeviceWifiP2P>;

        // Properties
        get peers(): WifiP2PPeer[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceWifiP2P.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceWifiP2P.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceWifiP2P.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWifiP2P.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceWifiP2P.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWifiP2P.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceWifiP2P.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceWifiP2P.SignalSignatures[K]>): void;

        // Methods
        get_peer_by_path(path: string): WifiP2PPeer;

        get_peers(): WifiP2PPeer[];

        start_find(options: GLib.Variant | null, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        start_find(options: GLib.Variant | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        start_find(options: GLib.Variant | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        start_find_finish(result: Gio.AsyncResult): boolean;

        stop_find(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        stop_find(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        stop_find(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        stop_find_finish(result: Gio.AsyncResult): boolean;
    }


    namespace DeviceWimax {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            /** @signal */
            "nsp-added": (nsp: GObject.Object) => void;
            /** @signal */
            "nsp-removed": (nsp: GObject.Object) => void;
            "notify::active-nsp": (pspec: GObject.ParamSpec) => void;
            "notify::bsid": (pspec: GObject.ParamSpec) => void;
            "notify::center-frequency": (pspec: GObject.ParamSpec) => void;
            "notify::cinr": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::nsps": (pspec: GObject.ParamSpec) => void;
            "notify::rssi": (pspec: GObject.ParamSpec) => void;
            "notify::tx-power": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            active_nsp: WimaxNsp;
            activeNsp: WimaxNsp;
            bsid: string;
            center_frequency: number;
            centerFrequency: number;
            cinr: number;
            hw_address: string;
            hwAddress: string;
            nsps: WimaxNsp[];
            rssi: number;
            tx_power: number;
            txPower: number;
        }
    }

    class DeviceWimax extends Device {
        static $gtype: GObject.GType<DeviceWimax>;

        // Properties
        get active_nsp(): WimaxNsp;

        get activeNsp(): WimaxNsp;

        get bsid(): string;

        get center_frequency(): number;

        get centerFrequency(): number;

        get cinr(): number;

        get hw_address(): string;

        get hwAddress(): string;

        get nsps(): WimaxNsp[];

        get rssi(): number;

        get tx_power(): number;

        get txPower(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceWimax.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceWimax.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceWimax.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWimax.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceWimax.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWimax.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceWimax.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceWimax.SignalSignatures[K]>): void;

        // Methods
        get_active_nsp(): WimaxNsp;

        get_bsid(): string;

        get_center_frequency(): number;

        get_cinr(): number;

        get_hw_address(): string;

        get_nsp_by_path(path: string): WimaxNsp;

        get_nsps(): WimaxNsp[];

        get_rssi(): number;

        get_tx_power(): number;
    }


    namespace DeviceWireGuard {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::fwmark": (pspec: GObject.ParamSpec) => void;
            "notify::listen-port": (pspec: GObject.ParamSpec) => void;
            "notify::public-key": (pspec: GObject.ParamSpec) => void;
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {
            fwmark: number;
            listen_port: number;
            listenPort: number;
            public_key: GLib.Bytes | Uint8Array;
            publicKey: GLib.Bytes | Uint8Array;
        }
    }

    class DeviceWireGuard extends Device {
        static $gtype: GObject.GType<DeviceWireGuard>;

        // Properties
        get fwmark(): number;

        get listen_port(): number;

        get listenPort(): number;

        get public_key(): GLib.Bytes;

        get publicKey(): GLib.Bytes;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceWireGuard.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceWireGuard.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceWireGuard.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWireGuard.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceWireGuard.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWireGuard.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceWireGuard.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceWireGuard.SignalSignatures[K]>): void;

        // Methods
        get_fwmark(): number;

        get_listen_port(): number;

        get_public_key(): GLib.Bytes;
    }


    namespace DeviceWpan {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::active-connection": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::available-connections": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::driver-version": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-missing": (pspec: GObject.ParamSpec) => void;
            "notify::firmware-version": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::interface": (pspec: GObject.ParamSpec) => void;
            "notify::interface-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ip-interface": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-connectivity": (pspec: GObject.ParamSpec) => void;
            "notify::lldp-neighbors": (pspec: GObject.ParamSpec) => void;
            "notify::managed": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::nm-plugin-missing": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::physical-port-id": (pspec: GObject.ParamSpec) => void;
            "notify::ports": (pspec: GObject.ParamSpec) => void;
            "notify::product": (pspec: GObject.ParamSpec) => void;
            "notify::real": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-reason": (pspec: GObject.ParamSpec) => void;
            "notify::udi": (pspec: GObject.ParamSpec) => void;
            "notify::vendor": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceWpan extends Device {
        static $gtype: GObject.GType<DeviceWpan>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceWpan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceWpan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceWpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWpan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceWpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceWpan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceWpan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceWpan.SignalSignatures[K]>): void;
    }


    namespace DhcpConfig {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::family": (pspec: GObject.ParamSpec) => void;
            "notify::options": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            family: number;
            options: { [key: string]: string };
        }
    }

    abstract class DhcpConfig extends Object {
        static $gtype: GObject.GType<DhcpConfig>;

        // Properties
        get family(): number;

        get options(): { [key: string]: string };

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DhcpConfig.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DhcpConfig.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DhcpConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DhcpConfig.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DhcpConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DhcpConfig.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DhcpConfig.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DhcpConfig.SignalSignatures[K]>): void;

        // Methods
        get_family(): number;

        get_one_option(option: string): string;

        get_options(): { [key: string]: string };
    }


    namespace IPConfig {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::addresses": (pspec: GObject.ParamSpec) => void;
            "notify::clat-address": (pspec: GObject.ParamSpec) => void;
            "notify::clat-pref64": (pspec: GObject.ParamSpec) => void;
            "notify::domains": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
            "notify::gateway": (pspec: GObject.ParamSpec) => void;
            "notify::nameservers": (pspec: GObject.ParamSpec) => void;
            "notify::routes": (pspec: GObject.ParamSpec) => void;
            "notify::searches": (pspec: GObject.ParamSpec) => void;
            "notify::wins-servers": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            addresses: never[];
            clat_address: string;
            clatAddress: string;
            clat_pref64: string;
            clatPref64: string;
            domains: string[];
            family: number;
            gateway: string;
            nameservers: string[];
            routes: IPRoute[];
            searches: string[];
            wins_servers: string[];
            winsServers: string[];
        }
    }

    abstract class IPConfig extends Object {
        static $gtype: GObject.GType<IPConfig>;

        // Properties
        get addresses(): null[];

        get clat_address(): string;

        get clatAddress(): string;

        get clat_pref64(): string;

        get clatPref64(): string;

        get domains(): string[];

        get family(): number;

        get gateway(): string;

        get nameservers(): string[];

        get routes(): IPRoute[];

        get searches(): string[];

        get wins_servers(): string[];

        get winsServers(): string[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IPConfig.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IPConfig.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof IPConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IPConfig.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IPConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IPConfig.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IPConfig.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IPConfig.SignalSignatures[K]>): void;

        // Methods
        get_addresses(): IPAddress[];

        get_clat_address(): string;

        get_clat_pref64(): string;

        get_domains(): string[];

        get_family(): number;

        get_gateway(): string;

        get_nameservers(): string[];

        get_routes(): IPRoute[];

        get_searches(): string[];

        get_wins_servers(): string[];
    }


    namespace Object {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            client: Client;
            path: string;
        }
    }

    abstract class Object extends GObject.Object {
        static $gtype: GObject.GType<Object>;

        // Properties
        get client(): Client;

        get path(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Object.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Object.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Object.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Object.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Object.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Object.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Object.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Object.SignalSignatures[K]>): void;

        // Methods
        get_client(): Client;

        get_path(): string;
    }


    namespace RemoteConnection {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures, Connection.SignalSignatures {
            "notify::filename": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::unsaved": (pspec: GObject.ParamSpec) => void;
            "notify::version-id": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps, Connection.ConstructorProps {
            filename: string;
            flags: number;
            unsaved: boolean;
            version_id: bigint | number;
            versionId: bigint | number;
            visible: boolean;
        }
    }

    class RemoteConnection extends Object implements Connection {
        static $gtype: GObject.GType<RemoteConnection>;

        // Properties
        get filename(): string;

        get flags(): number;

        get unsaved(): boolean;

        get version_id(): number;

        get versionId(): number;

        get visible(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: RemoteConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<RemoteConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof RemoteConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RemoteConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RemoteConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RemoteConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RemoteConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RemoteConnection.SignalSignatures[K]>): void;

        // Methods
        commit_changes(save_to_disk: boolean, cancellable: Gio.Cancellable | null): boolean;

        commit_changes_async(save_to_disk: boolean, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        commit_changes_async(save_to_disk: boolean, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        commit_changes_async(save_to_disk: boolean, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        commit_changes_finish(result: Gio.AsyncResult): boolean;

        ["delete"](cancellable: Gio.Cancellable | null): boolean;

        delete_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        delete_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        delete_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        delete_finish(result: Gio.AsyncResult): boolean;

        get_filename(): string;

        get_flags(): SettingsConnectionFlags;

        get_secrets(setting_name: string, cancellable: Gio.Cancellable | null): GLib.Variant;

        get_secrets_async(setting_name: string, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        get_secrets_async(setting_name: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_secrets_async(setting_name: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        get_secrets_finish(result: Gio.AsyncResult): GLib.Variant;

        get_unsaved(): boolean;

        get_version_id(): number;

        get_visible(): boolean;

        save(cancellable: Gio.Cancellable | null): boolean;

        save_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        save_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        save_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        save_finish(result: Gio.AsyncResult): boolean;

        update2(settings: GLib.Variant | null, flags: SettingsUpdate2Flags, args: GLib.Variant | null, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        update2(settings: GLib.Variant | null, flags: SettingsUpdate2Flags, args: GLib.Variant | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        update2(settings: GLib.Variant | null, flags: SettingsUpdate2Flags, args: GLib.Variant | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        update2_finish(result: Gio.AsyncResult): GLib.Variant;

        add_setting(setting: Setting): void;

        clear_secrets(): void;

        clear_secrets_with_flags(func: SettingClearSecretsWithFlagsFn | null): void;

        clear_settings(): void;

        compare(b: Connection, flags: SettingCompareFlags): boolean;

        dump(): void;

        for_each_setting_value(func: SettingValueIterFn): void;

        get_connection_type(): string;

        get_id(): string;

        get_interface_name(): string;

        get_path(): string;

        get_setting(setting_type: GObject.GType): Setting;

        get_setting_802_1x(): Setting8021x;

        get_setting_adsl(): SettingAdsl;

        get_setting_bluetooth(): SettingBluetooth;

        get_setting_bond(): SettingBond;

        get_setting_bridge(): SettingBridge;

        get_setting_bridge_port(): SettingBridgePort;

        get_setting_by_name(name: string): Setting;

        get_setting_cdma(): SettingCdma;

        get_setting_connection(): SettingConnection;

        get_setting_dcb(): SettingDcb;

        get_setting_dummy(): SettingDummy;

        get_setting_generic(): SettingGeneric;

        get_setting_geneve(): SettingGeneve;

        get_setting_gsm(): SettingGsm;

        get_setting_infiniband(): SettingInfiniband;

        get_setting_ip4_config(): SettingIP4Config;

        get_setting_ip6_config(): SettingIP6Config;

        get_setting_ip_tunnel(): SettingIPTunnel;

        get_setting_macsec(): SettingMacsec;

        get_setting_macvlan(): SettingMacvlan;

        get_setting_olpc_mesh(): SettingOlpcMesh;

        get_setting_ovs_bridge(): SettingOvsBridge;

        get_setting_ovs_interface(): SettingOvsInterface;

        get_setting_ovs_patch(): SettingOvsPatch;

        get_setting_ovs_port(): SettingOvsPort;

        get_setting_ppp(): SettingPpp;

        get_setting_pppoe(): SettingPppoe;

        get_setting_proxy(): SettingProxy;

        get_setting_serial(): SettingSerial;

        get_setting_tc_config(): SettingTCConfig;

        get_setting_team(): SettingTeam;

        get_setting_team_port(): SettingTeamPort;

        get_setting_tun(): SettingTun;

        get_setting_vlan(): SettingVlan;

        get_setting_vpn(): SettingVpn;

        get_setting_vxlan(): SettingVxlan;

        get_setting_wimax(): SettingWimax;

        get_setting_wired(): SettingWired;

        get_setting_wireless(): SettingWireless;

        get_setting_wireless_security(): SettingWirelessSecurity;

        get_settings(): Setting[] | null;

        get_uuid(): string;

        get_virtual_device_description(): string;

        is_type(type: string): boolean;

        is_virtual(): boolean;

        need_secrets(): [string | null, string[] | null];

        normalize(parameters: { [key: string]: never } | null): [boolean, boolean];

        remove_setting(setting_type: GObject.GType): void;

        replace_settings(new_settings: GLib.Variant): boolean;

        replace_settings_from_connection(new_connection: Connection): void;

        set_path(path: string): void;

        to_dbus(flags: ConnectionSerializationFlags): GLib.Variant;

        update_secrets(setting_name: string, secrets: GLib.Variant): boolean;

        verify(): boolean;

        verify_secrets(): boolean;

        vfunc_changed(): void;

        vfunc_secrets_cleared(): void;

        vfunc_secrets_updated(setting: string): void;
    }


    namespace SecretAgentOld {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::auto-register": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::dbus-connection": (pspec: GObject.ParamSpec) => void;
            "notify::identifier": (pspec: GObject.ParamSpec) => void;
            "notify::registered": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.Initable.ConstructorProps {
            auto_register: boolean;
            autoRegister: boolean;
            capabilities: SecretAgentCapabilities;
            dbus_connection: Gio.DBusConnection;
            dbusConnection: Gio.DBusConnection;
            identifier: string;
            registered: boolean;
        }
    }

    abstract class SecretAgentOld extends GObject.Object implements Gio.AsyncInitable<SecretAgentOld>, Gio.Initable {
        static $gtype: GObject.GType<SecretAgentOld>;

        // Properties
        get auto_register(): boolean;
        set auto_register(val: boolean);

        get autoRegister(): boolean;
        set autoRegister(val: boolean);

        get capabilities(): SecretAgentCapabilities;
        set capabilities(val: SecretAgentCapabilities);

        get dbus_connection(): Gio.DBusConnection;

        get dbusConnection(): Gio.DBusConnection;

        get identifier(): string;

        get registered(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SecretAgentOld.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SecretAgentOld.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SecretAgentOld.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SecretAgentOld.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SecretAgentOld.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SecretAgentOld.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SecretAgentOld.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SecretAgentOld.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_cancel_get_secrets(connection_path: string, setting_name: string): void;

        vfunc_delete_secrets(connection: Connection, connection_path: string, callback: SecretAgentOldDeleteSecretsFunc): void;

        vfunc_get_secrets(connection: Connection, connection_path: string, setting_name: string, hints: string[], flags: SecretAgentGetSecretsFlags, callback: SecretAgentOldGetSecretsFunc): void;

        vfunc_save_secrets(connection: Connection, connection_path: string, callback: SecretAgentOldSaveSecretsFunc): void;

        // Methods
        delete_secrets(connection: Connection, callback: SecretAgentOldDeleteSecretsFunc): void;

        destroy(): void;

        enable(enable: boolean): void;

        get_context_busy_watcher<T = GObject.Object>(): T;

        get_dbus_connection(): Gio.DBusConnection;

        get_dbus_name_owner(): string;

        get_main_context(): GLib.MainContext;

        get_registered(): boolean;

        get_secrets(connection: Connection, setting_name: string, hints: string[], flags: SecretAgentGetSecretsFlags, callback: SecretAgentOldGetSecretsFunc): void;

        register(cancellable: Gio.Cancellable | null): boolean;

        register_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        register_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        register_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        register_finish(result: Gio.AsyncResult): boolean;

        save_secrets(connection: Connection, callback: SecretAgentOldSaveSecretsFunc): void;

        unregister(cancellable: Gio.Cancellable | null): boolean;

        unregister_async(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        unregister_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        unregister_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        unregister_finish(result: Gio.AsyncResult): boolean;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): SecretAgentOld;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Setting {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            name: string;
        }
    }

    abstract class Setting extends GObject.Object {
        static $gtype: GObject.GType<Setting>;

        // Properties
        get name(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Setting.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Setting.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Setting.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Setting.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Setting.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Setting.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Setting.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Setting.SignalSignatures[K]>): void;

        // Static methods
        static get_enum_property_type(setting_type: GObject.GType, property_name: string): GObject.GType;

        static lookup_type(name: string): GObject.GType;

        // Methods
        compare(b: Setting, flags: SettingCompareFlags): boolean;

        diff(b: Setting, flags: SettingCompareFlags, invert_results: boolean, results: { [key: string]: number }): [boolean, { [key: string]: number }];

        duplicate(): Setting;

        enumerate_values(func: SettingValueIterFn): void;

        get_dbus_property_type(property_name: string): GLib.VariantType;

        get_name(): string;

        get_secret_flags(secret_name: string, out_flags: SettingSecretFlags): boolean;

        option_clear_by_name(predicate: UtilsPredicateStr | null): void;

        option_get(opt_name: string): GLib.Variant;

        option_get_all_names(): string[] | null;

        option_get_boolean(opt_name: string): [boolean, boolean];

        option_get_uint32(opt_name: string): [boolean, number];

        option_set(opt_name: string, variant: GLib.Variant | null): void;

        option_set_boolean(opt_name: string, value: boolean): void;

        option_set_uint32(opt_name: string, value: number): void;

        set_secret_flags(secret_name: string, flags: SettingSecretFlags): boolean;

        to_string(): string;

        verify(connection: Connection | null): boolean;

        verify_secrets(connection: Connection | null): boolean;
    }


    namespace Setting6Lowpan {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            parent: string;
        }
    }

    class Setting6Lowpan extends Setting {
        static $gtype: GObject.GType<Setting6Lowpan>;

        // Properties
        get parent(): string;
        set parent(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Setting6Lowpan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Setting6Lowpan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Setting6Lowpan;

        // Signals
        /** @signal */
        connect<K extends keyof Setting6Lowpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Setting6Lowpan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Setting6Lowpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Setting6Lowpan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Setting6Lowpan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Setting6Lowpan.SignalSignatures[K]>): void;

        // Methods
        get_parent(): string;
    }


    namespace Setting8021x {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::altsubject-matches": (pspec: GObject.ParamSpec) => void;
            "notify::anonymous-identity": (pspec: GObject.ParamSpec) => void;
            "notify::auth-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::ca-cert": (pspec: GObject.ParamSpec) => void;
            "notify::ca-cert-password": (pspec: GObject.ParamSpec) => void;
            "notify::ca-cert-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::ca-path": (pspec: GObject.ParamSpec) => void;
            "notify::client-cert": (pspec: GObject.ParamSpec) => void;
            "notify::client-cert-password": (pspec: GObject.ParamSpec) => void;
            "notify::client-cert-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::domain-match": (pspec: GObject.ParamSpec) => void;
            "notify::domain-suffix-match": (pspec: GObject.ParamSpec) => void;
            "notify::eap": (pspec: GObject.ParamSpec) => void;
            "notify::identity": (pspec: GObject.ParamSpec) => void;
            "notify::openssl-ciphers": (pspec: GObject.ParamSpec) => void;
            "notify::optional": (pspec: GObject.ParamSpec) => void;
            "notify::pac-file": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::password-raw": (pspec: GObject.ParamSpec) => void;
            "notify::password-raw-flags": (pspec: GObject.ParamSpec) => void;
            "notify::phase1-auth-flags": (pspec: GObject.ParamSpec) => void;
            "notify::phase1-fast-provisioning": (pspec: GObject.ParamSpec) => void;
            "notify::phase1-peaplabel": (pspec: GObject.ParamSpec) => void;
            "notify::phase1-peapver": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-altsubject-matches": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-auth": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-autheap": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-ca-cert": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-ca-cert-password": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-ca-cert-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-ca-path": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-client-cert": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-client-cert-password": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-client-cert-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-domain-match": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-domain-suffix-match": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-private-key": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-private-key-password": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-private-key-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::phase2-subject-match": (pspec: GObject.ParamSpec) => void;
            "notify::pin": (pspec: GObject.ParamSpec) => void;
            "notify::pin-flags": (pspec: GObject.ParamSpec) => void;
            "notify::private-key": (pspec: GObject.ParamSpec) => void;
            "notify::private-key-password": (pspec: GObject.ParamSpec) => void;
            "notify::private-key-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::subject-match": (pspec: GObject.ParamSpec) => void;
            "notify::system-ca-certs": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            altsubject_matches: string[];
            altsubjectMatches: string[];
            anonymous_identity: string;
            anonymousIdentity: string;
            auth_timeout: number;
            authTimeout: number;
            ca_cert: GLib.Bytes | Uint8Array;
            caCert: GLib.Bytes | Uint8Array;
            ca_cert_password: string;
            caCertPassword: string;
            ca_cert_password_flags: SettingSecretFlags;
            caCertPasswordFlags: SettingSecretFlags;
            ca_path: string;
            caPath: string;
            client_cert: GLib.Bytes | Uint8Array;
            clientCert: GLib.Bytes | Uint8Array;
            client_cert_password: string;
            clientCertPassword: string;
            client_cert_password_flags: SettingSecretFlags;
            clientCertPasswordFlags: SettingSecretFlags;
            domain_match: string;
            domainMatch: string;
            domain_suffix_match: string;
            domainSuffixMatch: string;
            eap: string[];
            identity: string;
            openssl_ciphers: string;
            opensslCiphers: string;
            optional: boolean;
            pac_file: string;
            pacFile: string;
            password: string;
            password_flags: SettingSecretFlags;
            passwordFlags: SettingSecretFlags;
            password_raw: GLib.Bytes | Uint8Array;
            passwordRaw: GLib.Bytes | Uint8Array;
            password_raw_flags: SettingSecretFlags;
            passwordRawFlags: SettingSecretFlags;
            phase1_auth_flags: number;
            phase1AuthFlags: number;
            phase1_fast_provisioning: string;
            phase1FastProvisioning: string;
            phase1_peaplabel: string;
            phase1Peaplabel: string;
            phase1_peapver: string;
            phase1Peapver: string;
            phase2_altsubject_matches: string[];
            phase2AltsubjectMatches: string[];
            phase2_auth: string;
            phase2Auth: string;
            phase2_autheap: string;
            phase2Autheap: string;
            phase2_ca_cert: GLib.Bytes | Uint8Array;
            phase2CaCert: GLib.Bytes | Uint8Array;
            phase2_ca_cert_password: string;
            phase2CaCertPassword: string;
            phase2_ca_cert_password_flags: SettingSecretFlags;
            phase2CaCertPasswordFlags: SettingSecretFlags;
            phase2_ca_path: string;
            phase2CaPath: string;
            phase2_client_cert: GLib.Bytes | Uint8Array;
            phase2ClientCert: GLib.Bytes | Uint8Array;
            phase2_client_cert_password: string;
            phase2ClientCertPassword: string;
            phase2_client_cert_password_flags: SettingSecretFlags;
            phase2ClientCertPasswordFlags: SettingSecretFlags;
            phase2_domain_match: string;
            phase2DomainMatch: string;
            phase2_domain_suffix_match: string;
            phase2DomainSuffixMatch: string;
            phase2_private_key: GLib.Bytes | Uint8Array;
            phase2PrivateKey: GLib.Bytes | Uint8Array;
            phase2_private_key_password: string;
            phase2PrivateKeyPassword: string;
            phase2_private_key_password_flags: SettingSecretFlags;
            phase2PrivateKeyPasswordFlags: SettingSecretFlags;
            phase2_subject_match: string;
            phase2SubjectMatch: string;
            pin: string;
            pin_flags: SettingSecretFlags;
            pinFlags: SettingSecretFlags;
            private_key: GLib.Bytes | Uint8Array;
            privateKey: GLib.Bytes | Uint8Array;
            private_key_password: string;
            privateKeyPassword: string;
            private_key_password_flags: SettingSecretFlags;
            privateKeyPasswordFlags: SettingSecretFlags;
            subject_match: string;
            subjectMatch: string;
            system_ca_certs: boolean;
            systemCaCerts: boolean;
        }
    }

    class Setting8021x extends Setting {
        static $gtype: GObject.GType<Setting8021x>;

        // Properties
        get altsubject_matches(): string[];
        set altsubject_matches(val: string[]);

        get altsubjectMatches(): string[];
        set altsubjectMatches(val: string[]);

        get anonymous_identity(): string;
        set anonymous_identity(val: string);

        get anonymousIdentity(): string;
        set anonymousIdentity(val: string);

        get auth_timeout(): number;
        set auth_timeout(val: number);

        get authTimeout(): number;
        set authTimeout(val: number);

        get ca_cert(): GLib.Bytes;
        set ca_cert(val: GLib.Bytes | Uint8Array);

        get caCert(): GLib.Bytes;
        set caCert(val: GLib.Bytes | Uint8Array);

        get ca_cert_password(): string;
        set ca_cert_password(val: string);

        get caCertPassword(): string;
        set caCertPassword(val: string);

        get ca_cert_password_flags(): SettingSecretFlags;
        set ca_cert_password_flags(val: SettingSecretFlags);

        get caCertPasswordFlags(): SettingSecretFlags;
        set caCertPasswordFlags(val: SettingSecretFlags);

        get ca_path(): string;
        set ca_path(val: string);

        get caPath(): string;
        set caPath(val: string);

        get client_cert(): GLib.Bytes;
        set client_cert(val: GLib.Bytes | Uint8Array);

        get clientCert(): GLib.Bytes;
        set clientCert(val: GLib.Bytes | Uint8Array);

        get client_cert_password(): string;
        set client_cert_password(val: string);

        get clientCertPassword(): string;
        set clientCertPassword(val: string);

        get client_cert_password_flags(): SettingSecretFlags;
        set client_cert_password_flags(val: SettingSecretFlags);

        get clientCertPasswordFlags(): SettingSecretFlags;
        set clientCertPasswordFlags(val: SettingSecretFlags);

        get domain_match(): string;
        set domain_match(val: string);

        get domainMatch(): string;
        set domainMatch(val: string);

        get domain_suffix_match(): string;
        set domain_suffix_match(val: string);

        get domainSuffixMatch(): string;
        set domainSuffixMatch(val: string);

        get eap(): string[];
        set eap(val: string[]);

        get identity(): string;
        set identity(val: string);

        get openssl_ciphers(): string;
        set openssl_ciphers(val: string);

        get opensslCiphers(): string;
        set opensslCiphers(val: string);

        get optional(): boolean;
        set optional(val: boolean);

        get pac_file(): string;
        set pac_file(val: string);

        get pacFile(): string;
        set pacFile(val: string);

        get password(): string;
        set password(val: string);

        get password_flags(): SettingSecretFlags;
        set password_flags(val: SettingSecretFlags);

        get passwordFlags(): SettingSecretFlags;
        set passwordFlags(val: SettingSecretFlags);

        get password_raw(): GLib.Bytes;
        set password_raw(val: GLib.Bytes | Uint8Array);

        get passwordRaw(): GLib.Bytes;
        set passwordRaw(val: GLib.Bytes | Uint8Array);

        get password_raw_flags(): SettingSecretFlags;
        set password_raw_flags(val: SettingSecretFlags);

        get passwordRawFlags(): SettingSecretFlags;
        set passwordRawFlags(val: SettingSecretFlags);

        get phase1_auth_flags(): number;
        set phase1_auth_flags(val: number);

        get phase1AuthFlags(): number;
        set phase1AuthFlags(val: number);

        get phase1_fast_provisioning(): string;
        set phase1_fast_provisioning(val: string);

        get phase1FastProvisioning(): string;
        set phase1FastProvisioning(val: string);

        get phase1_peaplabel(): string;
        set phase1_peaplabel(val: string);

        get phase1Peaplabel(): string;
        set phase1Peaplabel(val: string);

        get phase1_peapver(): string;
        set phase1_peapver(val: string);

        get phase1Peapver(): string;
        set phase1Peapver(val: string);

        get phase2_altsubject_matches(): string[];
        set phase2_altsubject_matches(val: string[]);

        get phase2AltsubjectMatches(): string[];
        set phase2AltsubjectMatches(val: string[]);

        get phase2_auth(): string;
        set phase2_auth(val: string);

        get phase2Auth(): string;
        set phase2Auth(val: string);

        get phase2_autheap(): string;
        set phase2_autheap(val: string);

        get phase2Autheap(): string;
        set phase2Autheap(val: string);

        get phase2_ca_cert(): GLib.Bytes;
        set phase2_ca_cert(val: GLib.Bytes | Uint8Array);

        get phase2CaCert(): GLib.Bytes;
        set phase2CaCert(val: GLib.Bytes | Uint8Array);

        get phase2_ca_cert_password(): string;
        set phase2_ca_cert_password(val: string);

        get phase2CaCertPassword(): string;
        set phase2CaCertPassword(val: string);

        get phase2_ca_cert_password_flags(): SettingSecretFlags;
        set phase2_ca_cert_password_flags(val: SettingSecretFlags);

        get phase2CaCertPasswordFlags(): SettingSecretFlags;
        set phase2CaCertPasswordFlags(val: SettingSecretFlags);

        get phase2_ca_path(): string;
        set phase2_ca_path(val: string);

        get phase2CaPath(): string;
        set phase2CaPath(val: string);

        get phase2_client_cert(): GLib.Bytes;
        set phase2_client_cert(val: GLib.Bytes | Uint8Array);

        get phase2ClientCert(): GLib.Bytes;
        set phase2ClientCert(val: GLib.Bytes | Uint8Array);

        get phase2_client_cert_password(): string;
        set phase2_client_cert_password(val: string);

        get phase2ClientCertPassword(): string;
        set phase2ClientCertPassword(val: string);

        get phase2_client_cert_password_flags(): SettingSecretFlags;
        set phase2_client_cert_password_flags(val: SettingSecretFlags);

        get phase2ClientCertPasswordFlags(): SettingSecretFlags;
        set phase2ClientCertPasswordFlags(val: SettingSecretFlags);

        get phase2_domain_match(): string;
        set phase2_domain_match(val: string);

        get phase2DomainMatch(): string;
        set phase2DomainMatch(val: string);

        get phase2_domain_suffix_match(): string;
        set phase2_domain_suffix_match(val: string);

        get phase2DomainSuffixMatch(): string;
        set phase2DomainSuffixMatch(val: string);

        get phase2_private_key(): GLib.Bytes;
        set phase2_private_key(val: GLib.Bytes | Uint8Array);

        get phase2PrivateKey(): GLib.Bytes;
        set phase2PrivateKey(val: GLib.Bytes | Uint8Array);

        get phase2_private_key_password(): string;
        set phase2_private_key_password(val: string);

        get phase2PrivateKeyPassword(): string;
        set phase2PrivateKeyPassword(val: string);

        get phase2_private_key_password_flags(): SettingSecretFlags;
        set phase2_private_key_password_flags(val: SettingSecretFlags);

        get phase2PrivateKeyPasswordFlags(): SettingSecretFlags;
        set phase2PrivateKeyPasswordFlags(val: SettingSecretFlags);

        get phase2_subject_match(): string;
        set phase2_subject_match(val: string);

        get phase2SubjectMatch(): string;
        set phase2SubjectMatch(val: string);

        get pin(): string;
        set pin(val: string);

        get pin_flags(): SettingSecretFlags;
        set pin_flags(val: SettingSecretFlags);

        get pinFlags(): SettingSecretFlags;
        set pinFlags(val: SettingSecretFlags);

        get private_key(): GLib.Bytes;
        set private_key(val: GLib.Bytes | Uint8Array);

        get privateKey(): GLib.Bytes;
        set privateKey(val: GLib.Bytes | Uint8Array);

        get private_key_password(): string;
        set private_key_password(val: string);

        get privateKeyPassword(): string;
        set privateKeyPassword(val: string);

        get private_key_password_flags(): SettingSecretFlags;
        set private_key_password_flags(val: SettingSecretFlags);

        get privateKeyPasswordFlags(): SettingSecretFlags;
        set privateKeyPasswordFlags(val: SettingSecretFlags);

        get subject_match(): string;
        set subject_match(val: string);

        get subjectMatch(): string;
        set subjectMatch(val: string);

        get system_ca_certs(): boolean;
        set system_ca_certs(val: boolean);

        get systemCaCerts(): boolean;
        set systemCaCerts(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Setting8021x.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Setting8021x.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Setting8021x;

        // Signals
        /** @signal */
        connect<K extends keyof Setting8021x.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Setting8021x.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Setting8021x.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Setting8021x.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Setting8021x.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Setting8021x.SignalSignatures[K]>): void;

        // Static methods
        static check_cert_scheme(pdata: null, length: bigint | number): Setting8021xCKScheme;

        // Methods
        add_altsubject_match(altsubject_match: string): boolean;

        add_eap_method(eap: string): boolean;

        add_phase2_altsubject_match(phase2_altsubject_match: string): boolean;

        clear_altsubject_matches(): void;

        clear_eap_methods(): void;

        clear_phase2_altsubject_matches(): void;

        get_altsubject_match(i: number): string;

        get_anonymous_identity(): string;

        get_auth_timeout(): number;

        get_ca_cert_blob(): GLib.Bytes;

        get_ca_cert_password(): string;

        get_ca_cert_password_flags(): SettingSecretFlags;

        get_ca_cert_path(): string;

        get_ca_cert_scheme(): Setting8021xCKScheme;

        get_ca_cert_uri(): string;

        get_ca_path(): string;

        get_client_cert_blob(): GLib.Bytes;

        get_client_cert_password(): string;

        get_client_cert_password_flags(): SettingSecretFlags;

        get_client_cert_path(): string;

        get_client_cert_scheme(): Setting8021xCKScheme;

        get_client_cert_uri(): string;

        get_domain_match(): string;

        get_domain_suffix_match(): string;

        get_eap_method(i: number): string;

        get_identity(): string;

        get_num_altsubject_matches(): number;

        get_num_eap_methods(): number;

        get_num_phase2_altsubject_matches(): number;

        get_openssl_ciphers(): string;

        get_optional(): boolean;

        get_pac_file(): string;

        get_password(): string;

        get_password_flags(): SettingSecretFlags;

        get_password_raw(): GLib.Bytes;

        get_password_raw_flags(): SettingSecretFlags;

        get_phase1_auth_flags(): Setting8021xAuthFlags;

        get_phase1_fast_provisioning(): string;

        get_phase1_peaplabel(): string;

        get_phase1_peapver(): string;

        get_phase2_altsubject_match(i: number): string;

        get_phase2_auth(): string;

        get_phase2_autheap(): string;

        get_phase2_ca_cert_blob(): GLib.Bytes;

        get_phase2_ca_cert_password(): string;

        get_phase2_ca_cert_password_flags(): SettingSecretFlags;

        get_phase2_ca_cert_path(): string;

        get_phase2_ca_cert_scheme(): Setting8021xCKScheme;

        get_phase2_ca_cert_uri(): string;

        get_phase2_ca_path(): string;

        get_phase2_client_cert_blob(): GLib.Bytes;

        get_phase2_client_cert_password(): string;

        get_phase2_client_cert_password_flags(): SettingSecretFlags;

        get_phase2_client_cert_path(): string;

        get_phase2_client_cert_scheme(): Setting8021xCKScheme;

        get_phase2_client_cert_uri(): string;

        get_phase2_domain_match(): string;

        get_phase2_domain_suffix_match(): string;

        get_phase2_private_key_blob(): GLib.Bytes;

        get_phase2_private_key_format(): Setting8021xCKFormat;

        get_phase2_private_key_password(): string;

        get_phase2_private_key_password_flags(): SettingSecretFlags;

        get_phase2_private_key_path(): string;

        get_phase2_private_key_scheme(): Setting8021xCKScheme;

        get_phase2_private_key_uri(): string;

        get_phase2_subject_match(): string;

        get_pin(): string;

        get_pin_flags(): SettingSecretFlags;

        get_private_key_blob(): GLib.Bytes;

        get_private_key_format(): Setting8021xCKFormat;

        get_private_key_password(): string;

        get_private_key_password_flags(): SettingSecretFlags;

        get_private_key_path(): string;

        get_private_key_scheme(): Setting8021xCKScheme;

        get_private_key_uri(): string;

        get_subject_match(): string;

        get_system_ca_certs(): boolean;

        remove_altsubject_match(i: number): void;

        remove_altsubject_match_by_value(altsubject_match: string): boolean;

        remove_eap_method(i: number): void;

        remove_eap_method_by_value(eap: string): boolean;

        remove_phase2_altsubject_match(i: number): void;

        remove_phase2_altsubject_match_by_value(phase2_altsubject_match: string): boolean;

        set_ca_cert(value: string, scheme: Setting8021xCKScheme, out_format: Setting8021xCKFormat): boolean;

        set_client_cert(value: string, scheme: Setting8021xCKScheme, out_format: Setting8021xCKFormat): boolean;

        set_phase2_ca_cert(value: string, scheme: Setting8021xCKScheme, out_format: Setting8021xCKFormat): boolean;

        set_phase2_client_cert(value: string, scheme: Setting8021xCKScheme, out_format: Setting8021xCKFormat): boolean;

        set_phase2_private_key(value: string, password: string, scheme: Setting8021xCKScheme, out_format: Setting8021xCKFormat): boolean;

        set_private_key(value: string, password: string, scheme: Setting8021xCKScheme, out_format: Setting8021xCKFormat): boolean;
    }


    namespace SettingAdsl {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::encapsulation": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
            "notify::vci": (pspec: GObject.ParamSpec) => void;
            "notify::vpi": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            encapsulation: string;
            password: string;
            password_flags: SettingSecretFlags;
            passwordFlags: SettingSecretFlags;
            protocol: string;
            username: string;
            vci: number;
            vpi: number;
        }
    }

    class SettingAdsl extends Setting {
        static $gtype: GObject.GType<SettingAdsl>;

        // Properties
        get encapsulation(): string;
        set encapsulation(val: string);

        get password(): string;
        set password(val: string);

        get password_flags(): SettingSecretFlags;
        set password_flags(val: SettingSecretFlags);

        get passwordFlags(): SettingSecretFlags;
        set passwordFlags(val: SettingSecretFlags);

        get protocol(): string;
        set protocol(val: string);

        get username(): string;
        set username(val: string);

        get vci(): number;
        set vci(val: number);

        get vpi(): number;
        set vpi(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingAdsl.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingAdsl.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingAdsl;

        // Signals
        /** @signal */
        connect<K extends keyof SettingAdsl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingAdsl.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingAdsl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingAdsl.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingAdsl.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingAdsl.SignalSignatures[K]>): void;

        // Methods
        get_encapsulation(): string;

        get_password(): string;

        get_password_flags(): SettingSecretFlags;

        get_protocol(): string;

        get_username(): string;

        get_vci(): number;

        get_vpi(): number;
    }


    namespace SettingBluetooth {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::bdaddr": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            bdaddr: string;
            type: string;
        }
    }

    class SettingBluetooth extends Setting {
        static $gtype: GObject.GType<SettingBluetooth>;

        // Properties
        get bdaddr(): string;
        set bdaddr(val: string);

        get type(): string;
        set type(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingBluetooth.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingBluetooth.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingBluetooth;

        // Signals
        /** @signal */
        connect<K extends keyof SettingBluetooth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBluetooth.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingBluetooth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBluetooth.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingBluetooth.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingBluetooth.SignalSignatures[K]>): void;

        // Methods
        get_bdaddr(): string;

        get_connection_type(): string;
    }


    namespace SettingBond {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::options": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            options: { [key: string]: string };
        }
    }

    class SettingBond extends Setting {
        static $gtype: GObject.GType<SettingBond>;

        // Properties
        get options(): { [key: string]: string };
        set options(val: { [key: string]: string });

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingBond.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingBond.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingBond;

        // Signals
        /** @signal */
        connect<K extends keyof SettingBond.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBond.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingBond.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBond.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingBond.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingBond.SignalSignatures[K]>): void;

        // Static methods
        static validate_option(name: string, value: string | null): boolean;

        // Methods
        add_option(name: string, value: string): boolean;

        get_num_options(): number;

        get_option(idx: number): [boolean, string, string];

        get_option_by_name(name: string): string;

        get_option_default(name: string): string;

        get_option_normalized(name: string): string;

        get_valid_options(): string[] | null;

        remove_option(name: string): boolean;
    }


    namespace SettingBondPort {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::prio": (pspec: GObject.ParamSpec) => void;
            "notify::queue-id": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            prio: number;
            queue_id: number;
            queueId: number;
        }
    }

    class SettingBondPort extends Setting {
        static $gtype: GObject.GType<SettingBondPort>;

        // Properties
        get prio(): number;
        set prio(val: number);

        get queue_id(): number;
        set queue_id(val: number);

        get queueId(): number;
        set queueId(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingBondPort.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingBondPort.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingBondPort;

        // Signals
        /** @signal */
        connect<K extends keyof SettingBondPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBondPort.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingBondPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBondPort.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingBondPort.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingBondPort.SignalSignatures[K]>): void;

        // Methods
        get_prio(): number;

        get_queue_id(): number;
    }


    namespace SettingBridge {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::ageing-time": (pspec: GObject.ParamSpec) => void;
            "notify::forward-delay": (pspec: GObject.ParamSpec) => void;
            "notify::group-address": (pspec: GObject.ParamSpec) => void;
            "notify::group-forward-mask": (pspec: GObject.ParamSpec) => void;
            "notify::hello-time": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::max-age": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-hash-max": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-last-member-count": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-last-member-interval": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-membership-interval": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-querier": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-querier-interval": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-query-interval": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-query-response-interval": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-query-use-ifaddr": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-router": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-snooping": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-startup-query-count": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-startup-query-interval": (pspec: GObject.ParamSpec) => void;
            "notify::priority": (pspec: GObject.ParamSpec) => void;
            "notify::stp": (pspec: GObject.ParamSpec) => void;
            "notify::vlan-default-pvid": (pspec: GObject.ParamSpec) => void;
            "notify::vlan-filtering": (pspec: GObject.ParamSpec) => void;
            "notify::vlan-protocol": (pspec: GObject.ParamSpec) => void;
            "notify::vlan-stats-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::vlans": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            ageing_time: number;
            ageingTime: number;
            forward_delay: number;
            forwardDelay: number;
            group_address: string;
            groupAddress: string;
            group_forward_mask: number;
            groupForwardMask: number;
            hello_time: number;
            helloTime: number;
            mac_address: string;
            macAddress: string;
            max_age: number;
            maxAge: number;
            multicast_hash_max: number;
            multicastHashMax: number;
            multicast_last_member_count: number;
            multicastLastMemberCount: number;
            multicast_last_member_interval: bigint | number;
            multicastLastMemberInterval: bigint | number;
            multicast_membership_interval: bigint | number;
            multicastMembershipInterval: bigint | number;
            multicast_querier: boolean;
            multicastQuerier: boolean;
            multicast_querier_interval: bigint | number;
            multicastQuerierInterval: bigint | number;
            multicast_query_interval: bigint | number;
            multicastQueryInterval: bigint | number;
            multicast_query_response_interval: bigint | number;
            multicastQueryResponseInterval: bigint | number;
            multicast_query_use_ifaddr: boolean;
            multicastQueryUseIfaddr: boolean;
            multicast_router: string;
            multicastRouter: string;
            multicast_snooping: boolean;
            multicastSnooping: boolean;
            multicast_startup_query_count: number;
            multicastStartupQueryCount: number;
            multicast_startup_query_interval: bigint | number;
            multicastStartupQueryInterval: bigint | number;
            priority: number;
            stp: boolean;
            vlan_default_pvid: number;
            vlanDefaultPvid: number;
            vlan_filtering: boolean;
            vlanFiltering: boolean;
            vlan_protocol: string;
            vlanProtocol: string;
            vlan_stats_enabled: boolean;
            vlanStatsEnabled: boolean;
            vlans: BridgeVlan[];
        }
    }

    class SettingBridge extends Setting {
        static $gtype: GObject.GType<SettingBridge>;

        // Properties
        get ageing_time(): number;
        set ageing_time(val: number);

        get ageingTime(): number;
        set ageingTime(val: number);

        get forward_delay(): number;
        set forward_delay(val: number);

        get forwardDelay(): number;
        set forwardDelay(val: number);

        get group_address(): string;
        set group_address(val: string);

        get groupAddress(): string;
        set groupAddress(val: string);

        get group_forward_mask(): number;
        set group_forward_mask(val: number);

        get groupForwardMask(): number;
        set groupForwardMask(val: number);

        get hello_time(): number;
        set hello_time(val: number);

        get helloTime(): number;
        set helloTime(val: number);

        get mac_address(): string;
        set mac_address(val: string);

        get macAddress(): string;
        set macAddress(val: string);

        get max_age(): number;
        set max_age(val: number);

        get maxAge(): number;
        set maxAge(val: number);

        get multicast_hash_max(): number;
        set multicast_hash_max(val: number);

        get multicastHashMax(): number;
        set multicastHashMax(val: number);

        get multicast_last_member_count(): number;
        set multicast_last_member_count(val: number);

        get multicastLastMemberCount(): number;
        set multicastLastMemberCount(val: number);

        get multicast_last_member_interval(): number;
        set multicast_last_member_interval(val: bigint | number);

        get multicastLastMemberInterval(): number;
        set multicastLastMemberInterval(val: bigint | number);

        get multicast_membership_interval(): number;
        set multicast_membership_interval(val: bigint | number);

        get multicastMembershipInterval(): number;
        set multicastMembershipInterval(val: bigint | number);

        get multicast_querier(): boolean;
        set multicast_querier(val: boolean);

        get multicastQuerier(): boolean;
        set multicastQuerier(val: boolean);

        get multicast_querier_interval(): number;
        set multicast_querier_interval(val: bigint | number);

        get multicastQuerierInterval(): number;
        set multicastQuerierInterval(val: bigint | number);

        get multicast_query_interval(): number;
        set multicast_query_interval(val: bigint | number);

        get multicastQueryInterval(): number;
        set multicastQueryInterval(val: bigint | number);

        get multicast_query_response_interval(): number;
        set multicast_query_response_interval(val: bigint | number);

        get multicastQueryResponseInterval(): number;
        set multicastQueryResponseInterval(val: bigint | number);

        get multicast_query_use_ifaddr(): boolean;
        set multicast_query_use_ifaddr(val: boolean);

        get multicastQueryUseIfaddr(): boolean;
        set multicastQueryUseIfaddr(val: boolean);

        get multicast_router(): string;
        set multicast_router(val: string);

        get multicastRouter(): string;
        set multicastRouter(val: string);

        get multicast_snooping(): boolean;
        set multicast_snooping(val: boolean);

        get multicastSnooping(): boolean;
        set multicastSnooping(val: boolean);

        get multicast_startup_query_count(): number;
        set multicast_startup_query_count(val: number);

        get multicastStartupQueryCount(): number;
        set multicastStartupQueryCount(val: number);

        get multicast_startup_query_interval(): number;
        set multicast_startup_query_interval(val: bigint | number);

        get multicastStartupQueryInterval(): number;
        set multicastStartupQueryInterval(val: bigint | number);

        get priority(): number;
        set priority(val: number);

        get stp(): boolean;
        set stp(val: boolean);

        get vlan_default_pvid(): number;
        set vlan_default_pvid(val: number);

        get vlanDefaultPvid(): number;
        set vlanDefaultPvid(val: number);

        get vlan_filtering(): boolean;
        set vlan_filtering(val: boolean);

        get vlanFiltering(): boolean;
        set vlanFiltering(val: boolean);

        get vlan_protocol(): string;
        set vlan_protocol(val: string);

        get vlanProtocol(): string;
        set vlanProtocol(val: string);

        get vlan_stats_enabled(): boolean;
        set vlan_stats_enabled(val: boolean);

        get vlanStatsEnabled(): boolean;
        set vlanStatsEnabled(val: boolean);

        get vlans(): BridgeVlan[];
        set vlans(val: BridgeVlan[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingBridge.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingBridge.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingBridge;

        // Signals
        /** @signal */
        connect<K extends keyof SettingBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBridge.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBridge.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingBridge.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingBridge.SignalSignatures[K]>): void;

        // Methods
        add_vlan(vlan: BridgeVlan): void;

        clear_vlans(): void;

        get_ageing_time(): number;

        get_forward_delay(): number;

        get_group_address(): string;

        get_group_forward_mask(): number;

        get_hello_time(): number;

        get_mac_address(): string;

        get_max_age(): number;

        get_multicast_hash_max(): number;

        get_multicast_last_member_count(): number;

        get_multicast_last_member_interval(): number;

        get_multicast_membership_interval(): number;

        get_multicast_querier(): boolean;

        get_multicast_querier_interval(): number;

        get_multicast_query_interval(): number;

        get_multicast_query_response_interval(): number;

        get_multicast_query_use_ifaddr(): boolean;

        get_multicast_router(): string;

        get_multicast_snooping(): boolean;

        get_multicast_startup_query_count(): number;

        get_multicast_startup_query_interval(): number;

        get_num_vlans(): number;

        get_priority(): number;

        get_stp(): boolean;

        get_vlan(idx: number): BridgeVlan;

        get_vlan_default_pvid(): number;

        get_vlan_filtering(): boolean;

        get_vlan_protocol(): string;

        get_vlan_stats_enabled(): boolean;

        remove_vlan(idx: number): void;

        remove_vlan_by_vid(vid_start: number, vid_end: number): boolean;
    }


    namespace SettingBridgePort {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::hairpin-mode": (pspec: GObject.ParamSpec) => void;
            "notify::path-cost": (pspec: GObject.ParamSpec) => void;
            "notify::priority": (pspec: GObject.ParamSpec) => void;
            "notify::vlans": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            hairpin_mode: boolean;
            hairpinMode: boolean;
            path_cost: number;
            pathCost: number;
            priority: number;
            vlans: BridgeVlan[];
        }
    }

    class SettingBridgePort extends Setting {
        static $gtype: GObject.GType<SettingBridgePort>;

        // Properties
        get hairpin_mode(): boolean;
        set hairpin_mode(val: boolean);

        get hairpinMode(): boolean;
        set hairpinMode(val: boolean);

        get path_cost(): number;
        set path_cost(val: number);

        get pathCost(): number;
        set pathCost(val: number);

        get priority(): number;
        set priority(val: number);

        get vlans(): BridgeVlan[];
        set vlans(val: BridgeVlan[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingBridgePort.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingBridgePort.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingBridgePort;

        // Signals
        /** @signal */
        connect<K extends keyof SettingBridgePort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBridgePort.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingBridgePort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingBridgePort.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingBridgePort.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingBridgePort.SignalSignatures[K]>): void;

        // Methods
        add_vlan(vlan: BridgeVlan): void;

        clear_vlans(): void;

        get_hairpin_mode(): boolean;

        get_num_vlans(): number;

        get_path_cost(): number;

        get_priority(): number;

        get_vlan(idx: number): BridgeVlan;

        remove_vlan(idx: number): void;

        remove_vlan_by_vid(vid_start: number, vid_end: number): boolean;
    }


    namespace SettingCdma {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::number": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            mtu: number;
            number: string;
            password: string;
            password_flags: SettingSecretFlags;
            passwordFlags: SettingSecretFlags;
            username: string;
        }
    }

    class SettingCdma extends Setting {
        static $gtype: GObject.GType<SettingCdma>;

        // Properties
        get mtu(): number;
        set mtu(val: number);

        get number(): string;
        set number(val: string);

        get password(): string;
        set password(val: string);

        get password_flags(): SettingSecretFlags;
        set password_flags(val: SettingSecretFlags);

        get passwordFlags(): SettingSecretFlags;
        set passwordFlags(val: SettingSecretFlags);

        get username(): string;
        set username(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingCdma.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingCdma.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingCdma;

        // Signals
        /** @signal */
        connect<K extends keyof SettingCdma.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingCdma.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingCdma.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingCdma.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingCdma.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingCdma.SignalSignatures[K]>): void;

        // Methods
        get_mtu(): number;

        get_number(): string;

        get_password(): string;

        get_password_flags(): SettingSecretFlags;

        get_username(): string;
    }


    namespace SettingConnection {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::auth-retries": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect-ports": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect-priority": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect-retries": (pspec: GObject.ParamSpec) => void;
            "notify::autoconnect-slaves": (pspec: GObject.ParamSpec) => void;
            "notify::controller": (pspec: GObject.ParamSpec) => void;
            "notify::dns-over-tls": (pspec: GObject.ParamSpec) => void;
            "notify::dnssec": (pspec: GObject.ParamSpec) => void;
            "notify::down-on-poweroff": (pspec: GObject.ParamSpec) => void;
            "notify::gateway-ping-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::ip-ping-addresses": (pspec: GObject.ParamSpec) => void;
            "notify::ip-ping-addresses-require-all": (pspec: GObject.ParamSpec) => void;
            "notify::ip-ping-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::lldp": (pspec: GObject.ParamSpec) => void;
            "notify::llmnr": (pspec: GObject.ParamSpec) => void;
            "notify::master": (pspec: GObject.ParamSpec) => void;
            "notify::mdns": (pspec: GObject.ParamSpec) => void;
            "notify::metered": (pspec: GObject.ParamSpec) => void;
            "notify::mptcp-flags": (pspec: GObject.ParamSpec) => void;
            "notify::mud-url": (pspec: GObject.ParamSpec) => void;
            "notify::multi-connect": (pspec: GObject.ParamSpec) => void;
            "notify::permissions": (pspec: GObject.ParamSpec) => void;
            "notify::port-type": (pspec: GObject.ParamSpec) => void;
            "notify::read-only": (pspec: GObject.ParamSpec) => void;
            "notify::secondaries": (pspec: GObject.ParamSpec) => void;
            "notify::slave-type": (pspec: GObject.ParamSpec) => void;
            "notify::stable-id": (pspec: GObject.ParamSpec) => void;
            "notify::timestamp": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
            "notify::uuid": (pspec: GObject.ParamSpec) => void;
            "notify::wait-activation-delay": (pspec: GObject.ParamSpec) => void;
            "notify::wait-device-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::zone": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            auth_retries: number;
            authRetries: number;
            autoconnect: boolean;
            autoconnect_ports: number;
            autoconnectPorts: number;
            autoconnect_priority: number;
            autoconnectPriority: number;
            autoconnect_retries: number;
            autoconnectRetries: number;
            autoconnect_slaves: SettingConnectionAutoconnectSlaves;
            autoconnectSlaves: SettingConnectionAutoconnectSlaves;
            controller: string;
            dns_over_tls: number;
            dnsOverTls: number;
            dnssec: number;
            down_on_poweroff: number;
            downOnPoweroff: number;
            gateway_ping_timeout: number;
            gatewayPingTimeout: number;
            id: string;
            interface_name: string;
            interfaceName: string;
            ip_ping_addresses: string[];
            ipPingAddresses: string[];
            ip_ping_addresses_require_all: number;
            ipPingAddressesRequireAll: number;
            ip_ping_timeout: number;
            ipPingTimeout: number;
            lldp: number;
            llmnr: number;
            master: string;
            mdns: number;
            metered: Metered;
            mptcp_flags: number;
            mptcpFlags: number;
            mud_url: string;
            mudUrl: string;
            multi_connect: number;
            multiConnect: number;
            permissions: string[];
            port_type: string;
            portType: string;
            read_only: boolean;
            readOnly: boolean;
            secondaries: string[];
            slave_type: string;
            slaveType: string;
            stable_id: string;
            stableId: string;
            timestamp: bigint | number;
            type: string;
            uuid: string;
            wait_activation_delay: number;
            waitActivationDelay: number;
            wait_device_timeout: number;
            waitDeviceTimeout: number;
            zone: string;
        }
    }

    class SettingConnection extends Setting {
        static $gtype: GObject.GType<SettingConnection>;

        // Properties
        get auth_retries(): number;
        set auth_retries(val: number);

        get authRetries(): number;
        set authRetries(val: number);

        get autoconnect(): boolean;
        set autoconnect(val: boolean);

        get autoconnect_ports(): number;
        set autoconnect_ports(val: number);

        get autoconnectPorts(): number;
        set autoconnectPorts(val: number);

        get autoconnect_priority(): number;
        set autoconnect_priority(val: number);

        get autoconnectPriority(): number;
        set autoconnectPriority(val: number);

        get autoconnect_retries(): number;
        set autoconnect_retries(val: number);

        get autoconnectRetries(): number;
        set autoconnectRetries(val: number);

        get autoconnect_slaves(): SettingConnectionAutoconnectSlaves;
        set autoconnect_slaves(val: SettingConnectionAutoconnectSlaves);

        get autoconnectSlaves(): SettingConnectionAutoconnectSlaves;
        set autoconnectSlaves(val: SettingConnectionAutoconnectSlaves);

        get controller(): string;
        set controller(val: string);

        get dns_over_tls(): number;
        set dns_over_tls(val: number);

        get dnsOverTls(): number;
        set dnsOverTls(val: number);

        get dnssec(): number;
        set dnssec(val: number);

        get down_on_poweroff(): number;
        set down_on_poweroff(val: number);

        get downOnPoweroff(): number;
        set downOnPoweroff(val: number);

        get gateway_ping_timeout(): number;
        set gateway_ping_timeout(val: number);

        get gatewayPingTimeout(): number;
        set gatewayPingTimeout(val: number);

        get id(): string;
        set id(val: string);

        get interface_name(): string;
        set interface_name(val: string);

        get interfaceName(): string;
        set interfaceName(val: string);

        get ip_ping_addresses(): string[];
        set ip_ping_addresses(val: string[]);

        get ipPingAddresses(): string[];
        set ipPingAddresses(val: string[]);

        get ip_ping_addresses_require_all(): number;
        set ip_ping_addresses_require_all(val: number);

        get ipPingAddressesRequireAll(): number;
        set ipPingAddressesRequireAll(val: number);

        get ip_ping_timeout(): number;
        set ip_ping_timeout(val: number);

        get ipPingTimeout(): number;
        set ipPingTimeout(val: number);

        get lldp(): number;
        set lldp(val: number);

        get llmnr(): number;
        set llmnr(val: number);

        get master(): string;
        set master(val: string);

        get mdns(): number;
        set mdns(val: number);

        get metered(): Metered;
        set metered(val: Metered);

        get mptcp_flags(): number;
        set mptcp_flags(val: number);

        get mptcpFlags(): number;
        set mptcpFlags(val: number);

        get mud_url(): string;
        set mud_url(val: string);

        get mudUrl(): string;
        set mudUrl(val: string);

        get multi_connect(): number;
        set multi_connect(val: number);

        get multiConnect(): number;
        set multiConnect(val: number);

        get permissions(): string[];
        set permissions(val: string[]);

        get port_type(): string;
        set port_type(val: string);

        get portType(): string;
        set portType(val: string);

        get read_only(): boolean;
        set read_only(val: boolean);

        get readOnly(): boolean;
        set readOnly(val: boolean);

        get secondaries(): string[];
        set secondaries(val: string[]);

        get slave_type(): string;
        set slave_type(val: string);

        get slaveType(): string;
        set slaveType(val: string);

        get stable_id(): string;
        set stable_id(val: string);

        get stableId(): string;
        set stableId(val: string);

        get timestamp(): number;
        set timestamp(val: bigint | number);

        get type(): string;
        set type(val: string);

        get uuid(): string;
        set uuid(val: string);

        get wait_activation_delay(): number;
        set wait_activation_delay(val: number);

        get waitActivationDelay(): number;
        set waitActivationDelay(val: number);

        get wait_device_timeout(): number;
        set wait_device_timeout(val: number);

        get waitDeviceTimeout(): number;
        set waitDeviceTimeout(val: number);

        get zone(): string;
        set zone(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingConnection;

        // Signals
        /** @signal */
        connect<K extends keyof SettingConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingConnection.SignalSignatures[K]>): void;

        // Methods
        add_ip_ping_address(address: string): boolean;

        add_permission(ptype: string, pitem: string, detail: string | null): boolean;

        add_secondary(sec_uuid: string): boolean;

        clear_ip_ping_addresses(): void;

        get_auth_retries(): number;

        get_autoconnect(): boolean;

        get_autoconnect_ports(): Ternary;

        get_autoconnect_priority(): number;

        get_autoconnect_retries(): number;

        get_autoconnect_slaves(): SettingConnectionAutoconnectSlaves;

        get_connection_type(): string;

        get_controller(): string;

        get_dns_over_tls(): SettingConnectionDnsOverTls;

        get_dnssec(): SettingConnectionDnssec;

        get_down_on_poweroff(): SettingConnectionDownOnPoweroff;

        get_gateway_ping_timeout(): number;

        get_id(): string;

        get_interface_name(): string;

        get_ip_ping_address(idx: number): string;

        get_ip_ping_addresses_require_all(): Ternary;

        get_ip_ping_timeout(): number;

        get_lldp(): SettingConnectionLldp;

        get_llmnr(): SettingConnectionLlmnr;

        get_master(): string;

        get_mdns(): SettingConnectionMdns;

        get_metered(): Metered;

        get_mptcp_flags(): MptcpFlags;

        get_mud_url(): string;

        get_multi_connect(): ConnectionMultiConnect;

        get_num_permissions(): number;

        get_num_secondaries(): number;

        get_permission(idx: number, out_ptype: string, out_pitem: string, out_detail: string): boolean;

        get_port_type(): string;

        get_read_only(): boolean;

        get_secondary(idx: number): string;

        get_slave_type(): string;

        get_stable_id(): string;

        get_timestamp(): number;

        get_uuid(): string;

        get_wait_activation_delay(): number;

        get_wait_device_timeout(): number;

        get_zone(): string;

        is_slave_type(type: string): boolean;

        permissions_user_allowed(uname: string): boolean;

        remove_ip_ping_address(idx: number): void;

        remove_ip_ping_address_by_value(address: string): boolean;

        remove_permission(idx: number): void;

        remove_permission_by_value(ptype: string, pitem: string, detail: string | null): boolean;

        remove_secondary(idx: number): void;

        remove_secondary_by_value(sec_uuid: string): boolean;
    }


    namespace SettingDcb {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::app-fcoe-flags": (pspec: GObject.ParamSpec) => void;
            "notify::app-fcoe-mode": (pspec: GObject.ParamSpec) => void;
            "notify::app-fcoe-priority": (pspec: GObject.ParamSpec) => void;
            "notify::app-fip-flags": (pspec: GObject.ParamSpec) => void;
            "notify::app-fip-priority": (pspec: GObject.ParamSpec) => void;
            "notify::app-iscsi-flags": (pspec: GObject.ParamSpec) => void;
            "notify::app-iscsi-priority": (pspec: GObject.ParamSpec) => void;
            "notify::priority-bandwidth": (pspec: GObject.ParamSpec) => void;
            "notify::priority-flow-control": (pspec: GObject.ParamSpec) => void;
            "notify::priority-flow-control-flags": (pspec: GObject.ParamSpec) => void;
            "notify::priority-group-bandwidth": (pspec: GObject.ParamSpec) => void;
            "notify::priority-group-flags": (pspec: GObject.ParamSpec) => void;
            "notify::priority-group-id": (pspec: GObject.ParamSpec) => void;
            "notify::priority-strict-bandwidth": (pspec: GObject.ParamSpec) => void;
            "notify::priority-traffic-class": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            app_fcoe_flags: SettingDcbFlags;
            appFcoeFlags: SettingDcbFlags;
            app_fcoe_mode: string;
            appFcoeMode: string;
            app_fcoe_priority: number;
            appFcoePriority: number;
            app_fip_flags: SettingDcbFlags;
            appFipFlags: SettingDcbFlags;
            app_fip_priority: number;
            appFipPriority: number;
            app_iscsi_flags: SettingDcbFlags;
            appIscsiFlags: SettingDcbFlags;
            app_iscsi_priority: number;
            appIscsiPriority: number;
            priority_bandwidth: number[];
            priorityBandwidth: number[];
            priority_flow_control: boolean[];
            priorityFlowControl: boolean[];
            priority_flow_control_flags: SettingDcbFlags;
            priorityFlowControlFlags: SettingDcbFlags;
            priority_group_bandwidth: number[];
            priorityGroupBandwidth: number[];
            priority_group_flags: SettingDcbFlags;
            priorityGroupFlags: SettingDcbFlags;
            priority_group_id: number[];
            priorityGroupId: number[];
            priority_strict_bandwidth: boolean[];
            priorityStrictBandwidth: boolean[];
            priority_traffic_class: number[];
            priorityTrafficClass: number[];
        }
    }

    class SettingDcb extends Setting {
        static $gtype: GObject.GType<SettingDcb>;

        // Properties
        get app_fcoe_flags(): SettingDcbFlags;
        set app_fcoe_flags(val: SettingDcbFlags);

        get appFcoeFlags(): SettingDcbFlags;
        set appFcoeFlags(val: SettingDcbFlags);

        get app_fcoe_mode(): string;
        set app_fcoe_mode(val: string);

        get appFcoeMode(): string;
        set appFcoeMode(val: string);

        get app_fcoe_priority(): number;
        set app_fcoe_priority(val: number);

        get appFcoePriority(): number;
        set appFcoePriority(val: number);

        get app_fip_flags(): SettingDcbFlags;
        set app_fip_flags(val: SettingDcbFlags);

        get appFipFlags(): SettingDcbFlags;
        set appFipFlags(val: SettingDcbFlags);

        get app_fip_priority(): number;
        set app_fip_priority(val: number);

        get appFipPriority(): number;
        set appFipPriority(val: number);

        get app_iscsi_flags(): SettingDcbFlags;
        set app_iscsi_flags(val: SettingDcbFlags);

        get appIscsiFlags(): SettingDcbFlags;
        set appIscsiFlags(val: SettingDcbFlags);

        get app_iscsi_priority(): number;
        set app_iscsi_priority(val: number);

        get appIscsiPriority(): number;
        set appIscsiPriority(val: number);

        get priority_bandwidth(): number[];
        set priority_bandwidth(val: number[]);

        get priorityBandwidth(): number[];
        set priorityBandwidth(val: number[]);

        get priority_flow_control(): boolean[];
        set priority_flow_control(val: boolean[]);

        get priorityFlowControl(): boolean[];
        set priorityFlowControl(val: boolean[]);

        get priority_flow_control_flags(): SettingDcbFlags;
        set priority_flow_control_flags(val: SettingDcbFlags);

        get priorityFlowControlFlags(): SettingDcbFlags;
        set priorityFlowControlFlags(val: SettingDcbFlags);

        get priority_group_bandwidth(): number[];
        set priority_group_bandwidth(val: number[]);

        get priorityGroupBandwidth(): number[];
        set priorityGroupBandwidth(val: number[]);

        get priority_group_flags(): SettingDcbFlags;
        set priority_group_flags(val: SettingDcbFlags);

        get priorityGroupFlags(): SettingDcbFlags;
        set priorityGroupFlags(val: SettingDcbFlags);

        get priority_group_id(): number[];
        set priority_group_id(val: number[]);

        get priorityGroupId(): number[];
        set priorityGroupId(val: number[]);

        get priority_strict_bandwidth(): boolean[];
        set priority_strict_bandwidth(val: boolean[]);

        get priorityStrictBandwidth(): boolean[];
        set priorityStrictBandwidth(val: boolean[]);

        get priority_traffic_class(): number[];
        set priority_traffic_class(val: number[]);

        get priorityTrafficClass(): number[];
        set priorityTrafficClass(val: number[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingDcb.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingDcb.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingDcb;

        // Signals
        /** @signal */
        connect<K extends keyof SettingDcb.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingDcb.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingDcb.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingDcb.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingDcb.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingDcb.SignalSignatures[K]>): void;

        // Methods
        get_app_fcoe_flags(): SettingDcbFlags;

        get_app_fcoe_mode(): string;

        get_app_fcoe_priority(): number;

        get_app_fip_flags(): SettingDcbFlags;

        get_app_fip_priority(): number;

        get_app_iscsi_flags(): SettingDcbFlags;

        get_app_iscsi_priority(): number;

        get_priority_bandwidth(user_priority: number): number;

        get_priority_flow_control(user_priority: number): boolean;

        get_priority_flow_control_flags(): SettingDcbFlags;

        get_priority_group_bandwidth(group_id: number): number;

        get_priority_group_flags(): SettingDcbFlags;

        get_priority_group_id(user_priority: number): number;

        get_priority_strict_bandwidth(user_priority: number): boolean;

        get_priority_traffic_class(user_priority: number): number;

        set_priority_bandwidth(user_priority: number, bandwidth_percent: number): void;

        set_priority_flow_control(user_priority: number, enabled: boolean): void;

        set_priority_group_bandwidth(group_id: number, bandwidth_percent: number): void;

        set_priority_group_id(user_priority: number, group_id: number): void;

        set_priority_strict_bandwidth(user_priority: number, strict: boolean): void;

        set_priority_traffic_class(user_priority: number, traffic_class: number): void;
    }


    namespace SettingDummy {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {}
    }

    class SettingDummy extends Setting {
        static $gtype: GObject.GType<SettingDummy>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingDummy.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingDummy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingDummy;

        // Signals
        /** @signal */
        connect<K extends keyof SettingDummy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingDummy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingDummy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingDummy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingDummy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingDummy.SignalSignatures[K]>): void;
    }


    namespace SettingEthtool {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {}
    }

    class SettingEthtool extends Setting {
        static $gtype: GObject.GType<SettingEthtool>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingEthtool.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingEthtool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingEthtool;

        // Signals
        /** @signal */
        connect<K extends keyof SettingEthtool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingEthtool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingEthtool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingEthtool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingEthtool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingEthtool.SignalSignatures[K]>): void;

        // Methods
        clear_features(): void;

        get_feature(optname: string): Ternary;

        get_optnames(): [string[], number];

        set_feature(optname: string, value: Ternary): void;
    }


    namespace SettingGeneric {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::device-handler": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            device_handler: string;
            deviceHandler: string;
        }
    }

    class SettingGeneric extends Setting {
        static $gtype: GObject.GType<SettingGeneric>;

        // Properties
        get device_handler(): string;
        set device_handler(val: string);

        get deviceHandler(): string;
        set deviceHandler(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingGeneric.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingGeneric.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingGeneric;

        // Signals
        /** @signal */
        connect<K extends keyof SettingGeneric.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingGeneric.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingGeneric.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingGeneric.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingGeneric.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingGeneric.SignalSignatures[K]>): void;

        // Methods
        get_device_handler(): string;
    }


    namespace SettingGeneve {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::destination-port": (pspec: GObject.ParamSpec) => void;
            "notify::df": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::remote": (pspec: GObject.ParamSpec) => void;
            "notify::tos": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            destination_port: number;
            destinationPort: number;
            df: number;
            id: number;
            remote: string;
            tos: number;
            ttl: number;
        }
    }

    class SettingGeneve extends Setting {
        static $gtype: GObject.GType<SettingGeneve>;

        // Properties
        get destination_port(): number;
        set destination_port(val: number);

        get destinationPort(): number;
        set destinationPort(val: number);

        get df(): number;
        set df(val: number);

        get id(): number;
        set id(val: number);

        get remote(): string;
        set remote(val: string);

        get tos(): number;
        set tos(val: number);

        get ttl(): number;
        set ttl(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingGeneve.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingGeneve.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingGeneve;

        // Signals
        /** @signal */
        connect<K extends keyof SettingGeneve.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingGeneve.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingGeneve.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingGeneve.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingGeneve.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingGeneve.SignalSignatures[K]>): void;

        // Methods
        get_destination_port(): number;

        get_df(): SettingGeneveDf;

        get_id(): number;

        get_remote(): string;

        get_tos(): number;

        get_ttl(): number;
    }


    namespace SettingGsm {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::apn": (pspec: GObject.ParamSpec) => void;
            "notify::auto-config": (pspec: GObject.ParamSpec) => void;
            "notify::device-id": (pspec: GObject.ParamSpec) => void;
            "notify::device-uid": (pspec: GObject.ParamSpec) => void;
            "notify::home-only": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-apn": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-configure": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-noauth": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-password": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-refuse-chap": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-refuse-eap": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-refuse-mschap": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-refuse-mschapv2": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-refuse-pap": (pspec: GObject.ParamSpec) => void;
            "notify::initial-eps-bearer-username": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::network-id": (pspec: GObject.ParamSpec) => void;
            "notify::number": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::pin": (pspec: GObject.ParamSpec) => void;
            "notify::pin-flags": (pspec: GObject.ParamSpec) => void;
            "notify::sim-id": (pspec: GObject.ParamSpec) => void;
            "notify::sim-operator-id": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            apn: string;
            auto_config: boolean;
            autoConfig: boolean;
            device_id: string;
            deviceId: string;
            device_uid: string;
            deviceUid: string;
            home_only: boolean;
            homeOnly: boolean;
            initial_eps_bearer_apn: string;
            initialEpsBearerApn: string;
            initial_eps_bearer_configure: boolean;
            initialEpsBearerConfigure: boolean;
            initial_eps_bearer_noauth: boolean;
            initialEpsBearerNoauth: boolean;
            initial_eps_bearer_password: string;
            initialEpsBearerPassword: string;
            initial_eps_bearer_password_flags: SettingSecretFlags;
            initialEpsBearerPasswordFlags: SettingSecretFlags;
            initial_eps_bearer_refuse_chap: boolean;
            initialEpsBearerRefuseChap: boolean;
            initial_eps_bearer_refuse_eap: boolean;
            initialEpsBearerRefuseEap: boolean;
            initial_eps_bearer_refuse_mschap: boolean;
            initialEpsBearerRefuseMschap: boolean;
            initial_eps_bearer_refuse_mschapv2: boolean;
            initialEpsBearerRefuseMschapv2: boolean;
            initial_eps_bearer_refuse_pap: boolean;
            initialEpsBearerRefusePap: boolean;
            initial_eps_bearer_username: string;
            initialEpsBearerUsername: string;
            mtu: number;
            network_id: string;
            networkId: string;
            number: string;
            password: string;
            password_flags: SettingSecretFlags;
            passwordFlags: SettingSecretFlags;
            pin: string;
            pin_flags: SettingSecretFlags;
            pinFlags: SettingSecretFlags;
            sim_id: string;
            simId: string;
            sim_operator_id: string;
            simOperatorId: string;
            username: string;
        }
    }

    class SettingGsm extends Setting {
        static $gtype: GObject.GType<SettingGsm>;

        // Properties
        get apn(): string;
        set apn(val: string);

        get auto_config(): boolean;
        set auto_config(val: boolean);

        get autoConfig(): boolean;
        set autoConfig(val: boolean);

        get device_id(): string;
        set device_id(val: string);

        get deviceId(): string;
        set deviceId(val: string);

        get device_uid(): string;
        set device_uid(val: string);

        get deviceUid(): string;
        set deviceUid(val: string);

        get home_only(): boolean;
        set home_only(val: boolean);

        get homeOnly(): boolean;
        set homeOnly(val: boolean);

        get initial_eps_bearer_apn(): string;
        set initial_eps_bearer_apn(val: string);

        get initialEpsBearerApn(): string;
        set initialEpsBearerApn(val: string);

        get initial_eps_bearer_configure(): boolean;
        set initial_eps_bearer_configure(val: boolean);

        get initialEpsBearerConfigure(): boolean;
        set initialEpsBearerConfigure(val: boolean);

        get initial_eps_bearer_noauth(): boolean;
        set initial_eps_bearer_noauth(val: boolean);

        get initialEpsBearerNoauth(): boolean;
        set initialEpsBearerNoauth(val: boolean);

        get initial_eps_bearer_password(): string;
        set initial_eps_bearer_password(val: string);

        get initialEpsBearerPassword(): string;
        set initialEpsBearerPassword(val: string);

        get initial_eps_bearer_password_flags(): SettingSecretFlags;
        set initial_eps_bearer_password_flags(val: SettingSecretFlags);

        get initialEpsBearerPasswordFlags(): SettingSecretFlags;
        set initialEpsBearerPasswordFlags(val: SettingSecretFlags);

        get initial_eps_bearer_refuse_chap(): boolean;
        set initial_eps_bearer_refuse_chap(val: boolean);

        get initialEpsBearerRefuseChap(): boolean;
        set initialEpsBearerRefuseChap(val: boolean);

        get initial_eps_bearer_refuse_eap(): boolean;
        set initial_eps_bearer_refuse_eap(val: boolean);

        get initialEpsBearerRefuseEap(): boolean;
        set initialEpsBearerRefuseEap(val: boolean);

        get initial_eps_bearer_refuse_mschap(): boolean;
        set initial_eps_bearer_refuse_mschap(val: boolean);

        get initialEpsBearerRefuseMschap(): boolean;
        set initialEpsBearerRefuseMschap(val: boolean);

        get initial_eps_bearer_refuse_mschapv2(): boolean;
        set initial_eps_bearer_refuse_mschapv2(val: boolean);

        get initialEpsBearerRefuseMschapv2(): boolean;
        set initialEpsBearerRefuseMschapv2(val: boolean);

        get initial_eps_bearer_refuse_pap(): boolean;
        set initial_eps_bearer_refuse_pap(val: boolean);

        get initialEpsBearerRefusePap(): boolean;
        set initialEpsBearerRefusePap(val: boolean);

        get initial_eps_bearer_username(): string;
        set initial_eps_bearer_username(val: string);

        get initialEpsBearerUsername(): string;
        set initialEpsBearerUsername(val: string);

        get mtu(): number;
        set mtu(val: number);

        get network_id(): string;
        set network_id(val: string);

        get networkId(): string;
        set networkId(val: string);

        get number(): string;
        set number(val: string);

        get password(): string;
        set password(val: string);

        get password_flags(): SettingSecretFlags;
        set password_flags(val: SettingSecretFlags);

        get passwordFlags(): SettingSecretFlags;
        set passwordFlags(val: SettingSecretFlags);

        get pin(): string;
        set pin(val: string);

        get pin_flags(): SettingSecretFlags;
        set pin_flags(val: SettingSecretFlags);

        get pinFlags(): SettingSecretFlags;
        set pinFlags(val: SettingSecretFlags);

        get sim_id(): string;
        set sim_id(val: string);

        get simId(): string;
        set simId(val: string);

        get sim_operator_id(): string;
        set sim_operator_id(val: string);

        get simOperatorId(): string;
        set simOperatorId(val: string);

        get username(): string;
        set username(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingGsm.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingGsm.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingGsm;

        // Signals
        /** @signal */
        connect<K extends keyof SettingGsm.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingGsm.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingGsm.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingGsm.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingGsm.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingGsm.SignalSignatures[K]>): void;

        // Methods
        get_apn(): string;

        get_auto_config(): boolean;

        get_device_id(): string;

        get_device_uid(): string;

        get_home_only(): boolean;

        get_initial_eps_apn(): string;

        get_initial_eps_config(): boolean;

        get_initial_eps_noauth(): boolean;

        get_initial_eps_password(): string;

        get_initial_eps_refuse_chap(): boolean;

        get_initial_eps_refuse_eap(): boolean;

        get_initial_eps_refuse_mschap(): boolean;

        get_initial_eps_refuse_mschapv2(): boolean;

        get_initial_eps_refuse_pap(): boolean;

        get_initial_eps_username(): string;

        get_mtu(): number;

        get_network_id(): string;

        get_number(): string;

        get_password(): string;

        get_password_flags(): SettingSecretFlags;

        get_pin(): string;

        get_pin_flags(): SettingSecretFlags;

        get_sim_id(): string;

        get_sim_operator_id(): string;

        get_username(): string;
    }


    namespace SettingHostname {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::from-dhcp": (pspec: GObject.ParamSpec) => void;
            "notify::from-dns-lookup": (pspec: GObject.ParamSpec) => void;
            "notify::only-from-default": (pspec: GObject.ParamSpec) => void;
            "notify::priority": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            from_dhcp: Ternary;
            fromDhcp: Ternary;
            from_dns_lookup: Ternary;
            fromDnsLookup: Ternary;
            only_from_default: Ternary;
            onlyFromDefault: Ternary;
            priority: number;
        }
    }

    class SettingHostname extends Setting {
        static $gtype: GObject.GType<SettingHostname>;

        // Properties
        get from_dhcp(): Ternary;
        set from_dhcp(val: Ternary);

        get fromDhcp(): Ternary;
        set fromDhcp(val: Ternary);

        get from_dns_lookup(): Ternary;
        set from_dns_lookup(val: Ternary);

        get fromDnsLookup(): Ternary;
        set fromDnsLookup(val: Ternary);

        get only_from_default(): Ternary;
        set only_from_default(val: Ternary);

        get onlyFromDefault(): Ternary;
        set onlyFromDefault(val: Ternary);

        get priority(): number;
        set priority(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingHostname.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingHostname.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingHostname;

        // Signals
        /** @signal */
        connect<K extends keyof SettingHostname.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingHostname.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingHostname.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingHostname.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingHostname.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingHostname.SignalSignatures[K]>): void;

        // Methods
        get_from_dhcp(): Ternary;

        get_from_dns_lookup(): Ternary;

        get_only_from_default(): Ternary;

        get_priority(): number;
    }


    namespace SettingHsr {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::interlink": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-spec": (pspec: GObject.ParamSpec) => void;
            "notify::port1": (pspec: GObject.ParamSpec) => void;
            "notify::port2": (pspec: GObject.ParamSpec) => void;
            "notify::protocol-version": (pspec: GObject.ParamSpec) => void;
            "notify::prp": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            interlink: string;
            multicast_spec: number;
            multicastSpec: number;
            port1: string;
            port2: string;
            protocol_version: number;
            protocolVersion: number;
            prp: boolean;
        }
    }

    class SettingHsr extends Setting {
        static $gtype: GObject.GType<SettingHsr>;

        // Properties
        get interlink(): string;
        set interlink(val: string);

        get multicast_spec(): number;
        set multicast_spec(val: number);

        get multicastSpec(): number;
        set multicastSpec(val: number);

        get port1(): string;
        set port1(val: string);

        get port2(): string;
        set port2(val: string);

        get protocol_version(): number;
        set protocol_version(val: number);

        get protocolVersion(): number;
        set protocolVersion(val: number);

        get prp(): boolean;
        set prp(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingHsr.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingHsr.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingHsr;

        // Signals
        /** @signal */
        connect<K extends keyof SettingHsr.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingHsr.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingHsr.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingHsr.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingHsr.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingHsr.SignalSignatures[K]>): void;

        // Methods
        get_interlink(): string;

        get_multicast_spec(): number;

        get_port1(): string;

        get_port2(): string;

        get_protocol_version(): SettingHsrProtocolVersion;

        get_prp(): boolean;
    }


    namespace SettingIP4Config {
        // Signal signatures
        interface SignalSignatures extends SettingIPConfig.SignalSignatures {
            "notify::clat": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-client-id": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-fqdn": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-ipv6-only-preferred": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-vendor-class-identifier": (pspec: GObject.ParamSpec) => void;
            "notify::link-local": (pspec: GObject.ParamSpec) => void;
            "notify::addresses": (pspec: GObject.ParamSpec) => void;
            "notify::auto-route-ext-gw": (pspec: GObject.ParamSpec) => void;
            "notify::dad-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-dscp": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-hostname-flags": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-iaid": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-reject-servers": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-hostname-v2": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-release": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::dns": (pspec: GObject.ParamSpec) => void;
            "notify::dns-options": (pspec: GObject.ParamSpec) => void;
            "notify::dns-priority": (pspec: GObject.ParamSpec) => void;
            "notify::dns-search": (pspec: GObject.ParamSpec) => void;
            "notify::forwarding": (pspec: GObject.ParamSpec) => void;
            "notify::gateway": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-auto-dns": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-auto-routes": (pspec: GObject.ParamSpec) => void;
            "notify::may-fail": (pspec: GObject.ParamSpec) => void;
            "notify::method": (pspec: GObject.ParamSpec) => void;
            "notify::never-default": (pspec: GObject.ParamSpec) => void;
            "notify::replace-local-rule": (pspec: GObject.ParamSpec) => void;
            "notify::required-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::route-metric": (pspec: GObject.ParamSpec) => void;
            "notify::route-table": (pspec: GObject.ParamSpec) => void;
            "notify::routed-dns": (pspec: GObject.ParamSpec) => void;
            "notify::routes": (pspec: GObject.ParamSpec) => void;
            "notify::shared-dhcp-lease-time": (pspec: GObject.ParamSpec) => void;
            "notify::shared-dhcp-range": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SettingIPConfig.ConstructorProps {
            clat: number;
            dhcp_client_id: string;
            dhcpClientId: string;
            dhcp_fqdn: string;
            dhcpFqdn: string;
            dhcp_ipv6_only_preferred: number;
            dhcpIpv6OnlyPreferred: number;
            dhcp_vendor_class_identifier: string;
            dhcpVendorClassIdentifier: string;
            link_local: number;
            linkLocal: number;
        }
    }

    class SettingIP4Config extends SettingIPConfig {
        static $gtype: GObject.GType<SettingIP4Config>;

        // Properties
        get clat(): number;
        set clat(val: number);

        get dhcp_client_id(): string;
        set dhcp_client_id(val: string);

        get dhcpClientId(): string;
        set dhcpClientId(val: string);

        get dhcp_fqdn(): string;
        set dhcp_fqdn(val: string);

        get dhcpFqdn(): string;
        set dhcpFqdn(val: string);

        get dhcp_ipv6_only_preferred(): number;
        set dhcp_ipv6_only_preferred(val: number);

        get dhcpIpv6OnlyPreferred(): number;
        set dhcpIpv6OnlyPreferred(val: number);

        get dhcp_vendor_class_identifier(): string;
        set dhcp_vendor_class_identifier(val: string);

        get dhcpVendorClassIdentifier(): string;
        set dhcpVendorClassIdentifier(val: string);

        get link_local(): number;
        set link_local(val: number);

        get linkLocal(): number;
        set linkLocal(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingIP4Config.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingIP4Config.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingIP4Config;

        // Signals
        /** @signal */
        connect<K extends keyof SettingIP4Config.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIP4Config.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingIP4Config.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIP4Config.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingIP4Config.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingIP4Config.SignalSignatures[K]>): void;

        // Methods
        get_clat(): SettingIp4ConfigClat;

        get_dhcp_client_id(): string;

        get_dhcp_fqdn(): string;

        get_dhcp_ipv6_only_preferred(): SettingIP4DhcpIpv6OnlyPreferred;

        get_dhcp_vendor_class_identifier(): string;

        get_link_local(): SettingIP4LinkLocal;
    }


    namespace SettingIP6Config {
        // Signal signatures
        interface SignalSignatures extends SettingIPConfig.SignalSignatures {
            "notify::addr-gen-mode": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-duid": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-pd-hint": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-privacy": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::ra-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::temp-preferred-lifetime": (pspec: GObject.ParamSpec) => void;
            "notify::temp-valid-lifetime": (pspec: GObject.ParamSpec) => void;
            "notify::token": (pspec: GObject.ParamSpec) => void;
            "notify::addresses": (pspec: GObject.ParamSpec) => void;
            "notify::auto-route-ext-gw": (pspec: GObject.ParamSpec) => void;
            "notify::dad-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-dscp": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-hostname-flags": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-iaid": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-reject-servers": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-hostname-v2": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-release": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::dns": (pspec: GObject.ParamSpec) => void;
            "notify::dns-options": (pspec: GObject.ParamSpec) => void;
            "notify::dns-priority": (pspec: GObject.ParamSpec) => void;
            "notify::dns-search": (pspec: GObject.ParamSpec) => void;
            "notify::forwarding": (pspec: GObject.ParamSpec) => void;
            "notify::gateway": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-auto-dns": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-auto-routes": (pspec: GObject.ParamSpec) => void;
            "notify::may-fail": (pspec: GObject.ParamSpec) => void;
            "notify::method": (pspec: GObject.ParamSpec) => void;
            "notify::never-default": (pspec: GObject.ParamSpec) => void;
            "notify::replace-local-rule": (pspec: GObject.ParamSpec) => void;
            "notify::required-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::route-metric": (pspec: GObject.ParamSpec) => void;
            "notify::route-table": (pspec: GObject.ParamSpec) => void;
            "notify::routed-dns": (pspec: GObject.ParamSpec) => void;
            "notify::routes": (pspec: GObject.ParamSpec) => void;
            "notify::shared-dhcp-lease-time": (pspec: GObject.ParamSpec) => void;
            "notify::shared-dhcp-range": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SettingIPConfig.ConstructorProps {
            addr_gen_mode: number;
            addrGenMode: number;
            dhcp_duid: string;
            dhcpDuid: string;
            dhcp_pd_hint: string;
            dhcpPdHint: string;
            ip6_privacy: SettingIP6ConfigPrivacy;
            ip6Privacy: SettingIP6ConfigPrivacy;
            mtu: number;
            ra_timeout: number;
            raTimeout: number;
            temp_preferred_lifetime: number;
            tempPreferredLifetime: number;
            temp_valid_lifetime: number;
            tempValidLifetime: number;
            token: string;
        }
    }

    class SettingIP6Config extends SettingIPConfig {
        static $gtype: GObject.GType<SettingIP6Config>;

        // Properties
        get addr_gen_mode(): number;
        set addr_gen_mode(val: number);

        get addrGenMode(): number;
        set addrGenMode(val: number);

        get dhcp_duid(): string;
        set dhcp_duid(val: string);

        get dhcpDuid(): string;
        set dhcpDuid(val: string);

        get dhcp_pd_hint(): string;
        set dhcp_pd_hint(val: string);

        get dhcpPdHint(): string;
        set dhcpPdHint(val: string);

        get ip6_privacy(): SettingIP6ConfigPrivacy;
        set ip6_privacy(val: SettingIP6ConfigPrivacy);

        get ip6Privacy(): SettingIP6ConfigPrivacy;
        set ip6Privacy(val: SettingIP6ConfigPrivacy);

        get mtu(): number;
        set mtu(val: number);

        get ra_timeout(): number;
        set ra_timeout(val: number);

        get raTimeout(): number;
        set raTimeout(val: number);

        get temp_preferred_lifetime(): number;
        set temp_preferred_lifetime(val: number);

        get tempPreferredLifetime(): number;
        set tempPreferredLifetime(val: number);

        get temp_valid_lifetime(): number;
        set temp_valid_lifetime(val: number);

        get tempValidLifetime(): number;
        set tempValidLifetime(val: number);

        get token(): string;
        set token(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingIP6Config.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingIP6Config.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingIP6Config;

        // Signals
        /** @signal */
        connect<K extends keyof SettingIP6Config.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIP6Config.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingIP6Config.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIP6Config.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingIP6Config.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingIP6Config.SignalSignatures[K]>): void;

        // Methods
        get_addr_gen_mode(): SettingIP6ConfigAddrGenMode;

        get_dhcp_duid(): string;

        get_dhcp_pd_hint(): string;

        get_ip6_privacy(): SettingIP6ConfigPrivacy;

        get_mtu(): number;

        get_ra_timeout(): number;

        get_temp_preferred_lifetime(): number;

        get_temp_valid_lifetime(): number;

        get_token(): string;
    }


    namespace SettingIPConfig {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::addresses": (pspec: GObject.ParamSpec) => void;
            "notify::auto-route-ext-gw": (pspec: GObject.ParamSpec) => void;
            "notify::dad-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-dscp": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-hostname-flags": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-iaid": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-reject-servers": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-hostname-v2": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-send-release": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::dns": (pspec: GObject.ParamSpec) => void;
            "notify::dns-options": (pspec: GObject.ParamSpec) => void;
            "notify::dns-priority": (pspec: GObject.ParamSpec) => void;
            "notify::dns-search": (pspec: GObject.ParamSpec) => void;
            "notify::forwarding": (pspec: GObject.ParamSpec) => void;
            "notify::gateway": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-auto-dns": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-auto-routes": (pspec: GObject.ParamSpec) => void;
            "notify::may-fail": (pspec: GObject.ParamSpec) => void;
            "notify::method": (pspec: GObject.ParamSpec) => void;
            "notify::never-default": (pspec: GObject.ParamSpec) => void;
            "notify::replace-local-rule": (pspec: GObject.ParamSpec) => void;
            "notify::required-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::route-metric": (pspec: GObject.ParamSpec) => void;
            "notify::route-table": (pspec: GObject.ParamSpec) => void;
            "notify::routed-dns": (pspec: GObject.ParamSpec) => void;
            "notify::routes": (pspec: GObject.ParamSpec) => void;
            "notify::shared-dhcp-lease-time": (pspec: GObject.ParamSpec) => void;
            "notify::shared-dhcp-range": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            addresses: IPAddress[];
            auto_route_ext_gw: Ternary;
            autoRouteExtGw: Ternary;
            dad_timeout: number;
            dadTimeout: number;
            dhcp_dscp: string;
            dhcpDscp: string;
            dhcp_hostname: string;
            dhcpHostname: string;
            dhcp_hostname_flags: number;
            dhcpHostnameFlags: number;
            dhcp_iaid: string;
            dhcpIaid: string;
            dhcp_reject_servers: string[];
            dhcpRejectServers: string[];
            dhcp_send_hostname: boolean;
            dhcpSendHostname: boolean;
            dhcp_send_hostname_v2: number;
            dhcpSendHostnameV2: number;
            dhcp_send_release: Ternary;
            dhcpSendRelease: Ternary;
            dhcp_timeout: number;
            dhcpTimeout: number;
            dns: string[];
            dns_options: string[];
            dnsOptions: string[];
            dns_priority: number;
            dnsPriority: number;
            dns_search: string[];
            dnsSearch: string[];
            forwarding: number;
            gateway: string;
            ignore_auto_dns: boolean;
            ignoreAutoDns: boolean;
            ignore_auto_routes: boolean;
            ignoreAutoRoutes: boolean;
            may_fail: boolean;
            mayFail: boolean;
            method: string;
            never_default: boolean;
            neverDefault: boolean;
            replace_local_rule: Ternary;
            replaceLocalRule: Ternary;
            required_timeout: number;
            requiredTimeout: number;
            route_metric: bigint | number;
            routeMetric: bigint | number;
            route_table: number;
            routeTable: number;
            routed_dns: number;
            routedDns: number;
            routes: IPRoute[];
            shared_dhcp_lease_time: number;
            sharedDhcpLeaseTime: number;
            shared_dhcp_range: string;
            sharedDhcpRange: string;
        }
    }

    abstract class SettingIPConfig extends Setting {
        static $gtype: GObject.GType<SettingIPConfig>;

        // Properties
        get addresses(): IPAddress[];
        set addresses(val: IPAddress[]);

        get auto_route_ext_gw(): Ternary;
        set auto_route_ext_gw(val: Ternary);

        get autoRouteExtGw(): Ternary;
        set autoRouteExtGw(val: Ternary);

        get dad_timeout(): number;
        set dad_timeout(val: number);

        get dadTimeout(): number;
        set dadTimeout(val: number);

        get dhcp_dscp(): string;
        set dhcp_dscp(val: string);

        get dhcpDscp(): string;
        set dhcpDscp(val: string);

        get dhcp_hostname(): string;
        set dhcp_hostname(val: string);

        get dhcpHostname(): string;
        set dhcpHostname(val: string);

        get dhcp_hostname_flags(): number;
        set dhcp_hostname_flags(val: number);

        get dhcpHostnameFlags(): number;
        set dhcpHostnameFlags(val: number);

        get dhcp_iaid(): string;
        set dhcp_iaid(val: string);

        get dhcpIaid(): string;
        set dhcpIaid(val: string);

        get dhcp_reject_servers(): string[];
        set dhcp_reject_servers(val: string[]);

        get dhcpRejectServers(): string[];
        set dhcpRejectServers(val: string[]);

        get dhcp_send_hostname(): boolean;
        set dhcp_send_hostname(val: boolean);

        get dhcpSendHostname(): boolean;
        set dhcpSendHostname(val: boolean);

        get dhcp_send_hostname_v2(): number;
        set dhcp_send_hostname_v2(val: number);

        get dhcpSendHostnameV2(): number;
        set dhcpSendHostnameV2(val: number);

        get dhcp_send_release(): Ternary;
        set dhcp_send_release(val: Ternary);

        get dhcpSendRelease(): Ternary;
        set dhcpSendRelease(val: Ternary);

        get dhcp_timeout(): number;
        set dhcp_timeout(val: number);

        get dhcpTimeout(): number;
        set dhcpTimeout(val: number);

        get dns(): string[];
        set dns(val: string[]);

        get dns_options(): string[];
        set dns_options(val: string[]);

        get dnsOptions(): string[];
        set dnsOptions(val: string[]);

        get dns_priority(): number;
        set dns_priority(val: number);

        get dnsPriority(): number;
        set dnsPriority(val: number);

        get dns_search(): string[];
        set dns_search(val: string[]);

        get dnsSearch(): string[];
        set dnsSearch(val: string[]);

        get forwarding(): number;
        set forwarding(val: number);

        get gateway(): string;
        set gateway(val: string);

        get ignore_auto_dns(): boolean;
        set ignore_auto_dns(val: boolean);

        get ignoreAutoDns(): boolean;
        set ignoreAutoDns(val: boolean);

        get ignore_auto_routes(): boolean;
        set ignore_auto_routes(val: boolean);

        get ignoreAutoRoutes(): boolean;
        set ignoreAutoRoutes(val: boolean);

        get may_fail(): boolean;
        set may_fail(val: boolean);

        get mayFail(): boolean;
        set mayFail(val: boolean);

        get method(): string;
        set method(val: string);

        get never_default(): boolean;
        set never_default(val: boolean);

        get neverDefault(): boolean;
        set neverDefault(val: boolean);

        get replace_local_rule(): Ternary;
        set replace_local_rule(val: Ternary);

        get replaceLocalRule(): Ternary;
        set replaceLocalRule(val: Ternary);

        get required_timeout(): number;
        set required_timeout(val: number);

        get requiredTimeout(): number;
        set requiredTimeout(val: number);

        get route_metric(): number;
        set route_metric(val: bigint | number);

        get routeMetric(): number;
        set routeMetric(val: bigint | number);

        get route_table(): number;
        set route_table(val: number);

        get routeTable(): number;
        set routeTable(val: number);

        get routed_dns(): number;
        set routed_dns(val: number);

        get routedDns(): number;
        set routedDns(val: number);

        get routes(): IPRoute[];
        set routes(val: IPRoute[]);

        get shared_dhcp_lease_time(): number;
        set shared_dhcp_lease_time(val: number);

        get sharedDhcpLeaseTime(): number;
        set sharedDhcpLeaseTime(val: number);

        get shared_dhcp_range(): string;
        set shared_dhcp_range(val: string);

        get sharedDhcpRange(): string;
        set sharedDhcpRange(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingIPConfig.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingIPConfig.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SettingIPConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIPConfig.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingIPConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIPConfig.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingIPConfig.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingIPConfig.SignalSignatures[K]>): void;

        // Methods
        add_address(address: IPAddress): boolean;

        add_dhcp_reject_server(server: string): void;

        add_dns(dns: string): boolean;

        add_dns_option(dns_option: string): boolean;

        add_dns_search(dns_search: string): boolean;

        add_route(route: IPRoute): boolean;

        add_routing_rule(routing_rule: IPRoutingRule): void;

        clear_addresses(): void;

        clear_dhcp_reject_servers(): void;

        clear_dns(): void;

        clear_dns_options(is_set: boolean): void;

        clear_dns_searches(): void;

        clear_routes(): void;

        clear_routing_rules(): void;

        get_address(idx: number): IPAddress;

        get_auto_route_ext_gw(): Ternary;

        get_dad_timeout(): number;

        get_dhcp_dscp(): string;

        get_dhcp_hostname(): string;

        get_dhcp_hostname_flags(): DhcpHostnameFlags;

        get_dhcp_iaid(): string;

        get_dhcp_reject_servers(): string[];

        get_dhcp_send_hostname(): boolean;

        get_dhcp_send_hostname_v2(): Ternary;

        get_dhcp_send_release(): Ternary;

        get_dhcp_timeout(): number;

        get_dns(idx: number): string;

        get_dns_option(idx: number): string;

        get_dns_priority(): number;

        get_dns_search(idx: number): string;

        get_forwarding(): SettingIPConfigForwarding;

        get_gateway(): string;

        get_ignore_auto_dns(): boolean;

        get_ignore_auto_routes(): boolean;

        get_may_fail(): boolean;

        get_method(): string;

        get_never_default(): boolean;

        get_num_addresses(): number;

        get_num_dns(): number;

        get_num_dns_options(): number;

        get_num_dns_searches(): number;

        get_num_routes(): number;

        get_num_routing_rules(): number;

        get_replace_local_rule(): Ternary;

        get_required_timeout(): number;

        get_route(idx: number): IPRoute;

        get_route_metric(): number;

        get_route_table(): number;

        get_routed_dns(): SettingIPConfigRoutedDns;

        get_routing_rule(idx: number): IPRoutingRule;

        get_shared_dhcp_lease_time(): number;

        get_shared_dhcp_range(): string;

        has_dns_options(): boolean;

        remove_address(idx: number): void;

        remove_address_by_value(address: IPAddress): boolean;

        remove_dhcp_reject_server(idx: number): void;

        remove_dns(idx: number): void;

        remove_dns_by_value(dns: string): boolean;

        remove_dns_option(idx: number): void;

        remove_dns_option_by_value(dns_option: string): boolean;

        remove_dns_search(idx: number): void;

        remove_dns_search_by_value(dns_search: string): boolean;

        remove_route(idx: number): void;

        remove_route_by_value(route: IPRoute): boolean;

        remove_routing_rule(idx: number): void;
    }


    namespace SettingIPTunnel {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::encapsulation-limit": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::flow-label": (pspec: GObject.ParamSpec) => void;
            "notify::fwmark": (pspec: GObject.ParamSpec) => void;
            "notify::input-key": (pspec: GObject.ParamSpec) => void;
            "notify::local": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::output-key": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::path-mtu-discovery": (pspec: GObject.ParamSpec) => void;
            "notify::remote": (pspec: GObject.ParamSpec) => void;
            "notify::tos": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            encapsulation_limit: number;
            encapsulationLimit: number;
            flags: number;
            flow_label: number;
            flowLabel: number;
            fwmark: number;
            input_key: string;
            inputKey: string;
            local: string;
            mode: number;
            mtu: number;
            output_key: string;
            outputKey: string;
            parent: string;
            path_mtu_discovery: boolean;
            pathMtuDiscovery: boolean;
            remote: string;
            tos: number;
            ttl: number;
        }
    }

    class SettingIPTunnel extends Setting {
        static $gtype: GObject.GType<SettingIPTunnel>;

        // Properties
        get encapsulation_limit(): number;
        set encapsulation_limit(val: number);

        get encapsulationLimit(): number;
        set encapsulationLimit(val: number);

        get flags(): number;
        set flags(val: number);

        get flow_label(): number;
        set flow_label(val: number);

        get flowLabel(): number;
        set flowLabel(val: number);

        get fwmark(): number;
        set fwmark(val: number);

        get input_key(): string;
        set input_key(val: string);

        get inputKey(): string;
        set inputKey(val: string);

        get local(): string;
        set local(val: string);

        get mode(): number;
        set mode(val: number);

        get mtu(): number;
        set mtu(val: number);

        get output_key(): string;
        set output_key(val: string);

        get outputKey(): string;
        set outputKey(val: string);

        get parent(): string;
        set parent(val: string);

        get path_mtu_discovery(): boolean;
        set path_mtu_discovery(val: boolean);

        get pathMtuDiscovery(): boolean;
        set pathMtuDiscovery(val: boolean);

        get remote(): string;
        set remote(val: string);

        get tos(): number;
        set tos(val: number);

        get ttl(): number;
        set ttl(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingIPTunnel.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingIPTunnel.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingIPTunnel;

        // Signals
        /** @signal */
        connect<K extends keyof SettingIPTunnel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIPTunnel.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingIPTunnel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIPTunnel.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingIPTunnel.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingIPTunnel.SignalSignatures[K]>): void;

        // Methods
        get_encapsulation_limit(): number;

        get_flags(): IPTunnelFlags;

        get_flow_label(): number;

        get_fwmark(): number;

        get_input_key(): string;

        get_local(): string;

        get_mode(): IPTunnelMode;

        get_mtu(): number;

        get_output_key(): string;

        get_parent(): string;

        get_path_mtu_discovery(): boolean;

        get_remote(): string;

        get_tos(): number;

        get_ttl(): number;
    }


    namespace SettingInfiniband {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::p-key": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::transport-mode": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            mac_address: string;
            macAddress: string;
            mtu: number;
            p_key: number;
            pKey: number;
            parent: string;
            transport_mode: string;
            transportMode: string;
        }
    }

    class SettingInfiniband extends Setting {
        static $gtype: GObject.GType<SettingInfiniband>;

        // Properties
        get mac_address(): string;
        set mac_address(val: string);

        get macAddress(): string;
        set macAddress(val: string);

        get mtu(): number;
        set mtu(val: number);

        get p_key(): number;
        set p_key(val: number);

        get pKey(): number;
        set pKey(val: number);

        get parent(): string;
        set parent(val: string);

        get transport_mode(): string;
        set transport_mode(val: string);

        get transportMode(): string;
        set transportMode(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingInfiniband.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingInfiniband.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingInfiniband;

        // Signals
        /** @signal */
        connect<K extends keyof SettingInfiniband.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingInfiniband.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingInfiniband.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingInfiniband.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingInfiniband.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingInfiniband.SignalSignatures[K]>): void;

        // Methods
        get_mac_address(): string;

        get_mtu(): number;

        get_p_key(): number;

        get_parent(): string;

        get_transport_mode(): string;

        get_virtual_interface_name(): string;
    }


    namespace SettingIpvlan {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::private": (pspec: GObject.ParamSpec) => void;
            "notify::vepa": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            mode: number;
            parent: string;
            "private": boolean;
            vepa: boolean;
        }
    }

    class SettingIpvlan extends Setting {
        static $gtype: GObject.GType<SettingIpvlan>;

        // Properties
        get mode(): number;
        set mode(val: number);

        get parent(): string;
        set parent(val: string);

        get "private"(): boolean;
        set "private"(val: boolean);

        get vepa(): boolean;
        set vepa(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingIpvlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingIpvlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingIpvlan;

        // Signals
        /** @signal */
        connect<K extends keyof SettingIpvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIpvlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingIpvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingIpvlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingIpvlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingIpvlan.SignalSignatures[K]>): void;

        // Methods
        get_mode(): SettingIpvlanMode;

        get_parent(): string;

        get_private(): boolean;

        get_vepa(): boolean;
    }


    namespace SettingLink {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::gro-max-size": (pspec: GObject.ParamSpec) => void;
            "notify::gso-max-segments": (pspec: GObject.ParamSpec) => void;
            "notify::gso-max-size": (pspec: GObject.ParamSpec) => void;
            "notify::tx-queue-length": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            gro_max_size: bigint | number;
            groMaxSize: bigint | number;
            gso_max_segments: bigint | number;
            gsoMaxSegments: bigint | number;
            gso_max_size: bigint | number;
            gsoMaxSize: bigint | number;
            tx_queue_length: bigint | number;
            txQueueLength: bigint | number;
        }
    }

    class SettingLink extends Setting {
        static $gtype: GObject.GType<SettingLink>;

        // Properties
        get gro_max_size(): number;
        set gro_max_size(val: bigint | number);

        get groMaxSize(): number;
        set groMaxSize(val: bigint | number);

        get gso_max_segments(): number;
        set gso_max_segments(val: bigint | number);

        get gsoMaxSegments(): number;
        set gsoMaxSegments(val: bigint | number);

        get gso_max_size(): number;
        set gso_max_size(val: bigint | number);

        get gsoMaxSize(): number;
        set gsoMaxSize(val: bigint | number);

        get tx_queue_length(): number;
        set tx_queue_length(val: bigint | number);

        get txQueueLength(): number;
        set txQueueLength(val: bigint | number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingLink.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingLink.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingLink;

        // Signals
        /** @signal */
        connect<K extends keyof SettingLink.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingLink.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingLink.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingLink.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingLink.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingLink.SignalSignatures[K]>): void;

        // Methods
        get_gro_max_size(): number;

        get_gso_max_segments(): number;

        get_gso_max_size(): number;

        get_tx_queue_length(): number;
    }


    namespace SettingLoopback {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            mtu: number;
        }
    }

    class SettingLoopback extends Setting {
        static $gtype: GObject.GType<SettingLoopback>;

        // Properties
        get mtu(): number;
        set mtu(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingLoopback.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingLoopback.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingLoopback;

        // Signals
        /** @signal */
        connect<K extends keyof SettingLoopback.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingLoopback.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingLoopback.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingLoopback.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingLoopback.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingLoopback.SignalSignatures[K]>): void;

        // Methods
        get_mtu(): number;
    }


    namespace SettingMacsec {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::encrypt": (pspec: GObject.ParamSpec) => void;
            "notify::mka-cak": (pspec: GObject.ParamSpec) => void;
            "notify::mka-cak-flags": (pspec: GObject.ParamSpec) => void;
            "notify::mka-ckn": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::offload": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::port": (pspec: GObject.ParamSpec) => void;
            "notify::send-sci": (pspec: GObject.ParamSpec) => void;
            "notify::validation": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            encrypt: boolean;
            mka_cak: string;
            mkaCak: string;
            mka_cak_flags: SettingSecretFlags;
            mkaCakFlags: SettingSecretFlags;
            mka_ckn: string;
            mkaCkn: string;
            mode: number;
            offload: number;
            parent: string;
            port: number;
            send_sci: boolean;
            sendSci: boolean;
            validation: number;
        }
    }

    class SettingMacsec extends Setting {
        static $gtype: GObject.GType<SettingMacsec>;

        // Properties
        get encrypt(): boolean;
        set encrypt(val: boolean);

        get mka_cak(): string;
        set mka_cak(val: string);

        get mkaCak(): string;
        set mkaCak(val: string);

        get mka_cak_flags(): SettingSecretFlags;
        set mka_cak_flags(val: SettingSecretFlags);

        get mkaCakFlags(): SettingSecretFlags;
        set mkaCakFlags(val: SettingSecretFlags);

        get mka_ckn(): string;
        set mka_ckn(val: string);

        get mkaCkn(): string;
        set mkaCkn(val: string);

        get mode(): number;
        set mode(val: number);

        get offload(): number;
        set offload(val: number);

        get parent(): string;
        set parent(val: string);

        get port(): number;
        set port(val: number);

        get send_sci(): boolean;
        set send_sci(val: boolean);

        get sendSci(): boolean;
        set sendSci(val: boolean);

        get validation(): number;
        set validation(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingMacsec.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingMacsec.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingMacsec;

        // Signals
        /** @signal */
        connect<K extends keyof SettingMacsec.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingMacsec.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingMacsec.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingMacsec.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingMacsec.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingMacsec.SignalSignatures[K]>): void;

        // Methods
        get_encrypt(): boolean;

        get_mka_cak(): string;

        get_mka_cak_flags(): SettingSecretFlags;

        get_mka_ckn(): string;

        get_mode(): SettingMacsecMode;

        get_offload(): SettingMacsecOffload;

        get_parent(): string;

        get_port(): number;

        get_send_sci(): boolean;

        get_validation(): SettingMacsecValidation;
    }


    namespace SettingMacvlan {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::promiscuous": (pspec: GObject.ParamSpec) => void;
            "notify::tap": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            mode: number;
            parent: string;
            promiscuous: boolean;
            tap: boolean;
        }
    }

    class SettingMacvlan extends Setting {
        static $gtype: GObject.GType<SettingMacvlan>;

        // Properties
        get mode(): number;
        set mode(val: number);

        get parent(): string;
        set parent(val: string);

        get promiscuous(): boolean;
        set promiscuous(val: boolean);

        get tap(): boolean;
        set tap(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingMacvlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingMacvlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingMacvlan;

        // Signals
        /** @signal */
        connect<K extends keyof SettingMacvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingMacvlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingMacvlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingMacvlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingMacvlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingMacvlan.SignalSignatures[K]>): void;

        // Methods
        get_mode(): SettingMacvlanMode;

        get_parent(): string;

        get_promiscuous(): boolean;

        get_tap(): boolean;
    }


    namespace SettingMatch {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::driver": (pspec: GObject.ParamSpec) => void;
            "notify::interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::kernel-command-line": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            driver: string[];
            interface_name: string[];
            interfaceName: string[];
            kernel_command_line: string[];
            kernelCommandLine: string[];
            path: string[];
        }
    }

    class SettingMatch extends Setting {
        static $gtype: GObject.GType<SettingMatch>;

        // Properties
        get driver(): string[];
        set driver(val: string[]);

        get interface_name(): string[];
        set interface_name(val: string[]);

        get interfaceName(): string[];
        set interfaceName(val: string[]);

        get kernel_command_line(): string[];
        set kernel_command_line(val: string[]);

        get kernelCommandLine(): string[];
        set kernelCommandLine(val: string[]);

        get path(): string[];
        set path(val: string[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingMatch.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingMatch.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingMatch;

        // Signals
        /** @signal */
        connect<K extends keyof SettingMatch.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingMatch.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingMatch.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingMatch.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingMatch.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingMatch.SignalSignatures[K]>): void;

        // Methods
        add_driver(driver: string): void;

        add_interface_name(interface_name: string): void;

        add_kernel_command_line(kernel_command_line: string): void;

        add_path(path: string): void;

        clear_drivers(): void;

        clear_interface_names(): void;

        clear_kernel_command_lines(): void;

        clear_paths(): void;

        get_driver(idx: number): string;

        get_drivers(): string[];

        get_interface_name(idx: number): string;

        get_interface_names(): string[];

        get_kernel_command_line(idx: number): string;

        get_kernel_command_lines(): string[];

        get_num_drivers(): number;

        get_num_interface_names(): number;

        get_num_kernel_command_lines(): number;

        get_num_paths(): number;

        get_path(idx: number): string;

        get_paths(): string[];

        remove_driver(idx: number): void;

        remove_driver_by_value(driver: string): boolean;

        remove_interface_name(idx: number): void;

        remove_interface_name_by_value(interface_name: string): boolean;

        remove_kernel_command_line(idx: number): void;

        remove_kernel_command_line_by_value(kernel_command_line: string): boolean;

        remove_path(idx: number): void;

        remove_path_by_value(path: string): boolean;
    }


    namespace SettingOlpcMesh {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::channel": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp-anycast-address": (pspec: GObject.ParamSpec) => void;
            "notify::ssid": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            channel: number;
            dhcp_anycast_address: string;
            dhcpAnycastAddress: string;
            ssid: GLib.Bytes | Uint8Array;
        }
    }

    class SettingOlpcMesh extends Setting {
        static $gtype: GObject.GType<SettingOlpcMesh>;

        // Properties
        get channel(): number;
        set channel(val: number);

        get dhcp_anycast_address(): string;
        set dhcp_anycast_address(val: string);

        get dhcpAnycastAddress(): string;
        set dhcpAnycastAddress(val: string);

        get ssid(): GLib.Bytes;
        set ssid(val: GLib.Bytes | Uint8Array);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOlpcMesh.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOlpcMesh.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOlpcMesh;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOlpcMesh.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOlpcMesh.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOlpcMesh.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOlpcMesh.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOlpcMesh.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOlpcMesh.SignalSignatures[K]>): void;

        // Methods
        get_channel(): number;

        get_dhcp_anycast_address(): string;

        get_ssid(): GLib.Bytes;
    }


    namespace SettingOvsBridge {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::datapath-type": (pspec: GObject.ParamSpec) => void;
            "notify::fail-mode": (pspec: GObject.ParamSpec) => void;
            "notify::mcast-snooping-enable": (pspec: GObject.ParamSpec) => void;
            "notify::rstp-enable": (pspec: GObject.ParamSpec) => void;
            "notify::stp-enable": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            datapath_type: string;
            datapathType: string;
            fail_mode: string;
            failMode: string;
            mcast_snooping_enable: boolean;
            mcastSnoopingEnable: boolean;
            rstp_enable: boolean;
            rstpEnable: boolean;
            stp_enable: boolean;
            stpEnable: boolean;
        }
    }

    class SettingOvsBridge extends Setting {
        static $gtype: GObject.GType<SettingOvsBridge>;

        // Properties
        get datapath_type(): string;
        set datapath_type(val: string);

        get datapathType(): string;
        set datapathType(val: string);

        get fail_mode(): string;
        set fail_mode(val: string);

        get failMode(): string;
        set failMode(val: string);

        get mcast_snooping_enable(): boolean;
        set mcast_snooping_enable(val: boolean);

        get mcastSnoopingEnable(): boolean;
        set mcastSnoopingEnable(val: boolean);

        get rstp_enable(): boolean;
        set rstp_enable(val: boolean);

        get rstpEnable(): boolean;
        set rstpEnable(val: boolean);

        get stp_enable(): boolean;
        set stp_enable(val: boolean);

        get stpEnable(): boolean;
        set stpEnable(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsBridge.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsBridge.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsBridge;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsBridge.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsBridge.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsBridge.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsBridge.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsBridge.SignalSignatures[K]>): void;

        // Methods
        get_datapath_type(): string;

        get_fail_mode(): string;

        get_mcast_snooping_enable(): boolean;

        get_rstp_enable(): boolean;

        get_stp_enable(): boolean;
    }


    namespace SettingOvsDpdk {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::devargs": (pspec: GObject.ParamSpec) => void;
            "notify::lsc-interrupt": (pspec: GObject.ParamSpec) => void;
            "notify::n-rxq": (pspec: GObject.ParamSpec) => void;
            "notify::n-rxq-desc": (pspec: GObject.ParamSpec) => void;
            "notify::n-txq-desc": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            devargs: string;
            lsc_interrupt: number;
            lscInterrupt: number;
            n_rxq: number;
            nRxq: number;
            n_rxq_desc: number;
            nRxqDesc: number;
            n_txq_desc: number;
            nTxqDesc: number;
        }
    }

    class SettingOvsDpdk extends Setting {
        static $gtype: GObject.GType<SettingOvsDpdk>;

        // Properties
        get devargs(): string;
        set devargs(val: string);

        get lsc_interrupt(): number;
        set lsc_interrupt(val: number);

        get lscInterrupt(): number;
        set lscInterrupt(val: number);

        get n_rxq(): number;
        set n_rxq(val: number);

        get nRxq(): number;
        set nRxq(val: number);

        get n_rxq_desc(): number;
        set n_rxq_desc(val: number);

        get nRxqDesc(): number;
        set nRxqDesc(val: number);

        get n_txq_desc(): number;
        set n_txq_desc(val: number);

        get nTxqDesc(): number;
        set nTxqDesc(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsDpdk.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsDpdk.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsDpdk;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsDpdk.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsDpdk.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsDpdk.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsDpdk.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsDpdk.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsDpdk.SignalSignatures[K]>): void;

        // Methods
        get_devargs(): string;

        get_lsc_interrupt(): SettingOvsDpdkLscInterrupt;

        get_n_rxq(): number;

        get_n_rxq_desc(): number;

        get_n_txq_desc(): number;
    }


    namespace SettingOvsExternalIDs {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::data": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            data: { [key: string]: string };
        }
    }

    class SettingOvsExternalIDs extends Setting {
        static $gtype: GObject.GType<SettingOvsExternalIDs>;

        // Properties
        get data(): { [key: string]: string };
        set data(val: { [key: string]: string });

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsExternalIDs.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsExternalIDs.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsExternalIDs;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsExternalIDs.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsExternalIDs.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsExternalIDs.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsExternalIDs.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsExternalIDs.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsExternalIDs.SignalSignatures[K]>): void;

        // Static methods
        static check_key(key: string | null): boolean;

        static check_val(val: string | null): boolean;

        // Methods
        get_data(key: string): string;

    // Conflicted with GObject.Object.get_data
        get_data(...args: never[]): any;

        get_data_keys(): string[];

        set_data(key: string, val: string | null): void;

    // Conflicted with GObject.Object.set_data
        set_data(...args: never[]): any;
    }


    namespace SettingOvsInterface {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::ofport-request": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            ofport_request: number;
            ofportRequest: number;
            type: string;
        }
    }

    class SettingOvsInterface extends Setting {
        static $gtype: GObject.GType<SettingOvsInterface>;

        // Properties
        get ofport_request(): number;
        set ofport_request(val: number);

        get ofportRequest(): number;
        set ofportRequest(val: number);

        get type(): string;
        set type(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsInterface.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsInterface.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsInterface;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsInterface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsInterface.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsInterface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsInterface.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsInterface.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsInterface.SignalSignatures[K]>): void;

        // Methods
        get_interface_type(): string;

        get_ofport_request(): number;
    }


    namespace SettingOvsOtherConfig {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::data": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            data: { [key: string]: string };
        }
    }

    class SettingOvsOtherConfig extends Setting {
        static $gtype: GObject.GType<SettingOvsOtherConfig>;

        // Properties
        get data(): { [key: string]: string };
        set data(val: { [key: string]: string });

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsOtherConfig.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsOtherConfig.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsOtherConfig;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsOtherConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsOtherConfig.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsOtherConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsOtherConfig.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsOtherConfig.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsOtherConfig.SignalSignatures[K]>): void;

        // Methods
        get_data(key: string): string;

    // Conflicted with GObject.Object.get_data
        get_data(...args: never[]): any;

        get_data_keys(): string[];

        set_data(key: string, val: string | null): void;

    // Conflicted with GObject.Object.set_data
        set_data(...args: never[]): any;
    }


    namespace SettingOvsPatch {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::peer": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            peer: string;
        }
    }

    class SettingOvsPatch extends Setting {
        static $gtype: GObject.GType<SettingOvsPatch>;

        // Properties
        get peer(): string;
        set peer(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsPatch.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsPatch.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsPatch;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsPatch.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsPatch.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsPatch.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsPatch.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsPatch.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsPatch.SignalSignatures[K]>): void;

        // Methods
        get_peer(): string;
    }


    namespace SettingOvsPort {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::bond-downdelay": (pspec: GObject.ParamSpec) => void;
            "notify::bond-mode": (pspec: GObject.ParamSpec) => void;
            "notify::bond-updelay": (pspec: GObject.ParamSpec) => void;
            "notify::lacp": (pspec: GObject.ParamSpec) => void;
            "notify::tag": (pspec: GObject.ParamSpec) => void;
            "notify::trunks": (pspec: GObject.ParamSpec) => void;
            "notify::vlan-mode": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            bond_downdelay: number;
            bondDowndelay: number;
            bond_mode: string;
            bondMode: string;
            bond_updelay: number;
            bondUpdelay: number;
            lacp: string;
            tag: number;
            trunks: Range[];
            vlan_mode: string;
            vlanMode: string;
        }
    }

    class SettingOvsPort extends Setting {
        static $gtype: GObject.GType<SettingOvsPort>;

        // Properties
        get bond_downdelay(): number;
        set bond_downdelay(val: number);

        get bondDowndelay(): number;
        set bondDowndelay(val: number);

        get bond_mode(): string;
        set bond_mode(val: string);

        get bondMode(): string;
        set bondMode(val: string);

        get bond_updelay(): number;
        set bond_updelay(val: number);

        get bondUpdelay(): number;
        set bondUpdelay(val: number);

        get lacp(): string;
        set lacp(val: string);

        get tag(): number;
        set tag(val: number);

        get trunks(): Range[];
        set trunks(val: Range[]);

        get vlan_mode(): string;
        set vlan_mode(val: string);

        get vlanMode(): string;
        set vlanMode(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingOvsPort.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingOvsPort.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingOvsPort;

        // Signals
        /** @signal */
        connect<K extends keyof SettingOvsPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsPort.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingOvsPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingOvsPort.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingOvsPort.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingOvsPort.SignalSignatures[K]>): void;

        // Methods
        add_trunk(trunk: Range): void;

        clear_trunks(): void;

        get_bond_downdelay(): number;

        get_bond_mode(): string;

        get_bond_updelay(): number;

        get_lacp(): string;

        get_num_trunks(): number;

        get_tag(): number;

        get_trunk(idx: number): Range;

        get_vlan_mode(): string;

        remove_trunk(idx: number): void;

        remove_trunk_by_value(start: number, end: number): boolean;
    }


    namespace SettingPpp {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::baud": (pspec: GObject.ParamSpec) => void;
            "notify::crtscts": (pspec: GObject.ParamSpec) => void;
            "notify::lcp-echo-failure": (pspec: GObject.ParamSpec) => void;
            "notify::lcp-echo-interval": (pspec: GObject.ParamSpec) => void;
            "notify::mppe-stateful": (pspec: GObject.ParamSpec) => void;
            "notify::mru": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::no-vj-comp": (pspec: GObject.ParamSpec) => void;
            "notify::noauth": (pspec: GObject.ParamSpec) => void;
            "notify::nobsdcomp": (pspec: GObject.ParamSpec) => void;
            "notify::nodeflate": (pspec: GObject.ParamSpec) => void;
            "notify::refuse-chap": (pspec: GObject.ParamSpec) => void;
            "notify::refuse-eap": (pspec: GObject.ParamSpec) => void;
            "notify::refuse-mschap": (pspec: GObject.ParamSpec) => void;
            "notify::refuse-mschapv2": (pspec: GObject.ParamSpec) => void;
            "notify::refuse-pap": (pspec: GObject.ParamSpec) => void;
            "notify::require-mppe": (pspec: GObject.ParamSpec) => void;
            "notify::require-mppe-128": (pspec: GObject.ParamSpec) => void;
            "notify::require-mppe128": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            baud: number;
            crtscts: boolean;
            lcp_echo_failure: number;
            lcpEchoFailure: number;
            lcp_echo_interval: number;
            lcpEchoInterval: number;
            mppe_stateful: boolean;
            mppeStateful: boolean;
            mru: number;
            mtu: number;
            no_vj_comp: boolean;
            noVjComp: boolean;
            noauth: boolean;
            nobsdcomp: boolean;
            nodeflate: boolean;
            refuse_chap: boolean;
            refuseChap: boolean;
            refuse_eap: boolean;
            refuseEap: boolean;
            refuse_mschap: boolean;
            refuseMschap: boolean;
            refuse_mschapv2: boolean;
            refuseMschapv2: boolean;
            refuse_pap: boolean;
            refusePap: boolean;
            require_mppe: boolean;
            requireMppe: boolean;
            require_mppe_128: boolean;
            requireMppe128: boolean;
        }
    }

    class SettingPpp extends Setting {
        static $gtype: GObject.GType<SettingPpp>;

        // Properties
        get baud(): number;
        set baud(val: number);

        get crtscts(): boolean;
        set crtscts(val: boolean);

        get lcp_echo_failure(): number;
        set lcp_echo_failure(val: number);

        get lcpEchoFailure(): number;
        set lcpEchoFailure(val: number);

        get lcp_echo_interval(): number;
        set lcp_echo_interval(val: number);

        get lcpEchoInterval(): number;
        set lcpEchoInterval(val: number);

        get mppe_stateful(): boolean;
        set mppe_stateful(val: boolean);

        get mppeStateful(): boolean;
        set mppeStateful(val: boolean);

        get mru(): number;
        set mru(val: number);

        get mtu(): number;
        set mtu(val: number);

        get no_vj_comp(): boolean;
        set no_vj_comp(val: boolean);

        get noVjComp(): boolean;
        set noVjComp(val: boolean);

        get noauth(): boolean;
        set noauth(val: boolean);

        get nobsdcomp(): boolean;
        set nobsdcomp(val: boolean);

        get nodeflate(): boolean;
        set nodeflate(val: boolean);

        get refuse_chap(): boolean;
        set refuse_chap(val: boolean);

        get refuseChap(): boolean;
        set refuseChap(val: boolean);

        get refuse_eap(): boolean;
        set refuse_eap(val: boolean);

        get refuseEap(): boolean;
        set refuseEap(val: boolean);

        get refuse_mschap(): boolean;
        set refuse_mschap(val: boolean);

        get refuseMschap(): boolean;
        set refuseMschap(val: boolean);

        get refuse_mschapv2(): boolean;
        set refuse_mschapv2(val: boolean);

        get refuseMschapv2(): boolean;
        set refuseMschapv2(val: boolean);

        get refuse_pap(): boolean;
        set refuse_pap(val: boolean);

        get refusePap(): boolean;
        set refusePap(val: boolean);

        get require_mppe(): boolean;
        set require_mppe(val: boolean);

        get requireMppe(): boolean;
        set requireMppe(val: boolean);

        get require_mppe_128(): boolean;
        set require_mppe_128(val: boolean);

        get requireMppe128(): boolean;
        set requireMppe128(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingPpp.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingPpp.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingPpp;

        // Signals
        /** @signal */
        connect<K extends keyof SettingPpp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingPpp.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingPpp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingPpp.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingPpp.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingPpp.SignalSignatures[K]>): void;

        // Methods
        get_baud(): number;

        get_crtscts(): boolean;

        get_lcp_echo_failure(): number;

        get_lcp_echo_interval(): number;

        get_mppe_stateful(): boolean;

        get_mru(): number;

        get_mtu(): number;

        get_no_vj_comp(): boolean;

        get_noauth(): boolean;

        get_nobsdcomp(): boolean;

        get_nodeflate(): boolean;

        get_refuse_chap(): boolean;

        get_refuse_eap(): boolean;

        get_refuse_mschap(): boolean;

        get_refuse_mschapv2(): boolean;

        get_refuse_pap(): boolean;

        get_require_mppe(): boolean;

        get_require_mppe_128(): boolean;
    }


    namespace SettingPppoe {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::service": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            parent: string;
            password: string;
            password_flags: SettingSecretFlags;
            passwordFlags: SettingSecretFlags;
            service: string;
            username: string;
        }
    }

    class SettingPppoe extends Setting {
        static $gtype: GObject.GType<SettingPppoe>;

        // Properties
        get parent(): string;
        set parent(val: string);

        get password(): string;
        set password(val: string);

        get password_flags(): SettingSecretFlags;
        set password_flags(val: SettingSecretFlags);

        get passwordFlags(): SettingSecretFlags;
        set passwordFlags(val: SettingSecretFlags);

        get service(): string;
        set service(val: string);

        get username(): string;
        set username(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingPppoe.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingPppoe.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingPppoe;

        // Signals
        /** @signal */
        connect<K extends keyof SettingPppoe.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingPppoe.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingPppoe.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingPppoe.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingPppoe.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingPppoe.SignalSignatures[K]>): void;

        // Methods
        get_parent(): string;

        get_password(): string;

        get_password_flags(): SettingSecretFlags;

        get_service(): string;

        get_username(): string;
    }


    namespace SettingPrefixDelegation {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::subnet-id": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            subnet_id: bigint | number;
            subnetId: bigint | number;
        }
    }

    class SettingPrefixDelegation extends Setting {
        static $gtype: GObject.GType<SettingPrefixDelegation>;

        // Properties
        get subnet_id(): number;
        set subnet_id(val: bigint | number);

        get subnetId(): number;
        set subnetId(val: bigint | number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingPrefixDelegation.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingPrefixDelegation.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingPrefixDelegation;

        // Signals
        /** @signal */
        connect<K extends keyof SettingPrefixDelegation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingPrefixDelegation.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingPrefixDelegation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingPrefixDelegation.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingPrefixDelegation.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingPrefixDelegation.SignalSignatures[K]>): void;

        // Methods
        get_subnet_id(): number;
    }


    namespace SettingProxy {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::browser-only": (pspec: GObject.ParamSpec) => void;
            "notify::method": (pspec: GObject.ParamSpec) => void;
            "notify::pac-script": (pspec: GObject.ParamSpec) => void;
            "notify::pac-url": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            browser_only: boolean;
            browserOnly: boolean;
            method: number;
            pac_script: string;
            pacScript: string;
            pac_url: string;
            pacUrl: string;
        }
    }

    class SettingProxy extends Setting {
        static $gtype: GObject.GType<SettingProxy>;

        // Properties
        get browser_only(): boolean;
        set browser_only(val: boolean);

        get browserOnly(): boolean;
        set browserOnly(val: boolean);

        get method(): number;
        set method(val: number);

        get pac_script(): string;
        set pac_script(val: string);

        get pacScript(): string;
        set pacScript(val: string);

        get pac_url(): string;
        set pac_url(val: string);

        get pacUrl(): string;
        set pacUrl(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingProxy.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingProxy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingProxy;

        // Signals
        /** @signal */
        connect<K extends keyof SettingProxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingProxy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingProxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingProxy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingProxy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingProxy.SignalSignatures[K]>): void;

        // Methods
        get_browser_only(): boolean;

        get_method(): SettingProxyMethod;

        get_pac_script(): string;

        get_pac_url(): string;
    }


    namespace SettingSerial {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::baud": (pspec: GObject.ParamSpec) => void;
            "notify::bits": (pspec: GObject.ParamSpec) => void;
            "notify::parity": (pspec: GObject.ParamSpec) => void;
            "notify::send-delay": (pspec: GObject.ParamSpec) => void;
            "notify::stopbits": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            baud: number;
            bits: number;
            parity: SettingSerialParity;
            send_delay: bigint | number;
            sendDelay: bigint | number;
            stopbits: number;
        }
    }

    class SettingSerial extends Setting {
        static $gtype: GObject.GType<SettingSerial>;

        // Properties
        get baud(): number;
        set baud(val: number);

        get bits(): number;
        set bits(val: number);

        get parity(): SettingSerialParity;
        set parity(val: SettingSerialParity);

        get send_delay(): number;
        set send_delay(val: bigint | number);

        get sendDelay(): number;
        set sendDelay(val: bigint | number);

        get stopbits(): number;
        set stopbits(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingSerial.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingSerial.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingSerial;

        // Signals
        /** @signal */
        connect<K extends keyof SettingSerial.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingSerial.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingSerial.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingSerial.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingSerial.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingSerial.SignalSignatures[K]>): void;

        // Methods
        get_baud(): number;

        get_bits(): number;

        get_parity(): SettingSerialParity;

        get_send_delay(): number;

        get_stopbits(): number;
    }


    namespace SettingSriov {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::autoprobe-drivers": (pspec: GObject.ParamSpec) => void;
            "notify::eswitch-encap-mode": (pspec: GObject.ParamSpec) => void;
            "notify::eswitch-inline-mode": (pspec: GObject.ParamSpec) => void;
            "notify::eswitch-mode": (pspec: GObject.ParamSpec) => void;
            "notify::preserve-on-down": (pspec: GObject.ParamSpec) => void;
            "notify::total-vfs": (pspec: GObject.ParamSpec) => void;
            "notify::vfs": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            autoprobe_drivers: Ternary;
            autoprobeDrivers: Ternary;
            eswitch_encap_mode: number;
            eswitchEncapMode: number;
            eswitch_inline_mode: number;
            eswitchInlineMode: number;
            eswitch_mode: number;
            eswitchMode: number;
            preserve_on_down: number;
            preserveOnDown: number;
            total_vfs: number;
            totalVfs: number;
            vfs: SriovVF[];
        }
    }

    class SettingSriov extends Setting {
        static $gtype: GObject.GType<SettingSriov>;

        // Properties
        get autoprobe_drivers(): Ternary;
        set autoprobe_drivers(val: Ternary);

        get autoprobeDrivers(): Ternary;
        set autoprobeDrivers(val: Ternary);

        get eswitch_encap_mode(): number;
        set eswitch_encap_mode(val: number);

        get eswitchEncapMode(): number;
        set eswitchEncapMode(val: number);

        get eswitch_inline_mode(): number;
        set eswitch_inline_mode(val: number);

        get eswitchInlineMode(): number;
        set eswitchInlineMode(val: number);

        get eswitch_mode(): number;
        set eswitch_mode(val: number);

        get eswitchMode(): number;
        set eswitchMode(val: number);

        get preserve_on_down(): number;
        set preserve_on_down(val: number);

        get preserveOnDown(): number;
        set preserveOnDown(val: number);

        get total_vfs(): number;
        set total_vfs(val: number);

        get totalVfs(): number;
        set totalVfs(val: number);

        get vfs(): SriovVF[];
        set vfs(val: SriovVF[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingSriov.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingSriov.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingSriov;

        // Signals
        /** @signal */
        connect<K extends keyof SettingSriov.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingSriov.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingSriov.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingSriov.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingSriov.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingSriov.SignalSignatures[K]>): void;

        // Methods
        add_vf(vf: SriovVF): void;

        clear_vfs(): void;

        get_autoprobe_drivers(): Ternary;

        get_eswitch_encap_mode(): SriovEswitchEncapMode;

        get_eswitch_inline_mode(): SriovEswitchInlineMode;

        get_eswitch_mode(): SriovEswitchMode;

        get_num_vfs(): number;

        get_preserve_on_down(): SriovPreserveOnDown;

        get_total_vfs(): number;

        get_vf(idx: number): SriovVF;

        remove_vf(idx: number): void;

        remove_vf_by_index(index: number): boolean;
    }


    namespace SettingTCConfig {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::qdiscs": (pspec: GObject.ParamSpec) => void;
            "notify::tfilters": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            qdiscs: TCQdisc[];
            tfilters: TCTfilter[];
        }
    }

    class SettingTCConfig extends Setting {
        static $gtype: GObject.GType<SettingTCConfig>;

        // Properties
        get qdiscs(): TCQdisc[];
        set qdiscs(val: TCQdisc[]);

        get tfilters(): TCTfilter[];
        set tfilters(val: TCTfilter[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingTCConfig.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingTCConfig.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingTCConfig;

        // Signals
        /** @signal */
        connect<K extends keyof SettingTCConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTCConfig.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingTCConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTCConfig.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingTCConfig.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingTCConfig.SignalSignatures[K]>): void;

        // Methods
        add_qdisc(qdisc: TCQdisc): boolean;

        add_tfilter(tfilter: TCTfilter): boolean;

        clear_qdiscs(): void;

        clear_tfilters(): void;

        get_num_qdiscs(): number;

        get_num_tfilters(): number;

        get_qdisc(idx: number): TCQdisc;

        get_tfilter(idx: number): TCTfilter;

        remove_qdisc(idx: number): void;

        remove_qdisc_by_value(qdisc: TCQdisc): boolean;

        remove_tfilter(idx: number): void;

        remove_tfilter_by_value(tfilter: TCTfilter): boolean;
    }


    namespace SettingTeam {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::config": (pspec: GObject.ParamSpec) => void;
            "notify::link-watchers": (pspec: GObject.ParamSpec) => void;
            "notify::mcast-rejoin-count": (pspec: GObject.ParamSpec) => void;
            "notify::mcast-rejoin-interval": (pspec: GObject.ParamSpec) => void;
            "notify::notify-peers-count": (pspec: GObject.ParamSpec) => void;
            "notify::notify-peers-interval": (pspec: GObject.ParamSpec) => void;
            "notify::runner": (pspec: GObject.ParamSpec) => void;
            "notify::runner-active": (pspec: GObject.ParamSpec) => void;
            "notify::runner-agg-select-policy": (pspec: GObject.ParamSpec) => void;
            "notify::runner-fast-rate": (pspec: GObject.ParamSpec) => void;
            "notify::runner-hwaddr-policy": (pspec: GObject.ParamSpec) => void;
            "notify::runner-min-ports": (pspec: GObject.ParamSpec) => void;
            "notify::runner-sys-prio": (pspec: GObject.ParamSpec) => void;
            "notify::runner-tx-balancer": (pspec: GObject.ParamSpec) => void;
            "notify::runner-tx-balancer-interval": (pspec: GObject.ParamSpec) => void;
            "notify::runner-tx-hash": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            config: string;
            link_watchers: TeamLinkWatcher[];
            linkWatchers: TeamLinkWatcher[];
            mcast_rejoin_count: number;
            mcastRejoinCount: number;
            mcast_rejoin_interval: number;
            mcastRejoinInterval: number;
            notify_peers_count: number;
            notifyPeersCount: number;
            notify_peers_interval: number;
            notifyPeersInterval: number;
            runner: string;
            runner_active: boolean;
            runnerActive: boolean;
            runner_agg_select_policy: string;
            runnerAggSelectPolicy: string;
            runner_fast_rate: boolean;
            runnerFastRate: boolean;
            runner_hwaddr_policy: string;
            runnerHwaddrPolicy: string;
            runner_min_ports: number;
            runnerMinPorts: number;
            runner_sys_prio: number;
            runnerSysPrio: number;
            runner_tx_balancer: string;
            runnerTxBalancer: string;
            runner_tx_balancer_interval: number;
            runnerTxBalancerInterval: number;
            runner_tx_hash: string[];
            runnerTxHash: string[];
        }
    }

    class SettingTeam extends Setting {
        static $gtype: GObject.GType<SettingTeam>;

        // Properties
        get config(): string;
        set config(val: string);

        get link_watchers(): TeamLinkWatcher[];
        set link_watchers(val: TeamLinkWatcher[]);

        get linkWatchers(): TeamLinkWatcher[];
        set linkWatchers(val: TeamLinkWatcher[]);

        get mcast_rejoin_count(): number;
        set mcast_rejoin_count(val: number);

        get mcastRejoinCount(): number;
        set mcastRejoinCount(val: number);

        get mcast_rejoin_interval(): number;
        set mcast_rejoin_interval(val: number);

        get mcastRejoinInterval(): number;
        set mcastRejoinInterval(val: number);

        get notify_peers_count(): number;
        set notify_peers_count(val: number);

        get notifyPeersCount(): number;
        set notifyPeersCount(val: number);

        get notify_peers_interval(): number;
        set notify_peers_interval(val: number);

        get notifyPeersInterval(): number;
        set notifyPeersInterval(val: number);

        get runner(): string;
        set runner(val: string);

        get runner_active(): boolean;
        set runner_active(val: boolean);

        get runnerActive(): boolean;
        set runnerActive(val: boolean);

        get runner_agg_select_policy(): string;
        set runner_agg_select_policy(val: string);

        get runnerAggSelectPolicy(): string;
        set runnerAggSelectPolicy(val: string);

        get runner_fast_rate(): boolean;
        set runner_fast_rate(val: boolean);

        get runnerFastRate(): boolean;
        set runnerFastRate(val: boolean);

        get runner_hwaddr_policy(): string;
        set runner_hwaddr_policy(val: string);

        get runnerHwaddrPolicy(): string;
        set runnerHwaddrPolicy(val: string);

        get runner_min_ports(): number;
        set runner_min_ports(val: number);

        get runnerMinPorts(): number;
        set runnerMinPorts(val: number);

        get runner_sys_prio(): number;
        set runner_sys_prio(val: number);

        get runnerSysPrio(): number;
        set runnerSysPrio(val: number);

        get runner_tx_balancer(): string;
        set runner_tx_balancer(val: string);

        get runnerTxBalancer(): string;
        set runnerTxBalancer(val: string);

        get runner_tx_balancer_interval(): number;
        set runner_tx_balancer_interval(val: number);

        get runnerTxBalancerInterval(): number;
        set runnerTxBalancerInterval(val: number);

        get runner_tx_hash(): string[];
        set runner_tx_hash(val: string[]);

        get runnerTxHash(): string[];
        set runnerTxHash(val: string[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingTeam.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingTeam.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingTeam;

        // Signals
        /** @signal */
        connect<K extends keyof SettingTeam.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTeam.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingTeam.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTeam.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingTeam.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingTeam.SignalSignatures[K]>): void;

        // Methods
        add_link_watcher(link_watcher: TeamLinkWatcher): boolean;

        add_runner_tx_hash(txhash: string): boolean;

        clear_link_watchers(): void;

        get_config(): string;

        get_link_watcher(idx: number): TeamLinkWatcher;

        get_mcast_rejoin_count(): number;

        get_mcast_rejoin_interval(): number;

        get_notify_peers_count(): number;

        get_notify_peers_interval(): number;

        get_num_link_watchers(): number;

        get_num_runner_tx_hash(): number;

        get_runner(): string;

        get_runner_active(): boolean;

        get_runner_agg_select_policy(): string;

        get_runner_fast_rate(): boolean;

        get_runner_hwaddr_policy(): string;

        get_runner_min_ports(): number;

        get_runner_sys_prio(): number;

        get_runner_tx_balancer(): string;

        get_runner_tx_balancer_interval(): number;

        get_runner_tx_hash(idx: number): string;

        remove_link_watcher(idx: number): void;

        remove_link_watcher_by_value(link_watcher: TeamLinkWatcher): boolean;

        remove_runner_tx_hash(idx: number): void;

        remove_runner_tx_hash_by_value(txhash: string): boolean;
    }


    namespace SettingTeamPort {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::config": (pspec: GObject.ParamSpec) => void;
            "notify::lacp-key": (pspec: GObject.ParamSpec) => void;
            "notify::lacp-prio": (pspec: GObject.ParamSpec) => void;
            "notify::link-watchers": (pspec: GObject.ParamSpec) => void;
            "notify::prio": (pspec: GObject.ParamSpec) => void;
            "notify::queue-id": (pspec: GObject.ParamSpec) => void;
            "notify::sticky": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            config: string;
            lacp_key: number;
            lacpKey: number;
            lacp_prio: number;
            lacpPrio: number;
            link_watchers: TeamLinkWatcher[];
            linkWatchers: TeamLinkWatcher[];
            prio: number;
            queue_id: number;
            queueId: number;
            sticky: boolean;
        }
    }

    class SettingTeamPort extends Setting {
        static $gtype: GObject.GType<SettingTeamPort>;

        // Properties
        get config(): string;
        set config(val: string);

        get lacp_key(): number;
        set lacp_key(val: number);

        get lacpKey(): number;
        set lacpKey(val: number);

        get lacp_prio(): number;
        set lacp_prio(val: number);

        get lacpPrio(): number;
        set lacpPrio(val: number);

        get link_watchers(): TeamLinkWatcher[];
        set link_watchers(val: TeamLinkWatcher[]);

        get linkWatchers(): TeamLinkWatcher[];
        set linkWatchers(val: TeamLinkWatcher[]);

        get prio(): number;
        set prio(val: number);

        get queue_id(): number;
        set queue_id(val: number);

        get queueId(): number;
        set queueId(val: number);

        get sticky(): boolean;
        set sticky(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingTeamPort.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingTeamPort.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingTeamPort;

        // Signals
        /** @signal */
        connect<K extends keyof SettingTeamPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTeamPort.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingTeamPort.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTeamPort.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingTeamPort.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingTeamPort.SignalSignatures[K]>): void;

        // Methods
        add_link_watcher(link_watcher: TeamLinkWatcher): boolean;

        clear_link_watchers(): void;

        get_config(): string;

        get_lacp_key(): number;

        get_lacp_prio(): number;

        get_link_watcher(idx: number): TeamLinkWatcher;

        get_num_link_watchers(): number;

        get_prio(): number;

        get_queue_id(): number;

        get_sticky(): boolean;

        remove_link_watcher(idx: number): void;

        remove_link_watcher_by_value(link_watcher: TeamLinkWatcher): boolean;
    }


    namespace SettingTun {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::group": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::multi-queue": (pspec: GObject.ParamSpec) => void;
            "notify::owner": (pspec: GObject.ParamSpec) => void;
            "notify::pi": (pspec: GObject.ParamSpec) => void;
            "notify::vnet-hdr": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            group: string;
            mode: number;
            multi_queue: boolean;
            multiQueue: boolean;
            owner: string;
            pi: boolean;
            vnet_hdr: boolean;
            vnetHdr: boolean;
        }
    }

    class SettingTun extends Setting {
        static $gtype: GObject.GType<SettingTun>;

        // Properties
        get group(): string;
        set group(val: string);

        get mode(): number;
        set mode(val: number);

        get multi_queue(): boolean;
        set multi_queue(val: boolean);

        get multiQueue(): boolean;
        set multiQueue(val: boolean);

        get owner(): string;
        set owner(val: string);

        get pi(): boolean;
        set pi(val: boolean);

        get vnet_hdr(): boolean;
        set vnet_hdr(val: boolean);

        get vnetHdr(): boolean;
        set vnetHdr(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingTun.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingTun.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingTun;

        // Signals
        /** @signal */
        connect<K extends keyof SettingTun.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTun.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingTun.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingTun.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingTun.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingTun.SignalSignatures[K]>): void;

        // Methods
        get_group(): string;

        get_mode(): SettingTunMode;

        get_multi_queue(): boolean;

        get_owner(): string;

        get_pi(): boolean;

        get_vnet_hdr(): boolean;
    }


    namespace SettingUser {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::data": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            data: { [key: string]: string };
        }
    }

    class SettingUser extends Setting {
        static $gtype: GObject.GType<SettingUser>;

        // Properties
        get data(): { [key: string]: string };
        set data(val: { [key: string]: string });

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingUser.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingUser.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingUser;

        // Signals
        /** @signal */
        connect<K extends keyof SettingUser.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingUser.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingUser.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingUser.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingUser.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingUser.SignalSignatures[K]>): void;

        // Static methods
        static check_key(key: string): boolean;

        static check_val(val: string): boolean;

        // Methods
        get_data(key: string): string;

    // Conflicted with GObject.Object.get_data
        get_data(...args: never[]): any;

        get_keys(): string[];

        set_data(key: string, val: string | null): boolean;

    // Conflicted with GObject.Object.set_data
        set_data(...args: never[]): any;
    }


    namespace SettingVeth {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::peer": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            peer: string;
        }
    }

    class SettingVeth extends Setting {
        static $gtype: GObject.GType<SettingVeth>;

        // Properties
        get peer(): string;
        set peer(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingVeth.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingVeth.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingVeth;

        // Signals
        /** @signal */
        connect<K extends keyof SettingVeth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVeth.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingVeth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVeth.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingVeth.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingVeth.SignalSignatures[K]>): void;

        // Methods
        get_peer(): string;
    }


    namespace SettingVlan {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::egress-priority-map": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::ingress-priority-map": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            egress_priority_map: string[];
            egressPriorityMap: string[];
            flags: VlanFlags;
            id: number;
            ingress_priority_map: string[];
            ingressPriorityMap: string[];
            parent: string;
            protocol: string;
        }
    }

    class SettingVlan extends Setting {
        static $gtype: GObject.GType<SettingVlan>;

        // Properties
        get egress_priority_map(): string[];
        set egress_priority_map(val: string[]);

        get egressPriorityMap(): string[];
        set egressPriorityMap(val: string[]);

        get flags(): VlanFlags;
        set flags(val: VlanFlags);

        get id(): number;
        set id(val: number);

        get ingress_priority_map(): string[];
        set ingress_priority_map(val: string[]);

        get ingressPriorityMap(): string[];
        set ingressPriorityMap(val: string[]);

        get parent(): string;
        set parent(val: string);

        get protocol(): string;
        set protocol(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingVlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingVlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingVlan;

        // Signals
        /** @signal */
        connect<K extends keyof SettingVlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingVlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingVlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingVlan.SignalSignatures[K]>): void;

        // Methods
        add_priority(map: VlanPriorityMap, from: number, to: number): boolean;

        add_priority_str(map: VlanPriorityMap, str: string): boolean;

        clear_priorities(map: VlanPriorityMap): void;

        get_flags(): number;

        get_id(): number;

        get_num_priorities(map: VlanPriorityMap): number;

        get_parent(): string;

        get_priority(map: VlanPriorityMap, idx: number): [boolean, number, number];

        get_protocol(): string;

        remove_priority(map: VlanPriorityMap, idx: number): void;

        remove_priority_by_value(map: VlanPriorityMap, from: number, to: number): boolean;

        remove_priority_str_by_value(map: VlanPriorityMap, str: string): boolean;
    }


    namespace SettingVpn {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::data": (pspec: GObject.ParamSpec) => void;
            "notify::persistent": (pspec: GObject.ParamSpec) => void;
            "notify::secrets": (pspec: GObject.ParamSpec) => void;
            "notify::service-type": (pspec: GObject.ParamSpec) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::user-name": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            data: { [key: string]: string };
            persistent: boolean;
            secrets: { [key: string]: string };
            service_type: string;
            serviceType: string;
            timeout: number;
            user_name: string;
            userName: string;
        }
    }

    class SettingVpn extends Setting {
        static $gtype: GObject.GType<SettingVpn>;

        // Properties
        get data(): { [key: string]: string };
        set data(val: { [key: string]: string });

        get persistent(): boolean;
        set persistent(val: boolean);

        get secrets(): { [key: string]: string };
        set secrets(val: { [key: string]: string });

        get service_type(): string;
        set service_type(val: string);

        get serviceType(): string;
        set serviceType(val: string);

        get timeout(): number;
        set timeout(val: number);

        get user_name(): string;
        set user_name(val: string);

        get userName(): string;
        set userName(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingVpn.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingVpn.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingVpn;

        // Signals
        /** @signal */
        connect<K extends keyof SettingVpn.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVpn.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingVpn.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVpn.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingVpn.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingVpn.SignalSignatures[K]>): void;

        // Methods
        add_data_item(key: string, item: string | null): void;

        add_secret(key: string, secret: string | null): void;

        foreach_data_item(func: VpnIterFunc): void;

        foreach_secret(func: VpnIterFunc): void;

        get_data_item(key: string): string;

        get_data_keys(): string[] | null;

        get_num_data_items(): number;

        get_num_secrets(): number;

        get_persistent(): boolean;

        get_secret(key: string): string;

        get_secret_keys(): string[] | null;

        get_service_type(): string;

        get_timeout(): number;

        get_user_name(): string;

        remove_data_item(key: string): boolean;

        remove_secret(key: string): boolean;
    }


    namespace SettingVrf {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::table": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            table: number;
        }
    }

    class SettingVrf extends Setting {
        static $gtype: GObject.GType<SettingVrf>;

        // Properties
        get table(): number;
        set table(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingVrf.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingVrf.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingVrf;

        // Signals
        /** @signal */
        connect<K extends keyof SettingVrf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVrf.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingVrf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVrf.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingVrf.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingVrf.SignalSignatures[K]>): void;

        // Methods
        get_table(): number;
    }


    namespace SettingVxlan {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::ageing": (pspec: GObject.ParamSpec) => void;
            "notify::destination-port": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::l2-miss": (pspec: GObject.ParamSpec) => void;
            "notify::l3-miss": (pspec: GObject.ParamSpec) => void;
            "notify::learning": (pspec: GObject.ParamSpec) => void;
            "notify::limit": (pspec: GObject.ParamSpec) => void;
            "notify::local": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            "notify::proxy": (pspec: GObject.ParamSpec) => void;
            "notify::remote": (pspec: GObject.ParamSpec) => void;
            "notify::rsc": (pspec: GObject.ParamSpec) => void;
            "notify::source-port-max": (pspec: GObject.ParamSpec) => void;
            "notify::source-port-min": (pspec: GObject.ParamSpec) => void;
            "notify::tos": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            ageing: number;
            destination_port: number;
            destinationPort: number;
            id: number;
            l2_miss: boolean;
            l2Miss: boolean;
            l3_miss: boolean;
            l3Miss: boolean;
            learning: boolean;
            limit: number;
            local: string;
            parent: string;
            proxy: boolean;
            remote: string;
            rsc: boolean;
            source_port_max: number;
            sourcePortMax: number;
            source_port_min: number;
            sourcePortMin: number;
            tos: number;
            ttl: number;
        }
    }

    class SettingVxlan extends Setting {
        static $gtype: GObject.GType<SettingVxlan>;

        // Properties
        get ageing(): number;
        set ageing(val: number);

        get destination_port(): number;
        set destination_port(val: number);

        get destinationPort(): number;
        set destinationPort(val: number);

        get id(): number;
        set id(val: number);

        get l2_miss(): boolean;
        set l2_miss(val: boolean);

        get l2Miss(): boolean;
        set l2Miss(val: boolean);

        get l3_miss(): boolean;
        set l3_miss(val: boolean);

        get l3Miss(): boolean;
        set l3Miss(val: boolean);

        get learning(): boolean;
        set learning(val: boolean);

        get limit(): number;
        set limit(val: number);

        get local(): string;
        set local(val: string);

        get parent(): string;
        set parent(val: string);

        get proxy(): boolean;
        set proxy(val: boolean);

        get remote(): string;
        set remote(val: string);

        get rsc(): boolean;
        set rsc(val: boolean);

        get source_port_max(): number;
        set source_port_max(val: number);

        get sourcePortMax(): number;
        set sourcePortMax(val: number);

        get source_port_min(): number;
        set source_port_min(val: number);

        get sourcePortMin(): number;
        set sourcePortMin(val: number);

        get tos(): number;
        set tos(val: number);

        get ttl(): number;
        set ttl(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingVxlan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingVxlan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingVxlan;

        // Signals
        /** @signal */
        connect<K extends keyof SettingVxlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVxlan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingVxlan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingVxlan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingVxlan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingVxlan.SignalSignatures[K]>): void;

        // Methods
        get_ageing(): number;

        get_destination_port(): number;

        get_id(): number;

        get_l2_miss(): boolean;

        get_l3_miss(): boolean;

        get_learning(): boolean;

        get_limit(): number;

        get_local(): string;

        get_parent(): string;

        get_proxy(): boolean;

        get_remote(): string;

        get_rsc(): boolean;

        get_source_port_max(): number;

        get_source_port_min(): number;

        get_tos(): number;

        get_ttl(): number;
    }


    namespace SettingWifiP2P {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::peer": (pspec: GObject.ParamSpec) => void;
            "notify::wfd-ies": (pspec: GObject.ParamSpec) => void;
            "notify::wps-method": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            peer: string;
            wfd_ies: GLib.Bytes | Uint8Array;
            wfdIes: GLib.Bytes | Uint8Array;
            wps_method: number;
            wpsMethod: number;
        }
    }

    class SettingWifiP2P extends Setting {
        static $gtype: GObject.GType<SettingWifiP2P>;

        // Properties
        get peer(): string;
        set peer(val: string);

        get wfd_ies(): GLib.Bytes;
        set wfd_ies(val: GLib.Bytes | Uint8Array);

        get wfdIes(): GLib.Bytes;
        set wfdIes(val: GLib.Bytes | Uint8Array);

        get wps_method(): number;
        set wps_method(val: number);

        get wpsMethod(): number;
        set wpsMethod(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWifiP2P.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWifiP2P.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWifiP2P;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWifiP2P.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWifiP2P.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWifiP2P.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWifiP2P.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWifiP2P.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWifiP2P.SignalSignatures[K]>): void;

        // Methods
        get_peer(): string;

        get_wfd_ies(): GLib.Bytes;

        get_wps_method(): SettingWirelessSecurityWpsMethod;
    }


    namespace SettingWimax {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::network-name": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            mac_address: string;
            macAddress: string;
            network_name: string;
            networkName: string;
        }
    }

    class SettingWimax extends Setting {
        static $gtype: GObject.GType<SettingWimax>;

        // Properties
        get mac_address(): string;
        set mac_address(val: string);

        get macAddress(): string;
        set macAddress(val: string);

        get network_name(): string;
        set network_name(val: string);

        get networkName(): string;
        set networkName(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWimax.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWimax.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWimax;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWimax.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWimax.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWimax.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWimax.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWimax.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWimax.SignalSignatures[K]>): void;

        // Methods
        get_mac_address(): string;

        get_network_name(): string;
    }


    namespace SettingWireGuard {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::fwmark": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-auto-default-route": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-auto-default-route": (pspec: GObject.ParamSpec) => void;
            "notify::listen-port": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::peer-routes": (pspec: GObject.ParamSpec) => void;
            "notify::private-key": (pspec: GObject.ParamSpec) => void;
            "notify::private-key-flags": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            fwmark: number;
            ip4_auto_default_route: Ternary;
            ip4AutoDefaultRoute: Ternary;
            ip6_auto_default_route: Ternary;
            ip6AutoDefaultRoute: Ternary;
            listen_port: number;
            listenPort: number;
            mtu: number;
            peer_routes: boolean;
            peerRoutes: boolean;
            private_key: string;
            privateKey: string;
            private_key_flags: SettingSecretFlags;
            privateKeyFlags: SettingSecretFlags;
        }
    }

    class SettingWireGuard extends Setting {
        static $gtype: GObject.GType<SettingWireGuard>;

        // Properties
        get fwmark(): number;
        set fwmark(val: number);

        get ip4_auto_default_route(): Ternary;
        set ip4_auto_default_route(val: Ternary);

        get ip4AutoDefaultRoute(): Ternary;
        set ip4AutoDefaultRoute(val: Ternary);

        get ip6_auto_default_route(): Ternary;
        set ip6_auto_default_route(val: Ternary);

        get ip6AutoDefaultRoute(): Ternary;
        set ip6AutoDefaultRoute(val: Ternary);

        get listen_port(): number;
        set listen_port(val: number);

        get listenPort(): number;
        set listenPort(val: number);

        get mtu(): number;
        set mtu(val: number);

        get peer_routes(): boolean;
        set peer_routes(val: boolean);

        get peerRoutes(): boolean;
        set peerRoutes(val: boolean);

        get private_key(): string;
        set private_key(val: string);

        get privateKey(): string;
        set privateKey(val: string);

        get private_key_flags(): SettingSecretFlags;
        set private_key_flags(val: SettingSecretFlags);

        get privateKeyFlags(): SettingSecretFlags;
        set privateKeyFlags(val: SettingSecretFlags);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWireGuard.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWireGuard.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWireGuard;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWireGuard.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWireGuard.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWireGuard.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWireGuard.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWireGuard.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWireGuard.SignalSignatures[K]>): void;

        // Methods
        append_peer(peer: WireGuardPeer): void;

        clear_peers(): number;

        get_fwmark(): number;

        get_ip4_auto_default_route(): Ternary;

        get_ip6_auto_default_route(): Ternary;

        get_listen_port(): number;

        get_mtu(): number;

        get_peer(idx: number): WireGuardPeer;

        get_peer_by_public_key(public_key: string): [WireGuardPeer | null, number];

        get_peer_routes(): boolean;

        get_peers_len(): number;

        get_private_key(): string;

        get_private_key_flags(): SettingSecretFlags;

        remove_peer(idx: number): boolean;

        set_peer(peer: WireGuardPeer, idx: number): void;
    }


    namespace SettingWired {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::accept-all-mac-addresses": (pspec: GObject.ParamSpec) => void;
            "notify::auto-negotiate": (pspec: GObject.ParamSpec) => void;
            "notify::cloned-mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::duplex": (pspec: GObject.ParamSpec) => void;
            "notify::generate-mac-address-mask": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address-blacklist": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address-denylist": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::port": (pspec: GObject.ParamSpec) => void;
            "notify::s390-nettype": (pspec: GObject.ParamSpec) => void;
            "notify::s390-options": (pspec: GObject.ParamSpec) => void;
            "notify::s390-subchannels": (pspec: GObject.ParamSpec) => void;
            "notify::speed": (pspec: GObject.ParamSpec) => void;
            "notify::wake-on-lan": (pspec: GObject.ParamSpec) => void;
            "notify::wake-on-lan-password": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            accept_all_mac_addresses: Ternary;
            acceptAllMacAddresses: Ternary;
            auto_negotiate: boolean;
            autoNegotiate: boolean;
            cloned_mac_address: string;
            clonedMacAddress: string;
            duplex: string;
            generate_mac_address_mask: string;
            generateMacAddressMask: string;
            mac_address: string;
            macAddress: string;
            mac_address_blacklist: string[];
            macAddressBlacklist: string[];
            mac_address_denylist: string[];
            macAddressDenylist: string[];
            mtu: number;
            port: string;
            s390_nettype: string;
            s390Nettype: string;
            s390_options: { [key: string]: string };
            s390Options: { [key: string]: string };
            s390_subchannels: string[];
            s390Subchannels: string[];
            speed: number;
            wake_on_lan: number;
            wakeOnLan: number;
            wake_on_lan_password: string;
            wakeOnLanPassword: string;
        }
    }

    class SettingWired extends Setting {
        static $gtype: GObject.GType<SettingWired>;

        // Properties
        get accept_all_mac_addresses(): Ternary;
        set accept_all_mac_addresses(val: Ternary);

        get acceptAllMacAddresses(): Ternary;
        set acceptAllMacAddresses(val: Ternary);

        get auto_negotiate(): boolean;
        set auto_negotiate(val: boolean);

        get autoNegotiate(): boolean;
        set autoNegotiate(val: boolean);

        get cloned_mac_address(): string;
        set cloned_mac_address(val: string);

        get clonedMacAddress(): string;
        set clonedMacAddress(val: string);

        get duplex(): string;
        set duplex(val: string);

        get generate_mac_address_mask(): string;
        set generate_mac_address_mask(val: string);

        get generateMacAddressMask(): string;
        set generateMacAddressMask(val: string);

        get mac_address(): string;
        set mac_address(val: string);

        get macAddress(): string;
        set macAddress(val: string);

        get mac_address_blacklist(): string[];
        set mac_address_blacklist(val: string[]);

        get macAddressBlacklist(): string[];
        set macAddressBlacklist(val: string[]);

        get mac_address_denylist(): string[];
        set mac_address_denylist(val: string[]);

        get macAddressDenylist(): string[];
        set macAddressDenylist(val: string[]);

        get mtu(): number;
        set mtu(val: number);

        get port(): string;
        set port(val: string);

        get s390_nettype(): string;
        set s390_nettype(val: string);

        get s390Nettype(): string;
        set s390Nettype(val: string);

        get s390_options(): { [key: string]: string };
        set s390_options(val: { [key: string]: string });

        get s390Options(): { [key: string]: string };
        set s390Options(val: { [key: string]: string });

        get s390_subchannels(): string[];
        set s390_subchannels(val: string[]);

        get s390Subchannels(): string[];
        set s390Subchannels(val: string[]);

        get speed(): number;
        set speed(val: number);

        get wake_on_lan(): number;
        set wake_on_lan(val: number);

        get wakeOnLan(): number;
        set wakeOnLan(val: number);

        get wake_on_lan_password(): string;
        set wake_on_lan_password(val: string);

        get wakeOnLanPassword(): string;
        set wakeOnLanPassword(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWired.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWired.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWired;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWired.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWired.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWired.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWired.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWired.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWired.SignalSignatures[K]>): void;

        // Methods
        add_mac_blacklist_item(mac: string): boolean;

        add_mac_denylist_item(mac: string): boolean;

        add_s390_option(key: string, value: string): boolean;

        clear_mac_blacklist_items(): void;

        clear_mac_denylist_items(): void;

        get_accept_all_mac_addresses(): Ternary;

        get_auto_negotiate(): boolean;

        get_cloned_mac_address(): string;

        get_duplex(): string;

        get_generate_mac_address_mask(): string;

        get_mac_address(): string;

        get_mac_address_blacklist(): string[];

        get_mac_address_denylist(): string[];

        get_mac_blacklist_item(idx: number): string;

        get_mac_denylist_item(idx: number): string;

        get_mtu(): number;

        get_num_mac_blacklist_items(): number;

        get_num_mac_denylist_items(): number;

        get_num_s390_options(): number;

        get_port(): string;

        get_s390_nettype(): string;

        get_s390_option(idx: number): [boolean, string, string];

        get_s390_option_by_key(key: string): string;

        get_s390_subchannels(): string[];

        get_speed(): number;

        get_valid_s390_options(): string[];

        get_wake_on_lan(): SettingWiredWakeOnLan;

        get_wake_on_lan_password(): string;

        remove_mac_blacklist_item(idx: number): void;

        remove_mac_blacklist_item_by_value(mac: string): boolean;

        remove_mac_denylist_item(idx: number): void;

        remove_mac_denylist_item_by_value(mac: string): boolean;

        remove_s390_option(key: string): boolean;
    }


    namespace SettingWireless {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::ap-isolation": (pspec: GObject.ParamSpec) => void;
            "notify::band": (pspec: GObject.ParamSpec) => void;
            "notify::bssid": (pspec: GObject.ParamSpec) => void;
            "notify::channel": (pspec: GObject.ParamSpec) => void;
            "notify::channel-width": (pspec: GObject.ParamSpec) => void;
            "notify::cloned-mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::generate-mac-address-mask": (pspec: GObject.ParamSpec) => void;
            "notify::hidden": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address-blacklist": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address-denylist": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address-randomization": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::mtu": (pspec: GObject.ParamSpec) => void;
            "notify::powersave": (pspec: GObject.ParamSpec) => void;
            "notify::rate": (pspec: GObject.ParamSpec) => void;
            "notify::seen-bssids": (pspec: GObject.ParamSpec) => void;
            "notify::ssid": (pspec: GObject.ParamSpec) => void;
            "notify::tx-power": (pspec: GObject.ParamSpec) => void;
            "notify::wake-on-wlan": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            ap_isolation: Ternary;
            apIsolation: Ternary;
            band: string;
            bssid: string;
            channel: number;
            channel_width: number;
            channelWidth: number;
            cloned_mac_address: string;
            clonedMacAddress: string;
            generate_mac_address_mask: string;
            generateMacAddressMask: string;
            hidden: boolean;
            mac_address: string;
            macAddress: string;
            mac_address_blacklist: string[];
            macAddressBlacklist: string[];
            mac_address_denylist: string[];
            macAddressDenylist: string[];
            mac_address_randomization: number;
            macAddressRandomization: number;
            mode: string;
            mtu: number;
            powersave: number;
            rate: number;
            seen_bssids: string[];
            seenBssids: string[];
            ssid: GLib.Bytes | Uint8Array;
            tx_power: number;
            txPower: number;
            wake_on_wlan: number;
            wakeOnWlan: number;
        }
    }

    class SettingWireless extends Setting {
        static $gtype: GObject.GType<SettingWireless>;

        // Properties
        get ap_isolation(): Ternary;
        set ap_isolation(val: Ternary);

        get apIsolation(): Ternary;
        set apIsolation(val: Ternary);

        get band(): string;
        set band(val: string);

        get bssid(): string;
        set bssid(val: string);

        get channel(): number;
        set channel(val: number);

        get channel_width(): number;
        set channel_width(val: number);

        get channelWidth(): number;
        set channelWidth(val: number);

        get cloned_mac_address(): string;
        set cloned_mac_address(val: string);

        get clonedMacAddress(): string;
        set clonedMacAddress(val: string);

        get generate_mac_address_mask(): string;
        set generate_mac_address_mask(val: string);

        get generateMacAddressMask(): string;
        set generateMacAddressMask(val: string);

        get hidden(): boolean;
        set hidden(val: boolean);

        get mac_address(): string;
        set mac_address(val: string);

        get macAddress(): string;
        set macAddress(val: string);

        get mac_address_blacklist(): string[];
        set mac_address_blacklist(val: string[]);

        get macAddressBlacklist(): string[];
        set macAddressBlacklist(val: string[]);

        get mac_address_denylist(): string[];
        set mac_address_denylist(val: string[]);

        get macAddressDenylist(): string[];
        set macAddressDenylist(val: string[]);

        get mac_address_randomization(): number;
        set mac_address_randomization(val: number);

        get macAddressRandomization(): number;
        set macAddressRandomization(val: number);

        get mode(): string;
        set mode(val: string);

        get mtu(): number;
        set mtu(val: number);

        get powersave(): number;
        set powersave(val: number);

        get rate(): number;
        set rate(val: number);

        get seen_bssids(): string[];
        set seen_bssids(val: string[]);

        get seenBssids(): string[];
        set seenBssids(val: string[]);

        get ssid(): GLib.Bytes;
        set ssid(val: GLib.Bytes | Uint8Array);

        get tx_power(): number;
        set tx_power(val: number);

        get txPower(): number;
        set txPower(val: number);

        get wake_on_wlan(): number;
        set wake_on_wlan(val: number);

        get wakeOnWlan(): number;
        set wakeOnWlan(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWireless.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWireless.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWireless;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWireless.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWireless.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWireless.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWireless.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWireless.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWireless.SignalSignatures[K]>): void;

        // Methods
        add_mac_blacklist_item(mac: string): boolean;

        add_mac_denylist_item(mac: string): boolean;

        add_seen_bssid(bssid: string): boolean;

        ap_security_compatible(s_wireless_sec: SettingWirelessSecurity, ap_flags: __80211ApFlags, ap_wpa: __80211ApSecurityFlags, ap_rsn: __80211ApSecurityFlags, ap_mode: __80211Mode): boolean;

        clear_mac_blacklist_items(): void;

        clear_mac_denylist_items(): void;

        get_ap_isolation(): Ternary;

        get_band(): string;

        get_bssid(): string;

        get_channel(): number;

        get_channel_width(): SettingWirelessChannelWidth;

        get_cloned_mac_address(): string;

        get_generate_mac_address_mask(): string;

        get_hidden(): boolean;

        get_mac_address(): string;

        get_mac_address_blacklist(): string[];

        get_mac_address_denylist(): string[];

        get_mac_address_randomization(): SettingMacRandomization;

        get_mac_blacklist_item(idx: number): string;

        get_mac_denylist_item(idx: number): string;

        get_mode(): string;

        get_mtu(): number;

        get_num_mac_blacklist_items(): number;

        get_num_mac_denylist_items(): number;

        get_num_seen_bssids(): number;

        get_powersave(): number;

        get_rate(): number;

        get_seen_bssid(i: number): string;

        get_ssid(): GLib.Bytes;

        get_tx_power(): number;

        get_wake_on_wlan(): SettingWirelessWakeOnWLan;

        remove_mac_blacklist_item(idx: number): void;

        remove_mac_blacklist_item_by_value(mac: string): boolean;

        remove_mac_denylist_item(idx: number): void;

        remove_mac_denylist_item_by_value(mac: string): boolean;
    }


    namespace SettingWirelessSecurity {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::auth-alg": (pspec: GObject.ParamSpec) => void;
            "notify::fils": (pspec: GObject.ParamSpec) => void;
            "notify::group": (pspec: GObject.ParamSpec) => void;
            "notify::key-mgmt": (pspec: GObject.ParamSpec) => void;
            "notify::leap-password": (pspec: GObject.ParamSpec) => void;
            "notify::leap-password-flags": (pspec: GObject.ParamSpec) => void;
            "notify::leap-username": (pspec: GObject.ParamSpec) => void;
            "notify::pairwise": (pspec: GObject.ParamSpec) => void;
            "notify::pmf": (pspec: GObject.ParamSpec) => void;
            "notify::proto": (pspec: GObject.ParamSpec) => void;
            "notify::psk": (pspec: GObject.ParamSpec) => void;
            "notify::psk-flags": (pspec: GObject.ParamSpec) => void;
            "notify::wep-key-flags": (pspec: GObject.ParamSpec) => void;
            "notify::wep-key-type": (pspec: GObject.ParamSpec) => void;
            "notify::wep-key0": (pspec: GObject.ParamSpec) => void;
            "notify::wep-key1": (pspec: GObject.ParamSpec) => void;
            "notify::wep-key2": (pspec: GObject.ParamSpec) => void;
            "notify::wep-key3": (pspec: GObject.ParamSpec) => void;
            "notify::wep-tx-keyidx": (pspec: GObject.ParamSpec) => void;
            "notify::wps-method": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            auth_alg: string;
            authAlg: string;
            fils: number;
            group: string[];
            key_mgmt: string;
            keyMgmt: string;
            leap_password: string;
            leapPassword: string;
            leap_password_flags: SettingSecretFlags;
            leapPasswordFlags: SettingSecretFlags;
            leap_username: string;
            leapUsername: string;
            pairwise: string[];
            pmf: number;
            proto: string[];
            psk: string;
            psk_flags: SettingSecretFlags;
            pskFlags: SettingSecretFlags;
            wep_key_flags: SettingSecretFlags;
            wepKeyFlags: SettingSecretFlags;
            wep_key_type: WepKeyType;
            wepKeyType: WepKeyType;
            wep_key0: string;
            wepKey0: string;
            wep_key1: string;
            wepKey1: string;
            wep_key2: string;
            wepKey2: string;
            wep_key3: string;
            wepKey3: string;
            wep_tx_keyidx: number;
            wepTxKeyidx: number;
            wps_method: number;
            wpsMethod: number;
        }
    }

    class SettingWirelessSecurity extends Setting {
        static $gtype: GObject.GType<SettingWirelessSecurity>;

        // Properties
        get auth_alg(): string;
        set auth_alg(val: string);

        get authAlg(): string;
        set authAlg(val: string);

        get fils(): number;
        set fils(val: number);

        get group(): string[];
        set group(val: string[]);

        get key_mgmt(): string;
        set key_mgmt(val: string);

        get keyMgmt(): string;
        set keyMgmt(val: string);

        get leap_password(): string;
        set leap_password(val: string);

        get leapPassword(): string;
        set leapPassword(val: string);

        get leap_password_flags(): SettingSecretFlags;
        set leap_password_flags(val: SettingSecretFlags);

        get leapPasswordFlags(): SettingSecretFlags;
        set leapPasswordFlags(val: SettingSecretFlags);

        get leap_username(): string;
        set leap_username(val: string);

        get leapUsername(): string;
        set leapUsername(val: string);

        get pairwise(): string[];
        set pairwise(val: string[]);

        get pmf(): number;
        set pmf(val: number);

        get proto(): string[];
        set proto(val: string[]);

        get psk(): string;
        set psk(val: string);

        get psk_flags(): SettingSecretFlags;
        set psk_flags(val: SettingSecretFlags);

        get pskFlags(): SettingSecretFlags;
        set pskFlags(val: SettingSecretFlags);

        get wep_key_flags(): SettingSecretFlags;
        set wep_key_flags(val: SettingSecretFlags);

        get wepKeyFlags(): SettingSecretFlags;
        set wepKeyFlags(val: SettingSecretFlags);

        get wep_key_type(): WepKeyType;
        set wep_key_type(val: WepKeyType);

        get wepKeyType(): WepKeyType;
        set wepKeyType(val: WepKeyType);

        get wep_key0(): string;
        set wep_key0(val: string);

        get wepKey0(): string;
        set wepKey0(val: string);

        get wep_key1(): string;
        set wep_key1(val: string);

        get wepKey1(): string;
        set wepKey1(val: string);

        get wep_key2(): string;
        set wep_key2(val: string);

        get wepKey2(): string;
        set wepKey2(val: string);

        get wep_key3(): string;
        set wep_key3(val: string);

        get wepKey3(): string;
        set wepKey3(val: string);

        get wep_tx_keyidx(): number;
        set wep_tx_keyidx(val: number);

        get wepTxKeyidx(): number;
        set wepTxKeyidx(val: number);

        get wps_method(): number;
        set wps_method(val: number);

        get wpsMethod(): number;
        set wpsMethod(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWirelessSecurity.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWirelessSecurity.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWirelessSecurity;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWirelessSecurity.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWirelessSecurity.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWirelessSecurity.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWirelessSecurity.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWirelessSecurity.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWirelessSecurity.SignalSignatures[K]>): void;

        // Methods
        add_group(group: string): boolean;

        add_pairwise(pairwise: string): boolean;

        add_proto(proto: string): boolean;

        clear_groups(): void;

        clear_pairwise(): void;

        clear_protos(): void;

        get_auth_alg(): string;

        get_fils(): SettingWirelessSecurityFils;

        get_group(i: number): string;

        get_key_mgmt(): string;

        get_leap_password(): string;

        get_leap_password_flags(): SettingSecretFlags;

        get_leap_username(): string;

        get_num_groups(): number;

        get_num_pairwise(): number;

        get_num_protos(): number;

        get_pairwise(i: number): string;

        get_pmf(): SettingWirelessSecurityPmf;

        get_proto(i: number): string;

        get_psk(): string;

        get_psk_flags(): SettingSecretFlags;

        get_wep_key(idx: number): string;

        get_wep_key_flags(): SettingSecretFlags;

        get_wep_key_type(): WepKeyType;

        get_wep_tx_keyidx(): number;

        get_wps_method(): SettingWirelessSecurityWpsMethod;

        remove_group(i: number): void;

        remove_group_by_value(group: string): boolean;

        remove_pairwise(i: number): void;

        remove_pairwise_by_value(pairwise: string): boolean;

        remove_proto(i: number): void;

        remove_proto_by_value(proto: string): boolean;

        set_wep_key(idx: number, key: string): void;
    }


    namespace SettingWpan {
        // Signal signatures
        interface SignalSignatures extends Setting.SignalSignatures {
            "notify::channel": (pspec: GObject.ParamSpec) => void;
            "notify::mac-address": (pspec: GObject.ParamSpec) => void;
            "notify::page": (pspec: GObject.ParamSpec) => void;
            "notify::pan-id": (pspec: GObject.ParamSpec) => void;
            "notify::short-address": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Setting.ConstructorProps {
            channel: number;
            mac_address: string;
            macAddress: string;
            page: number;
            pan_id: number;
            panId: number;
            short_address: number;
            shortAddress: number;
        }
    }

    class SettingWpan extends Setting {
        static $gtype: GObject.GType<SettingWpan>;

        // Properties
        get channel(): number;
        set channel(val: number);

        get mac_address(): string;
        set mac_address(val: string);

        get macAddress(): string;
        set macAddress(val: string);

        get page(): number;
        set page(val: number);

        get pan_id(): number;
        set pan_id(val: number);

        get panId(): number;
        set panId(val: number);

        get short_address(): number;
        set short_address(val: number);

        get shortAddress(): number;
        set shortAddress(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingWpan.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingWpan.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SettingWpan;

        // Signals
        /** @signal */
        connect<K extends keyof SettingWpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWpan.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingWpan.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingWpan.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingWpan.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingWpan.SignalSignatures[K]>): void;

        // Methods
        get_channel(): number;

        get_mac_address(): string;

        get_page(): number;

        get_pan_id(): number;

        get_short_address(): number;
    }


    namespace SimpleConnection {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Connection.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Connection.ConstructorProps {}
    }

    class SimpleConnection extends GObject.Object implements Connection {
        static $gtype: GObject.GType<SimpleConnection>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimpleConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimpleConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SimpleConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimpleConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimpleConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimpleConnection.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](): Connection;

        static new_clone(connection: Connection): Connection;

        static new_from_dbus(dict: GLib.Variant): Connection;

        add_setting(setting: Setting): void;

        clear_secrets(): void;

        clear_secrets_with_flags(func: SettingClearSecretsWithFlagsFn | null): void;

        clear_settings(): void;

        compare(b: Connection, flags: SettingCompareFlags): boolean;

        dump(): void;

        for_each_setting_value(func: SettingValueIterFn): void;

        get_connection_type(): string;

        get_id(): string;

        get_interface_name(): string;

        get_path(): string;

        get_setting(setting_type: GObject.GType): Setting;

        get_setting_802_1x(): Setting8021x;

        get_setting_adsl(): SettingAdsl;

        get_setting_bluetooth(): SettingBluetooth;

        get_setting_bond(): SettingBond;

        get_setting_bridge(): SettingBridge;

        get_setting_bridge_port(): SettingBridgePort;

        get_setting_by_name(name: string): Setting;

        get_setting_cdma(): SettingCdma;

        get_setting_connection(): SettingConnection;

        get_setting_dcb(): SettingDcb;

        get_setting_dummy(): SettingDummy;

        get_setting_generic(): SettingGeneric;

        get_setting_geneve(): SettingGeneve;

        get_setting_gsm(): SettingGsm;

        get_setting_infiniband(): SettingInfiniband;

        get_setting_ip4_config(): SettingIP4Config;

        get_setting_ip6_config(): SettingIP6Config;

        get_setting_ip_tunnel(): SettingIPTunnel;

        get_setting_macsec(): SettingMacsec;

        get_setting_macvlan(): SettingMacvlan;

        get_setting_olpc_mesh(): SettingOlpcMesh;

        get_setting_ovs_bridge(): SettingOvsBridge;

        get_setting_ovs_interface(): SettingOvsInterface;

        get_setting_ovs_patch(): SettingOvsPatch;

        get_setting_ovs_port(): SettingOvsPort;

        get_setting_ppp(): SettingPpp;

        get_setting_pppoe(): SettingPppoe;

        get_setting_proxy(): SettingProxy;

        get_setting_serial(): SettingSerial;

        get_setting_tc_config(): SettingTCConfig;

        get_setting_team(): SettingTeam;

        get_setting_team_port(): SettingTeamPort;

        get_setting_tun(): SettingTun;

        get_setting_vlan(): SettingVlan;

        get_setting_vpn(): SettingVpn;

        get_setting_vxlan(): SettingVxlan;

        get_setting_wimax(): SettingWimax;

        get_setting_wired(): SettingWired;

        get_setting_wireless(): SettingWireless;

        get_setting_wireless_security(): SettingWirelessSecurity;

        get_settings(): Setting[] | null;

        get_uuid(): string;

        get_virtual_device_description(): string;

        is_type(type: string): boolean;

        is_virtual(): boolean;

        need_secrets(): [string | null, string[] | null];

        normalize(parameters: { [key: string]: never } | null): [boolean, boolean];

        remove_setting(setting_type: GObject.GType): void;

        replace_settings(new_settings: GLib.Variant): boolean;

        replace_settings_from_connection(new_connection: Connection): void;

        set_path(path: string): void;

        to_dbus(flags: ConnectionSerializationFlags): GLib.Variant;

        update_secrets(setting_name: string, secrets: GLib.Variant): boolean;

        verify(): boolean;

        verify_secrets(): boolean;

        vfunc_changed(): void;

        vfunc_secrets_cleared(): void;

        vfunc_secrets_updated(setting: string): void;
    }


    namespace VpnConnection {
        // Signal signatures
        interface SignalSignatures extends ActiveConnection.SignalSignatures {
            /** @signal */
            "vpn-state-changed": (object: number, p0: number) => void;
            "notify::banner": (pspec: GObject.ParamSpec) => void;
            "notify::vpn-state": (pspec: GObject.ParamSpec) => void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::controller": (pspec: GObject.ParamSpec) => void;
            "notify::default": (pspec: GObject.ParamSpec) => void;
            "notify::default6": (pspec: GObject.ParamSpec) => void;
            "notify::devices": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp4-config": (pspec: GObject.ParamSpec) => void;
            "notify::dhcp6-config": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::ip4-config": (pspec: GObject.ParamSpec) => void;
            "notify::ip6-config": (pspec: GObject.ParamSpec) => void;
            "notify::master": (pspec: GObject.ParamSpec) => void;
            "notify::specific-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-flags": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
            "notify::uuid": (pspec: GObject.ParamSpec) => void;
            "notify::vpn": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ActiveConnection.ConstructorProps {
            banner: string;
            vpn_state: VpnConnectionState;
            vpnState: VpnConnectionState;
        }
    }

    class VpnConnection extends ActiveConnection {
        static $gtype: GObject.GType<VpnConnection>;

        // Properties
        get banner(): string;

        get vpn_state(): VpnConnectionState;

        get vpnState(): VpnConnectionState;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VpnConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VpnConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof VpnConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VpnConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VpnConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VpnConnection.SignalSignatures[K]>): void;

        // Methods
        get_banner(): string;

        get_vpn_state(): VpnConnectionState;
    }


    namespace VpnPluginInfo {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::filename": (pspec: GObject.ParamSpec) => void;
            "notify::keyfile": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Initable.ConstructorProps {
            filename: string;
            keyfile: GLib.KeyFile;
            name: string;
        }
    }

    class VpnPluginInfo extends GObject.Object implements Gio.Initable {
        static $gtype: GObject.GType<VpnPluginInfo>;

        // Properties
        get filename(): string;

        set keyfile(val: GLib.KeyFile);

        get name(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VpnPluginInfo.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VpnPluginInfo.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_file(filename: string): VpnPluginInfo;

        static new_search_file(name: string | null, service: string | null): VpnPluginInfo;

        static new_with_data(filename: string, keyfile: GLib.KeyFile): VpnPluginInfo;

        // Signals
        /** @signal */
        connect<K extends keyof VpnPluginInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnPluginInfo.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VpnPluginInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnPluginInfo.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VpnPluginInfo.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VpnPluginInfo.SignalSignatures[K]>): void;

        // Static methods
        static list_add(list: VpnPluginInfo[], plugin_info: VpnPluginInfo): boolean;

        static list_find_by_filename(list: VpnPluginInfo[], filename: string): VpnPluginInfo;

        static list_find_by_name(list: VpnPluginInfo[], name: string): VpnPluginInfo;

        static list_find_by_service(list: VpnPluginInfo[], service: string): VpnPluginInfo;

        static list_find_service_type(list: VpnPluginInfo[], name: string): string;

        static list_get_service_types(list: VpnPluginInfo[], only_existing: boolean, with_abbreviations: boolean): string[];

        static list_load(): VpnPluginInfo[];

        static list_remove(list: VpnPluginInfo[], plugin_info: VpnPluginInfo): boolean;

        static validate_filename(filename: string): boolean;

        // Methods
        get_aliases(): string[];

        get_auth_dialog(): string;

        get_editor_plugin(): VpnEditorPlugin;

        get_filename(): string;

        get_name(): string;

        get_plugin(): string;

        get_program(): string;

        get_service(): string;

        load_editor_plugin(): VpnEditorPlugin;

        lookup_property(group: string, key: string): string;

        set_editor_plugin(plugin: VpnEditorPlugin | null): void;

        supports_hints(): boolean;

        supports_multiple(): boolean;

        supports_safe_private_file_access(): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace VpnPluginOld {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            config: (object: GLib.Variant) => void;
            /** @signal */
            failure: (object: number) => void;
            /** @signal */
            "ip4-config": (object: GLib.Variant) => void;
            /** @signal */
            "ip6-config": (object: GLib.Variant) => void;
            /** @signal */
            "login-banner": (object: string) => void;
            /** @signal */
            quit: () => void;
            /** @signal */
            "secrets-required": (object: string, p0: string[]) => void;
            /** @signal */
            "state-changed": (object: number) => void;
            "notify::service-name": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Initable.ConstructorProps {
            service_name: string;
            serviceName: string;
            state: VpnServiceState;
        }
    }

    abstract class VpnPluginOld extends GObject.Object implements Gio.Initable {
        static $gtype: GObject.GType<VpnPluginOld>;

        // Properties
        get service_name(): string;

        get serviceName(): string;

        get state(): VpnServiceState;
        set state(val: VpnServiceState);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VpnPluginOld.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VpnPluginOld.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof VpnPluginOld.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnPluginOld.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VpnPluginOld.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnPluginOld.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VpnPluginOld.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VpnPluginOld.SignalSignatures[K]>): void;

        // Static methods
        static get_secret_flags(data: never, secret_name: string): [boolean, SettingSecretFlags];

        static read_vpn_details(fd: number): [boolean, never, never];

        // Virtual methods
        vfunc_config(config: GLib.Variant): void;

        vfunc_connect(connection: Connection): boolean;

        vfunc_connect_interactive(connection: Connection, details: GLib.Variant): boolean;

        vfunc_disconnect(): boolean;

        vfunc_failure(reason: VpnPluginFailure): void;

        vfunc_ip4_config(ip4_config: GLib.Variant): void;

        vfunc_ip6_config(config: GLib.Variant): void;

        vfunc_login_banner(banner: string): void;

        vfunc_need_secrets(connection: Connection, setting_name: string): boolean;

        vfunc_new_secrets(connection: Connection): boolean;

        vfunc_quit(): void;

        vfunc_state_changed(state: VpnServiceState): void;

        // Methods
        disconnect(): boolean;

    // Conflicted with GObject.Object.disconnect
        disconnect(...args: never[]): any;

        failure(reason: VpnPluginFailure): void;

        get_connection(): Gio.DBusConnection;

        get_state(): VpnServiceState;

        secrets_required(message: string, hints: string): void;

        set_ip4_config(ip4_config: GLib.Variant): void;

        set_login_banner(banner: string): void;

        set_state(state: VpnServiceState): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace VpnServicePlugin {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            config: (object: GLib.Variant) => void;
            /** @signal */
            failure: (object: number) => void;
            /** @signal */
            "ip4-config": (object: GLib.Variant) => void;
            /** @signal */
            "ip6-config": (object: GLib.Variant) => void;
            /** @signal */
            "login-banner": (object: string) => void;
            /** @signal */
            quit: () => void;
            /** @signal */
            "secrets-required": (object: string, p0: string[]) => void;
            /** @signal */
            "state-changed": (object: number) => void;
            "notify::service-name": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::watch-peer": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Initable.ConstructorProps {
            service_name: string;
            serviceName: string;
            state: VpnServiceState;
            watch_peer: boolean;
            watchPeer: boolean;
        }
    }

    abstract class VpnServicePlugin extends GObject.Object implements Gio.Initable {
        static $gtype: GObject.GType<VpnServicePlugin>;

        // Properties
        get service_name(): string;

        get serviceName(): string;

        get state(): VpnServiceState;
        set state(val: VpnServiceState);

        get watch_peer(): boolean;

        get watchPeer(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VpnServicePlugin.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VpnServicePlugin.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof VpnServicePlugin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnServicePlugin.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VpnServicePlugin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VpnServicePlugin.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VpnServicePlugin.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VpnServicePlugin.SignalSignatures[K]>): void;

        // Static methods
        static get_secret_flags(data: never, secret_name: string): [boolean, SettingSecretFlags];

        static read_vpn_details(fd: number): [boolean, never, never];

        // Virtual methods
        vfunc_config(config: GLib.Variant): void;

        vfunc_connect(connection: Connection): boolean;

        vfunc_connect_interactive(connection: Connection, details: GLib.Variant): boolean;

        vfunc_disconnect(): boolean;

        vfunc_failure(reason: VpnPluginFailure): void;

        vfunc_ip4_config(ip4_config: GLib.Variant): void;

        vfunc_ip6_config(config: GLib.Variant): void;

        vfunc_login_banner(banner: string): void;

        vfunc_need_secrets(connection: Connection, setting_name: string): boolean;

        vfunc_new_secrets(connection: Connection): boolean;

        vfunc_quit(): void;

        vfunc_state_changed(state: VpnServiceState): void;

        // Methods
        disconnect(): boolean;

    // Conflicted with GObject.Object.disconnect
        disconnect(...args: never[]): any;

        failure(reason: VpnPluginFailure): void;

        get_connection(): Gio.DBusConnection;

        secrets_required(message: string, hints: string): void;

        set_config(config: GLib.Variant): void;

        set_ip4_config(ip4_config: GLib.Variant): void;

        set_ip6_config(ip6_config: GLib.Variant): void;

        set_login_banner(banner: string): void;

        shutdown(): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace WifiP2PPeer {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::hw-address": (pspec: GObject.ParamSpec) => void;
            "notify::last-seen": (pspec: GObject.ParamSpec) => void;
            "notify::manufacturer": (pspec: GObject.ParamSpec) => void;
            "notify::model": (pspec: GObject.ParamSpec) => void;
            "notify::model-number": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::serial": (pspec: GObject.ParamSpec) => void;
            "notify::strength": (pspec: GObject.ParamSpec) => void;
            "notify::wfd-ies": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            flags: __80211ApFlags;
            hw_address: string;
            hwAddress: string;
            last_seen: number;
            lastSeen: number;
            manufacturer: string;
            model: string;
            model_number: string;
            modelNumber: string;
            name: string;
            serial: string;
            strength: number;
            wfd_ies: GLib.Bytes | Uint8Array;
            wfdIes: GLib.Bytes | Uint8Array;
        }
    }

    class WifiP2PPeer extends Object {
        static $gtype: GObject.GType<WifiP2PPeer>;

        // Properties
        get flags(): __80211ApFlags;

        get hw_address(): string;

        get hwAddress(): string;

        get last_seen(): number;

        get lastSeen(): number;

        get manufacturer(): string;

        get model(): string;

        get model_number(): string;

        get modelNumber(): string;

        get name(): string;

        get serial(): string;

        get strength(): number;

        get wfd_ies(): GLib.Bytes;

        get wfdIes(): GLib.Bytes;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WifiP2PPeer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WifiP2PPeer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WifiP2PPeer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WifiP2PPeer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WifiP2PPeer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WifiP2PPeer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WifiP2PPeer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WifiP2PPeer.SignalSignatures[K]>): void;

        // Methods
        connection_valid(connection: Connection): boolean;

        filter_connections(connections: Connection[]): Connection[];

        get_flags(): __80211ApFlags;

        get_hw_address(): string;

        get_last_seen(): number;

        get_manufacturer(): string;

        get_model(): string;

        get_model_number(): string;

        get_name(): string;

        get_serial(): string;

        get_strength(): number;

        get_wfd_ies(): GLib.Bytes;
    }


    namespace WimaxNsp {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::network-type": (pspec: GObject.ParamSpec) => void;
            "notify::signal-quality": (pspec: GObject.ParamSpec) => void;
            "notify::client": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            name: string;
            network_type: WimaxNspNetworkType;
            networkType: WimaxNspNetworkType;
            signal_quality: number;
            signalQuality: number;
        }
    }

    class WimaxNsp extends Object {
        static $gtype: GObject.GType<WimaxNsp>;

        // Properties
        get name(): string;

        get network_type(): WimaxNspNetworkType;

        get networkType(): WimaxNspNetworkType;

        get signal_quality(): number;

        get signalQuality(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WimaxNsp.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WimaxNsp.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WimaxNsp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WimaxNsp.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WimaxNsp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WimaxNsp.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WimaxNsp.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WimaxNsp.SignalSignatures[K]>): void;

        // Methods
        connection_valid(connection: Connection): boolean;

        filter_connections(connections: Connection[]): Connection[];

        get_name(): string;

        get_network_type(): WimaxNspNetworkType;

        get_signal_quality(): number;
    }


    type AccessPointClass = typeof AccessPoint;

    type ActiveConnectionClass = typeof ActiveConnection;

    class BridgeVlan {
        static $gtype: GObject.GType<BridgeVlan>;

        // Constructors
        constructor(vid_start: number, vid_end: number);

        static ["new"](vid_start: number, vid_end: number): BridgeVlan;

        // Static methods
        static from_str(str: string): BridgeVlan;

        // Methods
        cmp(b: BridgeVlan): number;

        get_vid_range(): [boolean, number, number];

        is_pvid(): boolean;

        is_sealed(): boolean;

        is_untagged(): boolean;

        new_clone(): BridgeVlan;

        ref(): BridgeVlan;

        seal(): void;

        set_pvid(value: boolean): void;

        set_untagged(value: boolean): void;

        to_str(): string;

        unref(): void;
    }


    type CheckpointClass = typeof Checkpoint;

    type ClientClass = typeof Client;

    type ConnectionInterface = typeof Connection;

    type Device6LowpanClass = typeof Device6Lowpan;

    type DeviceAdslClass = typeof DeviceAdsl;

    type DeviceBondClass = typeof DeviceBond;

    type DeviceBridgeClass = typeof DeviceBridge;

    type DeviceBtClass = typeof DeviceBt;

    type DeviceClass = typeof Device;

    type DeviceDummyClass = typeof DeviceDummy;

    type DeviceEthernetClass = typeof DeviceEthernet;

    type DeviceGenericClass = typeof DeviceGeneric;

    type DeviceGeneveClass = typeof DeviceGeneve;

    type DeviceHsrClass = typeof DeviceHsr;

    type DeviceIPTunnelClass = typeof DeviceIPTunnel;

    type DeviceInfinibandClass = typeof DeviceInfiniband;

    type DeviceIpvlanClass = typeof DeviceIpvlan;

    type DeviceLoopbackClass = typeof DeviceLoopback;

    type DeviceMacsecClass = typeof DeviceMacsec;

    type DeviceMacvlanClass = typeof DeviceMacvlan;

    type DeviceModemClass = typeof DeviceModem;

    type DeviceOlpcMeshClass = typeof DeviceOlpcMesh;

    type DeviceOvsBridgeClass = typeof DeviceOvsBridge;

    type DeviceOvsInterfaceClass = typeof DeviceOvsInterface;

    type DeviceOvsPortClass = typeof DeviceOvsPort;

    type DevicePppClass = typeof DevicePpp;

    type DeviceTeamClass = typeof DeviceTeam;

    type DeviceTunClass = typeof DeviceTun;

    type DeviceVethClass = typeof DeviceVeth;

    type DeviceVlanClass = typeof DeviceVlan;

    type DeviceVrfClass = typeof DeviceVrf;

    type DeviceVxlanClass = typeof DeviceVxlan;

    type DeviceWifiClass = typeof DeviceWifi;

    type DeviceWifiP2PClass = typeof DeviceWifiP2P;

    type DeviceWimaxClass = typeof DeviceWimax;

    type DeviceWireGuardClass = typeof DeviceWireGuard;

    type DeviceWpanClass = typeof DeviceWpan;

    type DhcpConfigClass = typeof DhcpConfig;

    abstract class DnsEntry {
        static $gtype: GObject.GType<DnsEntry>;

        // Methods
        get_domains(): string[];

        get_interface(): string;

        get_nameservers(): string[];

        get_priority(): number;

        get_vpn(): boolean;

        unref(): void;
    }


    class IPAddress {
        static $gtype: GObject.GType<IPAddress>;

        // Constructors
        constructor(family: number, addr: string, prefix: number);

        static ["new"](family: number, addr: string, prefix: number): IPAddress;

        static new_binary(family: number, addr: null, prefix: number): IPAddress;

        // Methods
        cmp_full(b: IPAddress, cmp_flags: IPAddressCmpFlags): number;

        dup(): IPAddress;

        equal(other: IPAddress): boolean;

        get_address(): string;

        get_attribute(name: string): GLib.Variant;

        get_attribute_names(): string[];

        get_family(): number;

        get_prefix(): number;

        ref(): void;

        set_address(addr: string): void;

        set_attribute(name: string, value: GLib.Variant | null): void;

        set_prefix(prefix: number): void;

        unref(): void;
    }


    type IPConfigClass = typeof IPConfig;

    class IPRoute {
        static $gtype: GObject.GType<IPRoute>;

        // Constructors
        constructor(family: number, dest: string, prefix: number, next_hop: string | null, metric: bigint | number);

        static ["new"](family: number, dest: string, prefix: number, next_hop: string | null, metric: bigint | number): IPRoute;

        static new_binary(family: number, dest: null, prefix: number, next_hop: null, metric: bigint | number): IPRoute;

        // Static methods
        static attribute_validate(name: string, value: GLib.Variant, family: number): [boolean, boolean];

        static get_variant_attribute_spec(): VariantAttributeSpec;

        // Methods
        dup(): IPRoute;

        equal(other: IPRoute): boolean;

        equal_full(other: IPRoute, cmp_flags: number): boolean;

        get_attribute(name: string): GLib.Variant;

        get_attribute_names(): string[];

        get_dest(): string;

        get_family(): number;

        get_metric(): number;

        get_next_hop(): string;

        get_prefix(): number;

        ref(): void;

        set_attribute(name: string, value: GLib.Variant | null): void;

        set_dest(dest: string): void;

        set_metric(metric: bigint | number): void;

        set_next_hop(next_hop: string | null): void;

        set_prefix(prefix: number): void;

        unref(): void;
    }


    class IPRoutingRule {
        static $gtype: GObject.GType<IPRoutingRule>;

        // Constructors
        constructor(addr_family: number);

        static ["new"](addr_family: number): IPRoutingRule;

        // Static methods
        static from_string(str: string, to_string_flags: IPRoutingRuleAsStringFlags, extra_args: never | null): IPRoutingRule;

        // Methods
        cmp(other: IPRoutingRule | null): number;

        get_action(): number;

        get_addr_family(): number;

        get_destination_port_end(): number;

        get_destination_port_start(): number;

        get_from(): string;

        get_from_len(): number;

        get_fwmark(): number;

        get_fwmask(): number;

        get_iifname(): string;

        get_invert(): boolean;

        get_ipproto(): number;

        get_oifname(): string;

        get_priority(): number;

        get_source_port_end(): number;

        get_source_port_start(): number;

        get_suppress_prefixlength(): number;

        get_table(): number;

        get_to(): string;

        get_to_len(): number;

        get_tos(): number;

        get_uid_range(): [boolean, number, number];

        is_sealed(): boolean;

        new_clone(): IPRoutingRule;

        ref(): IPRoutingRule;

        seal(): void;

        set_action(action: number): void;

        set_destination_port(start: number, end: number): void;

        set_from(from: string | null, len: number): void;

        set_fwmark(fwmark: number, fwmask: number): void;

        set_iifname(iifname: string | null): void;

        set_invert(invert: boolean): void;

        set_ipproto(ipproto: number): void;

        set_oifname(oifname: string | null): void;

        set_priority(priority: bigint | number): void;

        set_source_port(start: number, end: number): void;

        set_suppress_prefixlength(suppress_prefixlength: number): void;

        set_table(table: number): void;

        set_to(to: string | null, len: number): void;

        set_tos(tos: number): void;

        set_uid_range(uid_range_start: number, uid_range_end: number): void;

        to_string(to_string_flags: IPRoutingRuleAsStringFlags, extra_args: never | null): string;

        unref(): void;

        validate(): boolean;
    }


    abstract class KeyfileHandlerData {
        static $gtype: GObject.GType<KeyfileHandlerData>;

        // Methods
        fail_with_error(src: GLib.Error): void;

        get_context(): [string, string, Setting | null, string];

        warn_get(): [string, KeyfileWarnSeverity | null];
    }


    class LldpNeighbor {
        static $gtype: GObject.GType<LldpNeighbor>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): LldpNeighbor;

        // Methods
        get_attr_names(): string[];

        get_attr_string_value(name: string): [boolean, string];

        get_attr_type(name: string): GLib.VariantType;

        get_attr_uint_value(name: string): [boolean, number];

        get_attr_value(name: string): GLib.Variant;

        ref(): void;

        unref(): void;
    }


    type ObjectClass = typeof Object;

    class Range {
        static $gtype: GObject.GType<Range>;

        // Constructors
        constructor(start: bigint | number, end: bigint | number);

        static ["new"](start: bigint | number, end: bigint | number): Range;

        // Static methods
        static from_str(str: string): Range;

        // Methods
        cmp(b: Range): number;

        get_range(): [boolean, number, number];

        ref(): Range;

        to_str(): string;

        unref(): void;
    }


    type RemoteConnectionClass = typeof RemoteConnection;

    type SecretAgentOldClass = typeof SecretAgentOld;

    type Setting6LowpanClass = typeof Setting6Lowpan;

    type Setting8021xClass = typeof Setting8021x;

    type SettingAdslClass = typeof SettingAdsl;

    type SettingBluetoothClass = typeof SettingBluetooth;

    type SettingBondClass = typeof SettingBond;

    type SettingBondPortClass = typeof SettingBondPort;

    type SettingBridgeClass = typeof SettingBridge;

    type SettingBridgePortClass = typeof SettingBridgePort;

    type SettingCdmaClass = typeof SettingCdma;

    type SettingClass = typeof Setting;

    type SettingConnectionClass = typeof SettingConnection;

    type SettingDcbClass = typeof SettingDcb;

    type SettingDummyClass = typeof SettingDummy;

    type SettingEthtoolClass = typeof SettingEthtool;

    type SettingGenericClass = typeof SettingGeneric;

    type SettingGeneveClass = typeof SettingGeneve;

    type SettingGsmClass = typeof SettingGsm;

    type SettingHostnameClass = typeof SettingHostname;

    type SettingHsrClass = typeof SettingHsr;

    type SettingIP4ConfigClass = typeof SettingIP4Config;

    type SettingIP6ConfigClass = typeof SettingIP6Config;

    type SettingIPConfigClass = typeof SettingIPConfig;

    type SettingIPTunnelClass = typeof SettingIPTunnel;

    type SettingInfinibandClass = typeof SettingInfiniband;

    type SettingIpvlanClass = typeof SettingIpvlan;

    type SettingLinkClass = typeof SettingLink;

    type SettingLoopbackClass = typeof SettingLoopback;

    type SettingMacsecClass = typeof SettingMacsec;

    type SettingMacvlanClass = typeof SettingMacvlan;

    type SettingMatchClass = typeof SettingMatch;

    type SettingOlpcMeshClass = typeof SettingOlpcMesh;

    type SettingOvsBridgeClass = typeof SettingOvsBridge;

    type SettingOvsDpdkClass = typeof SettingOvsDpdk;

    type SettingOvsExternalIDsClass = typeof SettingOvsExternalIDs;

    type SettingOvsInterfaceClass = typeof SettingOvsInterface;

    type SettingOvsOtherConfigClass = typeof SettingOvsOtherConfig;

    type SettingOvsPatchClass = typeof SettingOvsPatch;

    type SettingOvsPortClass = typeof SettingOvsPort;

    type SettingPppClass = typeof SettingPpp;

    type SettingPppoeClass = typeof SettingPppoe;

    type SettingPrefixDelegationClass = typeof SettingPrefixDelegation;

    type SettingProxyClass = typeof SettingProxy;

    type SettingSerialClass = typeof SettingSerial;

    type SettingSriovClass = typeof SettingSriov;

    type SettingTCConfigClass = typeof SettingTCConfig;

    type SettingTeamClass = typeof SettingTeam;

    type SettingTeamPortClass = typeof SettingTeamPort;

    type SettingTunClass = typeof SettingTun;

    type SettingUserClass = typeof SettingUser;

    type SettingVethClass = typeof SettingVeth;

    type SettingVlanClass = typeof SettingVlan;

    type SettingVpnClass = typeof SettingVpn;

    type SettingVrfClass = typeof SettingVrf;

    type SettingVxlanClass = typeof SettingVxlan;

    type SettingWifiP2PClass = typeof SettingWifiP2P;

    type SettingWimaxClass = typeof SettingWimax;

    type SettingWireGuardClass = typeof SettingWireGuard;

    type SettingWiredClass = typeof SettingWired;

    type SettingWirelessClass = typeof SettingWireless;

    type SettingWirelessSecurityClass = typeof SettingWirelessSecurity;

    type SettingWpanClass = typeof SettingWpan;

    type SimpleConnectionClass = typeof SimpleConnection;

    class SriovVF {
        static $gtype: GObject.GType<SriovVF>;

        // Constructors
        constructor(index: number);

        static ["new"](index: number): SriovVF;

        // Static methods
        static attribute_validate(name: string, value: GLib.Variant): [boolean, boolean];

        // Methods
        add_vlan(vlan_id: number): boolean;

        dup(): SriovVF;

        equal(other: SriovVF): boolean;

        get_attribute(name: string): GLib.Variant;

        get_attribute_names(): string[];

        get_index(): number;

        get_vlan_ids(): number[];

        get_vlan_protocol(vlan_id: number): SriovVFVlanProtocol;

        get_vlan_qos(vlan_id: number): number;

        ref(): void;

        remove_vlan(vlan_id: number): boolean;

        set_attribute(name: string, value: GLib.Variant | null): void;

        set_vlan_protocol(vlan_id: number, protocol: SriovVFVlanProtocol): void;

        set_vlan_qos(vlan_id: number, qos: number): void;

        unref(): void;
    }


    class TCAction {
        static $gtype: GObject.GType<TCAction>;

        // Constructors
        constructor(kind: string);

        static ["new"](kind: string): TCAction;

        // Methods
        dup(): TCAction;

        equal(other: TCAction): boolean;

        get_attribute(name: string): GLib.Variant;

        get_attribute_names(): string[];

        get_kind(): string;

        ref(): void;

        set_attribute(name: string, value: GLib.Variant | null): void;

        unref(): void;
    }


    class TCQdisc {
        static $gtype: GObject.GType<TCQdisc>;

        // Constructors
        constructor(kind: string, parent: number);

        static ["new"](kind: string, parent: number): TCQdisc;

        // Methods
        dup(): TCQdisc;

        equal(other: TCQdisc): boolean;

        get_attribute(name: string): GLib.Variant;

        get_attribute_names(): string[];

        get_handle(): number;

        get_kind(): string;

        get_parent(): number;

        ref(): void;

        set_attribute(name: string, value: GLib.Variant | null): void;

        set_handle(handle: number): void;

        unref(): void;
    }


    class TCTfilter {
        static $gtype: GObject.GType<TCTfilter>;

        // Constructors
        constructor(kind: string, parent: number);

        static ["new"](kind: string, parent: number): TCTfilter;

        // Methods
        dup(): TCTfilter;

        equal(other: TCTfilter): boolean;

        get_action(): TCAction;

        get_handle(): number;

        get_kind(): string;

        get_parent(): number;

        ref(): void;

        set_action(action: TCAction): void;

        set_handle(handle: number): void;

        unref(): void;
    }


    class TeamLinkWatcher {
        static $gtype: GObject.GType<TeamLinkWatcher>;

        // Constructors
        constructor(init_wait: number, interval: number, missed_max: number, target_host: string, source_host: string, flags: TeamLinkWatcherArpPingFlags);

        static new_arp_ping(init_wait: number, interval: number, missed_max: number, target_host: string, source_host: string, flags: TeamLinkWatcherArpPingFlags): TeamLinkWatcher;

        static new_arp_ping2(init_wait: number, interval: number, missed_max: number, vlanid: number, target_host: string, source_host: string, flags: TeamLinkWatcherArpPingFlags): TeamLinkWatcher;

        static new_ethtool(delay_up: number, delay_down: number): TeamLinkWatcher;

        static new_nsna_ping(init_wait: number, interval: number, missed_max: number, target_host: string): TeamLinkWatcher;

        // Methods
        dup(): TeamLinkWatcher;

        equal(other: TeamLinkWatcher): boolean;

        get_delay_down(): number;

        get_delay_up(): number;

        get_flags(): TeamLinkWatcherArpPingFlags;

        get_init_wait(): number;

        get_interval(): number;

        get_missed_max(): number;

        get_name(): string;

        get_source_host(): string;

        get_target_host(): string;

        get_vlanid(): number;

        ref(): void;

        unref(): void;
    }


    abstract class VariantAttributeSpec {
        static $gtype: GObject.GType<VariantAttributeSpec>;
    }


    type VpnConnectionClass = typeof VpnConnection;

    type VpnEditorInterface = typeof VpnEditor;

    type VpnEditorPluginInterface = typeof VpnEditorPlugin;

    abstract class VpnEditorPluginVT {
        static $gtype: GObject.GType<VpnEditorPluginVT>;
    }


    type VpnPluginInfoClass = typeof VpnPluginInfo;

    type VpnPluginOldClass = typeof VpnPluginOld;

    type VpnServicePluginClass = typeof VpnServicePlugin;

    type WifiP2PPeerClass = typeof WifiP2PPeer;

    type WimaxNspClass = typeof WimaxNsp;

    class WireGuardPeer {
        static $gtype: GObject.GType<WireGuardPeer>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): WireGuardPeer;

        // Methods
        append_allowed_ip(allowed_ip: string, accept_invalid: boolean): boolean;

        clear_allowed_ips(): void;

        cmp(b: WireGuardPeer | null, compare_flags: SettingCompareFlags): number;

        get_allowed_ip(idx: number, out_is_valid: boolean | null): string | null;

        get_allowed_ips_len(): number;

        get_endpoint(): string;

        get_persistent_keepalive(): number;

        get_preshared_key(): string;

        get_preshared_key_flags(): SettingSecretFlags;

        get_public_key(): string;

        is_sealed(): boolean;

        is_valid(check_non_secrets: boolean, check_secrets: boolean): boolean;

        new_clone(with_secrets: boolean): WireGuardPeer;

        ref(): WireGuardPeer;

        remove_allowed_ip(idx: number): boolean;

        seal(): void;

        set_endpoint(endpoint: string, allow_invalid: boolean): boolean;

        set_persistent_keepalive(persistent_keepalive: number): void;

        set_preshared_key(preshared_key: string | null, accept_invalid: boolean): boolean;

        set_preshared_key_flags(preshared_key_flags: SettingSecretFlags): void;

        set_public_key(public_key: string | null, accept_invalid: boolean): boolean;

        unref(): void;
    }


    namespace Connection {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            "secrets-cleared": () => void;
            /** @signal */
            "secrets-updated": (setting_name: string) => void;
        }
        /**
         * Interface for implementing Connection.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_changed(): void;

            vfunc_secrets_cleared(): void;

            vfunc_secrets_updated(setting: string): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ConnectionNamespace {
        $gtype: GObject.GType<Connection>;
        prototype: Connection;
    }
    interface Connection extends GObject.Object, Connection.Interface {

        // Methods
        add_setting(setting: Setting): void;

        clear_secrets(): void;

        clear_secrets_with_flags(func: SettingClearSecretsWithFlagsFn | null): void;

        clear_settings(): void;

        compare(b: Connection, flags: SettingCompareFlags): boolean;

        dump(): void;

        for_each_setting_value(func: SettingValueIterFn): void;

        get_connection_type(): string;

        get_id(): string;

        get_interface_name(): string;

        get_path(): string;

        get_setting(setting_type: GObject.GType): Setting;

        get_setting_802_1x(): Setting8021x;

        get_setting_adsl(): SettingAdsl;

        get_setting_bluetooth(): SettingBluetooth;

        get_setting_bond(): SettingBond;

        get_setting_bridge(): SettingBridge;

        get_setting_bridge_port(): SettingBridgePort;

        get_setting_by_name(name: string): Setting;

        get_setting_cdma(): SettingCdma;

        get_setting_connection(): SettingConnection;

        get_setting_dcb(): SettingDcb;

        get_setting_dummy(): SettingDummy;

        get_setting_generic(): SettingGeneric;

        get_setting_geneve(): SettingGeneve;

        get_setting_gsm(): SettingGsm;

        get_setting_infiniband(): SettingInfiniband;

        get_setting_ip4_config(): SettingIP4Config;

        get_setting_ip6_config(): SettingIP6Config;

        get_setting_ip_tunnel(): SettingIPTunnel;

        get_setting_macsec(): SettingMacsec;

        get_setting_macvlan(): SettingMacvlan;

        get_setting_olpc_mesh(): SettingOlpcMesh;

        get_setting_ovs_bridge(): SettingOvsBridge;

        get_setting_ovs_interface(): SettingOvsInterface;

        get_setting_ovs_patch(): SettingOvsPatch;

        get_setting_ovs_port(): SettingOvsPort;

        get_setting_ppp(): SettingPpp;

        get_setting_pppoe(): SettingPppoe;

        get_setting_proxy(): SettingProxy;

        get_setting_serial(): SettingSerial;

        get_setting_tc_config(): SettingTCConfig;

        get_setting_team(): SettingTeam;

        get_setting_team_port(): SettingTeamPort;

        get_setting_tun(): SettingTun;

        get_setting_vlan(): SettingVlan;

        get_setting_vpn(): SettingVpn;

        get_setting_vxlan(): SettingVxlan;

        get_setting_wimax(): SettingWimax;

        get_setting_wired(): SettingWired;

        get_setting_wireless(): SettingWireless;

        get_setting_wireless_security(): SettingWirelessSecurity;

        get_settings(): Setting[] | null;

        get_uuid(): string;

        get_virtual_device_description(): string;

        is_type(type: string): boolean;

        is_virtual(): boolean;

        need_secrets(): [string | null, string[] | null];

        normalize(parameters: { [key: string]: never } | null): [boolean, boolean];

        remove_setting(setting_type: GObject.GType): void;

        replace_settings(new_settings: GLib.Variant): boolean;

        replace_settings_from_connection(new_connection: Connection): void;

        set_path(path: string): void;

        to_dbus(flags: ConnectionSerializationFlags): GLib.Variant;

        update_secrets(setting_name: string, secrets: GLib.Variant): boolean;

        verify(): boolean;

        verify_secrets(): boolean;
    }


    export const Connection: ConnectionNamespace & {
        new (): Connection; // This allows `obj instanceof Connection`
    };

    namespace VpnEditor {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            changed: () => void;
        }
        /**
         * Interface for implementing VpnEditor.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_changed(): void;

            vfunc_get_widget<T = GObject.Object>(): T;

            vfunc_update_connection(connection: Connection): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface VpnEditorNamespace {
        $gtype: GObject.GType<VpnEditor>;
        prototype: VpnEditor;
    }
    interface VpnEditor extends GObject.Object, VpnEditor.Interface {

        // Methods
        get_widget<T = GObject.Object>(): T;

        update_connection(connection: Connection): boolean;
    }


    export const VpnEditor: VpnEditorNamespace & {
        new (): VpnEditor; // This allows `obj instanceof VpnEditor`
    };

    namespace VpnEditorPlugin {
        /**
         * Interface for implementing VpnEditorPlugin.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_export_to_file(path: string, connection: Connection): boolean;

            vfunc_get_capabilities(): VpnEditorPluginCapability;

            vfunc_get_editor(connection: Connection): VpnEditor;

            vfunc_get_suggested_filename(connection: Connection): string;

            vfunc_get_vt(out_vt_size: number): VpnEditorPluginVT;

            vfunc_notify_plugin_info_set(plugin_info: VpnPluginInfo): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            description: string;
            name: string;
            service: string;
        }
    }

    export interface VpnEditorPluginNamespace {
        $gtype: GObject.GType<VpnEditorPlugin>;
        prototype: VpnEditorPlugin;
        load(plugin_name: string, check_service: string): VpnEditorPlugin;
        load_from_file(plugin_name: string, check_service: string, check_owner: number, check_file: UtilsCheckFilePredicate): VpnEditorPlugin;
    }
    interface VpnEditorPlugin extends GObject.Object, VpnEditorPlugin.Interface {

        // Properties
        get description(): string;

        get name(): string;

        get service(): string;

        // Methods
        ["export"](path: string, connection: Connection): boolean;

        get_capabilities(): VpnEditorPluginCapability;

        get_editor(connection: Connection): VpnEditor;

        get_plugin_info(): VpnPluginInfo;

        get_suggested_filename(connection: Connection): string;

        get_vt(vt_size: bigint | number): [number, VpnEditorPluginVT];

        ["import"](path: string): Connection;

        set_plugin_info(plugin_info: VpnPluginInfo | null): void;
    }


    export const VpnEditorPlugin: VpnEditorPluginNamespace & {
        new (): VpnEditorPlugin; // This allows `obj instanceof VpnEditorPlugin`
    };

    const __name__: string;

    const __version__: string;
}

export default NM;

}

declare module 'gi://NM' {
    import NM10 from 'gi://NM?version=1.0';
    export default NM10;
}
// END
