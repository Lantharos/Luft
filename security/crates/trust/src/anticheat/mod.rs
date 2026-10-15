mod kernel;

use crate::keys::mok::Enrollment;
use crate::system::efi::{self, SecureBoot};
use crate::system::tpm::Tpm;

const LOCKDOWN_MODES: [&str; 2] = ["integrity", "confidentiality"];

pub struct Check {
    pub id: &'static str,
    pub name: &'static str,
    pub missing: Option<String>,
}

pub struct Readiness {
    pub checks: Vec<Check>,
    pub uses_luft_key: bool,
}

pub struct Startup<'a> {
    pub secure_boot: SecureBoot,
    pub tpm: &'a Tpm,
    pub luft_key: Enrollment,
    pub other_keys: usize,
    pub measured: bool,
}

impl Readiness {
    pub fn ready(&self) -> bool {
        self.checks.iter().all(|check| check.missing.is_none())
    }
}

fn firmware(secure_boot: SecureBoot) -> Option<String> {
    let state = match secure_boot {
        SecureBoot::On => return None,
        SecureBoot::Off => "is off in your firmware",
        SecureBoot::Setup => "is in setup mode in your firmware",
        SecureBoot::Unsupported => "this computer doesn't have",
    };
    Some(format!("Anti-cheat needs Secure Boot, which {state}"))
}

fn signed_system(startup: &Startup) -> Option<String> {
    firmware(startup.secure_boot).or_else(|| {
        kernel::unsigned_module_loaded()
            .then(|| "A driver without a signature is loaded".to_owned())
    })
}

fn tpm(tpm: &Tpm) -> Option<String> {
    (!tpm.usable).then(|| tpm.reason.trim_end_matches('.').to_owned())
}

fn other_keys(count: usize) -> Option<String> {
    match count {
        0 => None,
        1 => Some("1 key you added isn't from Luft".to_owned()),
        count => Some(format!("{count} keys you added aren't from Luft")),
    }
}

fn secure_boot(startup: &Startup) -> Option<String> {
    firmware(startup.secure_boot)
        .or_else(|| {
            efi::shim_checks_off().then(|| "Shim's signature checks are turned off".to_owned())
        })
        .or_else(|| other_keys(startup.other_keys))
}

fn measured(startup: &Startup) -> Option<String> {
    if !kernel::measurements_logged() {
        Some("The firmware didn't record how the computer started".to_owned())
    } else if startup.measured {
        None
    } else if startup.luft_key != Enrollment::Enrolled {
        Some("Luft's Secure Boot key isn't added yet".to_owned())
    } else {
        Some("This startup didn't come through Luft's boot menu".to_owned())
    }
}

fn iommu() -> Option<&'static str> {
    if !kernel::iommu_present() {
        Some("The IOMMU (VT-d or AMD-Vi) is off in your firmware")
    } else if kernel::iommu_passthrough() {
        Some("Devices can bypass the IOMMU")
    } else {
        None
    }
}

fn lockdown(secure_boot: SecureBoot) -> Option<&'static str> {
    if secure_boot != SecureBoot::On {
        return Some("Kernel lockdown is only on with Secure Boot");
    }
    let explicit =
        kernel::argument("lockdown").is_some_and(|mode| LOCKDOWN_MODES.contains(&mode.as_str()));
    let active = kernel::lockdown().is_some_and(|mode| LOCKDOWN_MODES.contains(&mode.as_str()));
    (!explicit || !active).then_some("Kernel lockdown isn't turned on at startup")
}

fn kexec() -> Option<&'static str> {
    let explicit = kernel::argument("sysctl.kernel.kexec_load_disabled").as_deref() == Some("1");
    (!explicit || !kernel::kexec_disabled())
        .then_some("Another kernel can be started without restarting")
}

fn bpf() -> Option<&'static str> {
    (!kernel::security_modules()
        .iter()
        .any(|module| module == "bpf"))
    .then_some("The BPF security module isn't active")
}

fn check(id: &'static str, name: &'static str, missing: Option<impl Into<String>>) -> Check {
    Check {
        id,
        name,
        missing: missing.map(Into::into),
    }
}

pub fn readiness(startup: &Startup) -> Readiness {
    Readiness {
        checks: vec![
            check(
                "signed-system",
                "Signed system and drivers",
                signed_system(startup),
            ),
            check("tpm", "TPM 2.0", tpm(startup.tpm)),
            check(
                "secure-boot",
                "Secure Boot without other keys",
                secure_boot(startup),
            ),
            check("measured-startup", "Measured startup", measured(startup)),
            check("iommu", "IOMMU without passthrough", iommu()),
            check("lockdown", "Kernel lockdown", lockdown(startup.secure_boot)),
            check("kexec", "kexec turned off", kexec()),
            check("bpf-lsm", "BPF security module", bpf()),
        ],
        uses_luft_key: startup.luft_key == Enrollment::Enrolled,
    }
}
