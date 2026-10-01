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
    pub protection: &'static str,
    pub driver_key_enrolled: bool,
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

pub fn signing_key(disk_encrypted: bool) -> SigningKey {
    let possible = if efi::secure_boot() == SecureBoot::Unsupported {
        Err("This computer doesn't start with UEFI.")
    } else {
        keys::protection(disk_encrypted).map(|_| ())
    };
    let request = Request::load().unwrap_or_default();
    SigningKey {
        enrollment: mok::enrollment(),
        available: possible.is_ok() || keys::has_signing_key(),
        reason: possible.err().unwrap_or_default().to_owned(),
        protection: keys::stored_protection().map_or("", |protection| protection.name()),
        driver_key_enrolled: mok::driver_key_enrolled(),
        missed: request.missed,
        missed_this_boot: request.missed_this_boot(),
    }
}

pub fn startup() -> Startup {
    let reason = startup::unavailable_reason();
    Startup {
        installed: startup::installed(),
        measured: efi::measured_uki(),
        available: reason.is_none(),
        reason: reason.unwrap_or_default().to_owned(),
    }
}

pub fn gather() -> Status {
    let disk = disk::status();
    Status {
        secure_boot: efi::secure_boot(),
        tpm: tpm::detect(),
        signing_key: signing_key(disk.as_ref().is_some_and(|disk| disk.encrypted)),
        startup: startup(),
        disk,
    }
}
