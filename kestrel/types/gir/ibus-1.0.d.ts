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

declare module 'gi://IBus?version=1.0' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace IBus {

    /**
     * IBus-1.0
     */


    export namespace AttrType {
        export const $gtype: GObject.GType<AttrType>;
    }

    enum AttrType {
        UNDERLINE = 1,
        FOREGROUND = 2,
        BACKGROUND = 3,
        HINT = 4,
    }


    export namespace AttrUnderline {
        export const $gtype: GObject.GType<AttrUnderline>;
    }

    enum AttrUnderline {
        NONE = 0,
        SINGLE = 1,
        DOUBLE = 2,
        LOW = 3,
        ERROR = 4,
    }


    export namespace BusGlobalBindingType {
        export const $gtype: GObject.GType<BusGlobalBindingType>;
    }

    enum BusGlobalBindingType {
        ANY = 0,
        IME_SWITCHER = 1,
        EMOJI_TYPING = 2,
    }


    export namespace BusRequestNameReply {
        export const $gtype: GObject.GType<BusRequestNameReply>;
    }

    enum BusRequestNameReply {
        PRIMARY_OWNER = 1,
        IN_QUEUE = 2,
        EXISTS = 3,
        ALREADY_OWNER = 4,
    }


    export namespace BusStartServiceByNameReply {
        export const $gtype: GObject.GType<BusStartServiceByNameReply>;
    }

    enum BusStartServiceByNameReply {
        SUCCESS = 1,
        ALREADY_RUNNING = 2,
    }


    export namespace EngineMsgCode {
        export const $gtype: GObject.GType<EngineMsgCode>;
    }

    enum EngineMsgCode {
        GENERAL = 0,
        INVALID_COMPOSE_SEQUENCE = 1,
        UPDATE_COMPOSE_TABLE = 2,
    }


    class Error extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NO_ENGINE: number;

        static NO_CONFIG: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace InputPurpose {
        export const $gtype: GObject.GType<InputPurpose>;
    }

    enum InputPurpose {
        FREE_FORM = 0,
        ALPHA = 1,
        DIGITS = 2,
        NUMBER = 3,
        PHONE = 4,
        URL = 5,
        EMAIL = 6,
        NAME = 7,
        PASSWORD = 8,
        PIN = 9,
        TERMINAL = 10,
        DATE = 11,
        TIME = 12,
        DATETIME = 13,
    }


    export namespace MessageDomain {
        export const $gtype: GObject.GType<MessageDomain>;
    }

    enum MessageDomain {
        NONE = 0,
        ENGINE = 1,
        PANEL = 2,
    }


    export namespace Orientation {
        export const $gtype: GObject.GType<Orientation>;
    }

    enum Orientation {
        HORIZONTAL = 0,
        VERTICAL = 1,
        SYSTEM = 2,
    }


    export namespace PanelServiceMsgCode {
        export const $gtype: GObject.GType<PanelServiceMsgCode>;
    }

    enum PanelServiceMsgCode {
        GENERAL = 0,
        LOADING_UNICODE = 1,
    }


    export namespace PreeditFocusMode {
        export const $gtype: GObject.GType<PreeditFocusMode>;
    }

    enum PreeditFocusMode {
        CLEAR = 0,
        COMMIT = 1,
    }


    export namespace PreeditFormat {
        export const $gtype: GObject.GType<PreeditFormat>;
    }

    enum PreeditFormat {
        RGBA = 0,
        HINT = 1,
    }


    export namespace PropState {
        export const $gtype: GObject.GType<PropState>;
    }

    enum PropState {
        UNCHECKED = 0,
        CHECKED = 1,
        INCONSISTENT = 2,
    }


    export namespace PropType {
        export const $gtype: GObject.GType<PropType>;
    }

    enum PropType {
        NORMAL = 0,
        TOGGLE = 1,
        RADIO = 2,
        MENU = 3,
        SEPARATOR = 4,
    }


    export namespace XEventType {
        export const $gtype: GObject.GType<XEventType>;
    }

    enum XEventType {
        NOTHING = -1,
        KEY_PRESS = 0,
        KEY_RELEASE = 1,
        OTHER = 2,
        EVENT_LAST = 3,
    }


    const __0: number;

    const __1: number;

    const __2: number;

    const __3: number;

    const __3270_AltCursor: number;

    const __3270_Attn: number;

    const __3270_BackTab: number;

    const __3270_ChangeScreen: number;

    const __3270_Copy: number;

    const __3270_CursorBlink: number;

    const __3270_CursorSelect: number;

    const __3270_DeleteWord: number;

    const __3270_Duplicate: number;

    const __3270_Enter: number;

    const __3270_EraseEOF: number;

    const __3270_EraseInput: number;

    const __3270_ExSelect: number;

    const __3270_FieldMark: number;

    const __3270_Ident: number;

    const __3270_Jump: number;

    const __3270_KeyClick: number;

    const __3270_Left2: number;

    const __3270_PA1: number;

    const __3270_PA2: number;

    const __3270_PA3: number;

    const __3270_Play: number;

    const __3270_PrintScreen: number;

    const __3270_Quit: number;

    const __3270_Record: number;

    const __3270_Reset: number;

    const __3270_Right2: number;

    const __3270_Rule: number;

    const __3270_Setup: number;

    const __3270_Test: number;

    const __4: number;

    const __5: number;

    const __6: number;

    const __7: number;

    const __8: number;

    const __9: number;

    const A: number;

    const AE: number;

    const Aacute: number;

    const Abelowdot: number;

    const Abreve: number;

    const Abreveacute: number;

    const Abrevebelowdot: number;

    const Abrevegrave: number;

    const Abrevehook: number;

    const Abrevetilde: number;

    const AccessX_Enable: number;

    const AccessX_Feedback_Enable: number;

    const Acircumflex: number;

    const Acircumflexacute: number;

    const Acircumflexbelowdot: number;

    const Acircumflexgrave: number;

    const Acircumflexhook: number;

    const Acircumflextilde: number;

    const Adiaeresis: number;

    const Agrave: number;

    const Ahook: number;

    const Alt_L: number;

    const Alt_R: number;

    const Amacron: number;

    const Aogonek: number;

    const Arabic_0: number;

    const Arabic_1: number;

    const Arabic_2: number;

    const Arabic_3: number;

    const Arabic_4: number;

    const Arabic_5: number;

    const Arabic_6: number;

    const Arabic_7: number;

    const Arabic_8: number;

    const Arabic_9: number;

    const Arabic_ain: number;

    const Arabic_alef: number;

    const Arabic_alefmaksura: number;

    const Arabic_beh: number;

    const Arabic_comma: number;

    const Arabic_dad: number;

    const Arabic_dal: number;

    const Arabic_damma: number;

    const Arabic_dammatan: number;

    const Arabic_ddal: number;

    const Arabic_farsi_yeh: number;

    const Arabic_fatha: number;

    const Arabic_fathatan: number;

    const Arabic_feh: number;

    const Arabic_fullstop: number;

    const Arabic_gaf: number;

    const Arabic_ghain: number;

    const Arabic_ha: number;

    const Arabic_hah: number;

    const Arabic_hamza: number;

    const Arabic_hamza_above: number;

    const Arabic_hamza_below: number;

    const Arabic_hamzaonalef: number;

    const Arabic_hamzaonwaw: number;

    const Arabic_hamzaonyeh: number;

    const Arabic_hamzaunderalef: number;

    const Arabic_heh: number;

    const Arabic_heh_doachashmee: number;

    const Arabic_heh_goal: number;

    const Arabic_jeem: number;

    const Arabic_jeh: number;

    const Arabic_kaf: number;

    const Arabic_kasra: number;

    const Arabic_kasratan: number;

    const Arabic_keheh: number;

    const Arabic_khah: number;

    const Arabic_lam: number;

    const Arabic_madda_above: number;

    const Arabic_maddaonalef: number;

    const Arabic_meem: number;

    const Arabic_noon: number;

    const Arabic_noon_ghunna: number;

    const Arabic_peh: number;

    const Arabic_percent: number;

    const Arabic_qaf: number;

    const Arabic_question_mark: number;

    const Arabic_ra: number;

    const Arabic_rreh: number;

    const Arabic_sad: number;

    const Arabic_seen: number;

    const Arabic_semicolon: number;

    const Arabic_shadda: number;

    const Arabic_sheen: number;

    const Arabic_sukun: number;

    const Arabic_superscript_alef: number;

    const Arabic_switch: number;

    const Arabic_tah: number;

    const Arabic_tatweel: number;

    const Arabic_tcheh: number;

    const Arabic_teh: number;

    const Arabic_tehmarbuta: number;

    const Arabic_thal: number;

    const Arabic_theh: number;

    const Arabic_tteh: number;

    const Arabic_veh: number;

    const Arabic_waw: number;

    const Arabic_yeh: number;

    const Arabic_yeh_baree: number;

    const Arabic_zah: number;

    const Arabic_zain: number;

    const Aring: number;

    const Armenian_AT: number;

    const Armenian_AYB: number;

    const Armenian_BEN: number;

    const Armenian_CHA: number;

    const Armenian_DA: number;

    const Armenian_DZA: number;

    const Armenian_E: number;

    const Armenian_FE: number;

    const Armenian_GHAT: number;

    const Armenian_GIM: number;

    const Armenian_HI: number;

    const Armenian_HO: number;

    const Armenian_INI: number;

    const Armenian_JE: number;

    const Armenian_KE: number;

    const Armenian_KEN: number;

    const Armenian_KHE: number;

    const Armenian_LYUN: number;

    const Armenian_MEN: number;

    const Armenian_NU: number;

    const Armenian_O: number;

    const Armenian_PE: number;

    const Armenian_PYUR: number;

    const Armenian_RA: number;

    const Armenian_RE: number;

    const Armenian_SE: number;

    const Armenian_SHA: number;

    const Armenian_TCHE: number;

    const Armenian_TO: number;

    const Armenian_TSA: number;

    const Armenian_TSO: number;

    const Armenian_TYUN: number;

    const Armenian_VEV: number;

    const Armenian_VO: number;

    const Armenian_VYUN: number;

    const Armenian_YECH: number;

    const Armenian_ZA: number;

    const Armenian_ZHE: number;

    const Armenian_accent: number;

    const Armenian_amanak: number;

    const Armenian_apostrophe: number;

    const Armenian_at: number;

    const Armenian_ayb: number;

    const Armenian_ben: number;

    const Armenian_but: number;

    const Armenian_cha: number;

    const Armenian_da: number;

    const Armenian_dza: number;

    const Armenian_e: number;

    const Armenian_exclam: number;

    const Armenian_fe: number;

    const Armenian_full_stop: number;

    const Armenian_ghat: number;

    const Armenian_gim: number;

    const Armenian_hi: number;

    const Armenian_ho: number;

    const Armenian_hyphen: number;

    const Armenian_ini: number;

    const Armenian_je: number;

    const Armenian_ke: number;

    const Armenian_ken: number;

    const Armenian_khe: number;

    const Armenian_ligature_ew: number;

    const Armenian_lyun: number;

    const Armenian_men: number;

    const Armenian_nu: number;

    const Armenian_o: number;

    const Armenian_paruyk: number;

    const Armenian_pe: number;

    const Armenian_pyur: number;

    const Armenian_question: number;

    const Armenian_ra: number;

    const Armenian_re: number;

    const Armenian_se: number;

    const Armenian_separation_mark: number;

    const Armenian_sha: number;

    const Armenian_shesht: number;

    const Armenian_tche: number;

    const Armenian_to: number;

    const Armenian_tsa: number;

    const Armenian_tso: number;

    const Armenian_tyun: number;

    const Armenian_verjaket: number;

    const Armenian_vev: number;

    const Armenian_vo: number;

    const Armenian_vyun: number;

    const Armenian_yech: number;

    const Armenian_yentamna: number;

    const Armenian_za: number;

    const Armenian_zhe: number;

    const Atilde: number;

    const AudibleBell_Enable: number;

    const B: number;

    const Babovedot: number;

    const BackSpace: number;

    const Begin: number;

    const BounceKeys_Enable: number;

    const Break: number;

    const Byelorussian_SHORTU: number;

    const Byelorussian_shortu: number;

    const C: number;

    const Cabovedot: number;

    const Cacute: number;

    const Cancel: number;

    const Caps_Lock: number;

    const Ccaron: number;

    const Ccedilla: number;

    const Ccircumflex: number;

    const Clear: number;

    const Codeinput: number;

    const ColonSign: number;

    const Control_L: number;

    const Control_R: number;

    const CruzeiroSign: number;

    const Cyrillic_A: number;

    const Cyrillic_BE: number;

    const Cyrillic_CHE: number;

    const Cyrillic_CHE_descender: number;

    const Cyrillic_CHE_vertstroke: number;

    const Cyrillic_DE: number;

    const Cyrillic_DZHE: number;

    const Cyrillic_E: number;

    const Cyrillic_EF: number;

    const Cyrillic_EL: number;

    const Cyrillic_EM: number;

    const Cyrillic_EN: number;

    const Cyrillic_EN_descender: number;

    const Cyrillic_ER: number;

    const Cyrillic_ES: number;

    const Cyrillic_GHE: number;

    const Cyrillic_GHE_bar: number;

    const Cyrillic_HA: number;

    const Cyrillic_HARDSIGN: number;

    const Cyrillic_HA_descender: number;

    const Cyrillic_I: number;

    const Cyrillic_IE: number;

    const Cyrillic_IO: number;

    const Cyrillic_I_macron: number;

    const Cyrillic_JE: number;

    const Cyrillic_KA: number;

    const Cyrillic_KA_descender: number;

    const Cyrillic_KA_vertstroke: number;

    const Cyrillic_LJE: number;

    const Cyrillic_NJE: number;

    const Cyrillic_O: number;

    const Cyrillic_O_bar: number;

    const Cyrillic_PE: number;

    const Cyrillic_SCHWA: number;

    const Cyrillic_SHA: number;

    const Cyrillic_SHCHA: number;

    const Cyrillic_SHHA: number;

    const Cyrillic_SHORTI: number;

    const Cyrillic_SOFTSIGN: number;

    const Cyrillic_TE: number;

    const Cyrillic_TSE: number;

    const Cyrillic_U: number;

    const Cyrillic_U_macron: number;

    const Cyrillic_U_straight: number;

    const Cyrillic_U_straight_bar: number;

    const Cyrillic_VE: number;

    const Cyrillic_YA: number;

    const Cyrillic_YERU: number;

    const Cyrillic_YU: number;

    const Cyrillic_ZE: number;

    const Cyrillic_ZHE: number;

    const Cyrillic_ZHE_descender: number;

    const Cyrillic_a: number;

    const Cyrillic_be: number;

    const Cyrillic_che: number;

    const Cyrillic_che_descender: number;

    const Cyrillic_che_vertstroke: number;

    const Cyrillic_de: number;

    const Cyrillic_dzhe: number;

    const Cyrillic_e: number;

    const Cyrillic_ef: number;

    const Cyrillic_el: number;

    const Cyrillic_em: number;

    const Cyrillic_en: number;

    const Cyrillic_en_descender: number;

    const Cyrillic_er: number;

    const Cyrillic_es: number;

    const Cyrillic_ghe: number;

    const Cyrillic_ghe_bar: number;

    const Cyrillic_ha: number;

    const Cyrillic_ha_descender: number;

    const Cyrillic_hardsign: number;

    const Cyrillic_i: number;

    const Cyrillic_i_macron: number;

    const Cyrillic_ie: number;

    const Cyrillic_io: number;

    const Cyrillic_je: number;

    const Cyrillic_ka: number;

    const Cyrillic_ka_descender: number;

    const Cyrillic_ka_vertstroke: number;

    const Cyrillic_lje: number;

    const Cyrillic_nje: number;

    const Cyrillic_o: number;

    const Cyrillic_o_bar: number;

    const Cyrillic_pe: number;

    const Cyrillic_schwa: number;

    const Cyrillic_sha: number;

    const Cyrillic_shcha: number;

    const Cyrillic_shha: number;

    const Cyrillic_shorti: number;

    const Cyrillic_softsign: number;

    const Cyrillic_te: number;

    const Cyrillic_tse: number;

    const Cyrillic_u: number;

    const Cyrillic_u_macron: number;

    const Cyrillic_u_straight: number;

    const Cyrillic_u_straight_bar: number;

    const Cyrillic_ve: number;

    const Cyrillic_ya: number;

    const Cyrillic_yeru: number;

    const Cyrillic_yu: number;

    const Cyrillic_ze: number;

    const Cyrillic_zhe: number;

    const Cyrillic_zhe_descender: number;

    const D: number;

    const Dabovedot: number;

    const Dcaron: number;

    const Delete: number;

    const DongSign: number;

    const Down: number;

    const Dstroke: number;

    const E: number;

    const ENG: number;

    const ETH: number;

    const Eabovedot: number;

    const Eacute: number;

    const Ebelowdot: number;

    const Ecaron: number;

    const Ecircumflex: number;

    const Ecircumflexacute: number;

    const Ecircumflexbelowdot: number;

    const Ecircumflexgrave: number;

    const Ecircumflexhook: number;

    const Ecircumflextilde: number;

    const EcuSign: number;

    const Ediaeresis: number;

    const Egrave: number;

    const Ehook: number;

    const Eisu_Shift: number;

    const Eisu_toggle: number;

    const Emacron: number;

    const End: number;

    const Eogonek: number;

    const Escape: number;

    const Eth: number;

    const Etilde: number;

    const EuroSign: number;

    const Execute: number;

    const F: number;

    const F1: number;

    const F10: number;

    const F11: number;

    const F12: number;

    const F13: number;

    const F14: number;

    const F15: number;

    const F16: number;

    const F17: number;

    const F18: number;

    const F19: number;

    const F2: number;

    const F20: number;

    const F21: number;

    const F22: number;

    const F23: number;

    const F24: number;

    const F25: number;

    const F26: number;

    const F27: number;

    const F28: number;

    const F29: number;

    const F3: number;

    const F30: number;

    const F31: number;

    const F32: number;

    const F33: number;

    const F34: number;

    const F35: number;

    const F4: number;

    const F5: number;

    const F6: number;

    const F7: number;

    const F8: number;

    const F9: number;

    const FFrancSign: number;

    const Fabovedot: number;

    const Farsi_0: number;

    const Farsi_1: number;

    const Farsi_2: number;

    const Farsi_3: number;

    const Farsi_4: number;

    const Farsi_5: number;

    const Farsi_6: number;

    const Farsi_7: number;

    const Farsi_8: number;

    const Farsi_9: number;

    const Farsi_yeh: number;

    const Find: number;

    const First_Virtual_Screen: number;

    const G: number;

    const Gabovedot: number;

    const Gbreve: number;

    const Gcaron: number;

    const Gcedilla: number;

    const Gcircumflex: number;

    const Georgian_an: number;

    const Georgian_ban: number;

    const Georgian_can: number;

    const Georgian_char: number;

    const Georgian_chin: number;

    const Georgian_cil: number;

    const Georgian_don: number;

    const Georgian_en: number;

    const Georgian_fi: number;

    const Georgian_gan: number;

    const Georgian_ghan: number;

    const Georgian_hae: number;

    const Georgian_har: number;

    const Georgian_he: number;

    const Georgian_hie: number;

    const Georgian_hoe: number;

    const Georgian_in: number;

    const Georgian_jhan: number;

    const Georgian_jil: number;

    const Georgian_kan: number;

    const Georgian_khar: number;

    const Georgian_las: number;

    const Georgian_man: number;

    const Georgian_nar: number;

    const Georgian_on: number;

    const Georgian_par: number;

    const Georgian_phar: number;

    const Georgian_qar: number;

    const Georgian_rae: number;

    const Georgian_san: number;

    const Georgian_shin: number;

    const Georgian_tan: number;

    const Georgian_tar: number;

    const Georgian_un: number;

    const Georgian_vin: number;

    const Georgian_we: number;

    const Georgian_xan: number;

    const Georgian_zen: number;

    const Georgian_zhar: number;

    const Greek_ALPHA: number;

    const Greek_ALPHAaccent: number;

    const Greek_BETA: number;

    const Greek_CHI: number;

    const Greek_DELTA: number;

    const Greek_EPSILON: number;

    const Greek_EPSILONaccent: number;

    const Greek_ETA: number;

    const Greek_ETAaccent: number;

    const Greek_GAMMA: number;

    const Greek_IOTA: number;

    const Greek_IOTAaccent: number;

    const Greek_IOTAdiaeresis: number;

    const Greek_IOTAdieresis: number;

    const Greek_KAPPA: number;

    const Greek_LAMBDA: number;

    const Greek_LAMDA: number;

    const Greek_MU: number;

    const Greek_NU: number;

    const Greek_OMEGA: number;

    const Greek_OMEGAaccent: number;

    const Greek_OMICRON: number;

    const Greek_OMICRONaccent: number;

    const Greek_PHI: number;

    const Greek_PI: number;

    const Greek_PSI: number;

    const Greek_RHO: number;

    const Greek_SIGMA: number;

    const Greek_TAU: number;

    const Greek_THETA: number;

    const Greek_UPSILON: number;

    const Greek_UPSILONaccent: number;

    const Greek_UPSILONdieresis: number;

    const Greek_XI: number;

    const Greek_ZETA: number;

    const Greek_accentdieresis: number;

    const Greek_alpha: number;

    const Greek_alphaaccent: number;

    const Greek_beta: number;

    const Greek_chi: number;

    const Greek_delta: number;

    const Greek_epsilon: number;

    const Greek_epsilonaccent: number;

    const Greek_eta: number;

    const Greek_etaaccent: number;

    const Greek_finalsmallsigma: number;

    const Greek_gamma: number;

    const Greek_horizbar: number;

    const Greek_iota: number;

    const Greek_iotaaccent: number;

    const Greek_iotaaccentdieresis: number;

    const Greek_iotadieresis: number;

    const Greek_kappa: number;

    const Greek_lambda: number;

    const Greek_lamda: number;

    const Greek_mu: number;

    const Greek_nu: number;

    const Greek_omega: number;

    const Greek_omegaaccent: number;

    const Greek_omicron: number;

    const Greek_omicronaccent: number;

    const Greek_phi: number;

    const Greek_pi: number;

    const Greek_psi: number;

    const Greek_rho: number;

    const Greek_sigma: number;

    const Greek_switch: number;

    const Greek_tau: number;

    const Greek_theta: number;

    const Greek_upsilon: number;

    const Greek_upsilonaccent: number;

    const Greek_upsilonaccentdieresis: number;

    const Greek_upsilondieresis: number;

    const Greek_xi: number;

    const Greek_zeta: number;

    const H: number;

    const Hangul: number;

    const Hangul_A: number;

    const Hangul_AE: number;

    const Hangul_AraeA: number;

    const Hangul_AraeAE: number;

    const Hangul_Banja: number;

    const Hangul_Cieuc: number;

    const Hangul_Codeinput: number;

    const Hangul_Dikeud: number;

    const Hangul_E: number;

    const Hangul_EO: number;

    const Hangul_EU: number;

    const Hangul_End: number;

    const Hangul_Hanja: number;

    const Hangul_Hieuh: number;

    const Hangul_I: number;

    const Hangul_Ieung: number;

    const Hangul_J_Cieuc: number;

    const Hangul_J_Dikeud: number;

    const Hangul_J_Hieuh: number;

    const Hangul_J_Ieung: number;

    const Hangul_J_Jieuj: number;

    const Hangul_J_Khieuq: number;

    const Hangul_J_Kiyeog: number;

    const Hangul_J_KiyeogSios: number;

    const Hangul_J_KkogjiDalrinIeung: number;

    const Hangul_J_Mieum: number;

    const Hangul_J_Nieun: number;

    const Hangul_J_NieunHieuh: number;

    const Hangul_J_NieunJieuj: number;

    const Hangul_J_PanSios: number;

    const Hangul_J_Phieuf: number;

    const Hangul_J_Pieub: number;

    const Hangul_J_PieubSios: number;

    const Hangul_J_Rieul: number;

    const Hangul_J_RieulHieuh: number;

    const Hangul_J_RieulKiyeog: number;

    const Hangul_J_RieulMieum: number;

    const Hangul_J_RieulPhieuf: number;

    const Hangul_J_RieulPieub: number;

    const Hangul_J_RieulSios: number;

    const Hangul_J_RieulTieut: number;

    const Hangul_J_Sios: number;

    const Hangul_J_SsangKiyeog: number;

    const Hangul_J_SsangSios: number;

    const Hangul_J_Tieut: number;

    const Hangul_J_YeorinHieuh: number;

    const Hangul_Jamo: number;

    const Hangul_Jeonja: number;

    const Hangul_Jieuj: number;

    const Hangul_Khieuq: number;

    const Hangul_Kiyeog: number;

    const Hangul_KiyeogSios: number;

    const Hangul_KkogjiDalrinIeung: number;

    const Hangul_Mieum: number;

    const Hangul_MultipleCandidate: number;

    const Hangul_Nieun: number;

    const Hangul_NieunHieuh: number;

    const Hangul_NieunJieuj: number;

    const Hangul_O: number;

    const Hangul_OE: number;

    const Hangul_PanSios: number;

    const Hangul_Phieuf: number;

    const Hangul_Pieub: number;

    const Hangul_PieubSios: number;

    const Hangul_PostHanja: number;

    const Hangul_PreHanja: number;

    const Hangul_PreviousCandidate: number;

    const Hangul_Rieul: number;

    const Hangul_RieulHieuh: number;

    const Hangul_RieulKiyeog: number;

    const Hangul_RieulMieum: number;

    const Hangul_RieulPhieuf: number;

    const Hangul_RieulPieub: number;

    const Hangul_RieulSios: number;

    const Hangul_RieulTieut: number;

    const Hangul_RieulYeorinHieuh: number;

    const Hangul_Romaja: number;

    const Hangul_SingleCandidate: number;

    const Hangul_Sios: number;

    const Hangul_Special: number;

    const Hangul_SsangDikeud: number;

    const Hangul_SsangJieuj: number;

    const Hangul_SsangKiyeog: number;

    const Hangul_SsangPieub: number;

    const Hangul_SsangSios: number;

    const Hangul_Start: number;

    const Hangul_SunkyeongeumMieum: number;

    const Hangul_SunkyeongeumPhieuf: number;

    const Hangul_SunkyeongeumPieub: number;

    const Hangul_Tieut: number;

    const Hangul_U: number;

    const Hangul_WA: number;

    const Hangul_WAE: number;

    const Hangul_WE: number;

    const Hangul_WEO: number;

    const Hangul_WI: number;

    const Hangul_YA: number;

    const Hangul_YAE: number;

    const Hangul_YE: number;

    const Hangul_YEO: number;

    const Hangul_YI: number;

    const Hangul_YO: number;

    const Hangul_YU: number;

    const Hangul_YeorinHieuh: number;

    const Hangul_switch: number;

    const Hankaku: number;

    const Hcircumflex: number;

    const Hebrew_switch: number;

    const Help: number;

    const Henkan: number;

    const Henkan_Mode: number;

    const Hiragana: number;

    const Hiragana_Katakana: number;

    const Home: number;

    const Hstroke: number;

    const Hyper_L: number;

    const Hyper_R: number;

    const I: number;

    const INTERFACE_CONFIG: string;

    const INTERFACE_ENGINE: string;

    const INTERFACE_FACTORY: string;

    const INTERFACE_IBUS: string;

    const INTERFACE_INPUT_CONTEXT: string;

    const INTERFACE_NOTIFICATIONS: string;

