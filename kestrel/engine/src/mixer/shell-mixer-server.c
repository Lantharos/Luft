/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <pulse/glib-mainloop.h>

#include "shell-mixer-private.h"

#define RECONNECT_DELAY_SECONDS 1

struct _ShellMixerServer
{
  ShellMixer *mixer;
  pa_glib_mainloop *mainloop;
  pa_context *context;
  guint reconnect_id;
};

static void connect_to_server (ShellMixerServer *server);

static void
drop_operation (pa_operation *operation)
{
  g_clear_pointer (&operation, pa_operation_unref);
}

static GStrv
sink_port_names (const pa_sink_info *info)
{
  GStrvBuilder *builder = g_strv_builder_new ();
  GStrv names;

  for (guint32 i = 0; i < info->n_ports; i++)
    g_strv_builder_add (builder, info->ports[i]->name);

  names = g_strv_builder_end (builder);
  g_strv_builder_unref (builder);
  return names;
}

static GStrv
source_port_names (const pa_source_info *info)
{
  GStrvBuilder *builder = g_strv_builder_new ();
  GStrv names;

  for (guint32 i = 0; i < info->n_ports; i++)
    g_strv_builder_add (builder, info->ports[i]->name);

  names = g_strv_builder_end (builder);
  g_strv_builder_unref (builder);
  return names;
}

static void
on_sink_info (pa_context         *context,
              const pa_sink_info *info,
              int                 eol,
              gpointer            user_data)
{
  ShellMixerServer *server = user_data;
  g_auto (GStrv) ports = NULL;

  if (eol)
    return;

  ports = sink_port_names (info);
  _shell_mixer_update_stream (server->mixer, TRUE, info->index, &(ShellMixerStreamInfo) {
    .name = info->name,
    .description = info->description,
    .card = info->card,
    .form_factor = pa_proplist_gets (info->proplist, PA_PROP_DEVICE_FORM_FACTOR),
    .port = info->active_port ? info->active_port->name : NULL,
    .port_description = info->active_port ? info->active_port->description : NULL,
    .ports = ports,
    .volume = &info->volume,
    .muted = info->mute,
    .running = info->state == PA_SINK_RUNNING,
  });
}

static void
on_source_info (pa_context           *context,
                const pa_source_info *info,
                int                   eol,
                gpointer              user_data)
{
  ShellMixerServer *server = user_data;
  g_auto (GStrv) ports = NULL;

  if (eol || info->monitor_of_sink != PA_INVALID_INDEX)
    return;

  ports = source_port_names (info);
  _shell_mixer_update_stream (server->mixer, FALSE, info->index, &(ShellMixerStreamInfo) {
    .name = info->name,
    .description = info->description,
    .card = info->card,
    .form_factor = pa_proplist_gets (info->proplist, PA_PROP_DEVICE_FORM_FACTOR),
    .port = info->active_port ? info->active_port->name : NULL,
    .port_description = info->active_port ? info->active_port->description : NULL,
    .ports = ports,
    .volume = &info->volume,
    .muted = info->mute,
    .running = info->state == PA_SOURCE_RUNNING,
  });
}

static void
on_source_output_info (pa_context                  *context,
                       const pa_source_output_info *info,
                       int                          eol,
                       gpointer                     user_data)
{
  ShellMixerServer *server = user_data;

  if (!eol)
    _shell_mixer_update_recorder (server->mixer, info->index,
                                  pa_proplist_gets (info->proplist, PA_PROP_APPLICATION_ID));
}

static void
on_card_info (pa_context         *context,
              const pa_card_info *info,
              int                 eol,
              gpointer            user_data)
{
  ShellMixerServer *server = user_data;

  if (!eol)
    _shell_mixer_update_card (server->mixer, info);
}

static void
on_server_info (pa_context           *context,
                const pa_server_info *info,
                gpointer              user_data)
{
  ShellMixerServer *server = user_data;

  _shell_mixer_set_defaults (server->mixer, info->default_sink_name, info->default_source_name);
}

