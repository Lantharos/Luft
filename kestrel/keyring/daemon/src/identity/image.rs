use super::process::Process;
use super::program::file_name;

const ANONYMOUS_DEVICES: u32 = 0;
const ELF: [u8; 4] = *b"\x7fELF";
const APPIMAGE: [u8; 2] = *b"AI";
const APPIMAGE_TYPES: [u8; 2] = [1, 2];

pub fn of(process: &Process) -> Option<String> {
    let (major, connection) = process.executable_device()?;
    if major != ANONYMOUS_DEVICES {
        return None;
    }
    let source = mount_source(&process.mounts()?, connection)?;
    let named = |name: &str| name == source;
    server(connection, named).or_else(|| server(connection, |name| !named(name)))
}

fn server(connection: u32, named: impl Fn(&str) -> bool) -> Option<String> {
    running().find_map(|candidate| {
        let executable = candidate.executable()?;
        (named(file_name(&executable))
            && is_appimage(&candidate)
            && candidate.serves_fuse(connection))
        .then_some(executable)
    })
}

fn is_appimage(process: &Process) -> bool {
    process.executable_start::<11>().is_some_and(|start| {
        start[..4] == ELF && start[8..10] == APPIMAGE && APPIMAGE_TYPES.contains(&start[10])
    })
}

fn running() -> impl Iterator<Item = Process> {
    std::fs::read_dir("/proc")
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| entry.file_name().to_str()?.parse().ok())
        .filter_map(Process::open)
}

fn mount_source(mounts: &str, connection: u32) -> Option<String> {
    let device = format!("{ANONYMOUS_DEVICES}:{connection}");
    mounts.lines().find_map(|line| {
        let (mount, filesystem) = line.split_once(" - ")?;
        if mount.split(' ').nth(2)? != device {
            return None;
        }
        let mut filesystem = filesystem.split(' ');
        filesystem.next()?.starts_with("fuse").then_some(())?;
        filesystem.next().map(ToOwned::to_owned)
    })
}

#[cfg(test)]
mod tests {
    use super::mount_source;

    #[test]
    fn mounts_name_the_image_they_serve() {
        let mounts = "64 1 0:40 / /tmp rw - tmpfs tmpfs rw\n\
            584 64 0:83 / /tmp/.mount_claudedFkFkB ro,nosuid - fuse.claude.AppImage claude.AppImage ro,user_id=1000\n";
        assert_eq!(mount_source(mounts, 83).as_deref(), Some("claude.AppImage"));
        assert_eq!(mount_source(mounts, 40), None);
    }
}
