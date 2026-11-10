use std::io::{Seek, Write};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::process::Command;

use super::fds;

pub const FILTER_FD: i32 = 4;

const LOAD_WORD: u16 = 0x20;
const JUMP_EQUAL: u16 = 0x15;
const JUMP_AT_LEAST: u16 = 0x35;
const JUMP_ANY_BIT: u16 = 0x45;
const RETURN: u16 = 0x06;
const ARCHITECTURE: u32 = 4;
const NUMBER: u32 = 0;
const FIRST_ARGUMENT: u32 = 16;
const FIRST_ARGUMENT_HIGH: u32 = 20;
const SECOND_ARGUMENT: u32 = 24;
const ALLOW: u32 = 0x7fff_0000;
const FAIL: u32 = 0x0005_0000;
const X32_SYSCALLS: u32 = 0x4000_0000;
const PER_LINUX: u32 = 0;

#[cfg(target_arch = "x86_64")]
const NATIVE: u32 = 0xc000_003e;
#[cfg(target_arch = "aarch64")]
const NATIVE: u32 = 0xc000_00b7;

/// Calls no app needs that reach outside the sandbox or weaken it, the list
/// Flatpak refuses: the kernel log, accounting, the kernel keyrings shared
/// with your session, memory placement, other processes' memory, profiling,
/// and everything that makes or enters namespaces or changes mounts.
const REFUSED: &[libc::c_long] = &[
    libc::SYS_syslog,
    #[cfg(target_arch = "x86_64")]
    libc::SYS_uselib,
    libc::SYS_acct,
    libc::SYS_quotactl,
    libc::SYS_add_key,
    libc::SYS_keyctl,
    libc::SYS_request_key,
    libc::SYS_move_pages,
    libc::SYS_mbind,
    libc::SYS_get_mempolicy,
    libc::SYS_set_mempolicy,
    libc::SYS_migrate_pages,
    libc::SYS_unshare,
    libc::SYS_setns,
    libc::SYS_mount,
    libc::SYS_umount2,
    libc::SYS_pivot_root,
    libc::SYS_chroot,
    libc::SYS_perf_event_open,
    libc::SYS_ptrace,
];

/// Newer calls with an older one that does the same. Programs fall back to
/// the older one when the kernel says it doesn't have these, which is where
/// the filter can see what they ask for.
const MISSING: &[libc::c_long] = &[
    libc::SYS_clone3,
    libc::SYS_open_tree,
    libc::SYS_move_mount,
    libc::SYS_fsopen,
    libc::SYS_fsconfig,
    libc::SYS_fsmount,
    libc::SYS_fspick,
    libc::SYS_mount_setattr,
];

/// Terminal requests that type into, or take over, the terminal the app was
/// started from.
const REFUSED_IOCTLS: [libc::c_ulong; 2] = [libc::TIOCSTI, libc::TIOCLINUX];

/// The kinds of socket an app gets: local ones, the internet, and the
/// kernel's own for looking up network settings. Every other kind reaches a
/// corner of the kernel few programs use and many bugs were found in.
const SOCKETS: [libc::c_int; 5] = [
    libc::AF_UNSPEC,
    libc::AF_UNIX,
    libc::AF_INET,
    libc::AF_INET6,
    libc::AF_NETLINK,
];

#[repr(C)]
struct Instruction {
    code: u16,
    when_true: u8,
    when_false: u8,
    value: u32,
}

const fn statement(code: u16, value: u32) -> Instruction {
    Instruction {
        code,
        when_true: 0,
        when_false: 0,
        value,
    }
}

const fn jump(code: u16, value: u32, when_true: u8, when_false: u8) -> Instruction {
    Instruction {
        code,
        when_true,
        when_false,
        value,
    }
}

const fn fail(error: libc::c_int) -> Instruction {
    statement(RETURN, FAIL | error as u32)
}

