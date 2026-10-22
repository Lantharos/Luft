/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-mixer-private.h"

#define PROP_SECURE_PID "pipewire.sec.pid"
#define PROP_PORTAL_APP_ID "pipewire.access.portal.app_id"

typedef struct
{
  ShellMixer *mixer;
  pa_proplist *stream;
  gboolean announced;
} PlaybackLookup;

static const char *
first_of (pa_proplist *first,
          pa_proplist *second,
          const char  *key)
{
  const char *value = first ? pa_proplist_gets (first, key) : NULL;

  return value || !second ? value : pa_proplist_gets (second, key);
}

static void
announce (ShellMixer  *mixer,
          pa_proplist *stream,
          pa_proplist *client)
{
  const char *pid = pa_proplist_gets (stream, PA_PROP_APPLICATION_PROCESS_ID);
  const char *app_id = first_of (client, stream, PROP_PORTAL_APP_ID);

  if (!pid)
    pid = first_of (client, NULL, PROP_SECURE_PID);
  if (!app_id)
    app_id = first_of (stream, client, PA_PROP_APPLICATION_ID);

  _shell_mixer_playback_started (mixer,
                                 pid ? (guint) g_ascii_strtoull (pid, NULL, 10) : 0,
                                 app_id,
                                 first_of (client, stream, PA_PROP_APPLICATION_PROCESS_BINARY),
                                 first_of (stream, client, PA_PROP_APPLICATION_NAME));
}

static void
on_client_info (pa_context           *context,
                const pa_client_info *info,
                int                   eol,
                gpointer              user_data)
{
  PlaybackLookup *lookup = user_data;

  if (!eol)
    {
      announce (lookup->mixer, lookup->stream, info->proplist);
      lookup->announced = TRUE;
      return;
    }

  if (!lookup->announced)
    announce (lookup->mixer, lookup->stream, NULL);
  pa_proplist_free (lookup->stream);
  g_free (lookup);
}

static void
look_up_client (ShellMixer               *mixer,
                const pa_sink_input_info *info)
{
  PlaybackLookup *lookup;
  pa_operation *operation;

  if (info->client == PA_INVALID_INDEX)
    {
      announce (mixer, info->proplist, NULL);
      return;
    }

  lookup = g_new0 (PlaybackLookup, 1);
  lookup->mixer = mixer;
  lookup->stream = pa_proplist_copy (info->proplist);
  operation = pa_context_get_client_info (_shell_mixer_get_context (mixer), info->client, on_client_info, lookup);
  g_clear_pointer (&operation, pa_operation_unref);
}

void
_shell_mixer_update_player (ShellMixer               *mixer,
                            const pa_sink_input_info *info,
                            gboolean                  announce_start)
{
  gpointer key = GUINT_TO_POINTER (info->index);
  gboolean was_playing = GPOINTER_TO_INT (g_hash_table_lookup (mixer->players, key));
  gboolean playing = !info->corked;

  g_hash_table_insert (mixer->players, key, GINT_TO_POINTER (playing));
  if (announce_start && playing && !was_playing)
    look_up_client (mixer, info);
}

void
_shell_mixer_remove_player (ShellMixer *mixer,
                            guint32     index)
{
  g_hash_table_remove (mixer->players, GUINT_TO_POINTER (index));
}
