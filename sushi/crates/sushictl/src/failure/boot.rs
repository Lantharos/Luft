use std::fs::File;
use std::io;

use rustix::fs::{IFlags, ioctl_getflags, ioctl_setflags};
use sushi::scene::firmware::{self, LOADER_VARIABLES, LUFT_VARIABLES};

const VARIABLES: &str = "/sys/firmware/efi/efivars";
const NON_VOLATILE_BOOT_RUNTIME: u32 = 0x7;

fn path(name: &str, vendor: &str) -> String {
    format!("{VARIABLES}/{name}-{vendor}")
}

fn variable(name: &str, vendor: &str) -> Option<Vec<u8>> {
    std::fs::read(path(name, vendor))
        .ok()
        .and_then(|data| data.get(4..).map(<[u8]>::to_vec))
}

pub fn previous_version() -> Option<String> {
    variable("LuftBootPrevious", LUFT_VARIABLES)
        .map(|data| String::from_utf8_lossy(&data).into_owned())
}

pub fn on_trial() -> bool {
    variable("LoaderBootCountPath", LOADER_VARIABLES).is_some()
}

pub fn go_back() -> io::Result<()> {
    let started = variable("LoaderEntrySelected", LOADER_VARIABLES)
        .map(|data| firmware::text(&data))
        .filter(|entry| !entry.is_empty())
        .ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::NotFound,
                "the boot menu didn't say what it started",
            )
        })?;
    let path = path("LuftBootGoBack", LUFT_VARIABLES);
    if let Ok(existing) = File::open(&path) {
        ioctl_setflags(&existing, ioctl_getflags(&existing)? - IFlags::IMMUTABLE)?;
        std::fs::remove_file(&path)?;
    }
    let mut contents = NON_VOLATILE_BOOT_RUNTIME.to_le_bytes().to_vec();
    contents.extend_from_slice(started.as_bytes());
    std::fs::write(path, contents)
}
