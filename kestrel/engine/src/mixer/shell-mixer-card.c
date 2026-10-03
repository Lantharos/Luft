/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-mixer-private.h"

static int
compare_profiles (gconstpointer a,
                  gconstpointer b)
{
  const pa_card_profile_info2 *first = *(pa_card_profile_info2 * const *) a;
  const pa_card_profile_info2 *second = *(pa_card_profile_info2 * const *) b;

  return (second->priority > first->priority) - (second->priority < first->priority);
}

static GStrv
available_profiles (const pa_card_port_info *info)
{
  g_autoptr (GPtrArray) profiles = g_ptr_array_new ();
  GStrvBuilder *names = g_strv_builder_new ();
  GStrv result;

  for (guint32 i = 0; i < info->n_profiles; i++)
    if (info->profiles2[i]->available)
      g_ptr_array_add (profiles, info->profiles2[i]);

  g_ptr_array_sort (profiles, compare_profiles);
  for (guint i = 0; i < profiles->len; i++)
    g_strv_builder_add (names, ((pa_card_profile_info2 *) profiles->pdata[i])->name);

  result = g_strv_builder_end (names);
  g_strv_builder_unref (names);
  return result;
}

static void
port_free (ShellMixerPort *port)
{
  g_free (port->name);
  g_free (port->description);
  g_free (port->group);
  g_strfreev (port->profiles);
  g_free (port);
}

ShellMixerCard *
_shell_mixer_card_new (const pa_card_info *info)
{
  ShellMixerCard *card = g_new0 (ShellMixerCard, 1);
  const char *description = pa_proplist_gets (info->proplist, PA_PROP_DEVICE_DESCRIPTION);
  const char *icon_name = pa_proplist_gets (info->proplist, PA_PROP_DEVICE_ICON_NAME);

  card->index = info->index;
  card->description = g_strdup (description ? description : info->name);
  card->icon_name = g_strdup (icon_name ? icon_name : "audio-card");
  card->ports = g_ptr_array_new_with_free_func ((GDestroyNotify) port_free);

  for (guint32 i = 0; i < info->n_ports; i++)
    {
      const pa_card_port_info *source = info->ports[i];
      ShellMixerPort *port = g_new0 (ShellMixerPort, 1);

      port->name = g_strdup (source->name);
      port->description = g_strdup (source->description);
      port->direction = source->direction;
      port->available = source->available;
      port->type = source->type;
      port->group = g_strdup (source->availability_group);
      port->priority = source->priority;
      port->profiles = available_profiles (source);
      g_ptr_array_add (card->ports, port);
    }

  return card;
}

void
_shell_mixer_card_free (ShellMixerCard *card)
{
  g_free (card->description);
  g_free (card->icon_name);
  g_ptr_array_unref (card->ports);
  g_free (card);
}

gboolean
_shell_mixer_card_has_ports (ShellMixerCard *card,
                             pa_direction_t  direction)
{
  for (guint i = 0; i < card->ports->len; i++)
    if (((ShellMixerPort *) card->ports->pdata[i])->direction == direction)
      return TRUE;

  return FALSE;
}

const char *
_shell_mixer_card_best_profile (ShellMixerCard *card,
                                const char     *name)
{
  for (guint i = 0; i < card->ports->len; i++)
    {
      ShellMixerPort *port = card->ports->pdata[i];

      if (g_strcmp0 (port->name, name) == 0)
        return port->profiles[0];
    }

  return NULL;
}

static void
prefer (const ShellMixerPort **chosen,
        const ShellMixerPort  *port)
{
  if (!*chosen || (*chosen)->priority < port->priority)
    *chosen = port;
}

void
_shell_mixer_card_headset_ports (ShellMixerCard         *card,
                                 ShellMixerHeadsetPorts *ports)
{
  *ports = (ShellMixerHeadsetPorts) { 0 };

  for (guint i = 0; i < card->ports->len; i++)
    {
      ShellMixerPort *port = card->ports->pdata[i];

      if (port->type == PA_DEVICE_PORT_TYPE_HEADPHONES && port->group)
        prefer (&ports->headphones, port);
      else if (port->type == PA_DEVICE_PORT_TYPE_SPEAKER)
        prefer (&ports->speaker, port);
      else if (port->type == PA_DEVICE_PORT_TYPE_MIC && !port->group)
        prefer (&ports->internal_mic, port);
    }

  if (!ports->headphones)
    return;

  for (guint i = 0; i < card->ports->len; i++)
    {
      ShellMixerPort *port = card->ports->pdata[i];

      if (port->direction != PA_DIRECTION_INPUT ||
          g_strcmp0 (port->group, ports->headphones->group) != 0)
        continue;

      if (port->type == PA_DEVICE_PORT_TYPE_HEADSET)
        prefer (&ports->headset_mic, port);
      else if (port->type == PA_DEVICE_PORT_TYPE_MIC)
        prefer (&ports->headphone_mic, port);
    }
}
