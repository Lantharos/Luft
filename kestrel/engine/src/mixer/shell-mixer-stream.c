/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-mixer-private.h"

struct _ShellMixerStream
{
  GObject parent;

  ShellMixer *mixer;
  gboolean output;
  guint32 index;
  guint32 card;
  char *name;
  char *description;
  char *form_factor;
  char *port;
  char *port_description;
  GStrv ports;
  pa_cvolume volume;
  gboolean muted;
  gboolean running;
};

enum
{
  PROP_0,
  PROP_DESCRIPTION,
  PROP_PORT,
  PROP_PORT_DESCRIPTION,
  PROP_FORM_FACTOR,
  PROP_VOLUME,
  PROP_MUTED,
  PROP_RUNNING,
  N_PROPS
};

static GParamSpec *props[N_PROPS];

G_DEFINE_TYPE (ShellMixerStream, shell_mixer_stream, G_TYPE_OBJECT)

static void
shell_mixer_stream_finalize (GObject *object)
{
  ShellMixerStream *stream = SHELL_MIXER_STREAM (object);

  g_free (stream->name);
  g_free (stream->description);
  g_free (stream->form_factor);
  g_free (stream->port);
  g_free (stream->port_description);
  g_strfreev (stream->ports);

  G_OBJECT_CLASS (shell_mixer_stream_parent_class)->finalize (object);
}

static void
shell_mixer_stream_get_property (GObject    *object,
                                 guint       prop_id,
                                 GValue     *value,
                                 GParamSpec *pspec)
{
  ShellMixerStream *stream = SHELL_MIXER_STREAM (object);

  switch (prop_id)
    {
    case PROP_DESCRIPTION:
      g_value_set_string (value, stream->description);
      break;
    case PROP_PORT:
      g_value_set_string (value, stream->port);
      break;
    case PROP_PORT_DESCRIPTION:
      g_value_set_string (value, stream->port_description);
      break;
    case PROP_FORM_FACTOR:
      g_value_set_string (value, stream->form_factor);
      break;
    case PROP_VOLUME:
      g_value_set_double (value, shell_mixer_stream_get_volume (stream));
      break;
    case PROP_MUTED:
      g_value_set_boolean (value, stream->muted);
      break;
    case PROP_RUNNING:
      g_value_set_boolean (value, stream->running);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    }
}

static void
shell_mixer_stream_class_init (ShellMixerStreamClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->finalize = shell_mixer_stream_finalize;
  object_class->get_property = shell_mixer_stream_get_property;

  props[PROP_DESCRIPTION] =
    g_param_spec_string ("description", NULL, NULL, NULL,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_PORT] =
    g_param_spec_string ("port", NULL, NULL, NULL,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_PORT_DESCRIPTION] =
    g_param_spec_string ("port-description", NULL, NULL, NULL,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_FORM_FACTOR] =
    g_param_spec_string ("form-factor", NULL, NULL, NULL,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_VOLUME] =
    g_param_spec_double ("volume", NULL, NULL, 0, G_MAXDOUBLE, 0,
                         G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_MUTED] =
    g_param_spec_boolean ("muted", NULL, NULL, FALSE,
                          G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);
  props[PROP_RUNNING] =
    g_param_spec_boolean ("running", NULL, NULL, FALSE,
                          G_PARAM_READABLE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  g_object_class_install_properties (object_class, N_PROPS, props);
}

static void
shell_mixer_stream_init (ShellMixerStream *stream)
{
  pa_cvolume_init (&stream->volume);
}

ShellMixerStream *
_shell_mixer_stream_new (ShellMixer *mixer,
                         gboolean    output,
                         guint32     index)
{
  ShellMixerStream *stream = g_object_new (SHELL_TYPE_MIXER_STREAM, NULL);

  stream->mixer = mixer;
  stream->output = output;
  stream->index = index;
  return stream;
}

static void
update_string (ShellMixerStream *stream,
               char            **field,
               const char       *value,
               int               prop)
{
  if (g_set_str (field, value))
    g_object_notify_by_pspec (G_OBJECT (stream), props[prop]);
}

static void
update_boolean (ShellMixerStream *stream,
                gboolean         *field,
                gboolean          value,
                int               prop)
{
  if (*field == value)
    return;

  *field = value;
  g_object_notify_by_pspec (G_OBJECT (stream), props[prop]);
}

void
_shell_mixer_stream_update (ShellMixerStream           *stream,
                            const ShellMixerStreamInfo *info)
{
  g_object_freeze_notify (G_OBJECT (stream));

  g_set_str (&stream->name, info->name);
  stream->card = info->card;
  g_strfreev (stream->ports);
  stream->ports = g_strdupv (info->ports);

  update_string (stream, &stream->description, info->description, PROP_DESCRIPTION);
  update_string (stream, &stream->form_factor, info->form_factor, PROP_FORM_FACTOR);
  update_string (stream, &stream->port, info->port, PROP_PORT);
  update_string (stream, &stream->port_description, info->port_description, PROP_PORT_DESCRIPTION);
  update_boolean (stream, &stream->muted, info->muted, PROP_MUTED);
  update_boolean (stream, &stream->running, info->running, PROP_RUNNING);

  if (!pa_cvolume_equal (&stream->volume, info->volume))
    {
      stream->volume = *info->volume;
      g_object_notify_by_pspec (G_OBJECT (stream), props[PROP_VOLUME]);
    }

  g_object_thaw_notify (G_OBJECT (stream));
}

const char *
_shell_mixer_stream_get_name (ShellMixerStream *stream)
{
  return stream->name;
}

guint32
_shell_mixer_stream_get_card (ShellMixerStream *stream)
{
  return stream->card;
}

gboolean
_shell_mixer_stream_has_port (ShellMixerStream *stream,
                              const char       *port)
{
  return stream->ports && g_strv_contains ((const char * const *) stream->ports, port);
}

void
_shell_mixer_stream_set_port (ShellMixerStream *stream,
                              const char       *port)
{
  pa_context *context = _shell_mixer_get_context (stream->mixer);
  pa_operation *operation;

  if (g_strcmp0 (stream->port, port) == 0)
    return;

  operation = stream->output
    ? pa_context_set_sink_port_by_index (context, stream->index, port, NULL, NULL)
    : pa_context_set_source_port_by_index (context, stream->index, port, NULL, NULL);
  g_clear_pointer (&operation, pa_operation_unref);
}

const char *
shell_mixer_stream_get_description (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), NULL);

  return stream->description;
}