    const INTERFACE_PANEL: string;

    const INTERFACE_PORTAL: string;

    const ISO_Center_Object: number;

    const ISO_Continuous_Underline: number;

    const ISO_Discontinuous_Underline: number;

    const ISO_Emphasize: number;

    const ISO_Enter: number;

    const ISO_Fast_Cursor_Down: number;

    const ISO_Fast_Cursor_Left: number;

    const ISO_Fast_Cursor_Right: number;

    const ISO_Fast_Cursor_Up: number;

    const ISO_First_Group: number;

    const ISO_First_Group_Lock: number;

    const ISO_Group_Latch: number;

    const ISO_Group_Lock: number;

    const ISO_Group_Shift: number;

    const ISO_Last_Group: number;

    const ISO_Last_Group_Lock: number;

    const ISO_Left_Tab: number;

    const ISO_Level2_Latch: number;

    const ISO_Level3_Latch: number;

    const ISO_Level3_Lock: number;

    const ISO_Level3_Shift: number;

    const ISO_Level5_Latch: number;

    const ISO_Level5_Lock: number;

    const ISO_Level5_Shift: number;

    const ISO_Lock: number;

    const ISO_Move_Line_Down: number;

    const ISO_Move_Line_Up: number;

    const ISO_Next_Group: number;

    const ISO_Next_Group_Lock: number;

    const ISO_Partial_Line_Down: number;

    const ISO_Partial_Line_Up: number;

    const ISO_Partial_Space_Left: number;

    const ISO_Partial_Space_Right: number;

    const ISO_Prev_Group: number;

    const ISO_Prev_Group_Lock: number;

    const ISO_Release_Both_Margins: number;

    const ISO_Release_Margin_Left: number;

    const ISO_Release_Margin_Right: number;

    const ISO_Set_Margin_Left: number;

    const ISO_Set_Margin_Right: number;

    const Iabovedot: number;

    const Iacute: number;

    const Ibelowdot: number;

    const Ibreve: number;

    const Icircumflex: number;

    const Idiaeresis: number;

    const Igrave: number;

    const Ihook: number;

    const Imacron: number;

    const Insert: number;

    const Iogonek: number;

    const Itilde: number;

    const J: number;

    const Jcircumflex: number;

    const K: number;

    const KEY_0: number;

    const KEY_1: number;

    const KEY_2: number;

    const KEY_3: number;

    const KEY_3270_AltCursor: number;

    const KEY_3270_Attn: number;

    const KEY_3270_BackTab: number;

    const KEY_3270_ChangeScreen: number;

    const KEY_3270_Copy: number;

    const KEY_3270_CursorBlink: number;

    const KEY_3270_CursorSelect: number;

    const KEY_3270_DeleteWord: number;

    const KEY_3270_Duplicate: number;

    const KEY_3270_Enter: number;

    const KEY_3270_EraseEOF: number;

    const KEY_3270_EraseInput: number;

    const KEY_3270_ExSelect: number;

    const KEY_3270_FieldMark: number;

    const KEY_3270_Ident: number;

    const KEY_3270_Jump: number;

    const KEY_3270_KeyClick: number;

    const KEY_3270_Left2: number;

    const KEY_3270_PA1: number;

    const KEY_3270_PA2: number;

    const KEY_3270_PA3: number;

    const KEY_3270_Play: number;

    const KEY_3270_PrintScreen: number;

    const KEY_3270_Quit: number;

    const KEY_3270_Record: number;

    const KEY_3270_Reset: number;

    const KEY_3270_Right2: number;

    const KEY_3270_Rule: number;

    const KEY_3270_Setup: number;

    const KEY_3270_Test: number;

    const KEY_4: number;

    const KEY_5: number;

    const KEY_6: number;

    const KEY_7: number;

    const KEY_8: number;

    const KEY_9: number;

    const KEY_A: number;

    const KEY_AE: number;

    const KEY_Aacute: number;

    const KEY_Abelowdot: number;

    const KEY_Abreve: number;

    const KEY_Abreveacute: number;

    const KEY_Abrevebelowdot: number;

    const KEY_Abrevegrave: number;

    const KEY_Abrevehook: number;

    const KEY_Abrevetilde: number;

    const KEY_AccessX_Enable: number;

    const KEY_AccessX_Feedback_Enable: number;

    const KEY_Acircumflex: number;

    const KEY_Acircumflexacute: number;

    const KEY_Acircumflexbelowdot: number;

    const KEY_Acircumflexgrave: number;

    const KEY_Acircumflexhook: number;

    const KEY_Acircumflextilde: number;

    const KEY_AddFavorite: number;

    const KEY_Adiaeresis: number;

    const KEY_Agrave: number;

    const KEY_Ahook: number;

    const KEY_Alt_L: number;

    const KEY_Alt_R: number;

    const KEY_Amacron: number;

    const KEY_Aogonek: number;

    const KEY_ApplicationLeft: number;

    const KEY_ApplicationRight: number;

    const KEY_Arabic_0: number;

    const KEY_Arabic_1: number;

    const KEY_Arabic_2: number;

    const KEY_Arabic_3: number;

    const KEY_Arabic_4: number;

    const KEY_Arabic_5: number;

    const KEY_Arabic_6: number;

    const KEY_Arabic_7: number;

    const KEY_Arabic_8: number;

    const KEY_Arabic_9: number;

    const KEY_Arabic_ain: number;

    const KEY_Arabic_alef: number;

    const KEY_Arabic_alefmaksura: number;

    const KEY_Arabic_beh: number;

    const KEY_Arabic_comma: number;

    const KEY_Arabic_dad: number;

    const KEY_Arabic_dal: number;

    const KEY_Arabic_damma: number;

    const KEY_Arabic_dammatan: number;

    const KEY_Arabic_ddal: number;

    const KEY_Arabic_farsi_yeh: number;

    const KEY_Arabic_fatha: number;

    const KEY_Arabic_fathatan: number;

    const KEY_Arabic_feh: number;

    const KEY_Arabic_fullstop: number;

    const KEY_Arabic_gaf: number;

    const KEY_Arabic_ghain: number;

    const KEY_Arabic_ha: number;

    const KEY_Arabic_hah: number;

    const KEY_Arabic_hamza: number;

    const KEY_Arabic_hamza_above: number;

    const KEY_Arabic_hamza_below: number;

    const KEY_Arabic_hamzaonalef: number;

    const KEY_Arabic_hamzaonwaw: number;

    const KEY_Arabic_hamzaonyeh: number;

    const KEY_Arabic_hamzaunderalef: number;

    const KEY_Arabic_heh: number;

    const KEY_Arabic_heh_doachashmee: number;

    const KEY_Arabic_heh_goal: number;

    const KEY_Arabic_jeem: number;

    const KEY_Arabic_jeh: number;

    const KEY_Arabic_kaf: number;

    const KEY_Arabic_kasra: number;

    const KEY_Arabic_kasratan: number;

    const KEY_Arabic_keheh: number;

    const KEY_Arabic_khah: number;

    const KEY_Arabic_lam: number;

    const KEY_Arabic_madda_above: number;

    const KEY_Arabic_maddaonalef: number;

    const KEY_Arabic_meem: number;

    const KEY_Arabic_noon: number;

    const KEY_Arabic_noon_ghunna: number;

    const KEY_Arabic_peh: number;

    const KEY_Arabic_percent: number;

    const KEY_Arabic_qaf: number;

    const KEY_Arabic_question_mark: number;

    const KEY_Arabic_ra: number;

    const KEY_Arabic_rreh: number;

    const KEY_Arabic_sad: number;

    const KEY_Arabic_seen: number;

    const KEY_Arabic_semicolon: number;

    const KEY_Arabic_shadda: number;

    const KEY_Arabic_sheen: number;

    const KEY_Arabic_sukun: number;

    const KEY_Arabic_superscript_alef: number;

    const KEY_Arabic_switch: number;

    const KEY_Arabic_tah: number;

    const KEY_Arabic_tatweel: number;

    const KEY_Arabic_tcheh: number;

    const KEY_Arabic_teh: number;

    const KEY_Arabic_tehmarbuta: number;

    const KEY_Arabic_thal: number;

    const KEY_Arabic_theh: number;

    const KEY_Arabic_tteh: number;

    const KEY_Arabic_veh: number;

    const KEY_Arabic_waw: number;

    const KEY_Arabic_yeh: number;

    const KEY_Arabic_yeh_baree: number;

    const KEY_Arabic_zah: number;

    const KEY_Arabic_zain: number;

    const KEY_Aring: number;

    const KEY_Armenian_AT: number;

    const KEY_Armenian_AYB: number;

    const KEY_Armenian_BEN: number;

    const KEY_Armenian_CHA: number;

    const KEY_Armenian_DA: number;

    const KEY_Armenian_DZA: number;

    const KEY_Armenian_E: number;

    const KEY_Armenian_FE: number;

    const KEY_Armenian_GHAT: number;

    const KEY_Armenian_GIM: number;

    const KEY_Armenian_HI: number;

    const KEY_Armenian_HO: number;

    const KEY_Armenian_INI: number;

    const KEY_Armenian_JE: number;

    const KEY_Armenian_KE: number;

    const KEY_Armenian_KEN: number;

    const KEY_Armenian_KHE: number;

    const KEY_Armenian_LYUN: number;

    const KEY_Armenian_MEN: number;

    const KEY_Armenian_NU: number;

    const KEY_Armenian_O: number;

    const KEY_Armenian_PE: number;

    const KEY_Armenian_PYUR: number;

    const KEY_Armenian_RA: number;

    const KEY_Armenian_RE: number;

    const KEY_Armenian_SE: number;

    const KEY_Armenian_SHA: number;

    const KEY_Armenian_TCHE: number;

    const KEY_Armenian_TO: number;

    const KEY_Armenian_TSA: number;

    const KEY_Armenian_TSO: number;

    const KEY_Armenian_TYUN: number;

    const KEY_Armenian_VEV: number;

    const KEY_Armenian_VO: number;

    const KEY_Armenian_VYUN: number;

    const KEY_Armenian_YECH: number;

    const KEY_Armenian_ZA: number;

    const KEY_Armenian_ZHE: number;

    const KEY_Armenian_accent: number;

    const KEY_Armenian_amanak: number;

    const KEY_Armenian_apostrophe: number;

    const KEY_Armenian_at: number;

    const KEY_Armenian_ayb: number;

    const KEY_Armenian_ben: number;

    const KEY_Armenian_but: number;

    const KEY_Armenian_cha: number;

    const KEY_Armenian_da: number;

    const KEY_Armenian_dza: number;

    const KEY_Armenian_e: number;

    const KEY_Armenian_exclam: number;

    const KEY_Armenian_fe: number;

    const KEY_Armenian_full_stop: number;

    const KEY_Armenian_ghat: number;

    const KEY_Armenian_gim: number;

    const KEY_Armenian_hi: number;

    const KEY_Armenian_ho: number;

    const KEY_Armenian_hyphen: number;

    const KEY_Armenian_ini: number;

    const KEY_Armenian_je: number;

    const KEY_Armenian_ke: number;

    const KEY_Armenian_ken: number;

    const KEY_Armenian_khe: number;

    const KEY_Armenian_ligature_ew: number;

    const KEY_Armenian_lyun: number;

    const KEY_Armenian_men: number;

    const KEY_Armenian_nu: number;

    const KEY_Armenian_o: number;

    const KEY_Armenian_paruyk: number;

    const KEY_Armenian_pe: number;

    const KEY_Armenian_pyur: number;

    const KEY_Armenian_question: number;

    const KEY_Armenian_ra: number;

    const KEY_Armenian_re: number;

    const KEY_Armenian_se: number;

    const KEY_Armenian_separation_mark: number;

    const KEY_Armenian_sha: number;

    const KEY_Armenian_shesht: number;

    const KEY_Armenian_tche: number;

    const KEY_Armenian_to: number;

    const KEY_Armenian_tsa: number;

    const KEY_Armenian_tso: number;

    const KEY_Armenian_tyun: number;

    const KEY_Armenian_verjaket: number;

    const KEY_Armenian_vev: number;

    const KEY_Armenian_vo: number;

    const KEY_Armenian_vyun: number;

    const KEY_Armenian_yech: number;

    const KEY_Armenian_yentamna: number;

    const KEY_Armenian_za: number;

    const KEY_Armenian_zhe: number;

    const KEY_Atilde: number;

    const KEY_AudibleBell_Enable: number;

    const KEY_AudioCycleTrack: number;

    const KEY_AudioForward: number;

    const KEY_AudioLowerVolume: number;

    const KEY_AudioMedia: number;

    const KEY_AudioMicMute: number;

    const KEY_AudioMute: number;

    const KEY_AudioNext: number;

    const KEY_AudioPause: number;

    const KEY_AudioPlay: number;

    const KEY_AudioPreset: number;

    const KEY_AudioPrev: number;

    const KEY_AudioRaiseVolume: number;

    const KEY_AudioRandomPlay: number;

    const KEY_AudioRecord: number;

    const KEY_AudioRepeat: number;

    const KEY_AudioRewind: number;

    const KEY_AudioStop: number;

    const KEY_Away: number;

    const KEY_B: number;

    const KEY_Babovedot: number;

    const KEY_Back: number;

    const KEY_BackForward: number;

    const KEY_BackSpace: number;

    const KEY_Battery: number;

    const KEY_Begin: number;

    const KEY_Blue: number;

    const KEY_Bluetooth: number;

    const KEY_Book: number;

    const KEY_BounceKeys_Enable: number;

    const KEY_Break: number;

    const KEY_BrightnessAdjust: number;

    const KEY_Byelorussian_SHORTU: number;

    const KEY_Byelorussian_shortu: number;

    const KEY_C: number;

    const KEY_CD: number;

    const KEY_CH: number;

    const KEY_C_H: number;

    const KEY_C_h: number;

    const KEY_Cabovedot: number;

    const KEY_Cacute: number;

    const KEY_Calculator: number;

    const KEY_Calendar: number;

    const KEY_Cancel: number;

    const KEY_Caps_Lock: number;

    const KEY_Ccaron: number;

    const KEY_Ccedilla: number;

    const KEY_Ccircumflex: number;

    const KEY_Ch: number;

    const KEY_Clear: number;

    const KEY_ClearGrab: number;

    const KEY_Close: number;

    const KEY_Codeinput: number;

    const KEY_ColonSign: number;

    const KEY_Community: number;

    const KEY_ContrastAdjust: number;

    const KEY_Control_L: number;

    const KEY_Control_R: number;

    const KEY_Copy: number;

    const KEY_CruzeiroSign: number;

    const KEY_Cut: number;

    const KEY_CycleAngle: number;

    const KEY_Cyrillic_A: number;

    const KEY_Cyrillic_BE: number;

    const KEY_Cyrillic_CHE: number;

    const KEY_Cyrillic_CHE_descender: number;

    const KEY_Cyrillic_CHE_vertstroke: number;

    const KEY_Cyrillic_DE: number;

    const KEY_Cyrillic_DZHE: number;

    const KEY_Cyrillic_E: number;

    const KEY_Cyrillic_EF: number;

    const KEY_Cyrillic_EL: number;

    const KEY_Cyrillic_EM: number;

    const KEY_Cyrillic_EN: number;

    const KEY_Cyrillic_EN_descender: number;

    const KEY_Cyrillic_ER: number;

    const KEY_Cyrillic_ES: number;

    const KEY_Cyrillic_GHE: number;

    const KEY_Cyrillic_GHE_bar: number;

    const KEY_Cyrillic_HA: number;

    const KEY_Cyrillic_HARDSIGN: number;

    const KEY_Cyrillic_HA_descender: number;

    const KEY_Cyrillic_I: number;

    const KEY_Cyrillic_IE: number;

    const KEY_Cyrillic_IO: number;

    const KEY_Cyrillic_I_macron: number;

    const KEY_Cyrillic_JE: number;

    const KEY_Cyrillic_KA: number;

    const KEY_Cyrillic_KA_descender: number;

    const KEY_Cyrillic_KA_vertstroke: number;

    const KEY_Cyrillic_LJE: number;

    const KEY_Cyrillic_NJE: number;

    const KEY_Cyrillic_O: number;

    const KEY_Cyrillic_O_bar: number;

    const KEY_Cyrillic_PE: number;

    const KEY_Cyrillic_SCHWA: number;

    const KEY_Cyrillic_SHA: number;

    const KEY_Cyrillic_SHCHA: number;

    const KEY_Cyrillic_SHHA: number;

    const KEY_Cyrillic_SHORTI: number;

    const KEY_Cyrillic_SOFTSIGN: number;

    const KEY_Cyrillic_TE: number;

    const KEY_Cyrillic_TSE: number;

    const KEY_Cyrillic_U: number;

    const KEY_Cyrillic_U_macron: number;

    const KEY_Cyrillic_U_straight: number;

    const KEY_Cyrillic_U_straight_bar: number;

    const KEY_Cyrillic_VE: number;

    const KEY_Cyrillic_YA: number;

    const KEY_Cyrillic_YERU: number;

    const KEY_Cyrillic_YU: number;

    const KEY_Cyrillic_ZE: number;

    const KEY_Cyrillic_ZHE: number;

    const KEY_Cyrillic_ZHE_descender: number;

    const KEY_Cyrillic_a: number;

    const KEY_Cyrillic_be: number;

    const KEY_Cyrillic_che: number;

    const KEY_Cyrillic_che_descender: number;

    const KEY_Cyrillic_che_vertstroke: number;

    const KEY_Cyrillic_de: number;

    const KEY_Cyrillic_dzhe: number;

    const KEY_Cyrillic_e: number;

    const KEY_Cyrillic_ef: number;

    const KEY_Cyrillic_el: number;

    const KEY_Cyrillic_em: number;

    const KEY_Cyrillic_en: number;

    const KEY_Cyrillic_en_descender: number;

    const KEY_Cyrillic_er: number;

    const KEY_Cyrillic_es: number;

    const KEY_Cyrillic_ghe: number;

    const KEY_Cyrillic_ghe_bar: number;

    const KEY_Cyrillic_ha: number;

    const KEY_Cyrillic_ha_descender: number;

    const KEY_Cyrillic_hardsign: number;

    const KEY_Cyrillic_i: number;

    const KEY_Cyrillic_i_macron: number;

    const KEY_Cyrillic_ie: number;

    const KEY_Cyrillic_io: number;

    const KEY_Cyrillic_je: number;

    const KEY_Cyrillic_ka: number;

    const KEY_Cyrillic_ka_descender: number;

    const KEY_Cyrillic_ka_vertstroke: number;

    const KEY_Cyrillic_lje: number;

    const KEY_Cyrillic_nje: number;

    const KEY_Cyrillic_o: number;

    const KEY_Cyrillic_o_bar: number;

    const KEY_Cyrillic_pe: number;

    const KEY_Cyrillic_schwa: number;

    const KEY_Cyrillic_sha: number;

    const KEY_Cyrillic_shcha: number;

    const KEY_Cyrillic_shha: number;

    const KEY_Cyrillic_shorti: number;

    const KEY_Cyrillic_softsign: number;

    const KEY_Cyrillic_te: number;

    const KEY_Cyrillic_tse: number;

    const KEY_Cyrillic_u: number;

    const KEY_Cyrillic_u_macron: number;

    const KEY_Cyrillic_u_straight: number;

    const KEY_Cyrillic_u_straight_bar: number;

    const KEY_Cyrillic_ve: number;

    const KEY_Cyrillic_ya: number;

    const KEY_Cyrillic_yeru: number;

    const KEY_Cyrillic_yu: number;

    const KEY_Cyrillic_ze: number;

    const KEY_Cyrillic_zhe: number;

    const KEY_Cyrillic_zhe_descender: number;

    const KEY_D: number;

    const KEY_DOS: number;

    const KEY_Dabovedot: number;

    const KEY_Dcaron: number;

    const KEY_Delete: number;

    const KEY_Display: number;

    const KEY_Documents: number;

    const KEY_DongSign: number;

    const KEY_Down: number;

    const KEY_Dstroke: number;

    const KEY_E: number;

    const KEY_ENG: number;

    const KEY_ETH: number;

    const KEY_EZH: number;

    const KEY_Eabovedot: number;

    const KEY_Eacute: number;

    const KEY_Ebelowdot: number;

    const KEY_Ecaron: number;

    const KEY_Ecircumflex: number;

    const KEY_Ecircumflexacute: number;

    const KEY_Ecircumflexbelowdot: number;

    const KEY_Ecircumflexgrave: number;

    const KEY_Ecircumflexhook: number;

    const KEY_Ecircumflextilde: number;

    const KEY_EcuSign: number;

    const KEY_Ediaeresis: number;

    const KEY_Egrave: number;

    const KEY_Ehook: number;

    const KEY_Eisu_Shift: number;

    const KEY_Eisu_toggle: number;

    const KEY_Eject: number;

    const KEY_Emacron: number;

    const KEY_End: number;

    const KEY_Eogonek: number;

    const KEY_Escape: number;

    const KEY_Eth: number;

    const KEY_Etilde: number;

    const KEY_EuroSign: number;

    const KEY_Excel: number;

    const KEY_Execute: number;

    const KEY_Explorer: number;

    const KEY_F: number;

    const KEY_F1: number;

    const KEY_F10: number;

    const KEY_F11: number;

    const KEY_F12: number;

    const KEY_F13: number;

    const KEY_F14: number;

    const KEY_F15: number;

    const KEY_F16: number;

    const KEY_F17: number;

    const KEY_F18: number;

    const KEY_F19: number;

    const KEY_F2: number;

    const KEY_F20: number;

    const KEY_F21: number;

    const KEY_F22: number;

    const KEY_F23: number;

    const KEY_F24: number;

    const KEY_F25: number;

    const KEY_F26: number;

    const KEY_F27: number;

    const KEY_F28: number;

    const KEY_F29: number;

    const KEY_F3: number;

    const KEY_F30: number;

    const KEY_F31: number;

    const KEY_F32: number;

    const KEY_F33: number;

    const KEY_F34: number;

    const KEY_F35: number;

    const KEY_F4: number;

    const KEY_F5: number;

    const KEY_F6: number;

    const KEY_F7: number;

    const KEY_F8: number;

    const KEY_F9: number;

    const KEY_FFrancSign: number;

    const KEY_Fabovedot: number;

    const KEY_Farsi_0: number;

    const KEY_Farsi_1: number;

    const KEY_Farsi_2: number;

    const KEY_Farsi_3: number;

    const KEY_Farsi_4: number;

    const KEY_Farsi_5: number;

    const KEY_Farsi_6: number;

    const KEY_Farsi_7: number;

    const KEY_Farsi_8: number;

    const KEY_Farsi_9: number;

    const KEY_Farsi_yeh: number;

    const KEY_Favorites: number;

    const KEY_Finance: number;

    const KEY_Find: number;

    const KEY_First_Virtual_Screen: number;

    const KEY_Forward: number;

    const KEY_FrameBack: number;

    const KEY_FrameForward: number;

    const KEY_G: number;

    const KEY_Gabovedot: number;

    const KEY_Game: number;

    const KEY_Gbreve: number;

    const KEY_Gcaron: number;

    const KEY_Gcedilla: number;

    const KEY_Gcircumflex: number;

    const KEY_Georgian_an: number;

    const KEY_Georgian_ban: number;

    const KEY_Georgian_can: number;

    const KEY_Georgian_char: number;

    const KEY_Georgian_chin: number;

    const KEY_Georgian_cil: number;

    const KEY_Georgian_don: number;

    const KEY_Georgian_en: number;

    const KEY_Georgian_fi: number;

    const KEY_Georgian_gan: number;

    const KEY_Georgian_ghan: number;

    const KEY_Georgian_hae: number;

    const KEY_Georgian_har: number;

    const KEY_Georgian_he: number;

    const KEY_Georgian_hie: number;

    const KEY_Georgian_hoe: number;

    const KEY_Georgian_in: number;

    const KEY_Georgian_jhan: number;

    const KEY_Georgian_jil: number;

    const KEY_Georgian_kan: number;

    const KEY_Georgian_khar: number;

    const KEY_Georgian_las: number;

    const KEY_Georgian_man: number;

    const KEY_Georgian_nar: number;

    const KEY_Georgian_on: number;

    const KEY_Georgian_par: number;

    const KEY_Georgian_phar: number;

    const KEY_Georgian_qar: number;

    const KEY_Georgian_rae: number;

    const KEY_Georgian_san: number;

    const KEY_Georgian_shin: number;

    const KEY_Georgian_tan: number;

    const KEY_Georgian_tar: number;

    const KEY_Georgian_un: number;

    const KEY_Georgian_vin: number;

    const KEY_Georgian_we: number;

    const KEY_Georgian_xan: number;

    const KEY_Georgian_zen: number;

    const KEY_Georgian_zhar: number;

    const KEY_Go: number;

    const KEY_Greek_ALPHA: number;

    const KEY_Greek_ALPHAaccent: number;

    const KEY_Greek_BETA: number;

    const KEY_Greek_CHI: number;

    const KEY_Greek_DELTA: number;

    const KEY_Greek_EPSILON: number;

    const KEY_Greek_EPSILONaccent: number;

    const KEY_Greek_ETA: number;

    const KEY_Greek_ETAaccent: number;

    const KEY_Greek_GAMMA: number;

    const KEY_Greek_IOTA: number;

    const KEY_Greek_IOTAaccent: number;

    const KEY_Greek_IOTAdiaeresis: number;

    const KEY_Greek_IOTAdieresis: number;

    const KEY_Greek_KAPPA: number;

    const KEY_Greek_LAMBDA: number;

    const KEY_Greek_LAMDA: number;

    const KEY_Greek_MU: number;

    const KEY_Greek_NU: number;

    const KEY_Greek_OMEGA: number;

    const KEY_Greek_OMEGAaccent: number;

    const KEY_Greek_OMICRON: number;

    const KEY_Greek_OMICRONaccent: number;

    const KEY_Greek_PHI: number;

    const KEY_Greek_PI: number;

    const KEY_Greek_PSI: number;

    const KEY_Greek_RHO: number;

    const KEY_Greek_SIGMA: number;

    const KEY_Greek_TAU: number;

    const KEY_Greek_THETA: number;

    const KEY_Greek_UPSILON: number;

    const KEY_Greek_UPSILONaccent: number;

    const KEY_Greek_UPSILONdieresis: number;

    const KEY_Greek_XI: number;

    const KEY_Greek_ZETA: number;

    const KEY_Greek_accentdieresis: number;

    const KEY_Greek_alpha: number;

    const KEY_Greek_alphaaccent: number;

    const KEY_Greek_beta: number;

    const KEY_Greek_chi: number;

    const KEY_Greek_delta: number;

    const KEY_Greek_epsilon: number;

    const KEY_Greek_epsilonaccent: number;

    const KEY_Greek_eta: number;

    const KEY_Greek_etaaccent: number;

    const KEY_Greek_finalsmallsigma: number;

    const KEY_Greek_gamma: number;

    const KEY_Greek_horizbar: number;

    const KEY_Greek_iota: number;

    const KEY_Greek_iotaaccent: number;

    const KEY_Greek_iotaaccentdieresis: number;

    const KEY_Greek_iotadieresis: number;

    const KEY_Greek_kappa: number;

    const KEY_Greek_lambda: number;

    const KEY_Greek_lamda: number;

    const KEY_Greek_mu: number;

    const KEY_Greek_nu: number;

    const KEY_Greek_omega: number;

    const KEY_Greek_omegaaccent: number;

    const KEY_Greek_omicron: number;

    const KEY_Greek_omicronaccent: number;

