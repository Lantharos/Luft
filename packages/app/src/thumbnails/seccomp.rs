#[cfg(target_arch = "x86_64")]
const AUDIT_ARCH: u32 = 0xc000_003e;
#[cfg(target_arch = "aarch64")]
const AUDIT_ARCH: u32 = 0xc000_00b7;

const X32_SYSCALL_BIT: u32 = 0x4000_0000;

const LOAD: u32 = libc::BPF_LD | libc::BPF_W | libc::BPF_ABS;
const EQUALS: u32 = libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K;
const AT_LEAST: u32 = libc::BPF_JMP | libc::BPF_JGE | libc::BPF_K;
const HAS_BITS: u32 = libc::BPF_JMP | libc::BPF_JSET | libc::BPF_K;
const RETURN: u32 = libc::BPF_RET | libc::BPF_K;

const NUMBER_OFFSET: u32 = 0;
const ARCH_OFFSET: u32 = 4;
const FLAGS_OFFSET: u32 = 16;

const ALLOW: u32 = libc::SECCOMP_RET_ALLOW;
const UNSUPPORTED: u32 = libc::SECCOMP_RET_ERRNO | libc::ENOSYS as u32;
const DENY: u32 = libc::SECCOMP_RET_ERRNO | libc::EPERM as u32;

fn step(code: u32, value: u32, jump_true: u8, jump_false: u8) -> [u8; 8] {
    let mut bytes = [0; 8];
    bytes[..2].copy_from_slice(&(code as u16).to_ne_bytes());
    bytes[2] = jump_true;
    bytes[3] = jump_false;
    bytes[4..].copy_from_slice(&value.to_ne_bytes());
    bytes
}

pub(super) fn no_new_namespaces() -> Vec<u8> {
    [
        step(LOAD, ARCH_OFFSET, 0, 0),
        step(EQUALS, AUDIT_ARCH, 0, 7),
        step(LOAD, NUMBER_OFFSET, 0, 0),
        step(AT_LEAST, X32_SYSCALL_BIT, 7, 0),
        step(EQUALS, libc::SYS_unshare as u32, 6, 0),
        step(EQUALS, libc::SYS_clone3 as u32, 4, 0),
        step(EQUALS, libc::SYS_clone as u32, 0, 2),
        step(LOAD, FLAGS_OFFSET, 0, 0),
        step(HAS_BITS, libc::CLONE_NEWUSER as u32, 2, 0),
        step(RETURN, ALLOW, 0, 0),
        step(RETURN, UNSUPPORTED, 0, 0),
        step(RETURN, DENY, 0, 0),
    ]
    .concat()
}
