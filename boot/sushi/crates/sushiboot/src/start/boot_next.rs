use alloc::string::String;
use alloc::vec::Vec;

use uefi::proto::device_path::{DevicePath, DeviceSubType, DeviceType};
use uefi::runtime::{self, ResetType, VariableAttributes, VariableVendor};
use uefi::{CString16, Handle, Status, cstr16};

use crate::protocol;

const MEDIA: u8 = 4;
const HARD_DRIVE: u8 = 1;
const FILE_PATH: u8 = 4;
const END: u8 = 0x7f;
const SIGNATURE: core::ops::Range<usize> = 20..38;

struct LoadOption {
    disk: Option<Vec<u8>>,
    path: String,
}

fn u16_at(data: &[u8], at: usize) -> Option<u16> {
    Some(u16::from_le_bytes(data.get(at..at + 2)?.try_into().ok()?))
}

fn text(data: &[u8]) -> String {
    let units: Vec<u16> = data
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0)
        .collect();
    String::from_utf16_lossy(&units)
}

fn parse(data: &[u8]) -> Option<LoadOption> {
    let paths_length = usize::from(u16_at(data, 4)?);
    let label_end = (6..data.len())
        .step_by(2)
        .find(|at| u16_at(data, *at) == Some(0))?;
    let paths = data.get(label_end + 2..label_end + 2 + paths_length)?;
    let mut option = LoadOption {
        disk: None,
        path: String::new(),
    };
    let mut at = 0;
    while let (Some(&kind), Some(&subtype), Some(length)) =
        (paths.get(at), paths.get(at + 1), u16_at(paths, at + 2))
    {
        let length = usize::from(length);
        if kind == END || length < 4 {
            break;
        }
        let node = paths.get(at + 4..at + length)?;
        match (kind, subtype) {
            (MEDIA, HARD_DRIVE) => option.disk = node.get(SIGNATURE).map(<[u8]>::to_vec),
            (MEDIA, FILE_PATH) => option.path.push_str(&text(node)),
            _ => {}
        }
        at += length;
    }
    Some(option)
}

fn number(name: &str) -> Option<u16> {
    let digits = name.strip_prefix("Boot")?;
    (digits.len() == 4)
        .then(|| u16::from_str_radix(digits, 16).ok())
        .flatten()
}

// The partition's signature and its kind, as a firmware boot entry names it.
fn partition(volume: Handle) -> Option<Vec<u8>> {
    let path = protocol::shared::<DevicePath>(volume).ok()?;
    path.node_iter()
        .find(|node| {
            node.device_type() == DeviceType::MEDIA
                && node.sub_type() == DeviceSubType::MEDIA_HARD_DRIVE
        })
        .and_then(|node| node.data().get(SIGNATURE).map(<[u8]>::to_vec))
}

fn same_file(listed: &str, path: &str) -> bool {
    listed.replace('/', "\\").eq_ignore_ascii_case(path)
}

fn firmware_entry(volume: Handle, path: &str) -> Option<u16> {
    let disk = partition(volume)?;
    let mut options: Vec<(u16, CString16)> = runtime::variable_keys()
        .filter_map(Result::ok)
        .filter(|key| key.vendor == VariableVendor::GLOBAL_VARIABLE)
        .filter_map(|key| Some((number(&String::from(&key.name))?, key.name)))
        .collect();
    options.sort_unstable();
    options.into_iter().find_map(|(number, name)| {
        let (data, _) =
            runtime::get_variable_boxed(&name, &VariableVendor::GLOBAL_VARIABLE).ok()?;
        let option = parse(&data)?;
        (option.disk.as_deref() == Some(disk.as_slice()) && same_file(&option.path, path))
            .then_some(number)
    })
}

// Windows checks with the TPM that the firmware started it directly; started
// from here, BitLocker would ask for its recovery key. So the firmware's own
// entry for it is set to start next, and the computer restarts.
pub fn restart_into(volume: Handle, path: &str) -> uefi::Result<()> {
    let number = firmware_entry(volume, path).ok_or(Status::NOT_FOUND)?;
    runtime::set_variable(
        cstr16!("BootNext"),
        &VariableVendor::GLOBAL_VARIABLE,
        VariableAttributes::NON_VOLATILE
            | VariableAttributes::BOOTSERVICE_ACCESS
            | VariableAttributes::RUNTIME_ACCESS,
        &number.to_le_bytes(),
    )?;
    runtime::reset(ResetType::COLD, Status::SUCCESS, None)
}