    const KEY_Greek_phi: number;

    const KEY_Greek_pi: number;

    const KEY_Greek_psi: number;

    const KEY_Greek_rho: number;

    const KEY_Greek_sigma: number;

    const KEY_Greek_switch: number;

    const KEY_Greek_tau: number;

    const KEY_Greek_theta: number;

    const KEY_Greek_upsilon: number;

    const KEY_Greek_upsilonaccent: number;

    const KEY_Greek_upsilonaccentdieresis: number;

    const KEY_Greek_upsilondieresis: number;

    const KEY_Greek_xi: number;

    const KEY_Greek_zeta: number;

    const KEY_Green: number;

    const KEY_H: number;

    const KEY_Hangul: number;

    const KEY_Hangul_A: number;

    const KEY_Hangul_AE: number;

    const KEY_Hangul_AraeA: number;

    const KEY_Hangul_AraeAE: number;

    const KEY_Hangul_Banja: number;

    const KEY_Hangul_Cieuc: number;

    const KEY_Hangul_Codeinput: number;

    const KEY_Hangul_Dikeud: number;

    const KEY_Hangul_E: number;

    const KEY_Hangul_EO: number;

    const KEY_Hangul_EU: number;

    const KEY_Hangul_End: number;

    const KEY_Hangul_Hanja: number;

    const KEY_Hangul_Hieuh: number;

    const KEY_Hangul_I: number;

    const KEY_Hangul_Ieung: number;

    const KEY_Hangul_J_Cieuc: number;

    const KEY_Hangul_J_Dikeud: number;

    const KEY_Hangul_J_Hieuh: number;

    const KEY_Hangul_J_Ieung: number;

    const KEY_Hangul_J_Jieuj: number;

    const KEY_Hangul_J_Khieuq: number;

    const KEY_Hangul_J_Kiyeog: number;

    const KEY_Hangul_J_KiyeogSios: number;

    const KEY_Hangul_J_KkogjiDalrinIeung: number;

    const KEY_Hangul_J_Mieum: number;

    const KEY_Hangul_J_Nieun: number;

    const KEY_Hangul_J_NieunHieuh: number;

    const KEY_Hangul_J_NieunJieuj: number;

    const KEY_Hangul_J_PanSios: number;

    const KEY_Hangul_J_Phieuf: number;

    const KEY_Hangul_J_Pieub: number;

    const KEY_Hangul_J_PieubSios: number;

    const KEY_Hangul_J_Rieul: number;

    const KEY_Hangul_J_RieulHieuh: number;

    const KEY_Hangul_J_RieulKiyeog: number;

    const KEY_Hangul_J_RieulMieum: number;

    const KEY_Hangul_J_RieulPhieuf: number;

    const KEY_Hangul_J_RieulPieub: number;

    const KEY_Hangul_J_RieulSios: number;

    const KEY_Hangul_J_RieulTieut: number;

    const KEY_Hangul_J_Sios: number;

    const KEY_Hangul_J_SsangKiyeog: number;

    const KEY_Hangul_J_SsangSios: number;

    const KEY_Hangul_J_Tieut: number;

    const KEY_Hangul_J_YeorinHieuh: number;

    const KEY_Hangul_Jamo: number;

    const KEY_Hangul_Jeonja: number;

    const KEY_Hangul_Jieuj: number;

    const KEY_Hangul_Khieuq: number;

    const KEY_Hangul_Kiyeog: number;

    const KEY_Hangul_KiyeogSios: number;

    const KEY_Hangul_KkogjiDalrinIeung: number;

    const KEY_Hangul_Mieum: number;

    const KEY_Hangul_MultipleCandidate: number;

    const KEY_Hangul_Nieun: number;

    const KEY_Hangul_NieunHieuh: number;

    const KEY_Hangul_NieunJieuj: number;

    const KEY_Hangul_O: number;

    const KEY_Hangul_OE: number;

    const KEY_Hangul_PanSios: number;

    const KEY_Hangul_Phieuf: number;

    const KEY_Hangul_Pieub: number;

    const KEY_Hangul_PieubSios: number;

    const KEY_Hangul_PostHanja: number;

    const KEY_Hangul_PreHanja: number;

    const KEY_Hangul_PreviousCandidate: number;

    const KEY_Hangul_Rieul: number;

    const KEY_Hangul_RieulHieuh: number;

    const KEY_Hangul_RieulKiyeog: number;

    const KEY_Hangul_RieulMieum: number;

    const KEY_Hangul_RieulPhieuf: number;

    const KEY_Hangul_RieulPieub: number;

    const KEY_Hangul_RieulSios: number;

    const KEY_Hangul_RieulTieut: number;

    const KEY_Hangul_RieulYeorinHieuh: number;

    const KEY_Hangul_Romaja: number;

    const KEY_Hangul_SingleCandidate: number;

    const KEY_Hangul_Sios: number;

    const KEY_Hangul_Special: number;

    const KEY_Hangul_SsangDikeud: number;

    const KEY_Hangul_SsangJieuj: number;

    const KEY_Hangul_SsangKiyeog: number;

    const KEY_Hangul_SsangPieub: number;

    const KEY_Hangul_SsangSios: number;

    const KEY_Hangul_Start: number;

    const KEY_Hangul_SunkyeongeumMieum: number;

    const KEY_Hangul_SunkyeongeumPhieuf: number;

    const KEY_Hangul_SunkyeongeumPieub: number;

    const KEY_Hangul_Tieut: number;

    const KEY_Hangul_U: number;

    const KEY_Hangul_WA: number;

    const KEY_Hangul_WAE: number;

    const KEY_Hangul_WE: number;

    const KEY_Hangul_WEO: number;

    const KEY_Hangul_WI: number;

    const KEY_Hangul_YA: number;

    const KEY_Hangul_YAE: number;

    const KEY_Hangul_YE: number;

    const KEY_Hangul_YEO: number;

    const KEY_Hangul_YI: number;

    const KEY_Hangul_YO: number;

    const KEY_Hangul_YU: number;

    const KEY_Hangul_YeorinHieuh: number;

    const KEY_Hangul_switch: number;

    const KEY_Hankaku: number;

    const KEY_Hcircumflex: number;

    const KEY_Hebrew_switch: number;

    const KEY_Help: number;

    const KEY_Henkan: number;

    const KEY_Henkan_Mode: number;

    const KEY_Hibernate: number;

    const KEY_Hiragana: number;

    const KEY_Hiragana_Katakana: number;

    const KEY_History: number;

    const KEY_Home: number;

    const KEY_HomePage: number;

    const KEY_HotLinks: number;

    const KEY_Hstroke: number;

    const KEY_Hyper_L: number;

    const KEY_Hyper_R: number;

    const KEY_I: number;

    const KEY_ISO_Center_Object: number;

    const KEY_ISO_Continuous_Underline: number;

    const KEY_ISO_Discontinuous_Underline: number;

    const KEY_ISO_Emphasize: number;

    const KEY_ISO_Enter: number;

    const KEY_ISO_Fast_Cursor_Down: number;

    const KEY_ISO_Fast_Cursor_Left: number;

    const KEY_ISO_Fast_Cursor_Right: number;

    const KEY_ISO_Fast_Cursor_Up: number;

    const KEY_ISO_First_Group: number;

    const KEY_ISO_First_Group_Lock: number;

    const KEY_ISO_Group_Latch: number;

    const KEY_ISO_Group_Lock: number;

    const KEY_ISO_Group_Shift: number;

    const KEY_ISO_Last_Group: number;

    const KEY_ISO_Last_Group_Lock: number;

    const KEY_ISO_Left_Tab: number;

    const KEY_ISO_Level2_Latch: number;

    const KEY_ISO_Level3_Latch: number;

    const KEY_ISO_Level3_Lock: number;

    const KEY_ISO_Level3_Shift: number;

    const KEY_ISO_Level5_Latch: number;

    const KEY_ISO_Level5_Lock: number;

    const KEY_ISO_Level5_Shift: number;

    const KEY_ISO_Lock: number;

    const KEY_ISO_Move_Line_Down: number;

    const KEY_ISO_Move_Line_Up: number;

    const KEY_ISO_Next_Group: number;

    const KEY_ISO_Next_Group_Lock: number;

    const KEY_ISO_Partial_Line_Down: number;

    const KEY_ISO_Partial_Line_Up: number;

    const KEY_ISO_Partial_Space_Left: number;

    const KEY_ISO_Partial_Space_Right: number;

    const KEY_ISO_Prev_Group: number;

    const KEY_ISO_Prev_Group_Lock: number;

    const KEY_ISO_Release_Both_Margins: number;

    const KEY_ISO_Release_Margin_Left: number;

    const KEY_ISO_Release_Margin_Right: number;

    const KEY_ISO_Set_Margin_Left: number;

    const KEY_ISO_Set_Margin_Right: number;

    const KEY_Iabovedot: number;

    const KEY_Iacute: number;

    const KEY_Ibelowdot: number;

    const KEY_Ibreve: number;

    const KEY_Icircumflex: number;

    const KEY_Idiaeresis: number;

    const KEY_Igrave: number;

    const KEY_Ihook: number;

    const KEY_Imacron: number;

    const KEY_Insert: number;

    const KEY_Iogonek: number;

    const KEY_Itilde: number;

    const KEY_J: number;

    const KEY_Jcircumflex: number;

    const KEY_K: number;

    const KEY_KP_0: number;

    const KEY_KP_1: number;

    const KEY_KP_2: number;

    const KEY_KP_3: number;

    const KEY_KP_4: number;

    const KEY_KP_5: number;

    const KEY_KP_6: number;

    const KEY_KP_7: number;

    const KEY_KP_8: number;

    const KEY_KP_9: number;

    const KEY_KP_Add: number;

    const KEY_KP_Begin: number;

    const KEY_KP_Decimal: number;

    const KEY_KP_Delete: number;

    const KEY_KP_Divide: number;

    const KEY_KP_Down: number;

    const KEY_KP_End: number;

    const KEY_KP_Enter: number;

    const KEY_KP_Equal: number;

    const KEY_KP_F1: number;

    const KEY_KP_F2: number;

    const KEY_KP_F3: number;

    const KEY_KP_F4: number;

    const KEY_KP_Home: number;

    const KEY_KP_Insert: number;

    const KEY_KP_Left: number;

    const KEY_KP_Multiply: number;

    const KEY_KP_Next: number;

    const KEY_KP_Page_Down: number;

    const KEY_KP_Page_Up: number;

    const KEY_KP_Prior: number;

    const KEY_KP_Right: number;

    const KEY_KP_Separator: number;

    const KEY_KP_Space: number;

    const KEY_KP_Subtract: number;

    const KEY_KP_Tab: number;

    const KEY_KP_Up: number;

    const KEY_Kana_Lock: number;

    const KEY_Kana_Shift: number;

    const KEY_Kanji: number;

    const KEY_Kanji_Bangou: number;

    const KEY_Katakana: number;

    const KEY_KbdBrightnessDown: number;

    const KEY_KbdBrightnessUp: number;

    const KEY_KbdLightOnOff: number;

    const KEY_Kcedilla: number;

    const KEY_Keyboard: number;

    const KEY_Korean_Won: number;

    const KEY_L: number;

    const KEY_L1: number;

    const KEY_L10: number;

    const KEY_L2: number;

    const KEY_L3: number;

    const KEY_L4: number;

    const KEY_L5: number;

    const KEY_L6: number;

    const KEY_L7: number;

    const KEY_L8: number;

    const KEY_L9: number;

    const KEY_Lacute: number;

    const KEY_Last_Virtual_Screen: number;

    const KEY_Launch0: number;

    const KEY_Launch1: number;

    const KEY_Launch2: number;

    const KEY_Launch3: number;

    const KEY_Launch4: number;

    const KEY_Launch5: number;

    const KEY_Launch6: number;

    const KEY_Launch7: number;

    const KEY_Launch8: number;

    const KEY_Launch9: number;

    const KEY_LaunchA: number;

    const KEY_LaunchB: number;

    const KEY_LaunchC: number;

    const KEY_LaunchD: number;

    const KEY_LaunchE: number;

    const KEY_LaunchF: number;

    const KEY_Lbelowdot: number;

    const KEY_Lcaron: number;

    const KEY_Lcedilla: number;

    const KEY_Left: number;

    const KEY_LightBulb: number;

    const KEY_Linefeed: number;

    const KEY_LiraSign: number;

    const KEY_LogGrabInfo: number;

    const KEY_LogOff: number;

    const KEY_LogWindowTree: number;

    const KEY_Lstroke: number;

    const KEY_M: number;

    const KEY_Mabovedot: number;

    const KEY_Macedonia_DSE: number;

    const KEY_Macedonia_GJE: number;

    const KEY_Macedonia_KJE: number;

    const KEY_Macedonia_dse: number;

    const KEY_Macedonia_gje: number;

    const KEY_Macedonia_kje: number;

    const KEY_Mae_Koho: number;

    const KEY_Mail: number;

    const KEY_MailForward: number;

    const KEY_Market: number;

    const KEY_Massyo: number;

    const KEY_Meeting: number;

    const KEY_Memo: number;

    const KEY_Menu: number;

    const KEY_MenuKB: number;

    const KEY_MenuPB: number;

    const KEY_Messenger: number;

    const KEY_Meta_L: number;

    const KEY_Meta_R: number;

    const KEY_MillSign: number;

    const KEY_ModeLock: number;

    const KEY_Mode_switch: number;

    const KEY_MonBrightnessDown: number;

    const KEY_MonBrightnessUp: number;

    const KEY_MouseKeys_Accel_Enable: number;

    const KEY_MouseKeys_Enable: number;

    const KEY_Muhenkan: number;

    const KEY_Multi_key: number;

    const KEY_MultipleCandidate: number;

    const KEY_Music: number;

    const KEY_MyComputer: number;

    const KEY_MySites: number;

    const KEY_N: number;

    const KEY_Nacute: number;

    const KEY_NairaSign: number;

    const KEY_Ncaron: number;

    const KEY_Ncedilla: number;

    const KEY_New: number;

    const KEY_NewSheqelSign: number;

    const KEY_News: number;

    const KEY_Next: number;

    const KEY_Next_VMode: number;

    const KEY_Next_Virtual_Screen: number;

    const KEY_Ntilde: number;

    const KEY_Num_Lock: number;

    const KEY_O: number;

    const KEY_OE: number;

    const KEY_Oacute: number;

    const KEY_Obarred: number;

    const KEY_Obelowdot: number;

    const KEY_Ocaron: number;

    const KEY_Ocircumflex: number;

    const KEY_Ocircumflexacute: number;

    const KEY_Ocircumflexbelowdot: number;

    const KEY_Ocircumflexgrave: number;

    const KEY_Ocircumflexhook: number;

    const KEY_Ocircumflextilde: number;

    const KEY_Odiaeresis: number;

    const KEY_Odoubleacute: number;

    const KEY_OfficeHome: number;

    const KEY_Ograve: number;

    const KEY_Ohook: number;

    const KEY_Ohorn: number;

    const KEY_Ohornacute: number;

    const KEY_Ohornbelowdot: number;

    const KEY_Ohorngrave: number;

    const KEY_Ohornhook: number;

    const KEY_Ohorntilde: number;

    const KEY_Omacron: number;

    const KEY_Ooblique: number;

    const KEY_Open: number;

    const KEY_OpenURL: number;

    const KEY_Option: number;

    const KEY_Oslash: number;

    const KEY_Otilde: number;

    const KEY_Overlay1_Enable: number;

    const KEY_Overlay2_Enable: number;

    const KEY_P: number;

    const KEY_Pabovedot: number;

    const KEY_Page_Down: number;

    const KEY_Page_Up: number;

    const KEY_Paste: number;

    const KEY_Pause: number;

    const KEY_PesetaSign: number;

    const KEY_Phone: number;

    const KEY_Pictures: number;

    const KEY_Pointer_Accelerate: number;

    const KEY_Pointer_Button1: number;

    const KEY_Pointer_Button2: number;

    const KEY_Pointer_Button3: number;

    const KEY_Pointer_Button4: number;

    const KEY_Pointer_Button5: number;

    const KEY_Pointer_Button_Dflt: number;

    const KEY_Pointer_DblClick1: number;

    const KEY_Pointer_DblClick2: number;

    const KEY_Pointer_DblClick3: number;

    const KEY_Pointer_DblClick4: number;

    const KEY_Pointer_DblClick5: number;

    const KEY_Pointer_DblClick_Dflt: number;

    const KEY_Pointer_DfltBtnNext: number;

    const KEY_Pointer_DfltBtnPrev: number;

    const KEY_Pointer_Down: number;

    const KEY_Pointer_DownLeft: number;

    const KEY_Pointer_DownRight: number;

    const KEY_Pointer_Drag1: number;

    const KEY_Pointer_Drag2: number;

    const KEY_Pointer_Drag3: number;

    const KEY_Pointer_Drag4: number;

    const KEY_Pointer_Drag5: number;

    const KEY_Pointer_Drag_Dflt: number;

    const KEY_Pointer_EnableKeys: number;

    const KEY_Pointer_Left: number;

    const KEY_Pointer_Right: number;

    const KEY_Pointer_Up: number;

    const KEY_Pointer_UpLeft: number;

    const KEY_Pointer_UpRight: number;

    const KEY_PowerDown: number;

    const KEY_PowerOff: number;

    const KEY_Prev_VMode: number;

    const KEY_Prev_Virtual_Screen: number;

    const KEY_PreviousCandidate: number;

    const KEY_Print: number;

    const KEY_Prior: number;

    const KEY_Q: number;

    const KEY_R: number;

    const KEY_R1: number;

    const KEY_R10: number;

    const KEY_R11: number;

    const KEY_R12: number;

    const KEY_R13: number;

    const KEY_R14: number;

    const KEY_R15: number;

    const KEY_R2: number;

    const KEY_R3: number;

    const KEY_R4: number;

    const KEY_R5: number;

    const KEY_R6: number;

    const KEY_R7: number;

    const KEY_R8: number;

    const KEY_R9: number;

    const KEY_RFKill: number;

    const KEY_Racute: number;

    const KEY_Rcaron: number;

    const KEY_Rcedilla: number;

    const KEY_Red: number;

    const KEY_Redo: number;

    const KEY_Refresh: number;

    const KEY_Reload: number;

    const KEY_RepeatKeys_Enable: number;

    const KEY_Reply: number;

    const KEY_Return: number;

    const KEY_Right: number;

    const KEY_RockerDown: number;

    const KEY_RockerEnter: number;

    const KEY_RockerUp: number;

    const KEY_Romaji: number;

    const KEY_RotateWindows: number;

    const KEY_RotationKB: number;

    const KEY_RotationPB: number;

    const KEY_RupeeSign: number;

    const KEY_S: number;

    const KEY_SCHWA: number;

    const KEY_Sabovedot: number;

    const KEY_Sacute: number;

    const KEY_Save: number;

    const KEY_Scaron: number;

    const KEY_Scedilla: number;

    const KEY_Scircumflex: number;

    const KEY_ScreenSaver: number;

    const KEY_ScrollClick: number;

    const KEY_ScrollDown: number;

    const KEY_ScrollUp: number;

    const KEY_Scroll_Lock: number;

    const KEY_Search: number;

    const KEY_Select: number;

    const KEY_SelectButton: number;

    const KEY_Send: number;

    const KEY_Serbian_DJE: number;

    const KEY_Serbian_DZE: number;

    const KEY_Serbian_JE: number;

    const KEY_Serbian_LJE: number;

    const KEY_Serbian_NJE: number;

    const KEY_Serbian_TSHE: number;

    const KEY_Serbian_dje: number;

    const KEY_Serbian_dze: number;

    const KEY_Serbian_je: number;

    const KEY_Serbian_lje: number;

    const KEY_Serbian_nje: number;

    const KEY_Serbian_tshe: number;

    const KEY_Shift_L: number;

    const KEY_Shift_Lock: number;

    const KEY_Shift_R: number;

    const KEY_Shop: number;

    const KEY_SingleCandidate: number;

    const KEY_Sinh_a: number;

    const KEY_Sinh_aa: number;

    const KEY_Sinh_aa2: number;

    const KEY_Sinh_ae: number;

    const KEY_Sinh_ae2: number;

    const KEY_Sinh_aee: number;

    const KEY_Sinh_aee2: number;

    const KEY_Sinh_ai: number;

    const KEY_Sinh_ai2: number;

    const KEY_Sinh_al: number;

    const KEY_Sinh_au: number;

    const KEY_Sinh_au2: number;

    const KEY_Sinh_ba: number;

    const KEY_Sinh_bha: number;

    const KEY_Sinh_ca: number;

    const KEY_Sinh_cha: number;

    const KEY_Sinh_dda: number;

    const KEY_Sinh_ddha: number;

    const KEY_Sinh_dha: number;

    const KEY_Sinh_dhha: number;

    const KEY_Sinh_e: number;

    const KEY_Sinh_e2: number;

    const KEY_Sinh_ee: number;

    const KEY_Sinh_ee2: number;

    const KEY_Sinh_fa: number;

    const KEY_Sinh_ga: number;

    const KEY_Sinh_gha: number;

    const KEY_Sinh_h2: number;

    const KEY_Sinh_ha: number;

    const KEY_Sinh_i: number;

    const KEY_Sinh_i2: number;

    const KEY_Sinh_ii: number;

    const KEY_Sinh_ii2: number;

    const KEY_Sinh_ja: number;

    const KEY_Sinh_jha: number;

    const KEY_Sinh_jnya: number;

    const KEY_Sinh_ka: number;

    const KEY_Sinh_kha: number;

    const KEY_Sinh_kunddaliya: number;

    const KEY_Sinh_la: number;

    const KEY_Sinh_lla: number;

    const KEY_Sinh_lu: number;

    const KEY_Sinh_lu2: number;

    const KEY_Sinh_luu: number;

    const KEY_Sinh_luu2: number;

    const KEY_Sinh_ma: number;

    const KEY_Sinh_mba: number;

    const KEY_Sinh_na: number;

    const KEY_Sinh_ndda: number;

    const KEY_Sinh_ndha: number;

    const KEY_Sinh_ng: number;

    const KEY_Sinh_ng2: number;

    const KEY_Sinh_nga: number;

    const KEY_Sinh_nja: number;

    const KEY_Sinh_nna: number;

    const KEY_Sinh_nya: number;

    const KEY_Sinh_o: number;

    const KEY_Sinh_o2: number;

    const KEY_Sinh_oo: number;

    const KEY_Sinh_oo2: number;

    const KEY_Sinh_pa: number;

    const KEY_Sinh_pha: number;

    const KEY_Sinh_ra: number;

    const KEY_Sinh_ri: number;

    const KEY_Sinh_rii: number;

    const KEY_Sinh_ru2: number;

    const KEY_Sinh_ruu2: number;

    const KEY_Sinh_sa: number;

    const KEY_Sinh_sha: number;

    const KEY_Sinh_ssha: number;

    const KEY_Sinh_tha: number;

    const KEY_Sinh_thha: number;

    const KEY_Sinh_tta: number;

    const KEY_Sinh_ttha: number;

    const KEY_Sinh_u: number;

    const KEY_Sinh_u2: number;

    const KEY_Sinh_uu: number;

    const KEY_Sinh_uu2: number;

    const KEY_Sinh_va: number;

    const KEY_Sinh_ya: number;

    const KEY_Sleep: number;

    const KEY_SlowKeys_Enable: number;

    const KEY_Spell: number;

    const KEY_SplitScreen: number;

    const KEY_Standby: number;

    const KEY_Start: number;

    const KEY_StickyKeys_Enable: number;

    const KEY_Stop: number;

    const KEY_Subtitle: number;

    const KEY_Super_L: number;

    const KEY_Super_R: number;

    const KEY_Support: number;

    const KEY_Suspend: number;

    const KEY_Switch_VT_1: number;

    const KEY_Switch_VT_10: number;

    const KEY_Switch_VT_11: number;

    const KEY_Switch_VT_12: number;

    const KEY_Switch_VT_2: number;

    const KEY_Switch_VT_3: number;

    const KEY_Switch_VT_4: number;

    const KEY_Switch_VT_5: number;

    const KEY_Switch_VT_6: number;

    const KEY_Switch_VT_7: number;

    const KEY_Switch_VT_8: number;

    const KEY_Switch_VT_9: number;

    const KEY_Sys_Req: number;

    const KEY_T: number;

    const KEY_THORN: number;

    const KEY_Tab: number;

    const KEY_Tabovedot: number;

    const KEY_TaskPane: number;

    const KEY_Tcaron: number;

    const KEY_Tcedilla: number;

    const KEY_Terminal: number;

    const KEY_Terminate_Server: number;

    const KEY_Thai_baht: number;

    const KEY_Thai_bobaimai: number;

    const KEY_Thai_chochan: number;

    const KEY_Thai_chochang: number;

    const KEY_Thai_choching: number;

    const KEY_Thai_chochoe: number;

    const KEY_Thai_dochada: number;

    const KEY_Thai_dodek: number;

    const KEY_Thai_fofa: number;

    const KEY_Thai_fofan: number;

    const KEY_Thai_hohip: number;

    const KEY_Thai_honokhuk: number;

    const KEY_Thai_khokhai: number;

    const KEY_Thai_khokhon: number;

    const KEY_Thai_khokhuat: number;

    const KEY_Thai_khokhwai: number;

    const KEY_Thai_khorakhang: number;

    const KEY_Thai_kokai: number;

    const KEY_Thai_lakkhangyao: number;

    const KEY_Thai_lekchet: number;

    const KEY_Thai_lekha: number;

    const KEY_Thai_lekhok: number;

    const KEY_Thai_lekkao: number;

    const KEY_Thai_leknung: number;

    const KEY_Thai_lekpaet: number;

    const KEY_Thai_leksam: number;

    const KEY_Thai_leksi: number;

    const KEY_Thai_leksong: number;

    const KEY_Thai_leksun: number;

    const KEY_Thai_lochula: number;

    const KEY_Thai_loling: number;

    const KEY_Thai_lu: number;

    const KEY_Thai_maichattawa: number;

    const KEY_Thai_maiek: number;

    const KEY_Thai_maihanakat: number;

    const KEY_Thai_maihanakat_maitho: number;

    const KEY_Thai_maitaikhu: number;

    const KEY_Thai_maitho: number;

    const KEY_Thai_maitri: number;

    const KEY_Thai_maiyamok: number;

    const KEY_Thai_moma: number;

    const KEY_Thai_ngongu: number;

    const KEY_Thai_nikhahit: number;

    const KEY_Thai_nonen: number;

    const KEY_Thai_nonu: number;

    const KEY_Thai_oang: number;

    const KEY_Thai_paiyannoi: number;

    const KEY_Thai_phinthu: number;

    const KEY_Thai_phophan: number;

    const KEY_Thai_phophung: number;

    const KEY_Thai_phosamphao: number;

    const KEY_Thai_popla: number;

    const KEY_Thai_rorua: number;

    const KEY_Thai_ru: number;

    const KEY_Thai_saraa: number;

    const KEY_Thai_saraaa: number;

    const KEY_Thai_saraae: number;

    const KEY_Thai_saraaimaimalai: number;

    const KEY_Thai_saraaimaimuan: number;

    const KEY_Thai_saraam: number;

    const KEY_Thai_sarae: number;

    const KEY_Thai_sarai: number;

    const KEY_Thai_saraii: number;

    const KEY_Thai_sarao: number;

    const KEY_Thai_sarau: number;

    const KEY_Thai_saraue: number;

    const KEY_Thai_sarauee: number;

