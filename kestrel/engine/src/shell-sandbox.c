/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#define _GNU_SOURCE

#include "config.h"

#include <errno.h>
#include <fcntl.h>
#include <gio/gio.h>
#include <linux/audit.h>
#include <linux/filter.h>
#include <linux/seccomp.h>
#include <stddef.h>
#include <sys/ioctl.h>
#include <sys/mman.h>
#include <sys/syscall.h>
#include <unistd.h>

#include "shell-sandbox.h"

#if defined (__x86_64__)
#define NATIVE_ARCH AUDIT_ARCH_X86_64
#elif defined (__aarch64__)
#define NATIVE_ARCH AUDIT_ARCH_AARCH64
#else
#error "Sandboxes have no system call filter for this architecture"
#endif

#define X32_SYSCALL_BIT 0x40000000

#define LOAD(field) BPF_STMT (BPF_LD | BPF_W | BPF_ABS, offsetof (struct seccomp_data, field))
#define ANSWER(action) BPF_STMT (BPF_RET | BPF_K, action)
#define REFUSE(error) ANSWER (SECCOMP_RET_ERRNO | (error))
#define JUMP_IF(value, yes, no) BPF_JUMP (BPF_JMP | BPF_JEQ | BPF_K, value, yes, no)

static const int refused[] = {
  SYS_ptrace, SYS_process_vm_readv, SYS_process_vm_writev, SYS_kcmp, SYS_pidfd_getfd,
  SYS_mount, SYS_umount2, SYS_pivot_root, SYS_chroot, SYS_unshare, SYS_setns,
  SYS_open_tree, SYS_move_mount, SYS_fsopen, SYS_fsconfig, SYS_fsmount, SYS_fspick, SYS_mount_setattr,
  SYS_open_by_handle_at, SYS_name_to_handle_at,
  SYS_bpf, SYS_perf_event_open, SYS_userfaultfd,
  SYS_io_uring_setup, SYS_io_uring_enter, SYS_io_uring_register,
  SYS_add_key, SYS_request_key, SYS_keyctl,
  SYS_init_module, SYS_finit_module, SYS_delete_module, SYS_kexec_load, SYS_kexec_file_load,
  SYS_reboot, SYS_swapon, SYS_swapoff, SYS_acct, SYS_quotactl, SYS_syslog, SYS_personality,
};

static const unsigned int refused_requests[] = { TIOCSTI, TIOCLINUX };

/**
 * shell_sandbox_filter:
 * @error: return location for a #GError
 *
 * Writes the system call filter Kestrel's sandboxes run under, such as the one
 * an extension from the person's own folder runs in, to a sealed file in memory,
 * for `bwrap --seccomp`. It refuses what reaches past the sandbox or weakens
 * it: other processes' memory, mounts and namespaces, the kernel's keyrings,
 * modules and logs, faking input on a terminal, and the kernel interfaces
 * sandboxed code has no use for.
 *
 * Returns: a file descriptor at the start of the filter, which the caller owns,
 *   or -1 with @error set
 */
int
shell_sandbox_filter (GError **error)
{
  struct sock_filter filter[G_N_ELEMENTS (refused) + G_N_ELEMENTS (refused_requests) + 16];
  gsize length = 0;
  int fd;

  filter[length++] = (struct sock_filter) LOAD (arch);
  filter[length++] = (struct sock_filter) JUMP_IF (NATIVE_ARCH, 1, 0);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_KILL_PROCESS);
  filter[length++] = (struct sock_filter) LOAD (nr);
  filter[length++] = (struct sock_filter) BPF_JUMP (BPF_JMP | BPF_JGE | BPF_K, X32_SYSCALL_BIT, 0, 1);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_KILL_PROCESS);
  filter[length++] = (struct sock_filter) JUMP_IF (SYS_ioctl, 0, G_N_ELEMENTS (refused_requests) + 2);
  filter[length++] = (struct sock_filter) LOAD (args[1]);
  for (gsize i = 0; i < G_N_ELEMENTS (refused_requests); i++)
    filter[length++] = (struct sock_filter) JUMP_IF (refused_requests[i], G_N_ELEMENTS (refused_requests) - i + G_N_ELEMENTS (refused) + 1, 0);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_ALLOW);
  for (gsize i = 0; i < G_N_ELEMENTS (refused); i++)
    filter[length++] = (struct sock_filter) JUMP_IF (refused[i], G_N_ELEMENTS (refused) - i, 0);
  filter[length++] = (struct sock_filter) ANSWER (SECCOMP_RET_ALLOW);
  filter[length++] = (struct sock_filter) REFUSE (EPERM);

  fd = memfd_create ("kestrel-sandbox-filter", MFD_CLOEXEC | MFD_ALLOW_SEALING);
  if (fd < 0 ||
      write (fd, filter, length * sizeof (struct sock_filter)) != (gssize) (length * sizeof (struct sock_filter)) ||
      fcntl (fd, F_ADD_SEALS, F_SEAL_SHRINK | F_SEAL_GROW | F_SEAL_WRITE | F_SEAL_SEAL) < 0 ||
      lseek (fd, 0, SEEK_SET) < 0)
    {
      int saved = errno;

      if (fd >= 0)
        close (fd);
      g_set_error (error, G_IO_ERROR, g_io_error_from_errno (saved), "The sandbox's system call filter couldn't be written: %s", g_strerror (saved));
      return -1;
    }

  return fd;
}
