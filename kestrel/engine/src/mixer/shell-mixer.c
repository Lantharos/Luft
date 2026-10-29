/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <meta/meta-context.h>
#include <string.h>

#include "shell-enum-types.h"
#include "shell-mixer-private.h"

#define AMPLIFIED_DB 11.0

enum
{
  PROP_0,
  PROP_OUTPUT,
  PROP_INPUT,
  PROP_RECORDING,
  PROP_DICTATING,
  N_PROPS
};

enum
{
  DEVICES_CHANGED,
  HEADSET_CHANGED,
  PLAYBACK_STARTED,
  N_SIGNALS
};

static GParamSpec *props[N_PROPS];
static guint signals[N_SIGNALS];

G_DEFINE_TYPE (ShellMixer, shell_mixer, G_TYPE_OBJECT)

void
_shell_mixer_headset_clear (ShellMixerHeadsetNames *names)
{
  g_clear_pointer (&names->headphones, g_free);
  g_clear_pointer (&names->headset_mic, g_free);
  g_clear_pointer (&names->headphone_mic, g_free);
  g_clear_pointer (&names->internal_mic, g_free);
  g_clear_pointer (&names->speaker, g_free);
}

GHashTable *
_shell_mixer_streams_for (ShellMixer *mixer,
                          gboolean    output)
{
  return output ? mixer->sinks : mixer->sources;
}

static ShellMixerStream *
stream_named (GHashTable *streams,
              const char *name)
{
  GHashTableIter iter;
  ShellMixerStream *stream;

  if (!name)
    return NULL;

  g_hash_table_iter_init (&iter, streams);
  while (g_hash_table_iter_next (&iter, NULL, (gpointer *) &stream))
    if (g_strcmp0 (_shell_mixer_stream_get_name (stream), name) == 0)
      return stream;

  return NULL;
}

ShellMixerStream *
_shell_mixer_stream_with_port (GHashTable *streams,
                               guint32     card,
                               const char *port)
{
  GHashTableIter iter;
  ShellMixerStream *stream;

  g_hash_table_iter_init (&iter, streams);
  while (g_hash_table_iter_next (&iter, NULL, (gpointer *) &stream))
    if (_shell_mixer_stream_get_card (stream) == card &&
        _shell_mixer_stream_has_port (stream, port))
      return stream;

  return NULL;
}

static void
sync_defaults (ShellMixer *mixer)
{
  ShellMixerStream *output = stream_named (mixer->sinks, mixer->default_sink);
  ShellMixerStream *input = stream_named (mixer->sources, mixer->default_source);

  if (g_set_object (&mixer->output, output))
    g_object_notify_by_pspec (G_OBJECT (mixer), props[PROP_OUTPUT]);
  if (g_set_object (&mixer->input, input))
    g_object_notify_by_pspec (G_OBJECT (mixer), props[PROP_INPUT]);

  _shell_mixer_queue_devices (mixer);
}

static guint
parent_of (guint pid)
{
  g_autofree char *path = g_strdup_printf ("/proc/%u/stat", pid);
  g_autofree char *stat = NULL;
  const char *end_of_name;

  if (!g_file_get_contents (path, &stat, NULL, NULL))
    return 0;

  end_of_name = strrchr (stat, ')');
  return end_of_name ? (guint) g_ascii_strtoull (end_of_name + strlen (") S "), NULL, 10) : 0;
}

static gboolean
dictates (ShellMixer *mixer,
          guint       pid)
{
  return mixer->dictation_pid && pid &&
         (pid == mixer->dictation_pid || parent_of (pid) == mixer->dictation_pid);
}

static gboolean
runs_level_meter (ShellMixer *mixer,
                  guint       pid)
{
  g_autofree char *app_id = NULL;
  g_autofree char *executable = NULL;
  char **program;

  if (!pid || !mixer->level_meters || !meta_process_identify_pid (pid, &app_id, &executable) || !executable)
    return FALSE;

  for (program = mixer->level_meters; *program; program++)
    if (g_str_equal (executable, *program) ||
        (g_str_has_suffix (*program, "/") && g_str_has_prefix (executable, *program)))
      return TRUE;

  return FALSE;
}

static void
sync_level_meter (ShellMixer *mixer,
                  gpointer    client,
                  guint       pid)
{
  if (runs_level_meter (mixer, pid))
    g_hash_table_add (mixer->level_meter_clients, client);
  else
    g_hash_table_remove (mixer->level_meter_clients, client);
}