const char *
shell_mixer_stream_get_port (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), NULL);

  return stream->port;
}

const char *
shell_mixer_stream_get_port_description (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), NULL);

  return stream->port_description;
}

const char *
shell_mixer_stream_get_form_factor (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), NULL);

  return stream->form_factor;
}

double
shell_mixer_stream_get_volume (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), 0);

  if (!pa_cvolume_valid (&stream->volume))
    return 0;

  return (double) pa_cvolume_max (&stream->volume) / PA_VOLUME_NORM;
}

gboolean
shell_mixer_stream_get_muted (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), FALSE);

  return stream->muted;
}

gboolean
shell_mixer_stream_get_running (ShellMixerStream *stream)
{
  g_return_val_if_fail (SHELL_IS_MIXER_STREAM (stream), FALSE);

  return stream->running;
}

/**
 * shell_mixer_stream_set_volume:
 * @stream: a #ShellMixerStream
 * @volume: the new level, where 1 is the device's full volume
 *
 * Scales every channel so the loudest one plays at @volume, keeping the
 * balance between them.
 */
void
shell_mixer_stream_set_volume (ShellMixerStream *stream,
                               double            volume)
{
  pa_context *context;
  pa_operation *operation;
  pa_volume_t target;

  g_return_if_fail (SHELL_IS_MIXER_STREAM (stream));

  if (!pa_cvolume_valid (&stream->volume))
    return;

  target = (pa_volume_t) CLAMP (volume * PA_VOLUME_NORM, PA_VOLUME_MUTED, PA_VOLUME_MAX);
  if (pa_cvolume_max (&stream->volume) == target)
    return;

  pa_cvolume_scale (&stream->volume, target);
  g_object_notify_by_pspec (G_OBJECT (stream), props[PROP_VOLUME]);

  context = _shell_mixer_get_context (stream->mixer);
  operation = stream->output
    ? pa_context_set_sink_volume_by_index (context, stream->index, &stream->volume, NULL, NULL)
    : pa_context_set_source_volume_by_index (context, stream->index, &stream->volume, NULL, NULL);
  g_clear_pointer (&operation, pa_operation_unref);
}

void
shell_mixer_stream_set_muted (ShellMixerStream *stream,
                              gboolean          muted)
{
  pa_context *context;
  pa_operation *operation;

  g_return_if_fail (SHELL_IS_MIXER_STREAM (stream));

  if (stream->muted == !!muted)
    return;

  update_boolean (stream, &stream->muted, !!muted, PROP_MUTED);

  context = _shell_mixer_get_context (stream->mixer);
  operation = stream->output
    ? pa_context_set_sink_mute_by_index (context, stream->index, muted, NULL, NULL)
    : pa_context_set_source_mute_by_index (context, stream->index, muted, NULL, NULL);
  g_clear_pointer (&operation, pa_operation_unref);
}
