/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "confine.h"

#include <errno.h>
#include <linux/audit.h>
#include <linux/filter.h>
#include <linux/sched.h>
#include <linux/seccomp.h>
#include <stddef.h>
#include <sys/prctl.h>
#include <sys/resource.h>
#include <sys/syscall.h>
#include <unistd.h>

#if defined (__x86_64__)
#define NATIVE_ARCH AUDIT_ARCH_X86_64
#elif defined (__aarch64__)
#define NATIVE_ARCH AUDIT_ARCH_AARCH64
#else
#error "The sound decoder has no system call filter for this architecture"
#endif

#define X32_SYSCALL_BIT 0x40000000
#define MEMORY_LIMIT ((rlim_t) 1 << 30)

#define LOAD(field) BPF_STMT (BPF_LD | BPF_W | BPF_ABS, offsetof (struct seccomp_data, field))
#define ANSWER(action) BPF_STMT (BPF_RET | BPF_K, action)
#define REFUSE(error) ANSWER (SECCOMP_RET_ERRNO | (error))

static const int refused[] = {
  SYS_execve, SYS_execveat,
#ifdef SYS_fork
  SYS_fork, SYS_vfork,
#endif
  SYS_socket, SYS_connect, SYS_bind, SYS_listen, SYS_accept, SYS_accept4,
  SYS_ptrace, SYS_process_vm_readv, SYS_process_vm_writev, SYS_kcmp,
  SYS_pidfd_open, SYS_pidfd_getfd, SYS_pidfd_send_signal,
  SYS_mount, SYS_umount2, SYS_pivot_root, SYS_chroot, SYS_unshare, SYS_setns,
  SYS_open_tree, SYS_move_mount, SYS_fsopen, SYS_fsconfig, SYS_fsmount, SYS_fspick, SYS_mount_setattr,
  SYS_open_by_handle_at, SYS_name_to_handle_at,
  SYS_bpf, SYS_perf_event_open, SYS_userfaultfd,
  SYS_io_uring_setup, SYS_io_uring_enter, SYS_io_uring_register,
  SYS_add_key, SYS_request_key, SYS_keyctl,
  SYS_init_module, SYS_finit_module, SYS_delete_module, SYS_kexec_load, SYS_kexec_file_load,
  SYS_reboot, SYS_swapon, SYS_swapoff, SYS_acct, SYS_quotactl, SYS_syslog, SYS_personality,
  SYS_setuid, SYS_setgid, SYS_setreuid, SYS_setregid, SYS_setresuid, SYS_setresgid, SYS_setgroups,
};

static gboolean
filter_system_calls (void)
{
  struct sock_filter filter[G_N_ELEMENTS (refused) + 16];
  struct sock_fprog program = { .filter = filter };
  gsize length = 0;

  filter[length++] = (struct sock_filter) LOAD (arch);
  filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JEQ | BPF_K, NATIVE_ARCH, 1, 0);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_KILL_PROCESS);
  filter[length++] = (struct sock_filter) LOAD (nr);
  filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JGE | BPF_K, X32_SYSCALL_BIT, 0, 1);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_KILL_PROCESS);
  filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JEQ | BPF_K, SYS_clone3, 0, 1);
  filter[length++] = (struct sock_filter) REFUSE (ENOSYS);
  filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JEQ | BPF_K, SYS_clone, 0, 4);
  filter[length++] = (struct sock_filter) LOAD (args[0]);
  filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JSET | BPF_K, CLONE_THREAD, 1, 0);
  filter[length++] = (struct sock_filter) REFUSE (EPERM);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_ALLOW);
  for (gsize i = 0; i < G_N_ELEMENTS (refused); i++)
    filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JEQ | BPF_K, refused[i],
                                                      G_N_ELEMENTS (refused) - i, 0);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_ALLOW);
  filter[length++] = (struct sock_filter) REFUSE (EPERM);

  program.len = length;
  return prctl (PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) == 0 &&
         syscall (SYS_seccomp, SECCOMP_SET_MODE_FILTER, SECCOMP_FILTER_FLAG_TSYNC, &program) == 0;
}

gboolean
confine_to_decoding (void)
{
  struct rlimit memory = { MEMORY_LIMIT, MEMORY_LIMIT };

  return setrlimit (RLIMIT_AS, &memory) == 0 && filter_system_calls ();
}
