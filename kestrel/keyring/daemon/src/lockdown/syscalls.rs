use std::collections::BTreeMap;

use seccompiler::{
    BpfProgram, SeccompAction, SeccompCmpArgLen, SeccompCmpOp, SeccompCondition, SeccompFilter,
    SeccompRule, TargetArch, apply_filter,
};

const PRIVILEGED: &[libc::c_long] = &[
    libc::SYS_acct,
    libc::SYS_add_key,
    libc::SYS_adjtimex,
    libc::SYS_bpf,
    libc::SYS_chroot,
    libc::SYS_clock_adjtime,
    libc::SYS_clock_settime,
    libc::SYS_delete_module,
    libc::SYS_finit_module,
    libc::SYS_fsconfig,
    libc::SYS_fsmount,
    libc::SYS_fsopen,
    libc::SYS_fspick,
    libc::SYS_init_module,
    libc::SYS_io_uring_enter,
    libc::SYS_io_uring_register,
    libc::SYS_io_uring_setup,
    libc::SYS_ioperm,
    libc::SYS_iopl,
    libc::SYS_kcmp,
    libc::SYS_kexec_file_load,
    libc::SYS_kexec_load,
    libc::SYS_keyctl,
    libc::SYS_lookup_dcookie,
    libc::SYS_mount,
    libc::SYS_mount_setattr,
    libc::SYS_move_mount,
    libc::SYS_open_by_handle_at,
    libc::SYS_open_tree,
    libc::SYS_perf_event_open,
    libc::SYS_pidfd_getfd,
    libc::SYS_pivot_root,
    libc::SYS_process_madvise,
    libc::SYS_process_vm_readv,
    libc::SYS_process_vm_writev,
    libc::SYS_ptrace,
    libc::SYS_quotactl,
    libc::SYS_reboot,
    libc::SYS_request_key,
    libc::SYS_sched_setattr,
    libc::SYS_setdomainname,
    libc::SYS_setfsgid,
    libc::SYS_setfsuid,
    libc::SYS_setgid,
    libc::SYS_setgroups,
    libc::SYS_sethostname,
    libc::SYS_setns,
    libc::SYS_setregid,
    libc::SYS_setresgid,
    libc::SYS_setresuid,
    libc::SYS_setreuid,
    libc::SYS_settimeofday,
    libc::SYS_setuid,
    libc::SYS_swapoff,
    libc::SYS_swapon,
    libc::SYS_syslog,
    libc::SYS_umount2,
    libc::SYS_unshare,
    libc::SYS_uselib,
    libc::SYS_userfaultfd,
    libc::SYS_vhangup,
];
const NEW_NAMESPACES: [libc::c_int; 8] = [
    libc::CLONE_NEWCGROUP,
    libc::CLONE_NEWIPC,
    libc::CLONE_NEWNET,
    libc::CLONE_NEWNS,
    libc::CLONE_NEWPID,
    libc::CLONE_NEWTIME,
    libc::CLONE_NEWUSER,
    libc::CLONE_NEWUTS,
];
const REALTIME: [libc::c_int; 3] = [libc::SCHED_FIFO, libc::SCHED_RR, libc::SCHED_DEADLINE];
const LINUX_PERSONALITY: u64 = 0;
const PERSONALITY_QUERY: u64 = 0xffff_ffff;

type Rules = BTreeMap<i64, Vec<SeccompRule>>;

fn condition(argument: u8, operator: SeccompCmpOp, value: u64) -> SeccompCondition {
    SeccompCondition::new(argument, SeccompCmpArgLen::Qword, operator, value)
        .expect("a valid condition")
}

fn rule(conditions: Vec<SeccompCondition>) -> SeccompRule {
    SeccompRule::new(conditions).expect("a rule with conditions")
}

fn refused() -> Rules {
    let mut rules: Rules = PRIVILEGED.iter().map(|call| (*call, Vec::new())).collect();
    let namespaces = NEW_NAMESPACES.map(|flag| {
        let flag = flag as u64;
        rule(vec![condition(0, SeccompCmpOp::MaskedEq(flag), flag)])
    });
    rules.insert(libc::SYS_clone, namespaces.to_vec());
    let realtime = REALTIME.map(|policy| rule(vec![condition(1, SeccompCmpOp::Eq, policy as u64)]));
    rules.insert(libc::SYS_sched_setscheduler, realtime.to_vec());
    rules.insert(
        libc::SYS_personality,
        vec![rule(vec![
            condition(0, SeccompCmpOp::Ne, LINUX_PERSONALITY),
            condition(0, SeccompCmpOp::Ne, PERSONALITY_QUERY),
        ])],
    );
    rules
}

fn only_local_sockets() -> Rules {
    let other_families = rule(vec![condition(0, SeccompCmpOp::Ne, libc::AF_UNIX as u64)]);
    Rules::from([(libc::SYS_socket, vec![other_families])])
}

fn no_clone3() -> Rules {
    Rules::from([(libc::SYS_clone3, Vec::new())])
}

fn install(rules: Rules, errno: i32) -> Result<(), String> {
    let filter = SeccompFilter::new(
        rules,
        SeccompAction::Allow,
        SeccompAction::Errno(errno as u32),
        TargetArch::try_from(std::env::consts::ARCH).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    let program: BpfProgram = filter
        .try_into()
        .map_err(|error: seccompiler::BackendError| error.to_string())?;
    apply_filter(&program).map_err(|error| format!("seccomp: {error}"))
}

pub fn restrict() -> Result<(), String> {
    install(refused(), libc::EPERM)?;
    install(only_local_sockets(), libc::EAFNOSUPPORT)?;
    install(no_clone3(), libc::ENOSYS)
}
