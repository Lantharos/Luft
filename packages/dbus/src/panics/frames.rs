//! The stack a panic starts from, as the module each return address lies
//! in, that module's build ID and the address's offset from the module's
//! start, the way systemd-coredump writes the stack of a core dump.

use std::ffi::CStr;
use std::path::Path;

const DEEPEST: usize = 48;
const BUILD_ID_NOTE: u32 = 3;
const NOTE_OWNER: &[u8] = b"GNU\0";

unsafe extern "C" {
    fn backtrace(buffer: *mut *mut libc::c_void, size: libc::c_int) -> libc::c_int;
}

struct Module {
    name: String,
    start: usize,
    end: usize,
    build: String,
}

pub struct Stack {
    pub build: String,
    pub frames: String,
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

const fn aligned(length: usize) -> usize {
    (length + 3) & !3
}

/// The GNU build ID among an ELF file's notes.
pub fn build_id(notes: &[u8]) -> Option<String> {
    let mut rest = notes;
    while rest.len() >= 12 {
        let word = |at: usize| u32::from_ne_bytes(rest[at..at + 4].try_into().unwrap()) as usize;
        let (owner, length, kind) = (word(0), word(4), word(8) as u32);
        let owner_end = 12 + aligned(owner);
        let end = owner_end + aligned(length);
        if end > rest.len() {
            return None;
        }
        if kind == BUILD_ID_NOTE && &rest[12..12 + owner] == NOTE_OWNER {
            return Some(hex(&rest[owner_end..owner_end + length]));
        }
        rest = &rest[end..];
    }
    None
}

fn module(info: &libc::dl_phdr_info) -> Option<Module> {
    let headers = unsafe { std::slice::from_raw_parts(info.dlpi_phdr, info.dlpi_phnum.into()) };
    let loaded = headers
        .iter()
        .filter(|header| header.p_type == libc::PT_LOAD);
    let start = loaded.clone().map(|header| header.p_vaddr).min()?;
    let end = loaded.map(|header| header.p_vaddr + header.p_memsz).max()?;
    let base = info.dlpi_addr as usize;
    let build = headers
        .iter()
        .filter(|header| header.p_type == libc::PT_NOTE)
        .find_map(|header| {
            let notes = (base + header.p_vaddr as usize) as *const u8;
            build_id(unsafe { std::slice::from_raw_parts(notes, header.p_memsz as usize) })
        })
        .unwrap_or_else(|| "-".into());
    let path = unsafe { CStr::from_ptr(info.dlpi_name) }.to_string_lossy();
    let name = if path.is_empty() {
        std::env::current_exe().ok()?.to_string_lossy().into_owned()
    } else {
        path.into_owned()
    };
    Some(Module {
        name: Path::new(&name).file_name()?.to_string_lossy().into_owned(),
        start: base + start as usize,
        end: base + end as usize,
        build,
    })
}

unsafe extern "C" fn found(
    info: *mut libc::dl_phdr_info,
    _: libc::size_t,
    modules: *mut libc::c_void,
) -> libc::c_int {
    let modules = unsafe { &mut *modules.cast::<Vec<Module>>() };
    modules.extend(module(unsafe { &*info }));
    0
}

fn loaded() -> Vec<Module> {
    let mut modules = Vec::new();
    unsafe { libc::dl_iterate_phdr(Some(found), (&raw mut modules).cast()) };
    modules
}

fn return_addresses() -> Vec<usize> {
    let mut addresses = [std::ptr::null_mut(); DEEPEST];
    let count = unsafe { backtrace(addresses.as_mut_ptr(), DEEPEST as libc::c_int) };
    addresses[..usize::try_from(count).unwrap_or(0)]
        .iter()
        .map(|&address| address as usize)
        .collect()
}

pub fn current() -> Stack {
    let modules = loaded();
    let frames = return_addresses()
        .into_iter()
        .filter_map(|address| {
            let module = modules
                .iter()
                .find(|module| (module.start..module.end).contains(&address))?;
            Some(format!(
                "{} {} 0x{:x}",
                module.name,
                module.build,
                address - module.start
            ))
        })
        .collect::<Vec<_>>()
        .join("\n");
    Stack {
        build: modules
            .first()
            .map(|program| program.build.clone())
            .unwrap_or_default(),
        frames,
    }
}

#[cfg(test)]
mod tests {
    use super::{build_id, current};

    #[test]
    fn reads_the_gnu_build_id_note() {
        let mut notes = Vec::new();
        for word in [4u32, 2, 3] {
            notes.extend_from_slice(&word.to_ne_bytes());
        }
        notes.extend_from_slice(b"GNU\0\xab\xcd\0\0");
        assert_eq!(build_id(&notes).as_deref(), Some("abcd"));
    }

    #[test]
    fn names_the_test_program_first() {
        let stack = current();
        let program = std::env::current_exe().unwrap();
        let name = program.file_name().unwrap().to_string_lossy();
        assert!(stack.frames.lines().any(|frame| frame.starts_with(&*name)));
    }
}