static void
sync_recording (ShellMixer *mixer)
{
  gboolean recording = FALSE;
  gboolean dictating = FALSE;
  GHashTableIter iter;
  gpointer client;

  g_hash_table_iter_init (&iter, mixer->recorders);
  while (g_hash_table_iter_next (&iter, NULL, &client))
    {
      if (g_hash_table_contains (mixer->level_meter_clients, client))
        continue;
      if (dictates (mixer, GPOINTER_TO_UINT (g_hash_table_lookup (mixer->clients, client))))
        dictating = TRUE;
      else
        recording = TRUE;
    }

  if (mixer->recording != recording)
    {
      mixer->recording = recording;
      g_object_notify_by_pspec (G_OBJECT (mixer), props[PROP_RECORDING]);
    }
  if (mixer->dictating != dictating)
    {
      mixer->dictating = dictating;
      g_object_notify_by_pspec (G_OBJECT (mixer), props[PROP_DICTATING]);
    }
}

void
_shell_mixer_set_default (ShellMixer *mixer,
                          gboolean    output,
                          const char *name)
{
  pa_context *context = _shell_mixer_get_context (mixer);
  pa_operation *operation = output
    ? pa_context_set_default_sink (context, name, NULL, NULL)
    : pa_context_set_default_source (context, name, NULL, NULL);

  g_clear_pointer (&operation, pa_operation_unref);
}

void
_shell_mixer_select_port (ShellMixer       *mixer,
                          gboolean          output,
                          ShellMixerStream *stream,
                          const char       *port)
{
  _shell_mixer_stream_set_port (stream, port);
  _shell_mixer_set_default (mixer, output, _shell_mixer_stream_get_name (stream));
}

static void
resolve_pending (ShellMixer *mixer,
                 gboolean    output)
{
  ShellMixerStream *stream;

  if (!mixer->pending_port || mixer->pending_output != output)
    return;

  stream = _shell_mixer_stream_with_port (_shell_mixer_streams_for (mixer, output), mixer->pending_card, mixer->pending_port);
  if (!stream)
    return;

  _shell_mixer_select_port (mixer, output, stream, mixer->pending_port);
  g_clear_pointer (&mixer->pending_port, g_free);
}

static ShellMixerStream *
ensure_stream (ShellMixer *mixer,
               gboolean    output,
               guint32     index)
{
  GHashTable *streams = _shell_mixer_streams_for (mixer, output);
  ShellMixerStream *stream = g_hash_table_lookup (streams, GUINT_TO_POINTER (index));

  if (!stream)
    {
      stream = _shell_mixer_stream_new (mixer, output, index);
      g_hash_table_insert (streams, GUINT_TO_POINTER (index), stream);
    }

  return stream;
}

void
_shell_mixer_update_stream (ShellMixer                 *mixer,
                            gboolean                    output,
                            guint32                     index,
                            const ShellMixerStreamInfo *info)
{
  _shell_mixer_stream_update (ensure_stream (mixer, output, index), info);
  resolve_pending (mixer, output);
  sync_defaults (mixer);
}

void
_shell_mixer_remove_stream (ShellMixer *mixer,
                            gboolean    output,
                            guint32     index)
{
  if (!g_hash_table_remove (_shell_mixer_streams_for (mixer, output), GUINT_TO_POINTER (index)))
    return;

  sync_defaults (mixer);
}

void
_shell_mixer_update_card (ShellMixer         *mixer,
                          const pa_card_info *info)
{
  ShellMixerCard *card = _shell_mixer_card_new (info);

  g_hash_table_replace (mixer->cards, GUINT_TO_POINTER (info->index), card);
  _shell_mixer_track_headset (mixer, card);
  _shell_mixer_queue_devices (mixer);
}

void
_shell_mixer_remove_card (ShellMixer *mixer,
                          guint32     index)
{
  if (g_hash_table_remove (mixer->cards, GUINT_TO_POINTER (index)))
    _shell_mixer_queue_devices (mixer);
}

void
_shell_mixer_update_recorder (ShellMixer *mixer,
                              guint32     index,
                              guint32     client)
{
  g_hash_table_insert (mixer->recorders, GUINT_TO_POINTER (index), GUINT_TO_POINTER (client));
  sync_recording (mixer);
}

void
_shell_mixer_update_client (ShellMixer *mixer,
                            guint32     index,
                            guint       pid)
{
  g_hash_table_insert (mixer->clients, GUINT_TO_POINTER (index), GUINT_TO_POINTER (pid));
  sync_level_meter (mixer, GUINT_TO_POINTER (index), pid);
  sync_recording (mixer);
}

void
_shell_mixer_remove_client (ShellMixer *mixer,
                            guint32     index)
{
  g_hash_table_remove (mixer->level_meter_clients, GUINT_TO_POINTER (index));
  if (g_hash_table_remove (mixer->clients, GUINT_TO_POINTER (index)))
    sync_recording (mixer);
}

