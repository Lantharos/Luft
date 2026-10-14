use crate::boot::startup;
use crate::disk::{self, DiskStatus};
use crate::keys::request::Request;
use crate::keys::{self, mok};
use crate::system::efi::{self, SecureBoot};
use crate::system::tpm::{self, Tpm};

pub struct SigningKey {
    pub enrollment: mok::Enrollment,
    pub available: bool,
    pub reason: String,
    pub missed: u32,
    pub missed_this_boot: bool,
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
    Status {
        secure_boot: efi::secure_boot(),
        tpm: tpm::detect(),
        signing_key: signing_key(),
        startup: startup(),
        disk: disk::status(),
    }
}
