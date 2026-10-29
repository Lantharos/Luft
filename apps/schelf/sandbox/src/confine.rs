use std::ffi::OsString;
use std::os::unix::ffi::OsStringExt;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use landlock::{
    ABI, Access, AccessFs, BitFlags, PathBeneath, PathFd, Ruleset, RulesetAttr, RulesetCreatedAttr,
    RulesetError, Scope,
};

const MOUNTS: &str = "/proc/self/mountinfo";
const LANDLOCK: ABI = ABI::V9;

/// A place bubblewrap mounted into the sandbox, and whether it's writable.
struct Mount {
    path: PathBuf,
    writable: bool,
}

/// Turns the `\ooo` escapes of a mount table field back into bytes.
fn unescape(field: &str) -> PathBuf {
    let bytes = field.as_bytes();
    let mut path = Vec::with_capacity(bytes.len());
    let mut at = 0;
    while at < bytes.len() {
        let code = bytes
            .get(at + 1..at + 4)
            .filter(|_| bytes[at] == b'\\')
            .and_then(|digits| u8::from_str_radix(std::str::from_utf8(digits).ok()?, 8).ok());
        match code {
            Some(byte) => {
                path.push(byte);
                at += 4;
            }
            None => {
                path.push(bytes[at]);
                at += 1;
            }
        }
    }
    PathBuf::from(OsString::from_vec(path))
}

fn mount(line: &str) -> Option<Mount> {
    let mut fields = line.split(' ').skip(4);
    let path = unescape(fields.next()?);
    let writable = !fields.next()?.split(',').any(|option| option == "ro");
    Some(Mount { path, writable })
}

fn mounts() -> Result<Vec<Mount>, String> {
    let table = std::fs::read_to_string(MOUNTS).map_err(|error| error.to_string())?;
    Ok(table.lines().filter_map(mount).collect())
}

fn access(mount: &Mount) -> BitFlags<AccessFs> {
    if mount.writable && mount.path != Path::new("/") {
        AccessFs::from_all(LANDLOCK)
    } else {
        AccessFs::from_read(LANDLOCK) | AccessFs::ResolveUnix
    }
}

/// Keeps this process and everything it starts to what the sandbox mounts,
/// as mounted, and away from abstract sockets and processes outside it.
pub fn confine() -> Result<(), String> {
    let rules = mounts()?.into_iter().filter_map(|mount| {
        let fd = PathFd::new(&mount.path).ok()?;
        Some(Ok::<_, RulesetError>(PathBeneath::new(fd, access(&mount))))
    });
    Ruleset::default()
        .handle_access(AccessFs::from_all(LANDLOCK))
        .and_then(|ruleset| ruleset.scope(Scope::AbstractUnixSocket | Scope::Signal))
        .and_then(Ruleset::create)
        .and_then(|ruleset| ruleset.add_rules(rules))
        .and_then(|ruleset| ruleset.restrict_self())
        .map(drop)
        .map_err(|error| error.to_string())
}

/// Runs a process the sandbox's portal started, confined like the app.
pub fn exec(command: &[String]) -> i32 {
    let [program, arguments @ ..] = command else {
        eprintln!("Nothing to run in the sandbox");
        return 2;
    };
    if let Err(error) = confine() {
        eprintln!("The sandbox couldn't be confined: {error}");
        return 1;
    }
    let error = Command::new(program).args(arguments).exec();
    eprintln!("{program}: {error}");
    127
}
