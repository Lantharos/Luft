use serde::{Deserialize, Serialize};

use super::enterprise::{self, Enterprise};
use super::settings::{Settings, get, put};

pub const SECURITY: &str = "802-11-wireless-security";
pub const EAP: &str = "802-1x";

const WEP_KEY: u32 = 1;
const SYSTEM_STORED: u32 = 0;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Security {
    Open,
    Owe,
    Wep,
    Psk,
    Sae,
    Enterprise,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Wireless {
    pub security: Security,
    pub enterprise: Option<Enterprise>,
}

pub fn security(settings: &Settings) -> Security {
    match get::<String>(settings, SECURITY, "key-mgmt").as_deref() {
        None => Security::Open,
        Some("owe") => Security::Owe,
        Some("wpa-psk") => Security::Psk,
        Some("sae") => Security::Sae,
        Some("wpa-eap" | "wpa-eap-suite-b-192") => Security::Enterprise,
        Some(_) => Security::Wep,
    }
}

fn key_management(security: Security) -> Option<&'static str> {
    match security {
        Security::Open => None,
        Security::Owe => Some("owe"),
        Security::Wep => Some("none"),
        Security::Psk => Some("wpa-psk"),
        Security::Sae => Some("sae"),
        Security::Enterprise => Some("wpa-eap"),
    }
}

pub fn load(settings: &Settings) -> Wireless {
    let security = security(settings);
    Wireless {
        security,
        enterprise: (security == Security::Enterprise).then(|| enterprise::load(settings.get(EAP))),
    }
}

pub fn secret_key(settings: &Settings) -> Option<(&'static str, &'static str)> {
    match security(settings) {
        Security::Psk | Security::Sae => Some((SECURITY, "psk")),
        Security::Wep => Some((SECURITY, "wep-key0")),
        Security::Enterprise => Some((EAP, enterprise::secret_key(settings.get(EAP)))),
        Security::Open | Security::Owe => None,
    }
}

pub fn store(settings: &mut Settings, wireless: &Wireless, secret: Option<&str>) {
    if security(settings) != wireless.security {
        settings.remove(SECURITY);
        settings.remove(EAP);
    }
    let Some(management) = key_management(wireless.security) else {
        return;
    };
    let group = settings.entry(SECURITY.to_owned()).or_default();
    put(group, "key-mgmt", management);
    let (key, flags) = match wireless.security {
        Security::Psk | Security::Sae => ("psk", "psk-flags"),
        Security::Wep => {
            put(group, "wep-key-type", WEP_KEY);
            ("wep-key0", "wep-key-flags")
        }
        Security::Enterprise => {
            if let Some(details) = &wireless.enterprise {
                enterprise::store(settings.entry(EAP.to_owned()).or_default(), details, secret);
            }
            return;
        }
        Security::Open | Security::Owe => return,
    };
    if let Some(secret) = secret {
        put(group, key, secret.to_owned());
        put(group, flags, SYSTEM_STORED);
    }
}
