use std::fs;
use std::path::{Path, PathBuf};

use portguard::sign_in::{Enrolled, Part};

use crate::card::pcsc::{Readers, UsbAddress, reader_named};

const DEVICES: &str = "/sys/bus/usb/devices";
const HIDRAW: &str = "/sys/class/hidraw";

fn device_id(path: &Path) -> Option<String> {
    let mut path = fs::canonicalize(path).ok()?;
    while !path.join("idVendor").is_file() {
        path = path.parent()?.to_path_buf();
    }
    path.file_name()?.to_str().map(str::to_owned)
}

fn line(id: &str, part: Part) -> Option<String> {
    let identity = portguard::usb::identity(id)?;
    Some(Enrolled { identity, part }.line().trim_end().to_owned())
}

/// The USB device a security key's `/dev/hidrawN` belongs to, as USB
/// protection lets it through while locked.
pub fn security_key(hidraw: &str) -> Option<String> {
    let node = Path::new(hidraw).file_name()?;
    line(
        &device_id(&Path::new(HIDRAW).join(node).join("device"))?,
        Part::SecurityKey,
    )
}

fn number(path: &Path, attribute: &str) -> Option<u8> {
    fs::read_to_string(path.join(attribute))
        .ok()?
        .trim()
        .parse()
        .ok()
}

/// The USB device behind the card reader a PKCS #11 slot describes.
pub fn card_reader(description: &str) -> Option<String> {
    let readers = Readers::connect()?;
    let reader = reader_named(&readers.names(), description)?.clone();
    let UsbAddress { bus, device } = readers.usb_address(&reader)?;
    fs::read_dir(DEVICES)
        .ok()?
        .flatten()
        .map(|entry| entry.path())
        .find(|path: &PathBuf| {
            number(path, "busnum") == Some(bus) && number(path, "devnum") == Some(device)
        })
        .and_then(|path| line(path.file_name()?.to_str()?, Part::CardReader))
}
