/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-mixer-private.h"

static gint
compare_indices (gconstpointer a,
                 gconstpointer b)
{
  guint32 first = GPOINTER_TO_UINT (*(gconstpointer *) a);
  guint32 second = GPOINTER_TO_UINT (*(gconstpointer *) b);

  return (first > second) - (first < second);
}

static GPtrArray *
sorted_keys (GHashTable *table)
{
  GPtrArray *keys = g_hash_table_get_keys_as_ptr_array (table);

  g_ptr_array_sort (keys, compare_indices);
  return keys;
}

static GPtrArray *
build_devices (ShellMixer *mixer,
               gboolean    output)
{
  pa_direction_t direction = output ? PA_DIRECTION_OUTPUT : PA_DIRECTION_INPUT;
  ShellMixerStream *current = output ? mixer->output : mixer->input;
  GHashTable *streams = _shell_mixer_streams_for (mixer, output);
  GPtrArray *devices = g_ptr_array_new_with_free_func (g_object_unref);
  g_autoptr (GPtrArray) cards = sorted_keys (mixer->cards);
  g_autoptr (GPtrArray) indices = sorted_keys (streams);

  for (guint i = 0; i < cards->len; i++)
    {
      ShellMixerCard *card = g_hash_table_lookup (mixer->cards, cards->pdata[i]);

      for (guint j = 0; j < card->ports->len; j++)
        {
          ShellMixerPort *port = card->ports->pdata[j];
          gboolean active;

          if (port->direction != direction ||
              port->available == PA_PORT_AVAILABLE_NO ||
              !port->profiles[0])
            continue;

          active = current &&
                   _shell_mixer_stream_get_card (current) == card->index &&
                   g_strcmp0 (shell_mixer_stream_get_port (current), port->name) == 0;
          g_ptr_array_add (devices, _shell_mixer_device_new (port->description, card->description,
                                                             card->icon_name, active,
                                                             card->index, port->name, NULL));
        }
    }

  for (guint i = 0; i < indices->len; i++)
    {
      ShellMixerStream *stream = g_hash_table_lookup (streams, indices->pdata[i]);
      ShellMixerCard *card = g_hash_table_lookup (mixer->cards,
                                                  GUINT_TO_POINTER (_shell_mixer_stream_get_card (stream)));

      if (card && _shell_mixer_card_has_ports (card, direction))
        continue;

      g_ptr_array_add (devices, _shell_mixer_device_new (shell_mixer_stream_get_description (stream), NULL,
                                                         output ? "audio-speakers" : "audio-input-microphone",
                                                         stream == current, PA_INVALID_INDEX, NULL,
                                                         _shell_mixer_stream_get_name (stream)));
    }

  return devices;
}

static gboolean
devices_equal (GPtrArray *devices,
               GPtrArray *others)
{
  if (devices->len != others->len)
    return FALSE;

  for (guint i = 0; i < devices->len; i++)
    if (!_shell_mixer_device_equal (devices->pdata[i], others->pdata[i]))
      return FALSE;

  return TRUE;
}

static gboolean
rebuild_devices (gpointer user_data)
{
  ShellMixer *mixer = user_data;

  mixer->devices_idle_id = 0;

  for (int output = 0; output < 2; output++)
    {
      g_autoptr (GPtrArray) devices = build_devices (mixer, output);

      if (devices_equal (devices, mixer->devices[output]))
        continue;

      g_ptr_array_unref (mixer->devices[output]);
      mixer->devices[output] = g_steal_pointer (&devices);
      g_signal_emit_by_name (mixer, "devices-changed", (gboolean) output);
    }

  return G_SOURCE_REMOVE;
}

void
_shell_mixer_queue_devices (ShellMixer *mixer)
{
  if (mixer->devices_idle_id)
    return;

  mixer->devices_idle_id = g_idle_add (rebuild_devices, mixer);
  g_source_set_name_by_id (mixer->devices_idle_id, "[kestrel] rebuild_devices");
}

/**
 * shell_mixer_get_devices:
 * @mixer: a #ShellMixer
 * @output: whether to list outputs rather than inputs
 *
 * Returns: (transfer container) (element-type ShellMixerDevice): the
 *   devices sound can play on or be recorded from
 */
GPtrArray *
shell_mixer_get_devices (ShellMixer *mixer,
                         gboolean    output)
{
  g_return_val_if_fail (SHELL_IS_MIXER (mixer), NULL);

  return g_ptr_array_ref (mixer->devices[!!output]);
}

void
shell_mixer_activate_device (ShellMixer       *mixer,
                             ShellMixerDevice *device)
{
  gboolean output;
  ShellMixerCard *card;
  ShellMixerStream *stream;
  const char *port;
  const char *profile;
  pa_operation *operation;

  g_return_if_fail (SHELL_IS_MIXER (mixer));
  g_return_if_fail (SHELL_IS_MIXER_DEVICE (device));

  output = g_ptr_array_find (mixer->devices[1], device, NULL);
  if (_shell_mixer_device_get_stream (device))
    {
      _shell_mixer_set_default (mixer, output, _shell_mixer_device_get_stream (device));
      return;
    }

  port = _shell_mixer_device_get_port (device);
  stream = _shell_mixer_stream_with_port (_shell_mixer_streams_for (mixer, output), _shell_mixer_device_get_card (device), port);
  if (stream)
    {
      _shell_mixer_select_port (mixer, output, stream, port);
      return;
    }

  card = g_hash_table_lookup (mixer->cards, GUINT_TO_POINTER (_shell_mixer_device_get_card (device)));
  profile = card ? _shell_mixer_card_best_profile (card, port) : NULL;
  if (!profile)
    return;

  g_set_str (&mixer->pending_port, port);
  mixer->pending_card = card->index;
  mixer->pending_output = output;
  operation = pa_context_set_card_profile_by_index (_shell_mixer_get_context (mixer), card->index, profile, NULL, NULL);
  g_clear_pointer (&operation, pa_operation_unref);
}