    const KEY_Thai_sarauu: number;

    const KEY_Thai_sorusi: number;

    const KEY_Thai_sosala: number;

    const KEY_Thai_soso: number;

    const KEY_Thai_sosua: number;

    const KEY_Thai_thanthakhat: number;

    const KEY_Thai_thonangmontho: number;

    const KEY_Thai_thophuthao: number;

    const KEY_Thai_thothahan: number;

    const KEY_Thai_thothan: number;

    const KEY_Thai_thothong: number;

    const KEY_Thai_thothung: number;

    const KEY_Thai_topatak: number;

    const KEY_Thai_totao: number;

    const KEY_Thai_wowaen: number;

    const KEY_Thai_yoyak: number;

    const KEY_Thai_yoying: number;

    const KEY_Thorn: number;

    const KEY_Time: number;

    const KEY_ToDoList: number;

    const KEY_Tools: number;

    const KEY_TopMenu: number;

    const KEY_TouchpadOff: number;

    const KEY_TouchpadOn: number;

    const KEY_TouchpadToggle: number;

    const KEY_Touroku: number;

    const KEY_Travel: number;

    const KEY_Tslash: number;

    const KEY_U: number;

    const KEY_UWB: number;

    const KEY_Uacute: number;

    const KEY_Ubelowdot: number;

    const KEY_Ubreve: number;

    const KEY_Ucircumflex: number;

    const KEY_Udiaeresis: number;

    const KEY_Udoubleacute: number;

    const KEY_Ugrave: number;

    const KEY_Uhook: number;

    const KEY_Uhorn: number;

    const KEY_Uhornacute: number;

    const KEY_Uhornbelowdot: number;

    const KEY_Uhorngrave: number;

    const KEY_Uhornhook: number;

    const KEY_Uhorntilde: number;

    const KEY_Ukrainian_GHE_WITH_UPTURN: number;

    const KEY_Ukrainian_I: number;

    const KEY_Ukrainian_IE: number;

    const KEY_Ukrainian_YI: number;

    const KEY_Ukrainian_ghe_with_upturn: number;

    const KEY_Ukrainian_i: number;

    const KEY_Ukrainian_ie: number;

    const KEY_Ukrainian_yi: number;

    const KEY_Ukranian_I: number;

    const KEY_Ukranian_JE: number;

    const KEY_Ukranian_YI: number;

    const KEY_Ukranian_i: number;

    const KEY_Ukranian_je: number;

    const KEY_Ukranian_yi: number;

    const KEY_Umacron: number;

    const KEY_Undo: number;

    const KEY_Ungrab: number;

    const KEY_Uogonek: number;

    const KEY_Up: number;

    const KEY_Uring: number;

    const KEY_User1KB: number;

    const KEY_User2KB: number;

    const KEY_UserPB: number;

    const KEY_Utilde: number;

    const KEY_V: number;

    const KEY_VendorHome: number;

    const KEY_Video: number;

    const KEY_View: number;

    const KEY_VoidSymbol: number;

    const KEY_W: number;

    const KEY_WLAN: number;

    const KEY_WWAN: number;

    const KEY_WWW: number;

    const KEY_Wacute: number;

    const KEY_WakeUp: number;

    const KEY_Wcircumflex: number;

    const KEY_Wdiaeresis: number;

    const KEY_WebCam: number;

    const KEY_Wgrave: number;

    const KEY_WheelButton: number;

    const KEY_WindowClear: number;

    const KEY_WonSign: number;

    const KEY_Word: number;

    const KEY_X: number;

    const KEY_Xabovedot: number;

    const KEY_Xfer: number;

    const KEY_Y: number;

    const KEY_Yacute: number;

    const KEY_Ybelowdot: number;

    const KEY_Ycircumflex: number;

    const KEY_Ydiaeresis: number;

    const KEY_Yellow: number;

    const KEY_Ygrave: number;

    const KEY_Yhook: number;

    const KEY_Ytilde: number;

    const KEY_Z: number;

    const KEY_Zabovedot: number;

    const KEY_Zacute: number;

    const KEY_Zcaron: number;

    const KEY_Zen_Koho: number;

    const KEY_Zenkaku: number;

    const KEY_Zenkaku_Hankaku: number;

    const KEY_ZoomIn: number;

    const KEY_ZoomOut: number;

    const KEY_Zstroke: number;

    const KEY_a: number;

    const KEY_aacute: number;

    const KEY_abelowdot: number;

    const KEY_abovedot: number;

    const KEY_abreve: number;

    const KEY_abreveacute: number;

    const KEY_abrevebelowdot: number;

    const KEY_abrevegrave: number;

    const KEY_abrevehook: number;

    const KEY_abrevetilde: number;

    const KEY_acircumflex: number;

    const KEY_acircumflexacute: number;

    const KEY_acircumflexbelowdot: number;

    const KEY_acircumflexgrave: number;

    const KEY_acircumflexhook: number;

    const KEY_acircumflextilde: number;

    const KEY_acute: number;

    const KEY_adiaeresis: number;

    const KEY_ae: number;

    const KEY_agrave: number;

    const KEY_ahook: number;

    const KEY_amacron: number;

    const KEY_ampersand: number;

    const KEY_aogonek: number;

    const KEY_apostrophe: number;

    const KEY_approxeq: number;

    const KEY_approximate: number;

    const KEY_aring: number;

    const KEY_asciicircum: number;

    const KEY_asciitilde: number;

    const KEY_asterisk: number;

    const KEY_at: number;

    const KEY_atilde: number;

    const KEY_b: number;

    const KEY_babovedot: number;

    const KEY_backslash: number;

    const KEY_ballotcross: number;

    const KEY_bar: number;

    const KEY_because: number;

    const KEY_blank: number;

    const KEY_botintegral: number;

    const KEY_botleftparens: number;

    const KEY_botleftsqbracket: number;

    const KEY_botleftsummation: number;

    const KEY_botrightparens: number;

    const KEY_botrightsqbracket: number;

    const KEY_botrightsummation: number;

    const KEY_bott: number;

    const KEY_botvertsummationconnector: number;

    const KEY_braceleft: number;

    const KEY_braceright: number;

    const KEY_bracketleft: number;

    const KEY_bracketright: number;

    const KEY_braille_blank: number;

    const KEY_braille_dot_1: number;

    const KEY_braille_dot_10: number;

    const KEY_braille_dot_2: number;

    const KEY_braille_dot_3: number;

    const KEY_braille_dot_4: number;

    const KEY_braille_dot_5: number;

    const KEY_braille_dot_6: number;

    const KEY_braille_dot_7: number;

    const KEY_braille_dot_8: number;

    const KEY_braille_dot_9: number;

    const KEY_braille_dots_1: number;

    const KEY_braille_dots_12: number;

    const KEY_braille_dots_123: number;

    const KEY_braille_dots_1234: number;

    const KEY_braille_dots_12345: number;

    const KEY_braille_dots_123456: number;

    const KEY_braille_dots_1234567: number;

    const KEY_braille_dots_12345678: number;

    const KEY_braille_dots_1234568: number;

    const KEY_braille_dots_123457: number;

    const KEY_braille_dots_1234578: number;

    const KEY_braille_dots_123458: number;

    const KEY_braille_dots_12346: number;

    const KEY_braille_dots_123467: number;

    const KEY_braille_dots_1234678: number;

    const KEY_braille_dots_123468: number;

    const KEY_braille_dots_12347: number;

    const KEY_braille_dots_123478: number;

    const KEY_braille_dots_12348: number;

    const KEY_braille_dots_1235: number;

    const KEY_braille_dots_12356: number;

    const KEY_braille_dots_123567: number;

    const KEY_braille_dots_1235678: number;

    const KEY_braille_dots_123568: number;

    const KEY_braille_dots_12357: number;

    const KEY_braille_dots_123578: number;

    const KEY_braille_dots_12358: number;

    const KEY_braille_dots_1236: number;

    const KEY_braille_dots_12367: number;

    const KEY_braille_dots_123678: number;

    const KEY_braille_dots_12368: number;

    const KEY_braille_dots_1237: number;

    const KEY_braille_dots_12378: number;

    const KEY_braille_dots_1238: number;

    const KEY_braille_dots_124: number;

    const KEY_braille_dots_1245: number;

    const KEY_braille_dots_12456: number;

    const KEY_braille_dots_124567: number;

    const KEY_braille_dots_1245678: number;

    const KEY_braille_dots_124568: number;

    const KEY_braille_dots_12457: number;

    const KEY_braille_dots_124578: number;

    const KEY_braille_dots_12458: number;

    const KEY_braille_dots_1246: number;

    const KEY_braille_dots_12467: number;

    const KEY_braille_dots_124678: number;

    const KEY_braille_dots_12468: number;

    const KEY_braille_dots_1247: number;

    const KEY_braille_dots_12478: number;

    const KEY_braille_dots_1248: number;

    const KEY_braille_dots_125: number;

    const KEY_braille_dots_1256: number;

    const KEY_braille_dots_12567: number;

    const KEY_braille_dots_125678: number;

    const KEY_braille_dots_12568: number;

    const KEY_braille_dots_1257: number;

    const KEY_braille_dots_12578: number;

    const KEY_braille_dots_1258: number;

    const KEY_braille_dots_126: number;

    const KEY_braille_dots_1267: number;

    const KEY_braille_dots_12678: number;

    const KEY_braille_dots_1268: number;

    const KEY_braille_dots_127: number;

    const KEY_braille_dots_1278: number;

    const KEY_braille_dots_128: number;

    const KEY_braille_dots_13: number;

    const KEY_braille_dots_134: number;

    const KEY_braille_dots_1345: number;

    const KEY_braille_dots_13456: number;

    const KEY_braille_dots_134567: number;

    const KEY_braille_dots_1345678: number;

    const KEY_braille_dots_134568: number;

    const KEY_braille_dots_13457: number;

    const KEY_braille_dots_134578: number;

    const KEY_braille_dots_13458: number;

    const KEY_braille_dots_1346: number;

    const KEY_braille_dots_13467: number;

    const KEY_braille_dots_134678: number;

    const KEY_braille_dots_13468: number;

    const KEY_braille_dots_1347: number;

    const KEY_braille_dots_13478: number;

    const KEY_braille_dots_1348: number;

    const KEY_braille_dots_135: number;

    const KEY_braille_dots_1356: number;

    const KEY_braille_dots_13567: number;

    const KEY_braille_dots_135678: number;

    const KEY_braille_dots_13568: number;

    const KEY_braille_dots_1357: number;

    const KEY_braille_dots_13578: number;

    const KEY_braille_dots_1358: number;

    const KEY_braille_dots_136: number;

    const KEY_braille_dots_1367: number;

    const KEY_braille_dots_13678: number;

    const KEY_braille_dots_1368: number;

    const KEY_braille_dots_137: number;

    const KEY_braille_dots_1378: number;

    const KEY_braille_dots_138: number;

    const KEY_braille_dots_14: number;

    const KEY_braille_dots_145: number;

    const KEY_braille_dots_1456: number;

    const KEY_braille_dots_14567: number;

    const KEY_braille_dots_145678: number;

    const KEY_braille_dots_14568: number;

    const KEY_braille_dots_1457: number;

    const KEY_braille_dots_14578: number;

    const KEY_braille_dots_1458: number;

    const KEY_braille_dots_146: number;

    const KEY_braille_dots_1467: number;

    const KEY_braille_dots_14678: number;

    const KEY_braille_dots_1468: number;

    const KEY_braille_dots_147: number;

    const KEY_braille_dots_1478: number;

    const KEY_braille_dots_148: number;

    const KEY_braille_dots_15: number;

    const KEY_braille_dots_156: number;

    const KEY_braille_dots_1567: number;

    const KEY_braille_dots_15678: number;

    const KEY_braille_dots_1568: number;

    const KEY_braille_dots_157: number;

    const KEY_braille_dots_1578: number;

    const KEY_braille_dots_158: number;

    const KEY_braille_dots_16: number;

    const KEY_braille_dots_167: number;

    const KEY_braille_dots_1678: number;

    const KEY_braille_dots_168: number;

    const KEY_braille_dots_17: number;

    const KEY_braille_dots_178: number;

    const KEY_braille_dots_18: number;

    const KEY_braille_dots_2: number;

    const KEY_braille_dots_23: number;

    const KEY_braille_dots_234: number;

    const KEY_braille_dots_2345: number;

    const KEY_braille_dots_23456: number;

    const KEY_braille_dots_234567: number;

    const KEY_braille_dots_2345678: number;

    const KEY_braille_dots_234568: number;

    const KEY_braille_dots_23457: number;

    const KEY_braille_dots_234578: number;

    const KEY_braille_dots_23458: number;

    const KEY_braille_dots_2346: number;

    const KEY_braille_dots_23467: number;

    const KEY_braille_dots_234678: number;

    const KEY_braille_dots_23468: number;

    const KEY_braille_dots_2347: number;

    const KEY_braille_dots_23478: number;

    const KEY_braille_dots_2348: number;

    const KEY_braille_dots_235: number;

    const KEY_braille_dots_2356: number;

    const KEY_braille_dots_23567: number;

    const KEY_braille_dots_235678: number;

    const KEY_braille_dots_23568: number;

    const KEY_braille_dots_2357: number;

    const KEY_braille_dots_23578: number;

    const KEY_braille_dots_2358: number;

    const KEY_braille_dots_236: number;

    const KEY_braille_dots_2367: number;

    const KEY_braille_dots_23678: number;

    const KEY_braille_dots_2368: number;

    const KEY_braille_dots_237: number;

    const KEY_braille_dots_2378: number;

    const KEY_braille_dots_238: number;

    const KEY_braille_dots_24: number;

    const KEY_braille_dots_245: number;

    const KEY_braille_dots_2456: number;

    const KEY_braille_dots_24567: number;

    const KEY_braille_dots_245678: number;

    const KEY_braille_dots_24568: number;

    const KEY_braille_dots_2457: number;

    const KEY_braille_dots_24578: number;

    const KEY_braille_dots_2458: number;

    const KEY_braille_dots_246: number;

    const KEY_braille_dots_2467: number;

    const KEY_braille_dots_24678: number;

    const KEY_braille_dots_2468: number;

    const KEY_braille_dots_247: number;

    const KEY_braille_dots_2478: number;

    const KEY_braille_dots_248: number;

    const KEY_braille_dots_25: number;

    const KEY_braille_dots_256: number;

    const KEY_braille_dots_2567: number;

    const KEY_braille_dots_25678: number;

    const KEY_braille_dots_2568: number;

    const KEY_braille_dots_257: number;

    const KEY_braille_dots_2578: number;

    const KEY_braille_dots_258: number;

    const KEY_braille_dots_26: number;

    const KEY_braille_dots_267: number;

    const KEY_braille_dots_2678: number;

    const KEY_braille_dots_268: number;

    const KEY_braille_dots_27: number;

    const KEY_braille_dots_278: number;

    const KEY_braille_dots_28: number;

    const KEY_braille_dots_3: number;

    const KEY_braille_dots_34: number;

    const KEY_braille_dots_345: number;

    const KEY_braille_dots_3456: number;

    const KEY_braille_dots_34567: number;

    const KEY_braille_dots_345678: number;

    const KEY_braille_dots_34568: number;

    const KEY_braille_dots_3457: number;

    const KEY_braille_dots_34578: number;

    const KEY_braille_dots_3458: number;

    const KEY_braille_dots_346: number;

    const KEY_braille_dots_3467: number;

    const KEY_braille_dots_34678: number;

    const KEY_braille_dots_3468: number;

    const KEY_braille_dots_347: number;

    const KEY_braille_dots_3478: number;

    const KEY_braille_dots_348: number;

    const KEY_braille_dots_35: number;

    const KEY_braille_dots_356: number;

    const KEY_braille_dots_3567: number;

    const KEY_braille_dots_35678: number;

    const KEY_braille_dots_3568: number;

    const KEY_braille_dots_357: number;

    const KEY_braille_dots_3578: number;

    const KEY_braille_dots_358: number;

    const KEY_braille_dots_36: number;

    const KEY_braille_dots_367: number;

    const KEY_braille_dots_3678: number;

    const KEY_braille_dots_368: number;

    const KEY_braille_dots_37: number;

    const KEY_braille_dots_378: number;

    const KEY_braille_dots_38: number;

    const KEY_braille_dots_4: number;

    const KEY_braille_dots_45: number;

    const KEY_braille_dots_456: number;

    const KEY_braille_dots_4567: number;

    const KEY_braille_dots_45678: number;

    const KEY_braille_dots_4568: number;

    const KEY_braille_dots_457: number;

    const KEY_braille_dots_4578: number;

    const KEY_braille_dots_458: number;

    const KEY_braille_dots_46: number;

    const KEY_braille_dots_467: number;

    const KEY_braille_dots_4678: number;

    const KEY_braille_dots_468: number;

    const KEY_braille_dots_47: number;

    const KEY_braille_dots_478: number;

    const KEY_braille_dots_48: number;

    const KEY_braille_dots_5: number;

    const KEY_braille_dots_56: number;

    const KEY_braille_dots_567: number;

    const KEY_braille_dots_5678: number;

    const KEY_braille_dots_568: number;

    const KEY_braille_dots_57: number;

    const KEY_braille_dots_578: number;

    const KEY_braille_dots_58: number;

    const KEY_braille_dots_6: number;

    const KEY_braille_dots_67: number;

    const KEY_braille_dots_678: number;

    const KEY_braille_dots_68: number;

    const KEY_braille_dots_7: number;

    const KEY_braille_dots_78: number;

    const KEY_braille_dots_8: number;

    const KEY_breve: number;

    const KEY_brokenbar: number;

    const KEY_c: number;

    const KEY_c_h: number;

    const KEY_cabovedot: number;

    const KEY_cacute: number;

    const KEY_careof: number;

    const KEY_caret: number;

    const KEY_caron: number;

    const KEY_ccaron: number;

    const KEY_ccedilla: number;

    const KEY_ccircumflex: number;

    const KEY_cedilla: number;

    const KEY_cent: number;

    const KEY_ch: number;

    const KEY_checkerboard: number;

    const KEY_checkmark: number;

    const KEY_circle: number;

    const KEY_club: number;

    const KEY_colon: number;

    const KEY_combining_acute: number;

    const KEY_combining_belowdot: number;

    const KEY_combining_grave: number;

    const KEY_combining_hook: number;

    const KEY_combining_tilde: number;

    const KEY_comma: number;

    const KEY_containsas: number;

    const KEY_copyright: number;

    const KEY_cr: number;

    const KEY_crossinglines: number;

    const KEY_cuberoot: number;

    const KEY_currency: number;

    const KEY_cursor: number;

    const KEY_d: number;

    const KEY_dabovedot: number;

    const KEY_dagger: number;

    const KEY_dcaron: number;

    const KEY_dead_A: number;

    const KEY_dead_E: number;

    const KEY_dead_I: number;

    const KEY_dead_O: number;

    const KEY_dead_SCHWA: number;

    const KEY_dead_U: number;

    const KEY_dead_a: number;

    const KEY_dead_abovecomma: number;

    const KEY_dead_abovedot: number;

    const KEY_dead_abovereversedcomma: number;

    const KEY_dead_abovering: number;

    const KEY_dead_aboveverticalline: number;

    const KEY_dead_acute: number;

    const KEY_dead_belowbreve: number;

    const KEY_dead_belowcircumflex: number;

    const KEY_dead_belowcomma: number;

    const KEY_dead_belowdiaeresis: number;

    const KEY_dead_belowdot: number;

    const KEY_dead_belowmacron: number;

    const KEY_dead_belowring: number;

    const KEY_dead_belowtilde: number;

    const KEY_dead_belowverticalline: number;

    const KEY_dead_breve: number;

    const KEY_dead_capital_schwa: number;

    const KEY_dead_caron: number;

    const KEY_dead_cedilla: number;

    const KEY_dead_circumflex: number;

    const KEY_dead_currency: number;

    const KEY_dead_dasia: number;

    const KEY_dead_diaeresis: number;

    const KEY_dead_doubleacute: number;

    const KEY_dead_doublegrave: number;

    const KEY_dead_e: number;

    const KEY_dead_grave: number;

    const KEY_dead_greek: number;

    const KEY_dead_hamza: number;

    const KEY_dead_hook: number;

    const KEY_dead_horn: number;

    const KEY_dead_i: number;

    const KEY_dead_invertedbreve: number;

    const KEY_dead_iota: number;

    const KEY_dead_longsolidusoverlay: number;

    const KEY_dead_lowline: number;

    const KEY_dead_macron: number;

    const KEY_dead_o: number;

    const KEY_dead_ogonek: number;

    const KEY_dead_perispomeni: number;

    const KEY_dead_psili: number;

    const KEY_dead_schwa: number;

    const KEY_dead_semivoiced_sound: number;

    const KEY_dead_small_schwa: number;

    const KEY_dead_stroke: number;

    const KEY_dead_tilde: number;

    const KEY_dead_u: number;

    const KEY_dead_voiced_sound: number;

    const KEY_decimalpoint: number;

    const KEY_degree: number;

    const KEY_diaeresis: number;

    const KEY_diamond: number;

    const KEY_digitspace: number;

    const KEY_dintegral: number;

    const KEY_division: number;

    const KEY_dollar: number;

    const KEY_doubbaselinedot: number;

    const KEY_doubleacute: number;

    const KEY_doubledagger: number;

    const KEY_doublelowquotemark: number;

    const KEY_downarrow: number;

    const KEY_downcaret: number;

    const KEY_downshoe: number;

    const KEY_downstile: number;

    const KEY_downtack: number;

    const KEY_dstroke: number;

    const KEY_e: number;

    const KEY_eabovedot: number;

    const KEY_eacute: number;

    const KEY_ebelowdot: number;

    const KEY_ecaron: number;

    const KEY_ecircumflex: number;

    const KEY_ecircumflexacute: number;

    const KEY_ecircumflexbelowdot: number;

    const KEY_ecircumflexgrave: number;

    const KEY_ecircumflexhook: number;

    const KEY_ecircumflextilde: number;

    const KEY_ediaeresis: number;

    const KEY_egrave: number;

    const KEY_ehook: number;

    const KEY_eightsubscript: number;

    const KEY_eightsuperior: number;

    const KEY_elementof: number;

    const KEY_ellipsis: number;

    const KEY_em3space: number;

    const KEY_em4space: number;

    const KEY_emacron: number;

    const KEY_emdash: number;

    const KEY_emfilledcircle: number;

    const KEY_emfilledrect: number;

    const KEY_emopencircle: number;

    const KEY_emopenrectangle: number;

    const KEY_emptyset: number;

    const KEY_emspace: number;

    const KEY_endash: number;

    const KEY_enfilledcircbullet: number;

    const KEY_enfilledsqbullet: number;

    const KEY_eng: number;

    const KEY_enopencircbullet: number;

    const KEY_enopensquarebullet: number;

    const KEY_enspace: number;

    const KEY_eogonek: number;

    const KEY_equal: number;

    const KEY_eth: number;

    const KEY_etilde: number;

    const KEY_exclam: number;

    const KEY_exclamdown: number;

    const KEY_ezh: number;

    const KEY_f: number;

    const KEY_fabovedot: number;

    const KEY_femalesymbol: number;

    const KEY_ff: number;

    const KEY_figdash: number;

    const KEY_filledlefttribullet: number;

    const KEY_filledrectbullet: number;

    const KEY_filledrighttribullet: number;

    const KEY_filledtribulletdown: number;

    const KEY_filledtribulletup: number;

    const KEY_fiveeighths: number;

    const KEY_fivesixths: number;

    const KEY_fivesubscript: number;

    const KEY_fivesuperior: number;

    const KEY_fourfifths: number;

    const KEY_foursubscript: number;

    const KEY_foursuperior: number;

    const KEY_fourthroot: number;

    const KEY_function: number;

    const KEY_g: number;

    const KEY_gabovedot: number;

    const KEY_gbreve: number;

    const KEY_gcaron: number;

    const KEY_gcedilla: number;

    const KEY_gcircumflex: number;

    const KEY_grave: number;

    const KEY_greater: number;

    const KEY_greaterthanequal: number;

    const KEY_guillemetleft: number;

    const KEY_guillemetright: number;

    const KEY_guillemotleft: number;

    const KEY_guillemotright: number;

    const KEY_h: number;

    const KEY_hairspace: number;

    const KEY_hcircumflex: number;

    const KEY_heart: number;

    const KEY_hebrew_aleph: number;

    const KEY_hebrew_ayin: number;

    const KEY_hebrew_bet: number;

    const KEY_hebrew_beth: number;

    const KEY_hebrew_chet: number;

    const KEY_hebrew_dalet: number;

    const KEY_hebrew_daleth: number;

    const KEY_hebrew_doublelowline: number;

    const KEY_hebrew_finalkaph: number;

    const KEY_hebrew_finalmem: number;

    const KEY_hebrew_finalnun: number;

    const KEY_hebrew_finalpe: number;

    const KEY_hebrew_finalzade: number;

    const KEY_hebrew_finalzadi: number;

    const KEY_hebrew_gimel: number;

    const KEY_hebrew_gimmel: number;

    const KEY_hebrew_he: number;

    const KEY_hebrew_het: number;

    const KEY_hebrew_kaph: number;

    const KEY_hebrew_kuf: number;

    const KEY_hebrew_lamed: number;

    const KEY_hebrew_mem: number;

    const KEY_hebrew_nun: number;

    const KEY_hebrew_pe: number;

    const KEY_hebrew_qoph: number;

    const KEY_hebrew_resh: number;

    const KEY_hebrew_samech: number;

    const KEY_hebrew_samekh: number;

    const KEY_hebrew_shin: number;

    const KEY_hebrew_taf: number;

    const KEY_hebrew_taw: number;

    const KEY_hebrew_tet: number;

    const KEY_hebrew_teth: number;

    const KEY_hebrew_waw: number;

    const KEY_hebrew_yod: number;

    const KEY_hebrew_zade: number;

    const KEY_hebrew_zadi: number;

    const KEY_hebrew_zain: number;

    const KEY_hebrew_zayin: number;

    const KEY_hexagram: number;

    const KEY_horizconnector: number;

    const KEY_horizlinescan1: number;

    const KEY_horizlinescan3: number;

    const KEY_horizlinescan5: number;

    const KEY_horizlinescan7: number;

    const KEY_horizlinescan9: number;

    const KEY_hstroke: number;

    const KEY_ht: number;

    const KEY_hyphen: number;

    const KEY_i: number;

    const KEY_iTouch: number;

    const KEY_iacute: number;

    const KEY_ibelowdot: number;

    const KEY_ibreve: number;

    const KEY_icircumflex: number;

    const KEY_identical: number;

    const KEY_idiaeresis: number;

    const KEY_idotless: number;

    const KEY_ifonlyif: number;

    const KEY_igrave: number;

    const KEY_ihook: number;

    const KEY_imacron: number;

    const KEY_implies: number;

    const KEY_includedin: number;

    const KEY_includes: number;

    const KEY_infinity: number;

    const KEY_integral: number;

    const KEY_intersection: number;

    const KEY_iogonek: number;

    const KEY_itilde: number;

    const KEY_j: number;

    const KEY_jcircumflex: number;

    const KEY_jot: number;

    const KEY_k: number;

    const KEY_kana_A: number;

    const KEY_kana_CHI: number;

    const KEY_kana_E: number;

    const KEY_kana_FU: number;

    const KEY_kana_HA: number;

    const KEY_kana_HE: number;

    const KEY_kana_HI: number;

