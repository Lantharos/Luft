use crate::anticheat::{self, Readiness};
use crate::boot::startup;
use crate::disk::{self, DiskStatus};
use crate::keys::request::Request;
use crate::keys::{self, mok, others};
use crate::system::firmware::efi::{self, SecureBoot};
use crate::system::firmware::tpm::{self, Tpm};

pub struct SigningKey {
    pub enrollment: mok::Enrollment,
    pub available: bool,
    pub reason: String,
    pub missed: u32,
    pub missed_this_boot: bool,
    pub other_keys: Vec<String>,
    pub removing_other_keys: bool,
}

pub struct Startup {
    pub installed: bool,
    pub measured: bool,
    pub available: bool,
    pub reason: String,
}

pub struct Status {
    pub secure_boot: SecureBoot,
    pub tpm: Tpm,
    pub signing_key: SigningKey,
    pub startup: Startup,
    pub disk: Option<DiskStatus>,
    pub anti_cheat: Readiness,
}

fn signing_key_unavailable() -> Option<&'static str> {
    if efi::secure_boot() == SecureBoot::Unsupported {
        Some("This computer doesn't start with UEFI.")
    } else if !keys::shipped() {
        Some("This system doesn't carry Luft's Secure Boot key.")
    } else {
        None
    }
}

pub fn signing_key() -> SigningKey {
    let reason = signing_key_unavailable();
    let request = Request::load().unwrap_or_default();
    SigningKey {
        enrollment: mok::enrollment(),
        available: reason.is_none(),
        reason: reason.unwrap_or_default().to_owned(),
        missed: request.missed,
        missed_this_boot: request.missed_this_boot(),
        other_keys: others::enrolled()
            .iter()
            .map(|certificate| others::name(certificate))
            .collect(),
        removing_other_keys: others::removal_requested(),
    }
}

pub fn startup() -> Startup {
    let reason = startup::unavailable_reason();
    Startup {
        installed: startup::installed(),
        measured: efi::measured_uki() && startup::started_through_menu(),
        available: reason.is_none(),
        reason: reason.unwrap_or_default().to_owned(),
    }
}

pub fn gather() -> Status {
    let secure_boot = efi::secure_boot();
    let tpm = tpm::detect();
    let signing_key = signing_key();
    let startup = startup();
    let anti_cheat = anticheat::readiness(&anticheat::Startup {
        secure_boot,
        tpm: &tpm,
        luft_key: signing_key.enrollment,
        other_keys: signing_key.other_keys.len(),
        measured: startup.measured,
    });
    Status {
        secure_boot,
        tpm,
        signing_key,
        startup,
        disk: disk::status(),
        anti_cheat,
    }
}
