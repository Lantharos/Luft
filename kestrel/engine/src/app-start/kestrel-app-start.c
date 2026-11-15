/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include <errno.h>
#include <fcntl.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <syslog.h>
#include <sys/resource.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

#include <systemd/sd-journal.h>

#include "app-start.h"

static const char *
take_variable (const char *name)
{
  const char *value = getenv (name);

  unsetenv (name);
  return value && *value ? value : NULL;
}

static void
write_file (const char *path,
            const char *value)
{
  int fd = open (path, O_WRONLY | O_CLOEXEC);

  if (fd < 0)
    return;
  while (write (fd, value, strlen (value)) < 0 && errno == EINTR)
    ;
  close (fd);
}

static void
restore_file_limit (const char *limit)
{
  struct rlimit current;
  char *end;
  unsigned long long soft = strtoull (limit, &end, 10);

  if (*end || getrlimit (RLIMIT_NOFILE, &current) != 0 || soft > current.rlim_max)
    return;
  current.rlim_cur = soft;
  setrlimit (RLIMIT_NOFILE, &current);
}

static void
join_cgroup (const char *cgroup)
{
  char procs[PATH_MAX];

  if (snprintf (procs, sizeof (procs), "%s/cgroup.procs", cgroup) < (int) sizeof (procs))
    write_file (procs, "0");
}

static int
writes_to_journal (int fd)
{
  union {
    struct sockaddr_storage storage;
    struct sockaddr sa;
    struct sockaddr_un un;
  } address = { 0 };
  socklen_t length = sizeof (address);

  return getpeername (fd, &address.sa, &length) == 0 && address.storage.ss_family == AF_UNIX &&
         (strncmp (address.un.sun_path, "/run/systemd/journal/", strlen ("/run/systemd/journal/")) == 0 ||
          strncmp (address.un.sun_path, "/run/systemd/journal.", strlen ("/run/systemd/journal.")) == 0);
}

static void
log_to_journal_as (const char *program)
{
  int to_stdout = writes_to_journal (STDOUT_FILENO);
  int to_stderr = writes_to_journal (STDERR_FILENO);
  const char *identifier = getenv ("GIO_LAUNCHED_DESKTOP_FILE");
  const char *slash;
  int fd;

  if (!to_stdout && !to_stderr)
    return;

  if (!identifier)
    identifier = program;
  slash = strrchr (identifier, '/');
  if (slash && slash[1])
    identifier = slash + 1;

  fd = sd_journal_stream_fd (identifier, LOG_INFO, 0);
  if (fd < 0)
    return;
  if (to_stdout)
    dup2 (fd, STDOUT_FILENO);
  if (to_stderr)
    dup2 (fd, STDERR_FILENO);
  close (fd);
}

int
main (int    argc,
      char **argv)
{
  const char *limit = take_variable (KESTREL_APP_FILE_LIMIT);
  const char *oom_score_adjust = take_variable (KESTREL_APP_OOM_SCORE_ADJUST);
  const char *cgroup = take_variable (KESTREL_APP_CGROUP);
  char pid[sizeof ("GIO_LAUNCHED_DESKTOP_FILE_PID=") + 20];

  if (argc < 2)
    {
      fprintf (stderr, "Usage: kestrel-app-start PROGRAM [ARGUMENT…]\n"
                       "Starts an app the way Kestrel launches it.\n");
      return 2;
    }

  if (limit)
    restore_file_limit (limit);
  if (oom_score_adjust)
    write_file ("/proc/self/oom_score_adj", oom_score_adjust);
  if (cgroup)
    join_cgroup (cgroup);

  snprintf (pid, sizeof (pid), "GIO_LAUNCHED_DESKTOP_FILE_PID=%ld", (long) getpid ());
  putenv (pid);
  log_to_journal_as (argv[1]);

  execvp (argv[1], argv + 1);
  fprintf (stderr, "kestrel-app-start: %s: %s\n", argv[1], strerror (errno));
  return 127;
}
