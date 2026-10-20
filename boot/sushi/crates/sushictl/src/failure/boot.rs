use std::fs::File;
use std::io;

use rustix::fs::{IFlags, ioctl_getflags, ioctl_setflags};

const VARIABLES: &str = "/sys/firmware/efi/efivars";
const LUFT: &str = "b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e";
const LOADER: &str = "4a67b082-0a4c-41cf-b6c7-440b29bb8c4f";
const NON_VOLATILE_BOOT_RUNTIME: u32 = 0x7;

fn path(name: &str, vendor: &str) -> String {
    format!("{VARIABLES}/{name}-{vendor}")
}

fn variable(name: &str, vendor: &str) -> Option<Vec<u8>> {
    std::fs::read(path(name, vendor))
        .ok()
        .and_then(|data| data.get(4..).map(<[u8]>::to_vec))
}

fn utf16(data: &[u8]) -> String {
    let units: Vec<u16> = data
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0)
        .collect();
    String::from_utf16_lossy(&units)
}

pub fn previous_version() -> Option<String> {
    variable("LuftBootPrevious", LUFT).map(|data| String::from_utf8_lossy(&data).into_owned())
}

pub fn on_trial() -> bool {
    match (
        variable("LuftBootTrying", LUFT),
        variable("LuftBootGood", LUFT),
    ) {
        (Some(trying), Some(good)) => trying != good,
        _ => false,
    }
}

pub fn go_back() -> io::Result<()> {
    let started = variable("LoaderEntrySelected", LOADER)
        .map(|data| utf16(&data))
        .filter(|entry| !entry.is_empty())
        .ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::NotFound,
                "the boot menu didn't say what it started",
            )
        })?;
    let path = path("LuftBootGoBack", LUFT);
    if let Ok(existing) = File::open(&path) {
        ioctl_setflags(&existing, ioctl_getflags(&existing)? - IFlags::IMMUTABLE)?;
        std::fs::remove_file(&path)?;
    }
    let mut contents = NON_VOLATILE_BOOT_RUNTIME.to_le_bytes().to_vec();
    contents.extend_from_slice(started.as_bytes());
    std::fs::write(path, contents)
}
