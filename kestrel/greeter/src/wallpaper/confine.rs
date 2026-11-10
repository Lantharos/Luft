use std::collections::BTreeMap;

use seccompiler::{BpfProgram, SeccompAction, SeccompFilter, TargetArch, apply_filter};

const ALLOWED: [i64; 30] = [
    libc::SYS_brk,
    libc::SYS_clock_gettime,
    libc::SYS_clock_nanosleep,
    libc::SYS_clone,
    libc::SYS_clone3,
    libc::SYS_close,
    libc::SYS_exit,
    libc::SYS_exit_group,
    libc::SYS_futex,
    libc::SYS_getpid,
    libc::SYS_getrandom,
    libc::SYS_gettid,
    libc::SYS_madvise,
    libc::SYS_membarrier,
    libc::SYS_mmap,
    libc::SYS_mprotect,
    libc::SYS_mremap,
    libc::SYS_munmap,
    libc::SYS_nanosleep,
    libc::SYS_restart_syscall,
    libc::SYS_rseq,
    libc::SYS_rt_sigaction,
    libc::SYS_rt_sigprocmask,
    libc::SYS_rt_sigreturn,
    libc::SYS_sched_getaffinity,
    libc::SYS_sched_yield,
    libc::SYS_set_robust_list,
    libc::SYS_sigaltstack,
    libc::SYS_tgkill,
    libc::SYS_write,
];

pub fn to_memory_and_output() -> Result<(), String> {
    let allowed: BTreeMap<i64, Vec<_>> = ALLOWED.iter().map(|call| (*call, Vec::new())).collect();
    let filter = SeccompFilter::new(
        allowed,
        SeccompAction::Errno(libc::EPERM as u32),
        SeccompAction::Allow,
        TargetArch::try_from(std::env::consts::ARCH).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    let program: BpfProgram = filter
        .try_into()
        .map_err(|error: seccompiler::BackendError| error.to_string())?;
    apply_filter(&program).map_err(|error| format!("seccomp: {error}"))
}