void
_shell_mixer_remove_recorder (ShellMixer *mixer,
                              guint32     index)
{
  if (g_hash_table_remove (mixer->recorders, GUINT_TO_POINTER (index)))
    sync_recording (mixer);
}

void
_shell_mixer_playback_started (ShellMixer *mixer,
                               guint       pid,
                               const char *app_id,
                               const char *binary,
                               const char *name)
{
  g_signal_emit (mixer, signals[PLAYBACK_STARTED], 0, pid, app_id, binary, name);
}

void
_shell_mixer_set_defaults (ShellMixer *mixer,
                           const char *sink,
                           const char *source)
{
  g_set_str (&mixer->default_sink, sink);
  g_set_str (&mixer->default_source, source);
  sync_defaults (mixer);
}

void
_shell_mixer_forget (ShellMixer *mixer)
{
  g_hash_table_remove_all (mixer->sinks);
  g_hash_table_remove_all (mixer->sources);
  g_hash_table_remove_all (mixer->cards);
  g_hash_table_remove_all (mixer->recorders);
  g_hash_table_remove_all (mixer->clients);
  g_hash_table_remove_all (mixer->level_meter_clients);
  g_hash_table_remove_all (mixer->players);
  g_clear_pointer (&mixer->default_sink, g_free);
  g_clear_pointer (&mixer->default_source, g_free);
  g_clear_pointer (&mixer->pending_port, g_free);
  mixer->headset_card = PA_INVALID_INDEX;
  _shell_mixer_headset_clear (&mixer->headset);
  sync_defaults (mixer);
  sync_recording (mixer);
}

static void
shell_mixer_get_property (GObject    *object,
                          guint       prop_id,
                          GValue     *value,
                          GParamSpec *pspec)
{
  ShellMixer *mixer = SHELL_MIXER (object);

  switch (prop_id)
    {
    case PROP_OUTPUT:
      g_value_set_object (value, mixer->output);
      break;
    case PROP_INPUT:
      g_value_set_object (value, mixer->input);
      break;
    case PROP_RECORDING:
      g_value_set_boolean (value, mixer->recording);
      break;
    case PROP_DICTATING:
      g_value_set_boolean (value, mixer->dictating);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    }
}

static void
shell_mixer_finalize (GObject *object)
{
  ShellMixer *mixer = SHELL_MIXER (object);

  g_clear_handle_id (&mixer->devices_idle_id, g_source_remove);
  g_clear_pointer (&mixer->server, _shell_mixer_server_free);
  g_clear_object (&mixer->output);
  g_clear_object (&mixer->input);
  g_hash_table_unref (mixer->sinks);
  g_hash_table_unref (mixer->sources);
  g_hash_table_unref (mixer->cards);
  g_hash_table_unref (mixer->recorders);
  g_hash_table_unref (mixer->clients);
  g_hash_table_unref (mixer->level_meter_clients);
  g_strfreev (mixer->level_meters);
  g_hash_table_unref (mixer->players);
  g_ptr_array_unref (mixer->devices[0]);
  g_ptr_array_unref (mixer->devices[1]);
  g_free (mixer->default_sink);
  g_free (mixer->default_source);
  g_free (mixer->pending_port);
  _shell_mixer_headset_clear (&mixer->headset);

  G_OBJECT_CLASS (shell_mixer_parent_class)->finalize (object);
}