    const KEY_kana_HO: number;

    const KEY_kana_HU: number;

    const KEY_kana_I: number;

    const KEY_kana_KA: number;

    const KEY_kana_KE: number;

    const KEY_kana_KI: number;

    const KEY_kana_KO: number;

    const KEY_kana_KU: number;

    const KEY_kana_MA: number;

    const KEY_kana_ME: number;

    const KEY_kana_MI: number;

    const KEY_kana_MO: number;

    const KEY_kana_MU: number;

    const KEY_kana_N: number;

    const KEY_kana_NA: number;

    const KEY_kana_NE: number;

    const KEY_kana_NI: number;

    const KEY_kana_NO: number;

    const KEY_kana_NU: number;

    const KEY_kana_O: number;

    const KEY_kana_RA: number;

    const KEY_kana_RE: number;

    const KEY_kana_RI: number;

    const KEY_kana_RO: number;

    const KEY_kana_RU: number;

    const KEY_kana_SA: number;

    const KEY_kana_SE: number;

    const KEY_kana_SHI: number;

    const KEY_kana_SO: number;

    const KEY_kana_SU: number;

    const KEY_kana_TA: number;

    const KEY_kana_TE: number;

    const KEY_kana_TI: number;

    const KEY_kana_TO: number;

    const KEY_kana_TSU: number;

    const KEY_kana_TU: number;

    const KEY_kana_U: number;

    const KEY_kana_WA: number;

    const KEY_kana_WO: number;

    const KEY_kana_YA: number;

    const KEY_kana_YO: number;

    const KEY_kana_YU: number;

    const KEY_kana_a: number;

    const KEY_kana_closingbracket: number;

    const KEY_kana_comma: number;

    const KEY_kana_conjunctive: number;

    const KEY_kana_e: number;

    const KEY_kana_fullstop: number;

    const KEY_kana_i: number;

    const KEY_kana_middledot: number;

    const KEY_kana_o: number;

    const KEY_kana_openingbracket: number;

    const KEY_kana_switch: number;

    const KEY_kana_tsu: number;

    const KEY_kana_tu: number;

    const KEY_kana_u: number;

    const KEY_kana_ya: number;

    const KEY_kana_yo: number;

    const KEY_kana_yu: number;

    const KEY_kappa: number;

    const KEY_kcedilla: number;

    const KEY_kra: number;

    const KEY_l: number;

    const KEY_lacute: number;

    const KEY_latincross: number;

    const KEY_lbelowdot: number;

    const KEY_lcaron: number;

    const KEY_lcedilla: number;

    const KEY_leftanglebracket: number;

    const KEY_leftarrow: number;

    const KEY_leftcaret: number;

    const KEY_leftdoublequotemark: number;

    const KEY_leftmiddlecurlybrace: number;

    const KEY_leftopentriangle: number;

    const KEY_leftpointer: number;

    const KEY_leftradical: number;

    const KEY_leftshoe: number;

    const KEY_leftsinglequotemark: number;

    const KEY_leftt: number;

    const KEY_lefttack: number;

    const KEY_less: number;

    const KEY_lessthanequal: number;

    const KEY_lf: number;

    const KEY_logicaland: number;

    const KEY_logicalor: number;

    const KEY_lowleftcorner: number;

    const KEY_lowrightcorner: number;

    const KEY_lstroke: number;

    const KEY_m: number;

    const KEY_mabovedot: number;

    const KEY_macron: number;

    const KEY_malesymbol: number;

    const KEY_maltesecross: number;

    const KEY_marker: number;

    const KEY_masculine: number;

    const KEY_minus: number;

    const KEY_minutes: number;

    const KEY_mu: number;

    const KEY_multiply: number;

    const KEY_musicalflat: number;

    const KEY_musicalsharp: number;

    const KEY_n: number;

    const KEY_nabla: number;

    const KEY_nacute: number;

    const KEY_ncaron: number;

    const KEY_ncedilla: number;

    const KEY_ninesubscript: number;

    const KEY_ninesuperior: number;

    const KEY_nl: number;

    const KEY_nobreakspace: number;

    const KEY_notapproxeq: number;

    const KEY_notelementof: number;

    const KEY_notequal: number;

    const KEY_notidentical: number;

    const KEY_notsign: number;

    const KEY_ntilde: number;

    const KEY_numbersign: number;

    const KEY_numerosign: number;

    const KEY_o: number;

    const KEY_oacute: number;

    const KEY_obarred: number;

    const KEY_obelowdot: number;

    const KEY_ocaron: number;

    const KEY_ocircumflex: number;

    const KEY_ocircumflexacute: number;

    const KEY_ocircumflexbelowdot: number;

    const KEY_ocircumflexgrave: number;

    const KEY_ocircumflexhook: number;

    const KEY_ocircumflextilde: number;

    const KEY_odiaeresis: number;

    const KEY_odoubleacute: number;

    const KEY_oe: number;

    const KEY_ogonek: number;

    const KEY_ograve: number;

    const KEY_ohook: number;

    const KEY_ohorn: number;

    const KEY_ohornacute: number;

    const KEY_ohornbelowdot: number;

    const KEY_ohorngrave: number;

    const KEY_ohornhook: number;

    const KEY_ohorntilde: number;

    const KEY_omacron: number;

    const KEY_oneeighth: number;

    const KEY_onefifth: number;

    const KEY_onehalf: number;

    const KEY_onequarter: number;

    const KEY_onesixth: number;

    const KEY_onesubscript: number;

    const KEY_onesuperior: number;

    const KEY_onethird: number;

    const KEY_ooblique: number;

    const KEY_openrectbullet: number;

    const KEY_openstar: number;

    const KEY_opentribulletdown: number;

    const KEY_opentribulletup: number;

    const KEY_ordfeminine: number;

    const KEY_ordmasculine: number;

    const KEY_oslash: number;

    const KEY_otilde: number;

    const KEY_overbar: number;

    const KEY_overline: number;

    const KEY_p: number;

    const KEY_pabovedot: number;

    const KEY_paragraph: number;

    const KEY_parenleft: number;

    const KEY_parenright: number;

    const KEY_partdifferential: number;

    const KEY_partialderivative: number;

    const KEY_percent: number;

    const KEY_period: number;

    const KEY_periodcentered: number;

    const KEY_permille: number;

    const KEY_phonographcopyright: number;

    const KEY_plus: number;

    const KEY_plusminus: number;

    const KEY_prescription: number;

    const KEY_prolongedsound: number;

    const KEY_punctspace: number;

    const KEY_q: number;

    const KEY_quad: number;

    const KEY_question: number;

    const KEY_questiondown: number;

    const KEY_quotedbl: number;

    const KEY_quoteleft: number;

    const KEY_quoteright: number;

    const KEY_r: number;

    const KEY_racute: number;

    const KEY_radical: number;

    const KEY_rcaron: number;

    const KEY_rcedilla: number;

    const KEY_registered: number;

    const KEY_rightanglebracket: number;

    const KEY_rightarrow: number;

    const KEY_rightcaret: number;

    const KEY_rightdoublequotemark: number;

    const KEY_rightmiddlecurlybrace: number;

    const KEY_rightmiddlesummation: number;

    const KEY_rightopentriangle: number;

    const KEY_rightpointer: number;

    const KEY_rightshoe: number;

    const KEY_rightsinglequotemark: number;

    const KEY_rightt: number;

    const KEY_righttack: number;

    const KEY_s: number;

    const KEY_sabovedot: number;

    const KEY_sacute: number;

    const KEY_scaron: number;

    const KEY_scedilla: number;

    const KEY_schwa: number;

    const KEY_scircumflex: number;

    const KEY_script_switch: number;

    const KEY_seconds: number;

    const KEY_section: number;

    const KEY_semicolon: number;

    const KEY_semivoicedsound: number;

    const KEY_seveneighths: number;

    const KEY_sevensubscript: number;

    const KEY_sevensuperior: number;

    const KEY_signaturemark: number;

    const KEY_signifblank: number;

    const KEY_similarequal: number;

    const KEY_singlelowquotemark: number;

    const KEY_sixsubscript: number;

    const KEY_sixsuperior: number;

    const KEY_slash: number;

    const KEY_soliddiamond: number;

    const KEY_space: number;

    const KEY_squareroot: number;

    const KEY_ssharp: number;

    const KEY_sterling: number;

    const KEY_stricteq: number;

    const KEY_t: number;

    const KEY_tabovedot: number;

    const KEY_tcaron: number;

    const KEY_tcedilla: number;

    const KEY_telephone: number;

    const KEY_telephonerecorder: number;

    const KEY_therefore: number;

    const KEY_thinspace: number;

    const KEY_thorn: number;

    const KEY_threeeighths: number;

    const KEY_threefifths: number;

    const KEY_threequarters: number;

    const KEY_threesubscript: number;

    const KEY_threesuperior: number;

    const KEY_tintegral: number;

    const KEY_topintegral: number;

    const KEY_topleftparens: number;

    const KEY_topleftradical: number;

    const KEY_topleftsqbracket: number;

    const KEY_topleftsummation: number;

    const KEY_toprightparens: number;

    const KEY_toprightsqbracket: number;

    const KEY_toprightsummation: number;

    const KEY_topt: number;

    const KEY_topvertsummationconnector: number;

    const KEY_trademark: number;

    const KEY_trademarkincircle: number;

    const KEY_tslash: number;

    const KEY_twofifths: number;

    const KEY_twosubscript: number;

    const KEY_twosuperior: number;

    const KEY_twothirds: number;

    const KEY_u: number;

    const KEY_uacute: number;

    const KEY_ubelowdot: number;

    const KEY_ubreve: number;

    const KEY_ucircumflex: number;

    const KEY_udiaeresis: number;

    const KEY_udoubleacute: number;

    const KEY_ugrave: number;

    const KEY_uhook: number;

    const KEY_uhorn: number;

    const KEY_uhornacute: number;

    const KEY_uhornbelowdot: number;

    const KEY_uhorngrave: number;

    const KEY_uhornhook: number;

    const KEY_uhorntilde: number;

    const KEY_umacron: number;

    const KEY_underbar: number;

    const KEY_underscore: number;

    const KEY_union: number;

    const KEY_uogonek: number;

    const KEY_uparrow: number;

    const KEY_upcaret: number;

    const KEY_upleftcorner: number;

    const KEY_uprightcorner: number;

    const KEY_upshoe: number;

    const KEY_upstile: number;

    const KEY_uptack: number;

    const KEY_uring: number;

    const KEY_utilde: number;

    const KEY_v: number;

    const KEY_variation: number;

    const KEY_vertbar: number;

    const KEY_vertconnector: number;

    const KEY_voicedsound: number;

    const KEY_vt: number;

    const KEY_w: number;

    const KEY_wacute: number;

    const KEY_wcircumflex: number;

    const KEY_wdiaeresis: number;

    const KEY_wgrave: number;

    const KEY_x: number;

    const KEY_xabovedot: number;

    const KEY_y: number;

    const KEY_yacute: number;

    const KEY_ybelowdot: number;

    const KEY_ycircumflex: number;

    const KEY_ydiaeresis: number;

    const KEY_yen: number;

    const KEY_ygrave: number;

    const KEY_yhook: number;

    const KEY_ytilde: number;

    const KEY_z: number;

    const KEY_zabovedot: number;

    const KEY_zacute: number;

    const KEY_zcaron: number;

    const KEY_zerosubscript: number;

    const KEY_zerosuperior: number;

    const KEY_zstroke: number;

    const KP_0: number;

    const KP_1: number;

    const KP_2: number;

    const KP_3: number;

    const KP_4: number;

    const KP_5: number;

    const KP_6: number;

    const KP_7: number;

    const KP_8: number;

    const KP_9: number;

    const KP_Add: number;

    const KP_Begin: number;

    const KP_Decimal: number;

    const KP_Delete: number;

    const KP_Divide: number;

    const KP_Down: number;

    const KP_End: number;

    const KP_Enter: number;

    const KP_Equal: number;

    const KP_F1: number;

    const KP_F2: number;

    const KP_F3: number;

    const KP_F4: number;

    const KP_Home: number;

    const KP_Insert: number;

    const KP_Left: number;

    const KP_Multiply: number;

    const KP_Next: number;

    const KP_Page_Down: number;

    const KP_Page_Up: number;

    const KP_Prior: number;

    const KP_Right: number;

    const KP_Separator: number;

    const KP_Space: number;

    const KP_Subtract: number;

    const KP_Tab: number;

    const KP_Up: number;

    const Kana_Lock: number;

    const Kana_Shift: number;

    const Kanji: number;

    const Kanji_Bangou: number;

    const Katakana: number;

    const Kcedilla: number;

    const Korean_Won: number;

    const L: number;

    const L1: number;

    const L10: number;

    const L2: number;

    const L3: number;

    const L4: number;

    const L5: number;

    const L6: number;

    const L7: number;

    const L8: number;

    const L9: number;

    const Lacute: number;

    const Last_Virtual_Screen: number;

    const Lbelowdot: number;

    const Lcaron: number;

    const Lcedilla: number;

    const Left: number;

    const Linefeed: number;

    const LiraSign: number;

    const Lstroke: number;

    const M: number;

    const MAJOR_VERSION: number;

    const MAX_COMPOSE_LEN: number;

    const MICRO_VERSION: number;

    const MINOR_VERSION: number;

    const MODIFIER_FILTER: number;

    const Mabovedot: number;

    const Macedonia_DSE: number;

    const Macedonia_GJE: number;

    const Macedonia_KJE: number;

    const Macedonia_dse: number;

    const Macedonia_gje: number;

    const Macedonia_kje: number;

    const Mae_Koho: number;

    const Massyo: number;

    const Menu: number;

    const Meta_L: number;

    const Meta_R: number;

    const MillSign: number;

    const Mode_switch: number;

    const MouseKeys_Accel_Enable: number;

    const MouseKeys_Enable: number;

    const Muhenkan: number;

    const Multi_key: number;

    const MultipleCandidate: number;

    const N: number;

    const Nacute: number;

    const NairaSign: number;

    const Ncaron: number;

    const Ncedilla: number;

    const NewSheqelSign: number;

    const Next: number;

    const Next_Virtual_Screen: number;

    const Ntilde: number;

    const Num_Lock: number;

    const O: number;

    const OE: number;

    const Oacute: number;

    const Obarred: number;

    const Obelowdot: number;

    const Ocaron: number;

    const Ocircumflex: number;

    const Ocircumflexacute: number;

    const Ocircumflexbelowdot: number;

    const Ocircumflexgrave: number;

    const Ocircumflexhook: number;

    const Ocircumflextilde: number;

    const Odiaeresis: number;

    const Odoubleacute: number;

    const Ograve: number;

    const Ohook: number;

    const Ohorn: number;

    const Ohornacute: number;

    const Ohornbelowdot: number;

    const Ohorngrave: number;

    const Ohornhook: number;

    const Ohorntilde: number;

    const Omacron: number;

    const Ooblique: number;

    const Oslash: number;

    const Otilde: number;

    const Overlay1_Enable: number;

    const Overlay2_Enable: number;

    const P: number;

    const PATH_CONFIG: string;

    const PATH_FACTORY: string;

    const PATH_IBUS: string;

    const PATH_INPUT_CONTEXT: string;

    const PATH_NOTIFICATIONS: string;

    const PATH_PANEL: string;

    const PATH_PANEL_EXTENSION_EMOJI: string;

    const Pabovedot: number;

    const Page_Down: number;

    const Page_Up: number;

    const Pause: number;

    const PesetaSign: number;

    const Pointer_Accelerate: number;

    const Pointer_Button1: number;

    const Pointer_Button2: number;

    const Pointer_Button3: number;

    const Pointer_Button4: number;

    const Pointer_Button5: number;

    const Pointer_Button_Dflt: number;

    const Pointer_DblClick1: number;

    const Pointer_DblClick2: number;

    const Pointer_DblClick3: number;

    const Pointer_DblClick4: number;

    const Pointer_DblClick5: number;

    const Pointer_DblClick_Dflt: number;

    const Pointer_DfltBtnNext: number;

    const Pointer_DfltBtnPrev: number;

    const Pointer_Down: number;

    const Pointer_DownLeft: number;

    const Pointer_DownRight: number;

    const Pointer_Drag1: number;

    const Pointer_Drag2: number;

    const Pointer_Drag3: number;

    const Pointer_Drag4: number;

    const Pointer_Drag5: number;

    const Pointer_Drag_Dflt: number;

    const Pointer_EnableKeys: number;

    const Pointer_Left: number;

    const Pointer_Right: number;

    const Pointer_Up: number;

    const Pointer_UpLeft: number;

    const Pointer_UpRight: number;

    const Prev_Virtual_Screen: number;

    const PreviousCandidate: number;

    const Print: number;

    const Prior: number;

    const Q: number;

    const R: number;

    const R1: number;

    const R10: number;

    const R11: number;

    const R12: number;

    const R13: number;

    const R14: number;

    const R15: number;

    const R2: number;

    const R3: number;

    const R4: number;

    const R5: number;

    const R6: number;

    const R7: number;

    const R8: number;

    const R9: number;

    const Racute: number;

    const Rcaron: number;

    const Rcedilla: number;

    const Redo: number;

    const RepeatKeys_Enable: number;

    const Return: number;

    const Right: number;

    const Romaji: number;

    const RupeeSign: number;

    const S: number;

    const SCHWA: number;

    const SERVICE_CONFIG: string;

    const SERVICE_IBUS: string;

    const SERVICE_NOTIFICATIONS: string;

    const SERVICE_PANEL: string;

    const SERVICE_PANEL_EXTENSION: string;

    const SERVICE_PANEL_EXTENSION_EMOJI: string;

    const SERVICE_PORTAL: string;

    const Sabovedot: number;

    const Sacute: number;

    const Scaron: number;

    const Scedilla: number;

    const Scircumflex: number;

    const Scroll_Lock: number;

    const Select: number;

    const Serbian_DJE: number;

    const Serbian_DZE: number;

    const Serbian_JE: number;

    const Serbian_LJE: number;

    const Serbian_NJE: number;

    const Serbian_TSHE: number;

    const Serbian_dje: number;

    const Serbian_dze: number;

    const Serbian_je: number;

    const Serbian_lje: number;

    const Serbian_nje: number;

    const Serbian_tshe: number;

    const Shift_L: number;

    const Shift_Lock: number;

    const Shift_R: number;

    const SingleCandidate: number;

    const SlowKeys_Enable: number;

    const StickyKeys_Enable: number;

    const Super_L: number;

    const Super_R: number;

    const Sys_Req: number;

    const T: number;

    const THORN: number;

    const Tab: number;

    const Tabovedot: number;

    const Tcaron: number;

    const Tcedilla: number;

    const Terminate_Server: number;

    const Thai_baht: number;

    const Thai_bobaimai: number;

    const Thai_chochan: number;

    const Thai_chochang: number;

    const Thai_choching: number;

    const Thai_chochoe: number;

    const Thai_dochada: number;

    const Thai_dodek: number;

    const Thai_fofa: number;

    const Thai_fofan: number;

    const Thai_hohip: number;

    const Thai_honokhuk: number;

    const Thai_khokhai: number;

    const Thai_khokhon: number;

    const Thai_khokhuat: number;

    const Thai_khokhwai: number;

    const Thai_khorakhang: number;

    const Thai_kokai: number;

    const Thai_lakkhangyao: number;

    const Thai_lekchet: number;

    const Thai_lekha: number;

    const Thai_lekhok: number;

    const Thai_lekkao: number;

    const Thai_leknung: number;

    const Thai_lekpaet: number;

    const Thai_leksam: number;

    const Thai_leksi: number;

    const Thai_leksong: number;

    const Thai_leksun: number;

    const Thai_lochula: number;

    const Thai_loling: number;

    const Thai_lu: number;

    const Thai_maichattawa: number;

    const Thai_maiek: number;

    const Thai_maihanakat: number;

    const Thai_maihanakat_maitho: number;

    const Thai_maitaikhu: number;

    const Thai_maitho: number;

    const Thai_maitri: number;

    const Thai_maiyamok: number;

    const Thai_moma: number;

    const Thai_ngongu: number;

    const Thai_nikhahit: number;

    const Thai_nonen: number;

    const Thai_nonu: number;

    const Thai_oang: number;

    const Thai_paiyannoi: number;

    const Thai_phinthu: number;

    const Thai_phophan: number;

    const Thai_phophung: number;

    const Thai_phosamphao: number;

    const Thai_popla: number;

    const Thai_rorua: number;

    const Thai_ru: number;

    const Thai_saraa: number;

    const Thai_saraaa: number;

    const Thai_saraae: number;

    const Thai_saraaimaimalai: number;

    const Thai_saraaimaimuan: number;

    const Thai_saraam: number;

    const Thai_sarae: number;

    const Thai_sarai: number;

    const Thai_saraii: number;

    const Thai_sarao: number;

    const Thai_sarau: number;

    const Thai_saraue: number;

    const Thai_sarauee: number;

    const Thai_sarauu: number;

    const Thai_sorusi: number;

    const Thai_sosala: number;

    const Thai_soso: number;

    const Thai_sosua: number;

    const Thai_thanthakhat: number;

    const Thai_thonangmontho: number;

    const Thai_thophuthao: number;

    const Thai_thothahan: number;

    const Thai_thothan: number;

    const Thai_thothong: number;

    const Thai_thothung: number;

    const Thai_topatak: number;

    const Thai_totao: number;

    const Thai_wowaen: number;

    const Thai_yoyak: number;

    const Thai_yoying: number;

    const Thorn: number;

    const Touroku: number;

    const Tslash: number;

    const U: number;

    const Uacute: number;

    const Ubelowdot: number;

    const Ubreve: number;

    const Ucircumflex: number;

    const Udiaeresis: number;

    const Udoubleacute: number;

    const Ugrave: number;

    const Uhook: number;

    const Uhorn: number;

    const Uhornacute: number;

    const Uhornbelowdot: number;

    const Uhorngrave: number;

    const Uhornhook: number;

    const Uhorntilde: number;

    const Ukrainian_GHE_WITH_UPTURN: number;

    const Ukrainian_I: number;

    const Ukrainian_IE: number;

    const Ukrainian_YI: number;

    const Ukrainian_ghe_with_upturn: number;

    const Ukrainian_i: number;

    const Ukrainian_ie: number;

    const Ukrainian_yi: number;

    const Ukranian_I: number;

    const Ukranian_JE: number;

    const Ukranian_YI: number;

    const Ukranian_i: number;

    const Ukranian_je: number;

    const Ukranian_yi: number;

    const Umacron: number;

    const Undo: number;

    const Uogonek: number;

    const Up: number;

    const Uring: number;

    const Utilde: number;

    const V: number;

    const VERSION_MIN_REQUIRED: number;

    const VoidSymbol: number;

    const W: number;

    const Wacute: number;

    const Wcircumflex: number;

    const Wdiaeresis: number;

    const Wgrave: number;

    const WonSign: number;

    const X: number;

    const Xabovedot: number;

    const Y: number;

    const Yacute: number;

    const Ybelowdot: number;

    const Ycircumflex: number;

    const Ydiaeresis: number;

    const Ygrave: number;

    const Yhook: number;

    const Ytilde: number;

    const Z: number;

    const Zabovedot: number;

    const Zacute: number;

    const Zcaron: number;

    const Zen_Koho: number;

    const Zenkaku: number;

    const Zenkaku_Hankaku: number;

    const Zstroke: number;

    const a: number;

    const aacute: number;

    const abelowdot: number;

    const abovedot: number;

    const abreve: number;

    const abreveacute: number;

    const abrevebelowdot: number;

    const abrevegrave: number;

    const abrevehook: number;

    const abrevetilde: number;

    const acircumflex: number;

    const acircumflexacute: number;

    const acircumflexbelowdot: number;

    const acircumflexgrave: number;

    const acircumflexhook: number;

    const acircumflextilde: number;

    const acute: number;

    const adiaeresis: number;

    const ae: number;

    const agrave: number;

    const ahook: number;

    const amacron: number;

    const ampersand: number;

    const aogonek: number;

    const apostrophe: number;

    const approxeq: number;

    const approximate: number;

    const aring: number;

    const asciicircum: number;

    const asciitilde: number;

    const asterisk: number;

    const at: number;

    const atilde: number;

    const b: number;

    const babovedot: number;

    const backslash: number;

    const ballotcross: number;

    const bar: number;

    const because: number;

    const blank: number;

    const botintegral: number;

    const botleftparens: number;

    const botleftsqbracket: number;

    const botleftsummation: number;

    const botrightparens: number;

    const botrightsqbracket: number;

    const botrightsummation: number;

    const bott: number;

    const botvertsummationconnector: number;

    const braceleft: number;

    const braceright: number;

    const bracketleft: number;

    const bracketright: number;

    const braille_blank: number;

    const braille_dot_1: number;

    const braille_dot_10: number;

    const braille_dot_2: number;

    const braille_dot_3: number;

    const braille_dot_4: number;

    const braille_dot_5: number;

    const braille_dot_6: number;

    const braille_dot_7: number;

    const braille_dot_8: number;

    const braille_dot_9: number;

    const braille_dots_1: number;

    const braille_dots_12: number;

    const braille_dots_123: number;

    const braille_dots_1234: number;

    const braille_dots_12345: number;

    const braille_dots_123456: number;

    const braille_dots_1234567: number;

    const braille_dots_12345678: number;

    const braille_dots_1234568: number;

    const braille_dots_123457: number;

    const braille_dots_1234578: number;

    const braille_dots_123458: number;

    const braille_dots_12346: number;

    const braille_dots_123467: number;

    const braille_dots_1234678: number;

    const braille_dots_123468: number;

    const braille_dots_12347: number;

    const braille_dots_123478: number;

    const braille_dots_12348: number;

    const braille_dots_1235: number;

    const braille_dots_12356: number;

    const braille_dots_123567: number;

    const braille_dots_1235678: number;

    const braille_dots_123568: number;

    const braille_dots_12357: number;

    const braille_dots_123578: number;

    const braille_dots_12358: number;

    const braille_dots_1236: number;

    const braille_dots_12367: number;

    const braille_dots_123678: number;

    const braille_dots_12368: number;

    const braille_dots_1237: number;

    const braille_dots_12378: number;

    const braille_dots_1238: number;

    const braille_dots_124: number;

    const braille_dots_1245: number;

    const braille_dots_12456: number;

    const braille_dots_124567: number;

    const braille_dots_1245678: number;

    const braille_dots_124568: number;

    const braille_dots_12457: number;

    const braille_dots_124578: number;

    const braille_dots_12458: number;

    const braille_dots_1246: number;

    const braille_dots_12467: number;

    const braille_dots_124678: number;

    const braille_dots_12468: number;

    const braille_dots_1247: number;

    const braille_dots_12478: number;

    const braille_dots_1248: number;

    const braille_dots_125: number;

    const braille_dots_1256: number;

    const braille_dots_12567: number;

    const braille_dots_125678: number;

    const braille_dots_12568: number;

    const braille_dots_1257: number;

    const braille_dots_12578: number;

    const braille_dots_1258: number;

    const braille_dots_126: number;

    const braille_dots_1267: number;

    const braille_dots_12678: number;

    const braille_dots_1268: number;

    const braille_dots_127: number;

    const braille_dots_1278: number;

    const braille_dots_128: number;

    const braille_dots_13: number;

    const braille_dots_134: number;

    const braille_dots_1345: number;

    const braille_dots_13456: number;

    const braille_dots_134567: number;

    const braille_dots_1345678: number;

    const braille_dots_134568: number;

