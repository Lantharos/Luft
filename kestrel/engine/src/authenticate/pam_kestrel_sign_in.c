#define _GNU_SOURCE

#include <errno.h>
#include <fcntl.h>
#include <poll.h>
#include <security/pam_ext.h>
#include <security/pam_modules.h>
#include <signal.h>
#include <spawn.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

#define METHOD_QUESTION "Sign in with (fingerprint/password): "
#define FINGERPRINT_QUESTION "Touch the fingerprint reader, or type password: "
#define VERIFIED "kestrel-fingerprint-verified"
#define READY_TIMEOUT_MS 10000
#define ROUND_MS 400

static char *
ask (pam_handle_t *handle,
     const char   *question)
{
  char *answer = NULL;

  if (pam_prompt (handle, PAM_PROMPT_ECHO_ON, &answer, "%s", question) != PAM_SUCCESS)
    return NULL;
  return answer ? answer : strdup ("");
}

static bool
answered (char       *answer,
          const char *expected)
{
  bool same = strcmp (answer, expected) == 0;

  free (answer);
  return same;
}

static int
wait_readable (int fd,
               int timeout_ms)
{
  struct pollfd poll_fd = { .fd = fd, .events = POLLIN };
  int ready;

  while ((ready = poll (&poll_fd, 1, timeout_ms)) < 0 && errno == EINTR)
    ;
  return ready;
}

static bool
reap (pid_t pid)
{
  int status;

  while (waitpid (pid, &status, 0) < 0)
    if (errno != EINTR)
      return false;
  return WIFEXITED (status) && WEXITSTATUS (status) == 0;
}

static void
stop (pid_t pid)
{
  kill (pid, SIGTERM);
  reap (pid);
}

static bool
listening (int fd)
{
  char byte;

  return wait_readable (fd, READY_TIMEOUT_MS) > 0 && read (fd, &byte, 1) == 1;
}

static bool
exited (int fd)
{
  char drained[64];

  if (wait_readable (fd, ROUND_MS) <= 0)
    return false;
  return read (fd, drained, sizeof drained) == 0;
}

static int
verify_fingerprint (pam_handle_t *handle,
                    const char   *user)
{
  char *const argv[] = { (char *) KESTREL_AUTHENTICATE, (char *) "--fingerprint", (char *) user, NULL };
  char *const envp[] = { NULL };
  posix_spawn_file_actions_t actions;
  int status = PAM_IGNORE;
  int pipe_fds[2];
  pid_t pid;

  if (pipe2 (pipe_fds, O_CLOEXEC) != 0)
    return PAM_IGNORE;

  posix_spawn_file_actions_init (&actions);
  posix_spawn_file_actions_addopen (&actions, STDIN_FILENO, "/dev/null", O_RDONLY, 0);
  posix_spawn_file_actions_adddup2 (&actions, pipe_fds[1], STDOUT_FILENO);
  posix_spawn_file_actions_addclosefrom_np (&actions, STDERR_FILENO + 1);
  if (posix_spawn (&pid, KESTREL_AUTHENTICATE, &actions, NULL, argv, envp) != 0)
    pid = 0;
  posix_spawn_file_actions_destroy (&actions);
  close (pipe_fds[1]);

  if (pid && !listening (pipe_fds[0]))
    {
      stop (pid);
      pid = 0;
    }

  while (pid)
    {
      char *answer = ask (handle, FINGERPRINT_QUESTION);

      if (!answer)
        {
          stop (pid);
          status = PAM_CONV_ERR;
          break;
        }
      if (answered (answer, "password"))
        {
          stop (pid);
          break;
        }
      if (exited (pipe_fds[0]))
        {
          status = reap (pid) ? PAM_SUCCESS : PAM_IGNORE;
          break;
        }
    }

  close (pipe_fds[0]);
  return status;
}

static int
verified (pam_handle_t *handle)
{
  const void *data = NULL;

  return pam_get_data (handle, VERIFIED, &data) == PAM_SUCCESS ? PAM_SUCCESS : PAM_IGNORE;
}

PAM_EXTERN int
pam_sm_authenticate (pam_handle_t  *handle,
                     int            flags,
                     int            argc,
                     const char   **argv)
{
  const char *user = NULL;
  char *answer;
  int status;

  if (argc == 1 && strcmp (argv[0], "verified") == 0)
    return verified (handle);
  if (argc != 0)
    return PAM_SERVICE_ERR;

  if (pam_get_user (handle, &user, NULL) != PAM_SUCCESS || !user)
    return PAM_USER_UNKNOWN;
  answer = ask (handle, METHOD_QUESTION);
  if (!answer)
    return PAM_CONV_ERR;
  if (!answered (answer, "fingerprint"))
    return PAM_IGNORE;

  status = verify_fingerprint (handle, user);
  if (status == PAM_SUCCESS && pam_set_data (handle, VERIFIED, (void *) VERIFIED, NULL) != PAM_SUCCESS)
    return PAM_SERVICE_ERR;
  return status;
}

PAM_EXTERN int
pam_sm_setcred (pam_handle_t  *handle,
                int            flags,
                int            argc,
                const char   **argv)
{
  return verified (handle);
}
