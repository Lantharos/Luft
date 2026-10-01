#define _GNU_SOURCE

#include <errno.h>
#include <poll.h>
#include <pwd.h>
#include <security/pam_appl.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/socket.h>
#include <unistd.h>

#include "protocol.h"

#define PASSWORD_SERVICE "kestrel-unlock"
#define FINGERPRINT_SERVICE "kestrel-unlock-fingerprint"

typedef struct
{
  gboolean cancelled;
} Conversation;

static const char *
message_type (int style)
{
  switch (style)
    {
    case PAM_PROMPT_ECHO_OFF:
      return "secret";
    case PAM_PROMPT_ECHO_ON:
      return "visible";
    case PAM_ERROR_MSG:
      return "error";
    default:
      return "info";
    }
}

static gboolean
is_prompt (int style)
{
  return style == PAM_PROMPT_ECHO_OFF || style == PAM_PROMPT_ECHO_ON;
}

static void
discard_responses (struct pam_response *responses,
                   int                  count)
{
  for (int i = 0; i < count; i++)
    {
      if (responses[i].resp)
        {
          explicit_bzero (responses[i].resp, strlen (responses[i].resp));
          free (responses[i].resp);
        }
    }
  free (responses);
}

static int
converse (int                        count,
          const struct pam_message **messages,
          struct pam_response      **result,
          void                      *data)
{
  Conversation *conversation = data;
  struct pam_response *responses = calloc (count, sizeof *responses);

  for (int i = 0; i < count; i++)
    {
      g_autoptr (JsonObject) request = NULL;
      const char *type;

      protocol_reply_message (message_type (messages[i]->msg_style), messages[i]->msg);
      request = protocol_read ();
      if (!request)
        _exit (0);

      type = json_object_get_string_member_with_default (request, "type", "");
      if (strcmp (type, "post_auth_message_response") != 0)
        {
          conversation->cancelled = TRUE;
          discard_responses (responses, count);
          return PAM_CONV_ERR;
        }

      if (is_prompt (messages[i]->msg_style))
        responses[i].resp = strdup (json_object_get_string_member_with_default (request, "response", ""));
    }

  *result = responses;
  return PAM_SUCCESS;
}

static gboolean
is_authentication_failure (int status)
{
  return status == PAM_AUTH_ERR ||
         status == PAM_USER_UNKNOWN ||
         status == PAM_MAXTRIES ||
         status == PAM_CRED_INSUFFICIENT ||
         status == PAM_AUTHINFO_UNAVAIL;
}

static const char *
service_for_mode (const char *mode)
{
  if (strcmp (mode, "password") == 0)
    return PASSWORD_SERVICE;
  if (strcmp (mode, "fingerprint") == 0)
    return FINGERPRINT_SERVICE;
  return NULL;
}

static void
authenticate (const char *service,
              const char *user)
{
  Conversation conversation = { FALSE };
  const struct pam_conv conv = { converse, &conversation };
  pam_handle_t *handle;
  int status;

  status = pam_start (service, user, &conv, &handle);
  if (status != PAM_SUCCESS)
    {
      protocol_reply_error ("error", pam_strerror (NULL, status));
      return;
    }

  status = pam_authenticate (handle, 0);
  if (status == PAM_SUCCESS)
    status = pam_acct_mgmt (handle, 0);
  if (status == PAM_SUCCESS)
    pam_setcred (handle, PAM_REINITIALIZE_CRED);

  if (conversation.cancelled)
    protocol_reply_success ();
  else if (status == PAM_SUCCESS)
    protocol_reply_success ();
  else if (is_authentication_failure (status))
    protocol_reply_error ("auth_error", pam_strerror (handle, status));
  else
    protocol_reply_error ("error", pam_strerror (handle, status));

  pam_end (handle, status);
}

static char *
peer_account (void)
{
  struct ucred peer;
  socklen_t size = sizeof peer;
  struct passwd *account;

  if (getsockopt (STDIN_FILENO, SOL_SOCKET, SO_PEERCRED, &peer, &size) != 0)
    return NULL;

  account = getpwuid (peer.uid);
  return account ? g_strdup (account->pw_name) : NULL;
}

static gpointer
exit_when_peer_leaves (gpointer data)
{
  struct pollfd peer = { .fd = STDIN_FILENO, .events = POLLRDHUP };

  while (poll (&peer, 1, -1) < 0 && errno == EINTR)
    ;
  _exit (0);
}

int
main (void)
{
  g_autofree char *user = NULL;

  prctl (PR_SET_DUMPABLE, 0);
  user = peer_account ();
  if (!user)
    return 1;

  g_thread_unref (g_thread_new ("peer", exit_when_peer_leaves, NULL));

  for (;;)
    {
      g_autoptr (JsonObject) request = protocol_read ();
      const char *type;
      const char *service;

      if (!request)
        return 0;

      type = json_object_get_string_member_with_default (request, "type", "");
      service = service_for_mode (json_object_get_string_member_with_default (request, "mode", "password"));
      if (strcmp (type, "cancel_session") == 0)
        protocol_reply_success ();
      else if (strcmp (type, "create_session") != 0)
        protocol_reply_error ("error", "Unlocking only checks credentials");
      else if (g_strcmp0 (json_object_get_string_member_with_default (request, "username", ""), user) != 0)
        protocol_reply_error ("error", "Only the signed-in account can unlock this session");
      else if (!service)
        protocol_reply_error ("error", "Unknown way to unlock");
      else
        authenticate (service, user);
    }
}
