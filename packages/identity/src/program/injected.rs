//! Whether an installed Luft program was started with something of someone
//! else's in it: code mapped from outside the image, an environment that
//! points the loader, a toolkit or an interpreter elsewhere, or switches that
//! open a Sabine app's browser to others.

use std::ffi::CStr;
use std::io::Read;
use std::os::fd::OwnedFd;
use std::path::Path;

use super::image::{self, Mapped};
use crate::process::open_at;

const MAPS: &CStr = c"maps";
const ENVIRON: &CStr = c"environ";
const CMDLINE: &CStr = c"cmdline";
const DELETED: &str = " (deleted)";
const SABINE_APPS: &str = "/usr/lib/sabine/";
const UNSAFE: &str = include_str!(concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../../kestrel/engine/src/environment/unsafe.list"
));
const SABINE_DEVELOPMENT: [&str; 5] = [
    "SABINE_WEB_ENTRY",
    "SABINE_DEV_URL",
    "SABINE_DEVTOOLS_PORT",
    "SABINE_MANIFEST_PATH",
    "SABINE_HOST_CONTROL",
];
const CHROMIUM_SWITCHES: [&str; 8] = [
    "--remote-debugging",
    "--renderer-cmd-prefix",
    "--utility-cmd-prefix",
    "--gpu-launcher",
    "--browser-subprocess-path",
    "--load-extension",
    "--user-data-dir",
    "--js-flags",
];

fn read(folder: &OwnedFd, name: &CStr) -> Option<Vec<u8>> {
    let mut contents = Vec::new();
    open_at(folder, name)
        .and_then(|mut file| file.read_to_end(&mut contents))
        .ok()?;
    Some(contents)
}

struct Mapping<'a> {
    executable: bool,
    inode: u64,
    file: &'a str,
}

fn mapping(line: &str) -> Option<Mapping<'_>> {
    let mut fields = line.split_ascii_whitespace();
    let executable = fields.nth(1)?.contains('x');
    let inode = fields.nth(2)?.parse().ok()?;
    let file = &line[line.find('/')?..];
    Some(Mapping {
        executable,
        inode,
        file,
    })
}

/// Whether the process maps code from a file that is still there, outside the
/// image, as a library slipped in through the loader or a module path is.
/// Code the process makes itself, in anonymous memory, a memfd or a file it
/// unlinked, as JIT compilers and graphics drivers do, isn't that. The path
/// the kernel shows can end in " (deleted)" either way, so the file is looked
/// up by both and told by its inode, never by the words.
fn maps_foreign_code(maps: &str, lookup: impl Fn(&str, u64) -> Mapped) -> bool {
    maps.lines()
        .filter_map(mapping)
        .filter(|mapping| mapping.executable && mapping.inode != 0)
        .any(|mapping| {
            let unlinked = mapping.file.strip_suffix(DELETED);
            [Some(mapping.file), unlinked]
                .into_iter()
                .flatten()
                .any(|path| lookup(path, mapping.inode) == Mapped::Elsewhere)
        })
}

fn names_unsafe(environment: &[u8], sabine_app: bool) -> bool {
    environment
        .split(|&byte| byte == 0)
        .filter_map(|entry| std::str::from_utf8(entry).ok())
        .filter_map(|entry| entry.split_once('=').map(|(name, _)| name))
        .any(|name| {
            UNSAFE.split_ascii_whitespace().any(|listed| listed == name)
                || (sabine_app
                    && SABINE_DEVELOPMENT
                        .iter()
                        .any(|variable| name.starts_with(variable)))
        })
}

fn opens_browser(arguments: &[u8]) -> bool {
    arguments.split(|&byte| byte == 0).skip(1).any(|argument| {
        CHROMIUM_SWITCHES
            .iter()
            .any(|switch| argument.starts_with(switch.as_bytes()))
    })
}

/// Whether the installed program at `program`, running behind a `/proc`
/// folder, was started with something slipped in. A process whose files
/// can't be read counts as one that was.
pub fn into(folder: &OwnedFd, program: &Path) -> bool {
    let sabine_app = program.starts_with(SABINE_APPS);
    let (Some(maps), Some(environment), Some(arguments)) = (
        read(folder, MAPS),
        read(folder, ENVIRON),
        read(folder, CMDLINE),
    ) else {
        return true;
    };
    maps_foreign_code(&String::from_utf8_lossy(&maps), |path, inode| {
        image::mapped(folder, path, inode)
    }) || names_unsafe(&environment, sabine_app)
        || (sabine_app && opens_browser(&arguments))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lookup(path: &str, inode: u64) -> Mapped {
        match (path, inode) {
            ("/usr/lib64/libc.so.6", 42) => Mapped::Image,
            ("/home/mara/.local/lib/payload.so", 9) => Mapped::Elsewhere,
            ("/home/mara/odd (deleted)", 11) => Mapped::Elsewhere,
            _ => Mapped::Gone,
        }
    }

    #[test]
    fn code_from_files_still_outside_the_image_counts() {
        let made_by_the_process = "7f00-7f10 r-xp 00000000 00:1f 42 /usr/lib64/libc.so.6\n\
                     7f10-7f20 rwxp 00000000 00:00 0 \n\
                     7f20-7f30 r--p 00000000 00:2a 7 /home/mara/notes.txt\n\
                     7f30-7f40 r-xs 00000000 00:01 5 /memfd:/.glXXXXXX (deleted)\n\
                     7f40-7f50 r-xs 00000000 00:2b 6 /run/user/1000/orcexec.IxDbZ6 (deleted)\n\
                     7fff-8000 r-xp 00000000 00:00 0 [vdso]\n";
        assert!(!maps_foreign_code(made_by_the_process, lookup));
        for slipped in [
            "7f00-7f10 r-xp 00000000 00:2a 9 /home/mara/.local/lib/payload.so",
            "7f00-7f10 r-xp 00000000 00:2a 11 /home/mara/odd (deleted)",
        ] {
            assert!(
                maps_foreign_code(&format!("{made_by_the_process}{slipped}\n"), lookup),
                "{slipped}"
            );
        }
    }

    #[test]
    fn loader_and_sabine_variables_count() {
        let clean = b"HOME=/home/mara\0LANG=en_US.UTF-8\0LD_PRELOADED_LIBS=x\0";
        assert!(!names_unsafe(clean, true));
        assert!(names_unsafe(
            b"HOME=/home/mara\0LD_PRELOAD=/tmp/x.so\0",
            false
        ));
        assert!(names_unsafe(b"GTK_MODULES=payload\0", false));
        assert!(names_unsafe(b"SABINE_WEB_ENTRY=/tmp/page\0", true));
        assert!(!names_unsafe(b"SABINE_WEB_ENTRY=/tmp/page\0", false));
    }

    #[test]
    fn browser_switches_count_after_the_program() {
        assert!(!opens_browser(b"/usr/bin/rover\0file:///home/mara\0"));
        assert!(opens_browser(
            b"/usr/bin/rover\0--remote-debugging-port=9222\0"
        ));
        assert!(!opens_browser(b"--user-data-dir\0"));
    }
}
