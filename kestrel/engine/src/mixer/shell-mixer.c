/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-enum-types.h"
#include "shell-mixer-private.h"

#define AMPLIFIED_DB 11.0

static const char * const level_meters[] = {
  "org.gnome.VolumeControl",
  "org.PulseAudio.pavucontrol",
  NULL,
};

enum
{
  PROP_0,
  PROP_OUTPUT,
  PROP_INPUT,
  PROP_RECORDING,
  N_PROPS
};

enum
{
  DEVICES_CHANGED,
  HEADSET_CHANGED,
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

static void
sync_recording (ShellMixer *mixer)
{
  gboolean recording = FALSE;
  GHashTableIter iter;
  gpointer value;

  g_hash_table_iter_init (&iter, mixer->recorders);
  while (!recording && g_hash_table_iter_next (&iter, NULL, &value))
    recording = GPOINTER_TO_INT (value);

  if (mixer->recording == recording)
    return;

  mixer->recording = recording;
  g_object_notify_by_pspec (G_OBJECT (mixer), props[PROP_RECORDING]);
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
                              const char *app_id)
{
  g_hash_table_insert (mixer->recorders, GUINT_TO_POINTER (index),
                       GINT_TO_POINTER (!app_id || !g_strv_contains (level_meters, app_id)));
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
  g_object_class_install_properties (object_class, N_PROPS, props);

  signals[DEVICES_CHANGED] =
    g_signal_new ("devices-changed", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                  0, NULL, NULL, NULL, G_TYPE_NONE, 1, G_TYPE_BOOLEAN);
  signals[HEADSET_CHANGED] =
    g_signal_new ("headset-changed", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                  0, NULL, NULL, NULL, G_TYPE_NONE, 1, SHELL_TYPE_MIXER_HEADSET);
}

static void
shell_mixer_init (ShellMixer *mixer)
{
  mixer->sinks = g_hash_table_new_full (NULL, NULL, NULL, g_object_unref);
  mixer->sources = g_hash_table_new_full (NULL, NULL, NULL, g_object_unref);
  mixer->cards = g_hash_table_new_full (NULL, NULL, NULL, (GDestroyNotify) _shell_mixer_card_free);
  mixer->recorders = g_hash_table_new (NULL, NULL);
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