/// Runs `checks` for the call `number` and lets it through when none of them
/// ends it, so each call's checks stand on their own.
fn for_call(program: &mut Vec<Instruction>, number: libc::c_long, checks: Vec<Instruction>) {
    program.push(jump(JUMP_EQUAL, number as u32, 0, checks.len() as u8 + 1));
    program.extend(checks);
    program.push(statement(RETURN, ALLOW));
}

fn program() -> Vec<Instruction> {
    let mut program = vec![
        statement(LOAD_WORD, ARCHITECTURE),
        jump(JUMP_EQUAL, NATIVE, 1, 0),
        fail(libc::EPERM),
        statement(LOAD_WORD, NUMBER),
        jump(JUMP_AT_LEAST, X32_SYSCALLS, 0, 1),
        fail(libc::EPERM),
    ];
    for (calls, error) in [(REFUSED, libc::EPERM), (MISSING, libc::ENOSYS)] {
        for call in calls {
            program.push(jump(JUMP_EQUAL, *call as u32, 0, 1));
            program.push(fail(error));
        }
    }
    for_call(
        &mut program,
        libc::SYS_clone,
        vec![
            statement(LOAD_WORD, FIRST_ARGUMENT),
            jump(JUMP_ANY_BIT, libc::CLONE_NEWUSER as u32, 0, 1),
            fail(libc::EPERM),
        ],
    );
    let mut requests = vec![statement(LOAD_WORD, SECOND_ARGUMENT)];
    for request in REFUSED_IOCTLS {
        requests.push(jump(JUMP_EQUAL, request as u32, 0, 1));
        requests.push(fail(libc::EPERM));
    }
    for_call(&mut program, libc::SYS_ioctl, requests);
    for_call(
        &mut program,
        libc::SYS_personality,
        vec![
            statement(LOAD_WORD, FIRST_ARGUMENT_HIGH),
            jump(JUMP_EQUAL, 0, 0, 2),
            statement(LOAD_WORD, FIRST_ARGUMENT),
            jump(JUMP_EQUAL, PER_LINUX, 1, 0),
            fail(libc::EPERM),
        ],
    );
    let mut families = vec![statement(LOAD_WORD, FIRST_ARGUMENT)];
    for (index, family) in SOCKETS.iter().enumerate() {
        let to_allow = (SOCKETS.len() - index) as u8;
        families.push(jump(JUMP_EQUAL, *family as u32, to_allow, 0));
    }
    families.push(fail(libc::EAFNOSUPPORT));
    for_call(&mut program, libc::SYS_socket, families);
    program.push(statement(RETURN, ALLOW));
    program
}

/// The compiled filter in an unlinked file that bwrap reads from `FILTER_FD`.
pub struct Filter {
    file: OwnedFd,
}

pub fn filter() -> Result<Filter, String> {
    let bytes: Vec<u8> = program()
        .iter()
        .flat_map(|instruction| {
            let mut bytes = Vec::with_capacity(8);
            bytes.extend(instruction.code.to_ne_bytes());
            bytes.push(instruction.when_true);
            bytes.push(instruction.when_false);
            bytes.extend(instruction.value.to_ne_bytes());
            bytes
        })
        .collect();
    let fd = unsafe { libc::memfd_create(c"luft-sandbox-filter".as_ptr(), libc::MFD_CLOEXEC) };
    if fd < 0 {
        return Err(std::io::Error::last_os_error().to_string());
    }
    let mut file = std::fs::File::from(unsafe { OwnedFd::from_raw_fd(fd) });
    file.write_all(&bytes).map_err(|error| error.to_string())?;
    file.rewind().map_err(|error| error.to_string())?;
    Ok(Filter { file: file.into() })
}

impl AsRawFd for Filter {
    fn as_raw_fd(&self) -> RawFd {
        self.file.as_raw_fd()
    }
}

impl Filter {
    pub fn pass_to(&self, command: &mut Command) {
        fds::pass(command, &self.file, FILTER_FD);
    }
}
