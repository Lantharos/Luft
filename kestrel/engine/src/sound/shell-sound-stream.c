/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>

#include "shell-sound-private.h"

struct pw_properties *
_shell_sound_stream_properties (const char *name,
                                const char *icon_name,
                                const char *quantum)
{
  return pw_properties_new (PW_KEY_MEDIA_TYPE, "Audio",
                            PW_KEY_MEDIA_CATEGORY, "Playback",
                            PW_KEY_MEDIA_ROLE, "Music",
                            PW_KEY_MEDIA_NAME, name,
                            PW_KEY_APP_NAME, name,
                            PW_KEY_APP_ID, "com.lantharos.Kestrel",
                            PW_KEY_APP_ICON_NAME, icon_name,
                            PW_KEY_NODE_DESCRIPTION, name,
                            PW_KEY_NODE_LATENCY, quantum,
                            NULL);
}

struct pw_stream *
_shell_sound_stream_connect (struct pw_core                *core,
                             const char                    *name,
                             struct pw_properties          *properties,
                             gboolean                       realtime,
                             struct spa_hook               *listener,
                             const struct pw_stream_events *events,
                             gpointer                       data)
{
  uint8_t pod[512];
  struct spa_pod_builder builder = SPA_POD_BUILDER_INIT (pod, sizeof (pod));
  const struct spa_pod *params[1];
  struct spa_audio_info_raw format = {
    .format = SPA_AUDIO_FORMAT_F32,
    .rate = SHELL_SOUND_RATE,
    .channels = SHELL_SOUND_CHANNELS,
    .position = { SPA_AUDIO_CHANNEL_FL, SPA_AUDIO_CHANNEL_FR },
  };
  enum pw_stream_flags flags = PW_STREAM_FLAG_AUTOCONNECT | PW_STREAM_FLAG_MAP_BUFFERS | PW_STREAM_FLAG_INACTIVE;
  struct pw_stream *stream = pw_stream_new (core, name, properties);

  if (realtime)
    flags |= PW_STREAM_FLAG_RT_PROCESS;

  pw_stream_add_listener (stream, listener, events, data);
  params[0] = spa_format_audio_raw_build (&builder, SPA_PARAM_EnumFormat, &format);
  if (pw_stream_connect (stream, PW_DIRECTION_OUTPUT, PW_ID_ANY, flags, params, 1) < 0)
    {
      spa_hook_remove (listener);
      pw_stream_destroy (stream);
      return NULL;
    }
  return stream;
}