static void
shell_mixer_class_init (ShellMixerClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->get_property = shell_mixer_get_property;
  object_class->finalize = shell_mixer_finalize;

  props[PROP_OUTPUT] =
    g_param_spec_object ("output", NULL, NULL, SHELL_TYPE_MIXER_STREAM,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_INPUT] =
    g_param_spec_object ("input", NULL, NULL, SHELL_TYPE_MIXER_STREAM,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_RECORDING] =
    g_param_spec_boolean ("recording", NULL, NULL, FALSE,
                          G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_DICTATING] =
    g_param_spec_boolean ("dictating", NULL, NULL, FALSE,
                          G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  g_object_class_install_properties (object_class, N_PROPS, props);

  signals[DEVICES_CHANGED] =
    g_signal_new ("devices-changed", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                  0, NULL, NULL, NULL, G_TYPE_NONE, 1, G_TYPE_BOOLEAN);
  signals[HEADSET_CHANGED] =
    g_signal_new ("headset-changed", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                  0, NULL, NULL, NULL, G_TYPE_NONE, 1, SHELL_TYPE_MIXER_HEADSET);

  /**
   * ShellMixer::playback-started:
   * @mixer: the #ShellMixer
   * @pid: the process that started playing, or 0 if unknown
   * @app_id: (nullable): the application's ID, if it gave one
   * @binary: (nullable): the process's executable name, if known
   * @name: (nullable): the application's name, if it gave one
   */
  signals[PLAYBACK_STARTED] =
    g_signal_new ("playback-started", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                  0, NULL, NULL, NULL, G_TYPE_NONE, 4,
                  G_TYPE_UINT, G_TYPE_STRING, G_TYPE_STRING, G_TYPE_STRING);
}

static void
shell_mixer_init (ShellMixer *mixer)
{
  mixer->sinks = g_hash_table_new_full (NULL, NULL, NULL, g_object_unref);
  mixer->sources = g_hash_table_new_full (NULL, NULL, NULL, g_object_unref);
  mixer->cards = g_hash_table_new_full (NULL, NULL, NULL, (GDestroyNotify) _shell_mixer_card_free);
  mixer->recorders = g_hash_table_new (NULL, NULL);
  mixer->clients = g_hash_table_new (NULL, NULL);
  mixer->level_meter_clients = g_hash_table_new (NULL, NULL);
  mixer->players = g_hash_table_new (NULL, NULL);
  mixer->devices[0] = g_ptr_array_new_with_free_func (g_object_unref);
  mixer->devices[1] = g_ptr_array_new_with_free_func (g_object_unref);
  mixer->headset_card = PA_INVALID_INDEX;
  mixer->server = _shell_mixer_server_new (mixer);
}

pa_context *
_shell_mixer_get_context (ShellMixer *mixer)
{
  return _shell_mixer_server_get_context (mixer->server);
}

/**
 * shell_mixer_get_default:
 *
 * Returns: (transfer none): the shell's connection to the sound server
 */
ShellMixer *
shell_mixer_get_default (void)
{
  static ShellMixer *mixer;

  if (!mixer)
    mixer = g_object_new (SHELL_TYPE_MIXER, NULL);

  return mixer;
}

/**
 * shell_mixer_get_max_amplified:
 *
 * Returns: the loudest level the volume can be raised to when going
 *   above 100% is allowed, where 1 is 100%
 */
double
shell_mixer_get_max_amplified (void)
{
  return (double) pa_sw_volume_from_dB (AMPLIFIED_DB) / PA_VOLUME_NORM;
}

/**
 * shell_mixer_get_output:
 * @mixer: a #ShellMixer
 *
 * Returns: (transfer none) (nullable): where sound plays by default
 */
ShellMixerStream *
shell_mixer_get_output (ShellMixer *mixer)
{
  g_return_val_if_fail (SHELL_IS_MIXER (mixer), NULL);

  return mixer->output;
}

/**
 * shell_mixer_get_input:
 * @mixer: a #ShellMixer
 *
 * Returns: (transfer none) (nullable): where sound is recorded from by default
 */
ShellMixerStream *
shell_mixer_get_input (ShellMixer *mixer)
{
  g_return_val_if_fail (SHELL_IS_MIXER (mixer), NULL);

  return mixer->input;
}

gboolean
shell_mixer_get_recording (ShellMixer *mixer)
{
  g_return_val_if_fail (SHELL_IS_MIXER (mixer), FALSE);

  return mixer->recording;
}

gboolean
shell_mixer_get_dictating (ShellMixer *mixer)
{
  g_return_val_if_fail (SHELL_IS_MIXER (mixer), FALSE);

  return mixer->dictating;
}

/**
 * shell_mixer_set_dictation_process:
 * @mixer: a #ShellMixer
 * @pid: the process that dictates for the shell, or 0 for none
 *
 * Counts what that process, or a program it started, records as dictation
 * rather than recording.
 * The process is known by the credentials the sound server took from its
 * connection, which only clients that connect to PipeWire directly carry.
 */
void
shell_mixer_set_dictation_process (ShellMixer *mixer,
                                   guint       pid)
{
  g_return_if_fail (SHELL_IS_MIXER (mixer));

  mixer->dictation_pid = pid;
  sync_recording (mixer);
}

/**
 * shell_mixer_set_level_meters:
 * @mixer: a #ShellMixer
 * @programs: (array zero-terminated=1) (nullable): the programs whose
 *   recording only shows the input level, each a path or a folder ending in /
 *
 * Leaves out of recording what those programs record when they run outside
 * a sandbox, judged from the credentials the sound server took from their
 * connection, which only clients that connect to PipeWire directly carry.
 */
void
shell_mixer_set_level_meters (ShellMixer         *mixer,
                              const char * const *programs)
{
  GHashTableIter iter;
  gpointer client, pid;

  g_return_if_fail (SHELL_IS_MIXER (mixer));

  g_strfreev (mixer->level_meters);
  mixer->level_meters = g_strdupv ((char **) programs);

  g_hash_table_iter_init (&iter, mixer->clients);
  while (g_hash_table_iter_next (&iter, &client, &pid))
    sync_level_meter (mixer, client, GPOINTER_TO_UINT (pid));
  sync_recording (mixer);
}