    const braille_dots_13457: number;

    const braille_dots_134578: number;

    const braille_dots_13458: number;

    const braille_dots_1346: number;

    const braille_dots_13467: number;

    const braille_dots_134678: number;

    const braille_dots_13468: number;

    const braille_dots_1347: number;

    const braille_dots_13478: number;

    const braille_dots_1348: number;

    const braille_dots_135: number;

    const braille_dots_1356: number;

    const braille_dots_13567: number;

    const braille_dots_135678: number;

    const braille_dots_13568: number;

    const braille_dots_1357: number;

    const braille_dots_13578: number;

    const braille_dots_1358: number;

    const braille_dots_136: number;

    const braille_dots_1367: number;

    const braille_dots_13678: number;

    const braille_dots_1368: number;

    const braille_dots_137: number;

    const braille_dots_1378: number;

    const braille_dots_138: number;

    const braille_dots_14: number;

    const braille_dots_145: number;

    const braille_dots_1456: number;

    const braille_dots_14567: number;

    const braille_dots_145678: number;

    const braille_dots_14568: number;

    const braille_dots_1457: number;

    const braille_dots_14578: number;

    const braille_dots_1458: number;

    const braille_dots_146: number;

    const braille_dots_1467: number;

    const braille_dots_14678: number;

    const braille_dots_1468: number;

    const braille_dots_147: number;

    const braille_dots_1478: number;

    const braille_dots_148: number;

    const braille_dots_15: number;

    const braille_dots_156: number;

    const braille_dots_1567: number;

    const braille_dots_15678: number;

    const braille_dots_1568: number;

    const braille_dots_157: number;

    const braille_dots_1578: number;

    const braille_dots_158: number;

    const braille_dots_16: number;

    const braille_dots_167: number;

    const braille_dots_1678: number;

    const braille_dots_168: number;

    const braille_dots_17: number;

    const braille_dots_178: number;

    const braille_dots_18: number;

    const braille_dots_2: number;

    const braille_dots_23: number;

    const braille_dots_234: number;

    const braille_dots_2345: number;

    const braille_dots_23456: number;

    const braille_dots_234567: number;

    const braille_dots_2345678: number;

    const braille_dots_234568: number;

    const braille_dots_23457: number;

    const braille_dots_234578: number;

    const braille_dots_23458: number;

    const braille_dots_2346: number;

    const braille_dots_23467: number;

    const braille_dots_234678: number;

    const braille_dots_23468: number;

    const braille_dots_2347: number;

    const braille_dots_23478: number;

    const braille_dots_2348: number;

    const braille_dots_235: number;

    const braille_dots_2356: number;

    const braille_dots_23567: number;

    const braille_dots_235678: number;

    const braille_dots_23568: number;

    const braille_dots_2357: number;

    const braille_dots_23578: number;

    const braille_dots_2358: number;

    const braille_dots_236: number;

    const braille_dots_2367: number;

    const braille_dots_23678: number;

    const braille_dots_2368: number;

    const braille_dots_237: number;

    const braille_dots_2378: number;

    const braille_dots_238: number;

    const braille_dots_24: number;

    const braille_dots_245: number;

    const braille_dots_2456: number;

    const braille_dots_24567: number;

    const braille_dots_245678: number;

    const braille_dots_24568: number;

    const braille_dots_2457: number;

    const braille_dots_24578: number;

    const braille_dots_2458: number;

    const braille_dots_246: number;

    const braille_dots_2467: number;

    const braille_dots_24678: number;

    const braille_dots_2468: number;

    const braille_dots_247: number;

    const braille_dots_2478: number;

    const braille_dots_248: number;

    const braille_dots_25: number;

    const braille_dots_256: number;

    const braille_dots_2567: number;

    const braille_dots_25678: number;

    const braille_dots_2568: number;

    const braille_dots_257: number;

    const braille_dots_2578: number;

    const braille_dots_258: number;

    const braille_dots_26: number;

    const braille_dots_267: number;

    const braille_dots_2678: number;

    const braille_dots_268: number;

    const braille_dots_27: number;

    const braille_dots_278: number;

    const braille_dots_28: number;

    const braille_dots_3: number;

    const braille_dots_34: number;

    const braille_dots_345: number;

    const braille_dots_3456: number;

    const braille_dots_34567: number;

    const braille_dots_345678: number;

    const braille_dots_34568: number;

    const braille_dots_3457: number;

    const braille_dots_34578: number;

    const braille_dots_3458: number;

    const braille_dots_346: number;

    const braille_dots_3467: number;

    const braille_dots_34678: number;

    const braille_dots_3468: number;

    const braille_dots_347: number;

    const braille_dots_3478: number;

    const braille_dots_348: number;

    const braille_dots_35: number;

    const braille_dots_356: number;

    const braille_dots_3567: number;

    const braille_dots_35678: number;

    const braille_dots_3568: number;

    const braille_dots_357: number;

    const braille_dots_3578: number;

    const braille_dots_358: number;

    const braille_dots_36: number;

    const braille_dots_367: number;

    const braille_dots_3678: number;

    const braille_dots_368: number;

    const braille_dots_37: number;

    const braille_dots_378: number;

    const braille_dots_38: number;

    const braille_dots_4: number;

    const braille_dots_45: number;

    const braille_dots_456: number;

    const braille_dots_4567: number;

    const braille_dots_45678: number;

    const braille_dots_4568: number;

    const braille_dots_457: number;

    const braille_dots_4578: number;

    const braille_dots_458: number;

    const braille_dots_46: number;

    const braille_dots_467: number;

    const braille_dots_4678: number;

    const braille_dots_468: number;

    const braille_dots_47: number;

    const braille_dots_478: number;

    const braille_dots_48: number;

    const braille_dots_5: number;

    const braille_dots_56: number;

    const braille_dots_567: number;

    const braille_dots_5678: number;

    const braille_dots_568: number;

    const braille_dots_57: number;

    const braille_dots_578: number;

    const braille_dots_58: number;

    const braille_dots_6: number;

    const braille_dots_67: number;

    const braille_dots_678: number;

    const braille_dots_68: number;

    const braille_dots_7: number;

    const braille_dots_78: number;

    const braille_dots_8: number;

    const breve: number;

    const brokenbar: number;

    const c: number;

    const cabovedot: number;

    const cacute: number;

    const careof: number;

    const caret: number;

    const caron: number;

    const ccaron: number;

    const ccedilla: number;

    const ccircumflex: number;

    const cedilla: number;

    const cent: number;

    const checkerboard: number;

    const checkmark: number;

    const circle: number;

    const club: number;

    const colon: number;

    const comma: number;

    const containsas: number;

    const copyright: number;

    const cr: number;

    const crossinglines: number;

    const cuberoot: number;

    const currency: number;

    const cursor: number;

    const d: number;

    const dabovedot: number;

    const dagger: number;

    const dcaron: number;

    const dead_abovecomma: number;

    const dead_abovedot: number;

    const dead_abovereversedcomma: number;

    const dead_abovering: number;

    const dead_acute: number;

    const dead_belowbreve: number;

    const dead_belowcircumflex: number;

    const dead_belowdiaeresis: number;

    const dead_belowdot: number;

    const dead_belowmacron: number;

    const dead_belowring: number;

    const dead_belowtilde: number;

    const dead_breve: number;

    const dead_caron: number;

    const dead_cedilla: number;

    const dead_circumflex: number;

    const dead_dasia: number;

    const dead_diaeresis: number;

    const dead_doubleacute: number;

    const dead_grave: number;

    const dead_hook: number;

    const dead_horn: number;

    const dead_iota: number;

    const dead_macron: number;

    const dead_ogonek: number;

    const dead_perispomeni: number;

    const dead_psili: number;

    const dead_semivoiced_sound: number;

    const dead_stroke: number;

    const dead_tilde: number;

    const dead_voiced_sound: number;

    const decimalpoint: number;

    const degree: number;

    const diaeresis: number;

    const diamond: number;

    const digitspace: number;

    const dintegral: number;

    const division: number;

    const dollar: number;

    const doubbaselinedot: number;

    const doubleacute: number;

    const doubledagger: number;

    const doublelowquotemark: number;

    const downarrow: number;

    const downcaret: number;

    const downshoe: number;

    const downstile: number;

    const downtack: number;

    const dstroke: number;

    const e: number;

    const eabovedot: number;

    const eacute: number;

    const ebelowdot: number;

    const ecaron: number;

    const ecircumflex: number;

    const ecircumflexacute: number;

    const ecircumflexbelowdot: number;

    const ecircumflexgrave: number;

    const ecircumflexhook: number;

    const ecircumflextilde: number;

    const ediaeresis: number;

    const egrave: number;

    const ehook: number;

    const eightsubscript: number;

    const eightsuperior: number;

    const elementof: number;

    const ellipsis: number;

    const em3space: number;

    const em4space: number;

    const emacron: number;

    const emdash: number;

    const emfilledcircle: number;

    const emfilledrect: number;

    const emopencircle: number;

    const emopenrectangle: number;

    const emptyset: number;

    const emspace: number;

    const endash: number;

    const enfilledcircbullet: number;

    const enfilledsqbullet: number;

    const eng: number;

    const enopencircbullet: number;

    const enopensquarebullet: number;

    const enspace: number;

    const eogonek: number;

    const equal: number;

    const eth: number;

    const etilde: number;

    const exclam: number;

    const exclamdown: number;

    const f: number;

    const fabovedot: number;

    const femalesymbol: number;

    const ff: number;

    const figdash: number;

    const filledlefttribullet: number;

    const filledrectbullet: number;

    const filledrighttribullet: number;

    const filledtribulletdown: number;

    const filledtribulletup: number;

    const fiveeighths: number;

    const fivesixths: number;

    const fivesubscript: number;

    const fivesuperior: number;

    const fourfifths: number;

    const foursubscript: number;

    const foursuperior: number;

    const fourthroot: number;

    const __function: number;

    const g: number;

    const gabovedot: number;

    const gbreve: number;

    const gcaron: number;

    const gcedilla: number;

    const gcircumflex: number;

    const grave: number;

    const greater: number;

    const greaterthanequal: number;

    const guillemotleft: number;

    const guillemotright: number;

    const h: number;

    const hairspace: number;

    const hcircumflex: number;

    const heart: number;

    const hebrew_aleph: number;

    const hebrew_ayin: number;

    const hebrew_bet: number;

    const hebrew_beth: number;

    const hebrew_chet: number;

    const hebrew_dalet: number;

    const hebrew_daleth: number;

    const hebrew_doublelowline: number;

    const hebrew_finalkaph: number;

    const hebrew_finalmem: number;

    const hebrew_finalnun: number;

    const hebrew_finalpe: number;

    const hebrew_finalzade: number;

    const hebrew_finalzadi: number;

    const hebrew_gimel: number;

    const hebrew_gimmel: number;

    const hebrew_he: number;

    const hebrew_het: number;

    const hebrew_kaph: number;

    const hebrew_kuf: number;

    const hebrew_lamed: number;

    const hebrew_mem: number;

    const hebrew_nun: number;

    const hebrew_pe: number;

    const hebrew_qoph: number;

    const hebrew_resh: number;

    const hebrew_samech: number;

    const hebrew_samekh: number;

    const hebrew_shin: number;

    const hebrew_taf: number;

    const hebrew_taw: number;

    const hebrew_tet: number;

    const hebrew_teth: number;

    const hebrew_waw: number;

    const hebrew_yod: number;

    const hebrew_zade: number;

    const hebrew_zadi: number;

    const hebrew_zain: number;

    const hebrew_zayin: number;

    const hexagram: number;

    const horizconnector: number;

    const horizlinescan1: number;

    const horizlinescan3: number;

    const horizlinescan5: number;

    const horizlinescan7: number;

    const horizlinescan9: number;

    const hstroke: number;

    const ht: number;

    const hyphen: number;

    const i: number;

    const iacute: number;

    const ibelowdot: number;

    const ibreve: number;

    const icircumflex: number;

    const identical: number;

    const idiaeresis: number;

    const idotless: number;

    const ifonlyif: number;

    const igrave: number;

    const ihook: number;

    const imacron: number;

    const implies: number;

    const includedin: number;

    const includes: number;

    const infinity: number;

    const integral: number;

    const intersection: number;

    const iogonek: number;

    const itilde: number;

    const j: number;

    const jcircumflex: number;

    const jot: number;

    const k: number;

    const kana_A: number;

    const kana_CHI: number;

    const kana_E: number;

    const kana_FU: number;

    const kana_HA: number;

    const kana_HE: number;

    const kana_HI: number;

    const kana_HO: number;

    const kana_HU: number;

    const kana_I: number;

    const kana_KA: number;

    const kana_KE: number;

    const kana_KI: number;

    const kana_KO: number;

    const kana_KU: number;

    const kana_MA: number;

    const kana_ME: number;

    const kana_MI: number;

    const kana_MO: number;

    const kana_MU: number;

    const kana_N: number;

    const kana_NA: number;

    const kana_NE: number;

    const kana_NI: number;

    const kana_NO: number;

    const kana_NU: number;

    const kana_O: number;

    const kana_RA: number;

    const kana_RE: number;

    const kana_RI: number;

    const kana_RO: number;

    const kana_RU: number;

    const kana_SA: number;

    const kana_SE: number;

    const kana_SHI: number;

    const kana_SO: number;

    const kana_SU: number;

    const kana_TA: number;

    const kana_TE: number;

    const kana_TI: number;

    const kana_TO: number;

    const kana_TSU: number;

    const kana_TU: number;

    const kana_U: number;

    const kana_WA: number;

    const kana_WO: number;

    const kana_YA: number;

    const kana_YO: number;

    const kana_YU: number;

    const kana_a: number;

    const kana_closingbracket: number;

    const kana_comma: number;

    const kana_conjunctive: number;

    const kana_e: number;

    const kana_fullstop: number;

    const kana_i: number;

    const kana_middledot: number;

    const kana_o: number;

    const kana_openingbracket: number;

    const kana_switch: number;

    const kana_tsu: number;

    const kana_tu: number;

    const kana_u: number;

    const kana_ya: number;

    const kana_yo: number;

    const kana_yu: number;

    const kappa: number;

    const kcedilla: number;

    const kra: number;

    const l: number;

    const lacute: number;

    const latincross: number;

    const lbelowdot: number;

    const lcaron: number;

    const lcedilla: number;

    const leftanglebracket: number;

    const leftarrow: number;

    const leftcaret: number;

    const leftdoublequotemark: number;

    const leftmiddlecurlybrace: number;

    const leftopentriangle: number;

    const leftpointer: number;

    const leftradical: number;

    const leftshoe: number;

    const leftsinglequotemark: number;

    const leftt: number;

    const lefttack: number;

    const less: number;

    const lessthanequal: number;

    const lf: number;

    const logicaland: number;

    const logicalor: number;

    const lowleftcorner: number;

    const lowrightcorner: number;

    const lstroke: number;

    const m: number;

    const mabovedot: number;

    const macron: number;

    const malesymbol: number;

    const maltesecross: number;

    const marker: number;

    const masculine: number;

    const minus: number;

    const minutes: number;

    const mu: number;

    const multiply: number;

    const musicalflat: number;

    const musicalsharp: number;

    const n: number;

    const nabla: number;

    const nacute: number;

    const ncaron: number;

    const ncedilla: number;

    const ninesubscript: number;

    const ninesuperior: number;

    const nl: number;

    const nobreakspace: number;

    const notapproxeq: number;

    const notelementof: number;

    const notequal: number;

    const notidentical: number;

    const notsign: number;

    const ntilde: number;

    const numbersign: number;

    const numerosign: number;

    const o: number;

    const oacute: number;

    const obarred: number;

    const obelowdot: number;

    const ocaron: number;

    const ocircumflex: number;

    const ocircumflexacute: number;

    const ocircumflexbelowdot: number;

    const ocircumflexgrave: number;

    const ocircumflexhook: number;

    const ocircumflextilde: number;

    const odiaeresis: number;

    const odoubleacute: number;

    const oe: number;

    const ogonek: number;

    const ograve: number;

    const ohook: number;

    const ohorn: number;

    const ohornacute: number;

    const ohornbelowdot: number;

    const ohorngrave: number;

    const ohornhook: number;

    const ohorntilde: number;

    const omacron: number;

    const oneeighth: number;

    const onefifth: number;

    const onehalf: number;

    const onequarter: number;

    const onesixth: number;

    const onesubscript: number;

    const onesuperior: number;

    const onethird: number;

    const ooblique: number;

    const openrectbullet: number;

    const openstar: number;

    const opentribulletdown: number;

    const opentribulletup: number;

    const ordfeminine: number;

    const oslash: number;

    const otilde: number;

    const overbar: number;

    const overline: number;

    const p: number;

    const pabovedot: number;

    const paragraph: number;

    const parenleft: number;

    const parenright: number;

    const partdifferential: number;

    const partialderivative: number;

    const percent: number;

    const period: number;

    const periodcentered: number;

    const phonographcopyright: number;

    const plus: number;

    const plusminus: number;

    const prescription: number;

    const prolongedsound: number;

    const punctspace: number;

    const q: number;

    const quad: number;

    const question: number;

    const questiondown: number;

    const quotedbl: number;

    const quoteleft: number;

    const quoteright: number;

    const r: number;

    const racute: number;

    const radical: number;

    const rcaron: number;

    const rcedilla: number;

    const registered: number;

    const rightanglebracket: number;

    const rightarrow: number;

    const rightcaret: number;

    const rightdoublequotemark: number;

    const rightmiddlecurlybrace: number;

    const rightmiddlesummation: number;

    const rightopentriangle: number;

    const rightpointer: number;

    const rightshoe: number;

    const rightsinglequotemark: number;

    const rightt: number;

    const righttack: number;

    const s: number;

    const sabovedot: number;

    const sacute: number;

    const scaron: number;

    const scedilla: number;

    const schwa: number;

    const scircumflex: number;

    const script_switch: number;

    const seconds: number;

    const section: number;

    const semicolon: number;

    const semivoicedsound: number;

    const seveneighths: number;

    const sevensubscript: number;

    const sevensuperior: number;

    const signaturemark: number;

    const signifblank: number;

    const similarequal: number;

    const singlelowquotemark: number;

    const sixsubscript: number;

    const sixsuperior: number;

    const slash: number;

    const soliddiamond: number;

    const space: number;

    const squareroot: number;

    const ssharp: number;

    const sterling: number;

    const stricteq: number;

    const t: number;

    const tabovedot: number;

    const tcaron: number;

    const tcedilla: number;

    const telephone: number;

    const telephonerecorder: number;

    const therefore: number;

    const thinspace: number;

    const thorn: number;

    const threeeighths: number;

    const threefifths: number;

    const threequarters: number;

    const threesubscript: number;

    const threesuperior: number;

    const tintegral: number;

    const topintegral: number;

    const topleftparens: number;

    const topleftradical: number;

    const topleftsqbracket: number;

    const topleftsummation: number;

    const toprightparens: number;

    const toprightsqbracket: number;

    const toprightsummation: number;

    const topt: number;

    const topvertsummationconnector: number;

    const trademark: number;

    const trademarkincircle: number;

    const tslash: number;

    const twofifths: number;

    const twosubscript: number;

    const twosuperior: number;

    const twothirds: number;

    const u: number;

    const uacute: number;

    const ubelowdot: number;

    const ubreve: number;

    const ucircumflex: number;

    const udiaeresis: number;

    const udoubleacute: number;

    const ugrave: number;

    const uhook: number;

    const uhorn: number;

    const uhornacute: number;

    const uhornbelowdot: number;

    const uhorngrave: number;

    const uhornhook: number;

    const uhorntilde: number;

    const umacron: number;

    const underbar: number;

    const underscore: number;

    const union: number;

    const uogonek: number;

    const uparrow: number;

    const upcaret: number;

    const upleftcorner: number;

    const uprightcorner: number;

    const upshoe: number;

    const upstile: number;

    const uptack: number;

    const uring: number;

    const utilde: number;

    const v: number;

    const variation: number;

    const vertbar: number;

    const vertconnector: number;

    const voicedsound: number;

    const vt: number;

    const w: number;

    const wacute: number;

    const wcircumflex: number;

    const wdiaeresis: number;

    const wgrave: number;

    const x: number;

    const xabovedot: number;

    const y: number;

    const yacute: number;

    const ybelowdot: number;

    const ycircumflex: number;

    const ydiaeresis: number;

    const yen: number;

    const ygrave: number;

    const yhook: number;

    const ytilde: number;

    const z: number;

    const zabovedot: number;

    const zacute: number;

    const zcaron: number;

    const zerosubscript: number;

    const zerosuperior: number;

    const zstroke: number;

    function accelerator_name(accelerator_key: number, accelerator_mods: ModifierType): string;

    function accelerator_parse(accelerator: string): [number, ModifierType | null];

    function accelerator_valid(keyval: number, modifiers: ModifierType): boolean;

    function attr_background_new(color: number, start_index: number, end_index: number): Attribute;

    function attr_foreground_new(color: number, start_index: number, end_index: number): Attribute;

    function attr_hint_new(hint: number, start_index: number, end_index: number): Attribute;

    function attr_underline_new(underline_type: number, start_index: number, end_index: number): Attribute;

    function emoji_dict_load(path: string): { [key: string]: never };

    function emoji_dict_lookup(dict: { [key: string]: EmojiData }, emoji: string): EmojiData;

    function emoji_dict_save(path: string, dict: { [key: string]: never }): void;

    function error_quark(): GLib.Quark;

    function free_strv(strv: string): void;

    function get_address(): string;

    function get_daemon_uid(): number;

    function get_group_name(): string;

    function get_language_name(_locale: string): string;

    function get_local_machine_id(): string;

    function get_socket_path(): string;

    function get_timeout(): number;

    function get_untranslated_language_name(_locale: string): string;

    function get_user_name(): string;

    function init(): void;

    function key_event_from_string(string: string): [boolean, number, number];

    function key_event_to_string(keyval: number, modifiers: number): string;

    function keyval_convert_case(symbol: number): [number, number];

    function keyval_from_name(keyval_name: string): number;

    function keyval_name(keyval: number): string;

    function keyval_to_lower(keyval: number): number;

    function keyval_to_unicode(keyval: number): string;

    function keyval_to_upper(keyval: number): number;

    function main(): void;

    function quit(): void;

    function set_display(display: string): void;

    function set_log_handler(verbose: boolean): void;

    function unicode_to_keyval(wc: string): number;

    function unset_log_handler(): void;

    function write_address(address: string): void;

    function xml_parse_buffer(buffer: string): XML;

    function xml_parse_file(name: string): XML;

    interface FreeFunc {
        (object: null): void;
    }

    interface ObjectDestroyFunc {
        (object: Object): void;
    }

    interface SerializableCopyFunc {
        (dest: Serializable, src: Serializable): boolean;
    }

    interface SerializableDeserializeFunc {
        (serializable: Serializable, variant: GLib.Variant): number;
    }

    interface SerializableSerializeFunc {
        (serializable: Serializable, builder: GLib.VariantBuilder): boolean;
    }

    interface UnicodeDataLoadAsyncFinish {
        (data_list: UnicodeData[]): void;
    }

    export namespace AttrPreedit {
        export const $gtype: GObject.GType<AttrPreedit>;
    }

    enum AttrPreedit {
        DEFAULT = 0,
        WHOLE = 1,
        SELECTION = 2,
        PREDICTION = 3,
        PREFIX = 4,
        SUFFIX = 5,
        ERROR_SPELLING = 6,
        ERROR_COMPOSE = 7,
        NONE = 256,
    }


    export namespace BusNameFlag {
        export const $gtype: GObject.GType<BusNameFlag>;
    }

    enum BusNameFlag {
        ALLOW_REPLACEMENT = 1,
        REPLACE_EXISTING = 2,
        DO_NOT_QUEUE = 4,
    }


    export namespace Capabilite {
        export const $gtype: GObject.GType<Capabilite>;
    }

    enum Capabilite {
        PREEDIT_TEXT = 1,
        AUXILIARY_TEXT = 2,
        LOOKUP_TABLE = 4,
        FOCUS = 8,
        PROPERTY = 16,
        SURROUNDING_TEXT = 32,
        OSK = 64,
        SYNC_PROCESS_KEY = 128,
        SYNC_PROCESS_KEY_V2 = 128,
    }


    export namespace InputHints {
        export const $gtype: GObject.GType<InputHints>;
    }

    enum InputHints {
        NONE = 0,
        SPELLCHECK = 1,
        NO_SPELLCHECK = 2,
        WORD_COMPLETION = 4,
        LOWERCASE = 8,
        UPPERCASE_CHARS = 16,
        UPPERCASE_WORDS = 32,
        UPPERCASE_SENTENCES = 64,
        INHIBIT_OSK = 128,
        VERTICAL_WRITING = 256,
        EMOJI = 512,
        NO_EMOJI = 1024,
        PRIVATE = 2048,
        HIDDEN_TEXT = 4096,
        LATIN = 8192,
        MULTILINE = 16384,
    }


    export namespace ModifierType {
        export const $gtype: GObject.GType<ModifierType>;
    }

    enum ModifierType {
        SHIFT_MASK = 1,
        LOCK_MASK = 2,
        CONTROL_MASK = 4,
        MOD1_MASK = 8,
        MOD2_MASK = 16,
        MOD3_MASK = 32,
        MOD4_MASK = 64,
        MOD5_MASK = 128,
        BUTTON1_MASK = 256,
        BUTTON2_MASK = 512,
        BUTTON3_MASK = 1024,
        BUTTON4_MASK = 2048,
        BUTTON5_MASK = 4096,
        HANDLED_MASK = 16777216,
        FORWARD_MASK = 33554432,
        IGNORED_MASK = 33554432,
        SUPER_MASK = 67108864,
        HYPER_MASK = 134217728,
        META_MASK = 268435456,
        RELEASE_MASK = 1073741824,
        MODIFIER_MASK = 1593843711,
    }


    export namespace ObjectFlags {
        export const $gtype: GObject.GType<ObjectFlags>;
    }

    enum ObjectFlags {
        IN_DESTRUCTION = 1,
        DESTROYED = 2,
        RESERVED_1 = 4,
        RESERVED_2 = 8,
    }


    namespace AttrList {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class AttrList extends Serializable {
        static $gtype: GObject.GType<AttrList>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AttrList.SignalSignatures;

        // Fields
        attributes: null[];

        // Constructors
        constructor(properties?: Partial<AttrList.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): AttrList;

        // Signals
        /** @signal */
        connect<K extends keyof AttrList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AttrList.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AttrList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AttrList.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AttrList.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AttrList.SignalSignatures[K]>): void;

        // Methods
        append(attr: Attribute): void;

        get(index: number): Attribute;
    }


    namespace Attribute {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class Attribute extends Serializable {
        static $gtype: GObject.GType<Attribute>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Attribute.SignalSignatures;

        // Fields
        type: number;

        value: number;

        start_index: number;

        end_index: number;

        // Constructors
        constructor(properties?: Partial<Attribute.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](type: number, value: number, start_index: number, end_index: number): Attribute;

        // Conflicted with IBus.Serializable.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Attribute.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Attribute.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Attribute.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Attribute.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Attribute.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Attribute.SignalSignatures[K]>): void;

        // Methods
        get_attr_type(): number;

        get_end_index(): number;

        get_start_index(): number;

        get_value(): number;
    }


