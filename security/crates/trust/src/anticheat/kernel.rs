use std::io::Read;

const COMMAND_LINE: &str = "/proc/cmdline";
const LOCKDOWN: &str = "/sys/kernel/security/lockdown";
const SECURITY_MODULES: &str = "/sys/kernel/security/lsm";
const KEXEC_DISABLED: &str = "/proc/sys/kernel/kexec_load_disabled";
const TAINTED: &str = "/proc/sys/kernel/tainted";
const IOMMUS: &str = "/sys/class/iommu";
const IOMMU_GROUPS: &str = "/sys/kernel/iommu_groups";
const EVENT_LOG: &str = "/sys/kernel/security/tpm0/binary_bios_measurements";
const UNSIGNED_MODULE: u64 = 1 << 13;
const PASSTHROUGH: &str = "identity";

fn read(path: &str) -> String {
    std::fs::read_to_string(path).unwrap_or_default()
}

pub fn argument(key: &str) -> Option<String> {
    read(COMMAND_LINE).split_whitespace().find_map(|argument| {
        let (name, value) = argument.split_once('=')?;
        (name == key).then(|| value.to_owned())
    })
}

pub fn lockdown() -> Option<String> {
    let modes = read(LOCKDOWN);
    let (_, selected) = modes.split_once('[')?;
    let (mode, _) = selected.split_once(']')?;
    Some(mode.to_owned())
}

pub fn security_modules() -> Vec<String> {
    read(SECURITY_MODULES)
        .trim()
        .split(',')
        .map(str::to_owned)
        .collect()
}

pub fn kexec_disabled() -> bool {
    read(KEXEC_DISABLED).trim() == "1"
}

pub fn unsigned_module_loaded() -> bool {
    read(TAINTED)
        .trim()
        .parse::<u64>()
        .is_ok_and(|taint| taint & UNSIGNED_MODULE != 0)
}

pub fn iommu_present() -> bool {
    std::fs::read_dir(IOMMUS).is_ok_and(|mut iommus| iommus.next().is_some())
}

pub fn iommu_passthrough() -> bool {
    std::fs::read_dir(IOMMU_GROUPS)
        .into_iter()
        .flatten()
        .flatten()
        .any(|group| {
            std::fs::read_to_string(group.path().join("type"))
                .is_ok_and(|kind| kind.trim() == PASSTHROUGH)
        })
}

pub fn measurements_logged() -> bool {
    let mut first = [0u8; 1];
    std::fs::File::open(EVENT_LOG)
        .is_ok_and(|mut log| log.read(&mut first).is_ok_and(|read| read == 1))
}