static void
on_event (pa_context                   *context,
          pa_subscription_event_type_t  event,
          guint32                       index,
          gpointer                      user_data)
{
  ShellMixerServer *server = user_data;
  ShellMixer *mixer = server->mixer;
  gboolean removed = (event & PA_SUBSCRIPTION_EVENT_TYPE_MASK) == PA_SUBSCRIPTION_EVENT_REMOVE;

  switch (event & PA_SUBSCRIPTION_EVENT_FACILITY_MASK)
    {
    case PA_SUBSCRIPTION_EVENT_SINK:
      if (removed)
        _shell_mixer_remove_stream (mixer, TRUE, index);
      else
        drop_operation (pa_context_get_sink_info_by_index (context, index, on_sink_info, server));
      break;
    case PA_SUBSCRIPTION_EVENT_SOURCE:
      if (removed)
        _shell_mixer_remove_stream (mixer, FALSE, index);
      else
        drop_operation (pa_context_get_source_info_by_index (context, index, on_source_info, server));
      break;
    case PA_SUBSCRIPTION_EVENT_SOURCE_OUTPUT:
      if (removed)
        _shell_mixer_remove_recorder (mixer, index);
      else
        drop_operation (pa_context_get_source_output_info (context, index, on_source_output_info, server));
      break;
    case PA_SUBSCRIPTION_EVENT_CARD:
      if (removed)
        _shell_mixer_remove_card (mixer, index);
      else
        drop_operation (pa_context_get_card_info_by_index (context, index, on_card_info, server));
      break;
    case PA_SUBSCRIPTION_EVENT_SERVER:
      drop_operation (pa_context_get_server_info (context, on_server_info, server));
      break;
    default:
      break;
    }
}

static gboolean
reconnect (gpointer user_data)
{
  ShellMixerServer *server = user_data;

  server->reconnect_id = 0;
  connect_to_server (server);
  return G_SOURCE_REMOVE;
}

static void
on_state (pa_context *context,
          gpointer    user_data)
{
  ShellMixerServer *server = user_data;

  switch (pa_context_get_state (context))
    {
    case PA_CONTEXT_READY:
      pa_context_set_subscribe_callback (context, on_event, server);
      drop_operation (pa_context_subscribe (context,
                                            PA_SUBSCRIPTION_MASK_SINK |
                                            PA_SUBSCRIPTION_MASK_SOURCE |
                                            PA_SUBSCRIPTION_MASK_SOURCE_OUTPUT |
                                            PA_SUBSCRIPTION_MASK_CARD |
                                            PA_SUBSCRIPTION_MASK_SERVER,
                                            NULL, NULL));
      drop_operation (pa_context_get_card_info_list (context, on_card_info, server));
      drop_operation (pa_context_get_sink_info_list (context, on_sink_info, server));
      drop_operation (pa_context_get_source_info_list (context, on_source_info, server));
      drop_operation (pa_context_get_source_output_info_list (context, on_source_output_info, server));
      drop_operation (pa_context_get_server_info (context, on_server_info, server));
      break;
    case PA_CONTEXT_FAILED:
    case PA_CONTEXT_TERMINATED:
      _shell_mixer_forget (server->mixer);
      if (!server->reconnect_id)
        {
          server->reconnect_id = g_timeout_add_seconds (RECONNECT_DELAY_SECONDS, reconnect, server);
          g_source_set_name_by_id (server->reconnect_id, "[kestrel] reconnect to the sound server");
        }
      break;
    default:
      break;
    }
}

static void
disconnect_from_server (ShellMixerServer *server)
{
  if (!server->context)
    return;

  pa_context_set_state_callback (server->context, NULL, NULL);
  pa_context_set_subscribe_callback (server->context, NULL, NULL);
  pa_context_disconnect (server->context);
  g_clear_pointer (&server->context, pa_context_unref);
}

static void
connect_to_server (ShellMixerServer *server)
{
  pa_proplist *properties = pa_proplist_new ();

  disconnect_from_server (server);

  pa_proplist_sets (properties, PA_PROP_APPLICATION_NAME, "Kestrel");
  pa_proplist_sets (properties, PA_PROP_APPLICATION_ID, "com.lantharos.Kestrel");
  server->context = pa_context_new_with_proplist (pa_glib_mainloop_get_api (server->mainloop), NULL, properties);
  pa_proplist_free (properties);

  pa_context_set_state_callback (server->context, on_state, server);
  if (pa_context_connect (server->context, NULL, PA_CONTEXT_NOFAIL, NULL) < 0)
    on_state (server->context, server);
}

ShellMixerServer *
_shell_mixer_server_new (ShellMixer *mixer)
{
  ShellMixerServer *server = g_new0 (ShellMixerServer, 1);

  server->mixer = mixer;
  server->mainloop = pa_glib_mainloop_new (NULL);
  connect_to_server (server);
  return server;
}

void
_shell_mixer_server_free (ShellMixerServer *server)
{
  g_clear_handle_id (&server->reconnect_id, g_source_remove);
  disconnect_from_server (server);
  pa_glib_mainloop_free (server->mainloop);
  g_free (server);
}

pa_context *
_shell_mixer_server_get_context (ShellMixerServer *server)
{
  return server->context;
}