    namespace Bus {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            connected: () => void;
            /** @signal */
            disconnected: () => void;
            /** @signal */
            "global-engine-changed": (name: string) => void;
            /** @signal */
            "global-shortcut-key-responded": (type: number, keyval: number, keycode: number, state: number, is_backward: boolean) => void;
            /** @signal */
            "name-owner-changed": (name: string, old_owner: string, new_owner: string) => void;
            "notify::client-only": (pspec: GObject.ParamSpec) => void;
            "notify::connect-async": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            client_only: boolean;
            clientOnly: boolean;
            connect_async: boolean;
            connectAsync: boolean;
        }
    }

    class Bus extends Object {
        static $gtype: GObject.GType<Bus>;

        // Properties
        get client_only(): boolean;

        get clientOnly(): boolean;

        get connect_async(): boolean;

        get connectAsync(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Bus.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Bus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Bus;

        static new_async(): Bus;

        static new_async_client(): Bus;

        // Signals
        /** @signal */
        connect<K extends keyof Bus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Bus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Bus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Bus.SignalSignatures[K]>): void;

        // Methods
        add_match(rule: string): boolean;

        add_match_async(rule: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        add_match_async(rule: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        add_match_async(rule: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        add_match_async_finish(res: Gio.AsyncResult): boolean;

        create_input_context(client_name: string): InputContext;

        create_input_context_async(client_name: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<InputContext>;

        create_input_context_async(client_name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        create_input_context_async(client_name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<InputContext> | void;

        create_input_context_async_finish(res: Gio.AsyncResult): InputContext;

        current_input_context(): string;

        current_input_context_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<string>;

        current_input_context_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        current_input_context_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<string> | void;

        current_input_context_async_finish(res: Gio.AsyncResult): string;

        exit(restart: boolean): boolean;

        exit_async(restart: boolean, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        exit_async(restart: boolean, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        exit_async(restart: boolean, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        exit_async_finish(res: Gio.AsyncResult): boolean;

        get_config(): Config;

        get_connection(): Gio.DBusConnection;

        get_engines_by_names(names: string[]): EngineDesc[];

        get_global_engine(): EngineDesc;

        get_global_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<EngineDesc>;

        get_global_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_global_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<EngineDesc> | void;

        get_global_engine_async_finish(res: Gio.AsyncResult): EngineDesc;

        get_ibus_property(property_name: string): GLib.Variant;

        get_ibus_property_async(property_name: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        get_ibus_property_async(property_name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_ibus_property_async(property_name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        get_ibus_property_async_finish(res: Gio.AsyncResult): GLib.Variant;

        get_name_owner(name: string): string;

        get_name_owner_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<string>;

        get_name_owner_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_name_owner_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<string> | void;

        get_name_owner_async_finish(res: Gio.AsyncResult): string;

        get_service_name(): string;

        get_use_global_engine(): boolean;

        get_use_global_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        get_use_global_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_use_global_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        get_use_global_engine_async_finish(res: Gio.AsyncResult): boolean;

        get_use_sys_layout(): boolean;

        get_use_sys_layout_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        get_use_sys_layout_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_use_sys_layout_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        get_use_sys_layout_async_finish(res: Gio.AsyncResult): boolean;

        hello(): string;

        is_connected(): boolean;

        is_global_engine_enabled(): boolean;

        is_global_engine_enabled_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        is_global_engine_enabled_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        is_global_engine_enabled_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        is_global_engine_enabled_async_finish(res: Gio.AsyncResult): boolean;

        list_active_engines(): EngineDesc[];

        list_active_engines_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<EngineDesc[]>;

        list_active_engines_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        list_active_engines_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<EngineDesc[]> | void;

        list_active_engines_async_finish(res: Gio.AsyncResult): EngineDesc[];

        list_engines(): EngineDesc[];

        list_engines_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<EngineDesc[]>;

        list_engines_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        list_engines_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<EngineDesc[]> | void;

        list_engines_async_finish(res: Gio.AsyncResult): EngineDesc[];

        list_names(): string[];

        list_queued_owners(name: string): string[];

        name_has_owner(name: string): boolean;

        name_has_owner_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        name_has_owner_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        name_has_owner_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        name_has_owner_async_finish(res: Gio.AsyncResult): boolean;

        preload_engines(names: string[]): boolean;

        preload_engines_async(names: string[], timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        preload_engines_async(names: string[], timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        preload_engines_async(names: string[], timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        preload_engines_async_finish(res: Gio.AsyncResult): boolean;

        register_component(component: Component): boolean;

        register_component_async(component: Component, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        register_component_async(component: Component, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        register_component_async(component: Component, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        register_component_async_finish(res: Gio.AsyncResult): boolean;

        release_name(name: string): number;

        release_name_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<number>;

        release_name_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        release_name_async(name: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        release_name_async_finish(res: Gio.AsyncResult): number;

        remove_match(rule: string): boolean;

        remove_match_async(rule: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        remove_match_async(rule: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        remove_match_async(rule: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        remove_match_async_finish(res: Gio.AsyncResult): boolean;

        request_name(name: string, flags: number): number;

        request_name_async(name: string, flags: number, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<number>;

        request_name_async(name: string, flags: number, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        request_name_async(name: string, flags: number, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        request_name_async_finish(res: Gio.AsyncResult): number;

        set_global_engine(global_engine: string): boolean;

        set_global_engine_async(global_engine: string, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_global_engine_async(global_engine: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_global_engine_async(global_engine: string, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_global_engine_async_finish(res: Gio.AsyncResult): boolean;

        set_global_shortcut_keys(gtype: BusGlobalBindingType, keys: ProcessKeyEventData[]): boolean;

        set_global_shortcut_keys_async(gtype: BusGlobalBindingType, keys: ProcessKeyEventData[], timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_global_shortcut_keys_async(gtype: BusGlobalBindingType, keys: ProcessKeyEventData[], timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_global_shortcut_keys_async(gtype: BusGlobalBindingType, keys: ProcessKeyEventData[], timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_global_shortcut_keys_async_finish(res: Gio.AsyncResult): boolean;

        set_ibus_property(property_name: string, value: GLib.Variant): void;

        set_ibus_property_async(property_name: string, value: GLib.Variant, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_ibus_property_async(property_name: string, value: GLib.Variant, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_ibus_property_async(property_name: string, value: GLib.Variant, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_ibus_property_async_finish(res: Gio.AsyncResult): boolean;

        set_watch_dbus_signal(watch: boolean): void;

        set_watch_ibus_signal(watch: boolean): void;
    }


    namespace Component {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::author": (pspec: GObject.ParamSpec) => void;
            "notify::command-line": (pspec: GObject.ParamSpec) => void;
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::homepage": (pspec: GObject.ParamSpec) => void;
            "notify::license": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::textdomain": (pspec: GObject.ParamSpec) => void;
            "notify::version": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            author: string;
            command_line: string;
            commandLine: string;
            description: string;
            homepage: string;
            license: string;
            name: string;
            textdomain: string;
            version: string;
        }
    }

    class Component extends Serializable {
        static $gtype: GObject.GType<Component>;

        // Properties
        get author(): string;

        get command_line(): string;

        get commandLine(): string;

        get description(): string;

        get homepage(): string;

        get license(): string;

        get name(): string;

        get textdomain(): string;

        get version(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Component.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Component.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string, description: string, version: string, license: string, author: string, homepage: string, command_line: string, textdomain: string): Component;

        // Conflicted with IBus.Serializable.new
        static ["new"](...args: never[]): any;

        static new_from_file(filename: string): Component;

        static new_from_xml_node(node: XML): Component;

        // Signals
        /** @signal */
        connect<K extends keyof Component.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Component.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Component.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Component.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Component.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Component.SignalSignatures[K]>): void;

        // Methods
        add_engine(engine: EngineDesc): void;

        add_observed_path(path: string, access_fs: boolean): void;

        check_modification(): boolean;

        get_author(): string;

        get_description(): string;

        get_engines(): EngineDesc[];

        get_exec(): string;

        get_homepage(): string;

        get_license(): string;

        get_name(): string;

        get_observed_paths(): ObservedPath[];

        get_textdomain(): string;

        get_version(): string;

        output(output: GLib.String, indent: number): void;

        output_engines(output: GLib.String, indent: number): void;
    }


    namespace Config {
        // Signal signatures
        interface SignalSignatures extends Proxy.SignalSignatures {
            /** @signal */
            "value-changed": (section: string, name: string, value: GLib.Variant) => void;
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Proxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps {}
    }

    class Config extends Proxy implements Gio.AsyncInitable<Config>, Gio.DBusInterface, Gio.Initable {
        static $gtype: GObject.GType<Config>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Config.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Config.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: Gio.DBusConnection, cancellable: Gio.Cancellable | null): Config;

        // Conflicted with Gio.DBusProxy.new
        static ["new"](...args: never[]): any;

        static new_async_finish(res: Gio.AsyncResult): Config;

        // Signals
        /** @signal */
        connect<K extends keyof Config.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Config.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Config.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Config.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Config.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Config.SignalSignatures[K]>): void;

        // Static methods
        static new_async(connection: Gio.DBusConnection, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Config> | null): void;

        // Methods
        get_value(section: string, name: string): GLib.Variant;

        get_value_async(section: string, name: string, timeout_ms: number, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        get_value_async(section: string, name: string, timeout_ms: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_value_async(section: string, name: string, timeout_ms: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        get_value_async_finish(result: Gio.AsyncResult): GLib.Variant;

        get_values(section: string): GLib.Variant;

        get_values_async(section: string, timeout_ms: number, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        get_values_async(section: string, timeout_ms: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_values_async(section: string, timeout_ms: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        get_values_async_finish(result: Gio.AsyncResult): GLib.Variant;

        set_value(section: string, name: string, value: GLib.Variant): boolean;

        set_value_async(section: string, name: string, value: GLib.Variant, timeout_ms: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_value_async(section: string, name: string, value: GLib.Variant, timeout_ms: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_value_async(section: string, name: string, value: GLib.Variant, timeout_ms: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_value_async_finish(result: Gio.AsyncResult): boolean;

        unset(section: string, name: string): boolean;

        unwatch(section: string | null, name: string | null): boolean;

        watch(section: string | null, name: string | null): boolean;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Config;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;
    }


    namespace ConfigService {
        // Signal signatures
        interface SignalSignatures extends Service.SignalSignatures {
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Service.ConstructorProps {}
    }

    class ConfigService extends Service {
        static $gtype: GObject.GType<ConfigService>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ConfigService.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ConfigService.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: Gio.DBusConnection): ConfigService;

        // Conflicted with IBus.Object.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof ConfigService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConfigService.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ConfigService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConfigService.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ConfigService.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ConfigService.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_value(section: string, name: string): GLib.Variant;

        vfunc_get_values(section: string): GLib.Variant;

        vfunc_set_value(section: string, name: string, value: GLib.Variant): boolean;

        vfunc_unset_value(section: string, name: string): boolean;

        // Methods
        value_changed(section: string, name: string, value: GLib.Variant): void;
    }


    namespace EmojiData {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::annotations": (pspec: GObject.ParamSpec) => void;
            "notify::category": (pspec: GObject.ParamSpec) => void;
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::emoji": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            annotations: never;
            category: string;
            description: string;
            emoji: string;
        }
    }

    class EmojiData extends Serializable {
        static $gtype: GObject.GType<EmojiData>;

        // Properties
        get annotations(): null;
        set annotations(val: never);

        get category(): string;

        get description(): string;
        set description(val: string);

        get emoji(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EmojiData.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<EmojiData.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof EmojiData.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EmojiData.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EmojiData.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EmojiData.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EmojiData.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EmojiData.SignalSignatures[K]>): void;

        // Static methods
        static load(path: string): EmojiData[];

        static save(path: string, list: EmojiData[]): void;

        // Methods
        get_annotations(): string[];

        get_category(): string;

        get_description(): string;

        get_emoji(): string;

        set_annotations(annotations: string[]): void;

        set_description(description: string): void;
    }


    namespace Engine {
        // Signal signatures
        interface SignalSignatures extends Service.SignalSignatures {
            /** @signal */
            "cancel-hand-writing": (n_strokes: number) => void;
            /** @signal */
            "candidate-clicked": (index: number, button: number, state: number) => void;
            /** @signal */
            "cursor-down": () => void;
            /** @signal */
            "cursor-up": () => void;
            /** @signal */
            disable: () => void;
            /** @signal */
            enable: () => void;
            /** @signal */
            "focus-in": () => void;
            /** @signal */
            "focus-in-id": (object_path: string, client: string) => void;
            /** @signal */
            "focus-out": () => void;
            /** @signal */
            "focus-out-id": (object_path: string) => void;
            /** @signal */
            "page-down": () => void;
            /** @signal */
            "page-up": () => void;
            /** @signal */
            "process-hand-writing-event": (coordinates: null, coordinates_len: number) => void;
            /** @signal */
            "process-key-event": (keyval: number, keycode: number, state: number) => boolean | void;
            /** @signal */
            "property-activate": (name: string, state: number) => void;
            /** @signal */
            "property-hide": (name: string) => void;
            /** @signal */
            "property-show": (name: string) => void;
            /** @signal */
            reset: () => void;
            /** @signal */
            "set-capabilities": (caps: number) => void;
            /** @signal */
            "set-content-type": (purpose: number, hints: number) => void;
            /** @signal */
            "set-cursor-location": (x: number, y: number, w: number, h: number) => void;
            /** @signal */
            "set-surrounding-text": (text: GObject.Object, cursor_pos: number, anchor_pos: number) => void;
            "notify::active-surrounding-text": (pspec: GObject.ParamSpec) => void;
            "notify::engine-name": (pspec: GObject.ParamSpec) => void;
            "notify::has-focus-id": (pspec: GObject.ParamSpec) => void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Service.ConstructorProps {
            active_surrounding_text: boolean;
            activeSurroundingText: boolean;
            engine_name: string;
            engineName: string;
            has_focus_id: boolean;
            hasFocusId: boolean;
        }
    }

    class Engine extends Service {
        static $gtype: GObject.GType<Engine>;

        // Properties
        get active_surrounding_text(): boolean;

        get activeSurroundingText(): boolean;

        get engine_name(): string;

        get engineName(): string;

        get has_focus_id(): boolean;

        get hasFocusId(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Engine.SignalSignatures;

        // Fields
        enabled: boolean;

        has_focus: boolean;

        cursor_area: Rectangle;

        client_capabilities: number;

        // Constructors
        constructor(properties?: Partial<Engine.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](engine_name: string, object_path: string, connection: Gio.DBusConnection): Engine;

        // Conflicted with IBus.Service.new
        static ["new"](...args: never[]): any;

        static new_with_type(engine_type: GObject.GType, engine_name: string, object_path: string, connection: Gio.DBusConnection): Engine;

        // Signals
        /** @signal */
        connect<K extends keyof Engine.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Engine.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Engine.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Engine.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Engine.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Engine.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_cancel_hand_writing(n_strokes: number): void;

        vfunc_candidate_clicked(index: number, button: number, state: number): void;

        vfunc_cursor_down(): void;

        vfunc_cursor_up(): void;

        vfunc_disable(): void;

        vfunc_enable(): void;

        vfunc_focus_in(): void;

        vfunc_focus_in_id(object_path: string, client: string): void;

        vfunc_focus_out(): void;

        vfunc_focus_out_id(object_path: string): void;

        vfunc_page_down(): void;

        vfunc_page_up(): void;

        vfunc_process_hand_writing_event(coordinates: number, coordinates_len: number): void;

        vfunc_process_key_event(keyval: number, keycode: number, state: number): boolean;

        vfunc_property_activate(prop_name: string, prop_state: number): void;

        vfunc_property_hide(prop_name: string): void;

        vfunc_property_show(prop_name: string): void;

        vfunc_reset(): void;

        vfunc_set_capabilities(caps: number): void;

        vfunc_set_content_type(purpose: number, hints: number): void;

        vfunc_set_cursor_location(x: number, y: number, w: number, h: number): void;

        vfunc_set_surrounding_text(text: Text, cursor_index: number, anchor_pos: number): void;

        // Methods
        commit_text(text: Text): void;

        delete_surrounding_text(offset: number, nchars: number): void;

        forward_key_event(keyval: number, keycode: number, state: number): void;

        get_content_type(): [number, number];

        get_name(): string;

        get_surrounding_text(): [Text | null, number, number];

        hide_auxiliary_text(): void;

        hide_lookup_table(): void;

        hide_preedit_text(): void;

        register_properties(prop_list: PropList): void;

        send_message(message: Message): void;

        show_auxiliary_text(): void;

        show_lookup_table(): void;

        show_preedit_text(): void;

        update_auxiliary_text(text: Text, visible: boolean): void;

        update_lookup_table(lookup_table: LookupTable, visible: boolean): void;

        update_lookup_table_fast(lookup_table: LookupTable, visible: boolean): void;

        update_preedit_text(text: Text, cursor_pos: number, visible: boolean): void;

        update_preedit_text_with_mode(text: Text, cursor_pos: number, visible: boolean, mode: PreeditFocusMode): void;

        update_property(prop: Property): void;
    }


    namespace EngineDesc {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::author": (pspec: GObject.ParamSpec) => void;
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::hotkeys": (pspec: GObject.ParamSpec) => void;
            "notify::icon": (pspec: GObject.ParamSpec) => void;
            "notify::icon-prop-key": (pspec: GObject.ParamSpec) => void;
            "notify::language": (pspec: GObject.ParamSpec) => void;
            "notify::layout": (pspec: GObject.ParamSpec) => void;
            "notify::layout-option": (pspec: GObject.ParamSpec) => void;
            "notify::layout-variant": (pspec: GObject.ParamSpec) => void;
            "notify::license": (pspec: GObject.ParamSpec) => void;
            "notify::longname": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::rank": (pspec: GObject.ParamSpec) => void;
            "notify::setup": (pspec: GObject.ParamSpec) => void;
            "notify::symbol": (pspec: GObject.ParamSpec) => void;
            "notify::textdomain": (pspec: GObject.ParamSpec) => void;
            "notify::version": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            author: string;
            description: string;
            hotkeys: string;
            icon: string;
            icon_prop_key: string;
            iconPropKey: string;
            language: string;
            layout: string;
            layout_option: string;
            layoutOption: string;
            layout_variant: string;
            layoutVariant: string;
            license: string;
            longname: string;
            name: string;
            rank: number;
            setup: string;
            symbol: string;
            textdomain: string;
            version: string;
        }
    }

    class EngineDesc extends Serializable {
        static $gtype: GObject.GType<EngineDesc>;

        // Properties
        get author(): string;

        get description(): string;

        get hotkeys(): string;

        get icon(): string;

        get icon_prop_key(): string;

        get iconPropKey(): string;

        get language(): string;

        get layout(): string;

        get layout_option(): string;

        get layoutOption(): string;

        get layout_variant(): string;

        get layoutVariant(): string;

        get license(): string;

        get longname(): string;

        get name(): string;

        get rank(): number;

        get setup(): string;

        get symbol(): string;

        get textdomain(): string;

        get version(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EngineDesc.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<EngineDesc.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string, longname: string, description: string, language: string, license: string, author: string, icon: string, layout: string): EngineDesc;

        // Conflicted with IBus.Serializable.new
        static ["new"](...args: never[]): any;

        static new_from_xml_node(node: XML): EngineDesc;

        // Signals
        /** @signal */
        connect<K extends keyof EngineDesc.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EngineDesc.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EngineDesc.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EngineDesc.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EngineDesc.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EngineDesc.SignalSignatures[K]>): void;

        // Methods
        get_author(): string;

        get_description(): string;

        get_hotkeys(): string;

        get_icon(): string;

        get_icon_prop_key(): string;

        get_language(): string;

        get_layout(): string;

        get_layout_option(): string;

        get_layout_variant(): string;

        get_license(): string;

        get_longname(): string;

        get_name(): string;

        get_rank(): number;

        get_setup(): string;

        get_symbol(): string;

        get_textdomain(): string;

        get_version(): string;

        output(output: GLib.String, indent: number): void;
    }


    namespace EngineSimple {
        // Signal signatures
        interface SignalSignatures extends Engine.SignalSignatures {
            "notify::active-surrounding-text": (pspec: GObject.ParamSpec) => void;
            "notify::engine-name": (pspec: GObject.ParamSpec) => void;
            "notify::has-focus-id": (pspec: GObject.ParamSpec) => void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Engine.ConstructorProps {}
    }

    class EngineSimple extends Engine {
        static $gtype: GObject.GType<EngineSimple>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EngineSimple.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<EngineSimple.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof EngineSimple.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EngineSimple.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EngineSimple.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EngineSimple.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EngineSimple.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EngineSimple.SignalSignatures[K]>): void;

        // Methods
        add_compose_file(file: string): boolean;

        add_table(data: number[], max_seq_len: number, n_seqs: number): void;

        add_table_by_locale(locale: string | null): boolean;
    }


    namespace ExtensionEvent {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::is-enabled": (pspec: GObject.ParamSpec) => void;
            "notify::is-extension": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::params": (pspec: GObject.ParamSpec) => void;
            "notify::version": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            is_enabled: boolean;
            isEnabled: boolean;
            is_extension: boolean;
            isExtension: boolean;
            name: string;
            params: string;
            version: number;
        }
    }

    class ExtensionEvent extends Serializable {
        static $gtype: GObject.GType<ExtensionEvent>;

        // Properties
        get is_enabled(): boolean;

        get isEnabled(): boolean;

        get is_extension(): boolean;

        get isExtension(): boolean;

        get name(): string;

        get params(): string;

        get version(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ExtensionEvent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ExtensionEvent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ExtensionEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ExtensionEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ExtensionEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ExtensionEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ExtensionEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ExtensionEvent.SignalSignatures[K]>): void;

        // Methods
        get_name(): string;

        get_params(): string;

        get_version(): number;
    }


    namespace Factory {
        // Signal signatures
        interface SignalSignatures extends Service.SignalSignatures {
            /** @signal */
            "create-engine": (engine_name: string) => Engine | null;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Service.ConstructorProps {}
    }

    class Factory extends Service {
        static $gtype: GObject.GType<Factory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Factory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Factory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: Gio.DBusConnection): Factory;

        // Conflicted with IBus.Object.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Factory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Factory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Factory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Factory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Factory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Factory.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_create_engine(engine_name: string): Engine;

        // Methods
        add_engine(engine_name: string, engine_type: GObject.GType): void;

        create_engine(engine_name: string): Engine;
    }


    namespace HotkeyProfile {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            /** @signal */
            trigger: (event: number, user_data: null) => void;
            [key: `trigger::${string}`]: (event: number, user_data: null) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class HotkeyProfile extends Serializable {
        static $gtype: GObject.GType<HotkeyProfile>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: HotkeyProfile.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<HotkeyProfile.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): HotkeyProfile;

        // Signals
        /** @signal */
        connect<K extends keyof HotkeyProfile.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, HotkeyProfile.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof HotkeyProfile.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, HotkeyProfile.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof HotkeyProfile.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<HotkeyProfile.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_trigger(event: GLib.Quark): void;

        // Methods
        add_hotkey(keyval: number, modifiers: number, event: GLib.Quark): boolean;

        add_hotkey_from_string(str: string, event: GLib.Quark): boolean;

        filter_key_event(keyval: number, modifiers: number, prev_keyval: number, prev_modifiers: number, user_data: null): GLib.Quark;

        lookup_hotkey(keyval: number, modifiers: number): GLib.Quark;

        remove_hotkey(keyval: number, modifiers: number): boolean;

        remove_hotkey_by_event(event: GLib.Quark): boolean;
    }


    namespace InputContext {
        // Signal signatures
        interface SignalSignatures extends Proxy.SignalSignatures {
            /** @signal */
            "commit-text": (text: Text) => void;
            /** @signal */
            "cursor-down-lookup-table": () => void;
            /** @signal */
            "cursor-up-lookup-table": () => void;
            /** @signal */
            "delete-surrounding-text": (offset: number, n_chars: number) => void;
            /** @signal */
            disabled: () => void;
            /** @signal */
            enabled: () => void;
            /** @signal */
            "forward-key-event": (keyval: number, keycode: number, modifiers: number) => void;
            /** @signal */
            "hide-auxiliary-text": () => void;
            /** @signal */
            "hide-lookup-table": () => void;
            /** @signal */
            "hide-preedit-text": () => void;
            /** @signal */
            "page-down-lookup-table": () => void;
            /** @signal */
            "page-up-lookup-table": () => void;
            /** @signal */
            "register-properties": (props: PropList) => void;
            /** @signal */
            "require-surrounding-text": () => void;
            /** @signal */
            "show-auxiliary-text": () => void;
            /** @signal */
            "show-lookup-table": () => void;
            /** @signal */
            "show-preedit-text": () => void;
            /** @signal */
            "update-auxiliary-text": (text: Text, visible: boolean) => void;
            /** @signal */
            "update-lookup-table": (table: LookupTable, visible: boolean) => void;
            /** @signal */
            "update-preedit-text": (text: Text, cursor_pos: number, visible: boolean) => void;
            /** @signal */
            "update-preedit-text-with-mode": (text: Text, cursor_pos: number, visible: boolean, mode: number) => void;
            /** @signal */
            "update-property": (prop: Property) => void;
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Proxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps {}
    }

    class InputContext extends Proxy implements Gio.AsyncInitable<InputContext>, Gio.DBusInterface, Gio.Initable {
        static $gtype: GObject.GType<InputContext>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InputContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InputContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](path: string, connection: Gio.DBusConnection, cancellable: Gio.Cancellable | null): InputContext;

        // Conflicted with Gio.DBusProxy.new
        static ["new"](...args: never[]): any;

        static new_async_finish(res: Gio.AsyncResult): InputContext;

        // Signals
        /** @signal */
        connect<K extends keyof InputContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputContext.SignalSignatures[K]>): void;

        // Static methods
        static get_input_context(path: string, connection: Gio.DBusConnection): InputContext;

        static get_input_context_async(path: string, connection: Gio.DBusConnection, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<InputContext> | null): void;

        static get_input_context_async_finish(res: Gio.AsyncResult): InputContext;

        static new_async(path: string, connection: Gio.DBusConnection, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<InputContext> | null): void;

        // Methods
        cancel_hand_writing(n_strokes: number): void;

        focus_in(): void;

        focus_out(): void;

        get_engine(): EngineDesc;

        get_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<EngineDesc>;

        get_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_engine_async(timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<EngineDesc> | void;

        get_engine_async_finish(res: Gio.AsyncResult): EngineDesc;

        needs_surrounding_text(): boolean;

        post_process_key_event(): void;

        process_hand_writing_event(coordinates: number, coordinates_len: number): void;

        process_key_event(keyval: number, keycode: number, state: number): boolean;

        process_key_event_async(keyval: number, keycode: number, state: number, timeout_msec: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        process_key_event_async(keyval: number, keycode: number, state: number, timeout_msec: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        process_key_event_async(keyval: number, keycode: number, state: number, timeout_msec: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        process_key_event_async_finish(res: Gio.AsyncResult): boolean;

        property_activate(prop_name: string, state: number): void;

        reset(): void;

        set_capabilities(capabilities: number): void;

        set_client_commit_preedit(client_commit: boolean): void;

        set_content_type(purpose: number, hints: number): void;

        set_cursor_location(x: number, y: number, w: number, h: number): void;

        set_cursor_location_relative(x: number, y: number, w: number, h: number): void;

        set_engine(name: string): void;

        set_post_process_key_event(enable: boolean): void;

        set_preedit_format(format: PreeditFormat): void;

        set_surrounding_text(text: Text, cursor_pos: number, anchor_pos: number): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): InputContext;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;
    }


    namespace Keymap {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class Keymap extends Object {
        static $gtype: GObject.GType<Keymap>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Keymap.SignalSignatures;

        // Fields
        name: string;

        keymap: number[];

        // Constructors
        constructor(properties?: Partial<Keymap.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string): Keymap;

        // Conflicted with IBus.Object.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Keymap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Keymap.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Keymap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Keymap.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Keymap.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Keymap.SignalSignatures[K]>): void;

        // Static methods
        static get(name: string): Keymap;

        // Methods
        lookup_keysym(keycode: number, state: number): number;
    }


    namespace LookupTable {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class LookupTable extends Serializable {
        static $gtype: GObject.GType<LookupTable>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: LookupTable.SignalSignatures;

        // Fields
        page_size: number;

        cursor_pos: number;

        cursor_visible: boolean;

        round: boolean;

        orientation: number;

        candidates: null[];

        labels: null[];

        // Constructors
        constructor(properties?: Partial<LookupTable.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](page_size: number, cursor_pos: number, cursor_visible: boolean, round: boolean): LookupTable;

        // Conflicted with IBus.Serializable.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof LookupTable.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LookupTable.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LookupTable.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LookupTable.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LookupTable.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LookupTable.SignalSignatures[K]>): void;

        // Methods
        append_candidate(text: Text): void;

        append_label(text: Text): void;

        clear(): void;

        cursor_down(): boolean;

        cursor_up(): boolean;

        get_candidate(index: number): Text;

        get_cursor_in_page(): number;

        get_cursor_pos(): number;

        get_label(index: number): Text;

        get_number_of_candidates(): number;

        get_orientation(): number;

        get_page_size(): number;

        is_cursor_visible(): boolean;

        is_round(): boolean;

        page_down(): boolean;

        page_up(): boolean;

        set_cursor_pos(cursor_pos: number): void;

        set_cursor_visible(visible: boolean): void;

        set_label(index: number, text: Text): void;

        set_orientation(orientation: number): void;

        set_page_size(page_size: number): void;

        set_round(round: boolean): void;
    }


    namespace Message {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::code": (pspec: GObject.ParamSpec) => void;
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::domain": (pspec: GObject.ParamSpec) => void;
            "notify::progress": (pspec: GObject.ParamSpec) => void;
            "notify::serial": (pspec: GObject.ParamSpec) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::title": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            code: number;
            description: string;
            domain: number;
            progress: number;
            serial: number;
            timeout: number;
            title: string;
        }
    }

    class Message extends Serializable {
        static $gtype: GObject.GType<Message>;

        // Properties
        get code(): number;

        get description(): string;

        get domain(): number;

        get progress(): number;

        get serial(): number;

        get timeout(): number;

        get title(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Message.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Message.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Message.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Message.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Message.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Message.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Message.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Message.SignalSignatures[K]>): void;

        // Methods
        get_code(): number;

        get_description(): string;

        get_domain(): number;

        get_progress(): number;

        get_serial(): number;

        get_timeout(): number;

        get_title(): string;
    }


    namespace Object {
        // Signal signatures
        interface SignalSignatures extends GObject.InitiallyUnowned.SignalSignatures {
            /** @signal */
            destroy: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.InitiallyUnowned.ConstructorProps {}
    }

    class Object extends GObject.InitiallyUnowned {
        static $gtype: GObject.GType<Object>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Object.SignalSignatures;

        // Fields
        flags: number;

        // Constructors
        constructor(properties?: Partial<Object.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Object;

        // Signals
        /** @signal */
        connect<K extends keyof Object.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Object.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Object.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Object.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Object.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Object.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_destroy(): void;

        // Methods
        destroy(): void;
    }


    namespace ObservedPath {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class ObservedPath extends Serializable {
        static $gtype: GObject.GType<ObservedPath>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ObservedPath.SignalSignatures;

        // Fields
        path: string;

        mtime: number;

        is_dir: boolean;

        is_exist: boolean;

        // Constructors
        constructor(properties?: Partial<ObservedPath.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](path: string, fill_stat: boolean): ObservedPath;

        // Conflicted with IBus.Serializable.new
        static ["new"](...args: never[]): any;

        static new_from_xml_node(node: XML, fill_stat: boolean): ObservedPath;

        // Signals
        /** @signal */
        connect<K extends keyof ObservedPath.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ObservedPath.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ObservedPath.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ObservedPath.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ObservedPath.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ObservedPath.SignalSignatures[K]>): void;

        // Methods
        check_modification(): boolean;

        output(output: GLib.String, indent: number): void;

        traverse(dir_only: boolean): ObservedPath[];
    }


    namespace PanelService {
        // Signal signatures
        interface SignalSignatures extends Service.SignalSignatures {
            /** @signal */
            "candidate-clicked-lookup-table": (index: number, button: number, state: number) => void;
            /** @signal */
            "commit-text-received": (text: Text) => void;
            /** @signal */
            "cursor-down-lookup-table": () => void;
            /** @signal */
            "cursor-up-lookup-table": () => void;
            /** @signal */
            "destroy-context": (input_context_path: string) => void;
            /** @signal */
            "focus-in": (input_context_path: string) => void;
            /** @signal */
            "focus-out": (input_context_path: string) => void;
            /** @signal */
            "hide-auxiliary-text": () => void;
            /** @signal */
            "hide-language-bar": () => void;
            /** @signal */
            "hide-lookup-table": () => void;
            /** @signal */
            "hide-preedit-text": () => void;
            /** @signal */
            "page-down-lookup-table": () => void;
            /** @signal */
            "page-up-lookup-table": () => void;
            /** @signal */
            "panel-extension-received": (data: ExtensionEvent) => void;
            /** @signal */
            "process-key-event": (keyval: number, keycode: number, state: number) => boolean | void;
            /** @signal */
            "register-properties": (prop_list: PropList) => void;
            /** @signal */
            reset: () => void;
            /** @signal */
            "send-message-received": (message: Message) => void;
            /** @signal */
            "set-content-type": (purpose: number, hints: number) => void;
            /** @signal */
            "set-cursor-location": (x: number, y: number, w: number, h: number) => void;
            /** @signal */
            "set-cursor-location-relative": (x: number, y: number, w: number, h: number) => void;
            /** @signal */
            "show-auxiliary-text": () => void;
            /** @signal */
            "show-language-bar": () => void;
            /** @signal */
            "show-lookup-table": () => void;
            /** @signal */
            "show-preedit-text": () => void;
            /** @signal */
            "start-setup": () => void;
            /** @signal */
            "state-changed": () => void;
            /** @signal */
            "update-auxiliary-text": (text: Text, visible: boolean) => void;
            /** @signal */
            "update-lookup-table": (lookup_table: LookupTable, visible: boolean) => void;
            /** @signal */
            "update-preedit-text": (text: Text, cursor_pos: number, visible: boolean) => void;
            /** @signal */
            "update-property": (prop: Property) => void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Service.ConstructorProps {}
    }

    class PanelService extends Service {
        static $gtype: GObject.GType<PanelService>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PanelService.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PanelService.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: Gio.DBusConnection): PanelService;

        // Conflicted with IBus.Object.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof PanelService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PanelService.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PanelService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PanelService.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PanelService.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PanelService.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_candidate_clicked_lookup_table(index: number, button: number, state: number): void;

        vfunc_commit_text_received(text: Text): void;

        vfunc_cursor_down_lookup_table(): void;

        vfunc_cursor_up_lookup_table(): void;

        vfunc_destroy_context(input_context_path: string): void;

        vfunc_focus_in(input_context_path: string): void;

        vfunc_focus_out(input_context_path: string): void;

        vfunc_hide_auxiliary_text(): void;

        vfunc_hide_language_bar(): void;

        vfunc_hide_lookup_table(): void;

        vfunc_hide_preedit_text(): void;

        vfunc_page_down_lookup_table(): void;

        vfunc_page_up_lookup_table(): void;

        vfunc_panel_extension_received(event: ExtensionEvent): void;

        vfunc_process_key_event(keyval: number, keycode: number, state: number): boolean;

        vfunc_register_properties(prop_list: PropList): void;

        vfunc_reset(): void;

        vfunc_set_content_type(purpose: number, hints: number): void;

        vfunc_set_cursor_location(x: number, y: number, w: number, h: number): void;

        vfunc_set_cursor_location_relative(x: number, y: number, w: number, h: number): void;

        vfunc_show_auxiliary_text(): void;

        vfunc_show_language_bar(): void;

        vfunc_show_lookup_table(): void;

        vfunc_show_preedit_text(): void;

        vfunc_start_setup(): void;

        vfunc_state_changed(): void;

        vfunc_update_auxiliary_text(text: Text, visible: boolean): void;

        vfunc_update_lookup_table(lookup_table: LookupTable, visible: boolean): void;

        vfunc_update_preedit_text(text: Text, cursor_pos: number, visible: boolean): void;

        vfunc_update_property(prop: Property): void;

        // Methods
        candidate_clicked(index: number, button: number, state: number): void;

        commit_text(text: Text): void;

        cursor_down(): void;

        cursor_up(): void;

        forward_process_key_event(keyval: number, keycode: number, state: number): void;

        hide_preedit_text_received(): void;

        page_down(): void;

        page_up(): void;

        panel_extension(event: ExtensionEvent): void;

        property_activate(prop_name: string, prop_state: number): void;

        property_hide(prop_name: string): void;

        property_show(prop_name: string): void;

        send_message(message: Message): void;

        set_preedit_format(format: PreeditFormat): void;

        show_preedit_text_received(): void;

        update_auxiliary_text_received(text: Text, visible: boolean): void;

        update_lookup_table_received(table: LookupTable, visible: boolean): void;

        update_preedit_text_received(text: Text, cursor_pos: number, visible: boolean): void;
    }


    namespace PropList {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class PropList extends Serializable {
        static $gtype: GObject.GType<PropList>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PropList.SignalSignatures;

        // Fields
        properties: null[];

        // Constructors
        constructor(properties?: Partial<PropList.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): PropList;

        // Signals
        /** @signal */
        connect<K extends keyof PropList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PropList.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PropList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PropList.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PropList.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PropList.SignalSignatures[K]>): void;

        // Methods
        append(prop: Property): void;

        get(index: number): Property;

        update_property(prop: Property): boolean;
    }


    namespace Property {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::icon": (pspec: GObject.ParamSpec) => void;
            "notify::key": (pspec: GObject.ParamSpec) => void;
            "notify::label": (pspec: GObject.ParamSpec) => void;
            "notify::prop-type": (pspec: GObject.ParamSpec) => void;
            "notify::sensitive": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::sub-props": (pspec: GObject.ParamSpec) => void;
            "notify::symbol": (pspec: GObject.ParamSpec) => void;
            "notify::tooltip": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            icon: string;
            key: string;
            label: Text;
            prop_type: PropType;
            propType: PropType;
            sensitive: boolean;
            state: PropState;
            sub_props: PropList;
            subProps: PropList;
            symbol: Text;
            tooltip: Text;
            visible: boolean;
        }
    }

    class Property extends Serializable {
        static $gtype: GObject.GType<Property>;

        // Properties
        get icon(): string;
        set icon(val: string);

        get key(): string;

        get label(): Text;
        set label(val: Text);

        get prop_type(): PropType;

        get propType(): PropType;

        get sensitive(): boolean;
        set sensitive(val: boolean);

        get state(): PropState;
        set state(val: PropState);

        get sub_props(): PropList;
        set sub_props(val: PropList);

        get subProps(): PropList;
        set subProps(val: PropList);

        get symbol(): Text;
        set symbol(val: Text);

        get tooltip(): Text;
        set tooltip(val: Text);

        get visible(): boolean;
        set visible(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Property.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Property.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](key: string, type: PropType, label: Text, icon: string | null, tooltip: Text, sensitive: boolean, visible: boolean, state: PropState, prop_list: PropList | null): Property;

        // Conflicted with IBus.Serializable.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Property.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Property.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Property.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Property.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Property.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Property.SignalSignatures[K]>): void;

        // Methods
        get_icon(): string;

        get_key(): string;

        get_label(): Text;

        get_prop_type(): PropType;

        get_sensitive(): boolean;

        get_state(): PropState;

        get_sub_props(): PropList;

        get_symbol(): Text;

        get_tooltip(): Text;

        get_visible(): boolean;

        set_icon(icon: string): void;

        set_label(label: Text): void;

        set_sensitive(sensitive: boolean): void;

        set_state(state: PropState): void;

        set_sub_props(prop_list: PropList): void;

        set_symbol(symbol: Text): void;

        set_tooltip(tooltip: Text): void;

        set_visible(visible: boolean): void;

        update(prop_update: Property): boolean;
    }


    namespace Proxy {
        // Signal signatures
        interface SignalSignatures extends Gio.DBusProxy.SignalSignatures {
            /** @signal */
            destroy: () => void;
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.DBusProxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps {}
    }

    class Proxy extends Gio.DBusProxy implements Gio.AsyncInitable<Proxy>, Gio.DBusInterface, Gio.Initable {
        static $gtype: GObject.GType<Proxy>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Proxy.SignalSignatures;

        // Fields
        flags: number;

        own: boolean;

        // Constructors
        constructor(properties?: Partial<Proxy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Proxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Proxy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Proxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Proxy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Proxy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Proxy.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_destroy(): void;

        // Methods
        destroy(): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Proxy;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        get_object(): Gio.DBusObject | null;

        get_info(): Gio.DBusInterfaceInfo | null;

        set_object(object: Gio.DBusObject | null): void;

        vfunc_dup_object(): Gio.DBusObject | null;

        vfunc_get_info(): Gio.DBusInterfaceInfo | null;

        vfunc_set_object(object: Gio.DBusObject | null): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Registry {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            /** @signal */
            changed: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class Registry extends Serializable {
        static $gtype: GObject.GType<Registry>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Registry.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Registry.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Registry;

        // Signals
        /** @signal */
        connect<K extends keyof Registry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Registry.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Registry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Registry.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Registry.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Registry.SignalSignatures[K]>): void;

        // Methods
        check_modification(): boolean;

        get_components(): Component[];

        get_observed_paths(): ObservedPath[];

        load(): void;

        load_cache(is_user: boolean): boolean;

        load_cache_file(filename: string): boolean;

        load_in_dir(dirname: string): void;

        output(output: GLib.String, indent: number): void;

        save_cache(is_user: boolean): boolean;

        save_cache_file(filename: string): boolean;

        start_monitor_changes(): void;
    }


    namespace Serializable {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class Serializable extends Object {
        static $gtype: GObject.GType<Serializable>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Serializable.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Serializable.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Serializable;

        // Signals
        /** @signal */
        connect<K extends keyof Serializable.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Serializable.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Serializable.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Serializable.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Serializable.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Serializable.SignalSignatures[K]>): void;

        // Static methods
        static deserialize_object(variant: GLib.Variant): Serializable;

        // Virtual methods
        vfunc_copy(src: Serializable): boolean;

        vfunc_deserialize(variant: GLib.Variant): number;

        vfunc_serialize(builder: GLib.VariantBuilder): boolean;

        // Methods
        copy(): Serializable;

        get_qattachment(key: GLib.Quark): GLib.Variant;

        remove_qattachment(key: GLib.Quark): void;

        serialize_object(): GLib.Variant;

        set_qattachment(key: GLib.Quark, value: GLib.Variant): void;
    }


    namespace Service {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            connection: Gio.DBusConnection;
            object_path: string;
            objectPath: string;
        }
    }

    class Service extends Object {
        static $gtype: GObject.GType<Service>;

        // Properties
        get connection(): Gio.DBusConnection;
        set connection(val: Gio.DBusConnection);

        get object_path(): string;

        get objectPath(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Service.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Service.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: Gio.DBusConnection, path: string): Service;

        // Conflicted with IBus.Object.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Service.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Service.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Service.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Service.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Service.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Service.SignalSignatures[K]>): void;

        // Static methods
        static add_interfaces(xml_data: string): boolean;

        static free_interfaces(depth: number): number;

        // Virtual methods
        vfunc_service_get_property(connection: Gio.DBusConnection, sender: string, object_path: string, interface_name: string, property_name: string): GLib.Variant | null;

        vfunc_service_method_call(connection: Gio.DBusConnection, sender: string, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant, invocation: Gio.DBusMethodInvocation): void;

        vfunc_service_set_property(connection: Gio.DBusConnection, sender: string, object_path: string, interface_name: string, property_name: string, value: GLib.Variant): boolean;

        // Methods
        emit_signal(dest_bus_name: string, interface_name: string, signal_name: string, parameters: GLib.Variant): boolean;

        get_connection(): Gio.DBusConnection;

        get_object_path(): string;

        register(connection: Gio.DBusConnection): boolean;

        unregister(connection: Gio.DBusConnection): void;
    }


    namespace Text {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {}
    }

    class Text extends Serializable {
        static $gtype: GObject.GType<Text>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Text.SignalSignatures;

        // Fields
        is_static: boolean;

        text: string;

        attrs: AttrList;

        // Constructors
        constructor(properties?: Partial<Text.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_string(str: string): Text;

        static new_from_ucs4(str: string): Text;

        static new_from_unichar(c: string): Text;

        // Signals
        /** @signal */
        connect<K extends keyof Text.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Text.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Text.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Text.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Text.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Text.SignalSignatures[K]>): void;

        // Methods
        append_attribute(type: number, value: number, start_index: number, end_index: number): void;

        get_attributes(): AttrList;

        get_length(): number;

        get_text(): string;

        set_attributes(attrs: AttrList): void;
    }


    namespace UnicodeBlock {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::end": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::start": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            end: number;
            name: string;
            start: number;
        }
    }

    class UnicodeBlock extends Serializable {
        static $gtype: GObject.GType<UnicodeBlock>;

        // Properties
        get end(): number;

        get name(): string;
        set name(val: string);

        get start(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnicodeBlock.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnicodeBlock.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnicodeBlock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnicodeBlock.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnicodeBlock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnicodeBlock.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnicodeBlock.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnicodeBlock.SignalSignatures[K]>): void;

        // Static methods
        static load(path: string): UnicodeBlock[];

        static save(path: string, list: UnicodeBlock[]): void;

        // Methods
        get_end(): string;

        get_name(): string;

        get_start(): string;
    }


    namespace UnicodeData {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::alias": (pspec: GObject.ParamSpec) => void;
            "notify::block-name": (pspec: GObject.ParamSpec) => void;
            "notify::code": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            alias: string;
            block_name: string;
            blockName: string;
            code: number;
            name: string;
        }
    }

    class UnicodeData extends Serializable {
        static $gtype: GObject.GType<UnicodeData>;

        // Properties
        get alias(): string;
        set alias(val: string);

        get block_name(): string;
        set block_name(val: string);

        get blockName(): string;
        set blockName(val: string);

        get code(): number;

        get name(): string;
        set name(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnicodeData.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnicodeData.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnicodeData.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnicodeData.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnicodeData.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnicodeData.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnicodeData.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnicodeData.SignalSignatures[K]>): void;

        // Static methods
        static load(path: string, object: GObject.Object | null): UnicodeData[];

        static load_async(path: string, object: GObject.Object | null, cancellable: Gio.Cancellable | null, callback: UnicodeDataLoadAsyncFinish): void;

        static save(path: string, list: UnicodeData[]): void;

        // Methods
        get_alias(): string;

        get_block_name(): string;

        get_code(): string;

        get_name(): string;

        set_block_name(block_name: string): void;
    }


    namespace XEvent {
        // Signal signatures
        interface SignalSignatures extends Serializable.SignalSignatures {
            "notify::event-type": (pspec: GObject.ParamSpec) => void;
            "notify::group": (pspec: GObject.ParamSpec) => void;
            "notify::hardware-keycode": (pspec: GObject.ParamSpec) => void;
            "notify::is-modifier": (pspec: GObject.ParamSpec) => void;
            "notify::keyval": (pspec: GObject.ParamSpec) => void;
            "notify::length": (pspec: GObject.ParamSpec) => void;
            "notify::purpose": (pspec: GObject.ParamSpec) => void;
            "notify::root": (pspec: GObject.ParamSpec) => void;
            "notify::same-screen": (pspec: GObject.ParamSpec) => void;
            "notify::send-event": (pspec: GObject.ParamSpec) => void;
            "notify::serial": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::string": (pspec: GObject.ParamSpec) => void;
            "notify::subwindow": (pspec: GObject.ParamSpec) => void;
            "notify::time": (pspec: GObject.ParamSpec) => void;
            "notify::version": (pspec: GObject.ParamSpec) => void;
            "notify::window": (pspec: GObject.ParamSpec) => void;
            "notify::x": (pspec: GObject.ParamSpec) => void;
            "notify::x-root": (pspec: GObject.ParamSpec) => void;
            "notify::y": (pspec: GObject.ParamSpec) => void;
            "notify::y-root": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Serializable.ConstructorProps {
            event_type: number;
            eventType: number;
            group: number;
            hardware_keycode: number;
            hardwareKeycode: number;
            is_modifier: boolean;
            isModifier: boolean;
            keyval: number;
            length: number;
            purpose: string;
            root: number;
            same_screen: boolean;
            sameScreen: boolean;
            send_event: number;
            sendEvent: number;
            serial: bigint | number;
            state: number;
            string: string;
            subwindow: number;
            time: number;
            version: number;
            window: number;
            x: number;
            x_root: number;
            xRoot: number;
            y: number;
            y_root: number;
            yRoot: number;
        }
    }

    class XEvent extends Serializable {
        static $gtype: GObject.GType<XEvent>;

        // Properties
        get event_type(): number;

        get eventType(): number;

        get group(): number;

        get hardware_keycode(): number;

        get hardwareKeycode(): number;

        get is_modifier(): boolean;

        get isModifier(): boolean;

        get keyval(): number;

        get length(): number;

        get purpose(): string;

        get root(): number;

        get same_screen(): boolean;

        get sameScreen(): boolean;

        get send_event(): number;

        get sendEvent(): number;

        get serial(): number;

        get state(): number;

        get string(): string;

        get subwindow(): number;

        get time(): number;

        get version(): number;

        get window(): number;

        get x(): number;

        get x_root(): number;

        get xRoot(): number;

        get y(): number;

        get y_root(): number;

        get yRoot(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: XEvent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<XEvent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof XEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, XEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof XEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, XEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof XEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<XEvent.SignalSignatures[K]>): void;

        // Methods
        get_event_type(): XEventType;

        get_group(): number;

        get_hardware_keycode(): number;

        get_is_modifier(): boolean;

        get_keyval(): number;

        get_length(): number;

        get_purpose(): string;

        get_root(): number;

        get_same_screen(): boolean;

        get_send_event(): number;

        get_serial(): number;

        get_state(): number;

        get_string(): string;

        get_subwindow(): number;

        get_time(): number;

        get_version(): number;

        get_window(): number;

        get_x(): number;

        get_x_root(): number;

        get_y(): number;

        get_y_root(): number;
    }


    type AttrListClass = typeof AttrList;

    type AttributeClass = typeof Attribute;

    type BusClass = typeof Bus;

    abstract class BusPrivate {
        static $gtype: GObject.GType<BusPrivate>;
    }


    type ComponentClass = typeof Component;

    abstract class ComponentPrivate {
        static $gtype: GObject.GType<ComponentPrivate>;
    }


    type ConfigClass = typeof Config;

    abstract class ConfigPrivate {
        static $gtype: GObject.GType<ConfigPrivate>;
    }


    type ConfigServiceClass = typeof ConfigService;

    type EmojiDataClass = typeof EmojiData;

    abstract class EmojiDataPrivate {
        static $gtype: GObject.GType<EmojiDataPrivate>;
    }


    type EngineClass = typeof Engine;

    type EngineDescClass = typeof EngineDesc;

    abstract class EngineDescPrivate {
        static $gtype: GObject.GType<EngineDescPrivate>;
    }


    abstract class EnginePrivate {
        static $gtype: GObject.GType<EnginePrivate>;
    }


    type EngineSimpleClass = typeof EngineSimple;

    abstract class EngineSimplePrivate {
        static $gtype: GObject.GType<EngineSimplePrivate>;
    }


    type ExtensionEventClass = typeof ExtensionEvent;

    abstract class ExtensionEventPrivate {
        static $gtype: GObject.GType<ExtensionEventPrivate>;
    }


    type FactoryClass = typeof Factory;

    abstract class FactoryPrivate {
        static $gtype: GObject.GType<FactoryPrivate>;
    }


    type HotkeyProfileClass = typeof HotkeyProfile;

    type InputContextClass = typeof InputContext;

    type KeymapClass = typeof Keymap;

    type LookupTableClass = typeof LookupTable;

    type MessageClass = typeof Message;

    abstract class MessagePrivate {
        static $gtype: GObject.GType<MessagePrivate>;
    }


    type ObjectClass = typeof Object;

    abstract class ObjectPrivate {
        static $gtype: GObject.GType<ObjectPrivate>;
    }


    type ObservedPathClass = typeof ObservedPath;

    type PanelServiceClass = typeof PanelService;

    class ProcessKeyEventData {
        static $gtype: GObject.GType<ProcessKeyEventData>;

        // Fields
        keyval: number;

        keycode: number;

        state: number;

        // Constructors

        constructor(properties?: Partial<{
            keyval: number;
            keycode: number;
            state: number;
        }>);
    }


    type PropListClass = typeof PropList;

    type PropertyClass = typeof Property;

    abstract class PropertyPrivate {
        static $gtype: GObject.GType<PropertyPrivate>;
    }


    type ProxyClass = typeof Proxy;

    class RGBA {
        static $gtype: GObject.GType<RGBA>;

        // Fields
        red: number;

        green: number;

        blue: number;

        alpha: number;

        // Constructors

        constructor(properties?: Partial<{
            red: number;
            green: number;
            blue: number;
            alpha: number;
        }>);
    }


    class Rectangle {
        static $gtype: GObject.GType<Rectangle>;

        // Fields
        x: number;

        y: number;

        width: number;

        height: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>);
    }


    type RegistryClass = typeof Registry;

    abstract class RegistryPrivate {
        static $gtype: GObject.GType<RegistryPrivate>;
    }


    type SerializableClass = typeof Serializable;

    abstract class SerializablePrivate {
        static $gtype: GObject.GType<SerializablePrivate>;
    }


    type ServiceClass = typeof Service;

    abstract class ServicePrivate {
        static $gtype: GObject.GType<ServicePrivate>;
    }


    type TextClass = typeof Text;

    type UnicodeBlockClass = typeof UnicodeBlock;

    abstract class UnicodeBlockPrivate {
        static $gtype: GObject.GType<UnicodeBlockPrivate>;
    }


    type UnicodeDataClass = typeof UnicodeData;

    abstract class UnicodeDataPrivate {
        static $gtype: GObject.GType<UnicodeDataPrivate>;
    }


    type XEventClass = typeof XEvent;

    abstract class XEventPrivate {
        static $gtype: GObject.GType<XEventPrivate>;
    }


    class XML {
        static $gtype: GObject.GType<XML>;

        // Fields
        name: string;

        text: string;

        attributes: string;

        sub_nodes: null[];

        // Constructors

        constructor(properties?: Partial<{
            name: string;
            text: string;
            attributes: string;
        }>);

        // Static methods
        static parse_buffer(buffer: string): XML;

        static parse_file(name: string): XML;

        // Methods
        copy(): XML;

        free(): void;

        output(output: GLib.String): void;
    }


    const __name__: string;

    const __version__: string;
}

export default IBus;

}

declare module 'gi://IBus' {
    import IBus10 from 'gi://IBus?version=1.0';
    export default IBus10;
}
// END
