use std::io::{Seek, Write};
use std::os::fd::{FromRawFd, OwnedFd};
use std::process::Command;

use super::fds;

pub const FILTER_FD: i32 = 4;

const LOAD_WORD: u16 = 0x20;
const JUMP_EQUAL: u16 = 0x15;
const JUMP_AT_LEAST: u16 = 0x35;
const RETURN: u16 = 0x06;
const ARCHITECTURE: u32 = 4;
const NUMBER: u32 = 0;
const SECOND_ARGUMENT: u32 = 24;
const ALLOW: u32 = 0x7fff_0000;
const REFUSE: u32 = 0x0005_0000 | libc::EPERM as u32;
const X32_SYSCALLS: u32 = 0x4000_0000;

#[cfg(target_arch = "x86_64")]
const NATIVE: u32 = 0xc000_003e;
#[cfg(target_arch = "aarch64")]
const NATIVE: u32 = 0xc000_00b7;

/// Calls no app needs that reach outside the sandbox or weaken it: the
/// kernel keyrings shared with your session, the kernel log, other
/// processes' memory and memory placement, and accounting.
const REFUSED: [libc::c_long; 13] = [
    libc::SYS_syslog,
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
    libc::SYS_perf_event_open,
    libc::SYS_ptrace,
];

/// Terminal requests that type into, or take over, the terminal the app was
/// started from.
const REFUSED_IOCTLS: [libc::c_ulong; 2] = [libc::TIOCSTI, libc::TIOCLINUX];

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

const fn refuse_when_equal(value: u32) -> [Instruction; 2] {
    [
        Instruction {
            code: JUMP_EQUAL,
            when_true: 0,
            when_false: 1,
            value,
        },
        statement(RETURN, REFUSE),
    ]
}

fn program() -> Vec<Instruction> {
    let mut program = vec![
        statement(LOAD_WORD, ARCHITECTURE),
        Instruction {
            code: JUMP_EQUAL,
            when_true: 1,
            when_false: 0,
            value: NATIVE,
        },
        statement(RETURN, REFUSE),
        statement(LOAD_WORD, NUMBER),
        Instruction {
            code: JUMP_AT_LEAST,
            when_true: 0,
            when_false: 1,
            value: X32_SYSCALLS,
        },
        statement(RETURN, REFUSE),
    ];
    for call in REFUSED {
        program.extend(refuse_when_equal(call as u32));
    }
    program.push(Instruction {
        code: JUMP_EQUAL,
        when_true: 0,
        when_false: 1 + 2 * REFUSED_IOCTLS.len() as u8,
        value: libc::SYS_ioctl as u32,
    });
    program.push(statement(LOAD_WORD, SECOND_ARGUMENT));
    for request in REFUSED_IOCTLS {
        program.extend(refuse_when_equal(request as u32));
    }
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

impl Filter {
    pub fn pass_to(&self, command: &mut Command) {
        fds::pass(command, &self.file, FILTER_FD);
    }
}
