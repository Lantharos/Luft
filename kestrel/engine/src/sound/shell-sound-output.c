/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>

#include "shell-sound-private.h"

#define QUANTUM "512/48000"
#define IDLE_TIMEOUT_NS (500 * SPA_NSEC_PER_MSEC)
#define SAMPLE_SCALE (1.0f / 32768.0f)

typedef struct
{
  ShellSoundClip *clip;
  gsize position;
  gint64 queued_us;
  gboolean started;
} Voice;

typedef struct
{
  ShellSoundOutput *output;
  char *name;
  gint64 latency_us;
} Started;

struct _ShellSoundOutput
{
  ShellSoundStartedFunc started;
  gpointer user_data;

  struct pw_thread_loop *loop;
  struct pw_context *context;
  struct pw_core *core;
  struct pw_stream *stream;
  struct spa_hook core_listener;
  struct spa_hook stream_listener;
  struct spa_source *idle_timer;
  gboolean idle_armed;

  GArray *voices;
  gboolean active;
  gboolean broken;
};

static void
voice_clear (Voice *voice)
{
  g_clear_pointer (&voice->clip, _shell_sound_clip_unref);
}

static gboolean
emit_started (gpointer data)
{
  Started *started = data;

  started->output->started (started->name, started->latency_us, started->output->user_data);
  return G_SOURCE_REMOVE;
}

static void
started_free (gpointer data)
{
  Started *started = data;

  g_free (started->name);
  g_free (started);
}

static void
report_started (ShellSoundOutput *output,
                Voice            *voice)
{
  Started *started = g_new0 (Started, 1);

  started->output = output;
  started->name = g_strdup (voice->clip->name);
  started->latency_us = g_get_monotonic_time () - voice->queued_us;
  g_idle_add_full (G_PRIORITY_DEFAULT, emit_started, started, started_free);
}

static void
mix (ShellSoundOutput *output,
     float            *destination,
     gsize             frames)
{
  memset (destination, 0, frames * SHELL_SOUND_CHANNELS * sizeof (float));

  for (guint i = 0; i < output->voices->len;)
    {
      Voice *voice = &g_array_index (output->voices, Voice, i);
      const gint16 *source = g_bytes_get_data (voice->clip->samples, NULL);
      gsize count = MIN (frames, voice->clip->frames - voice->position);

      source += voice->position * SHELL_SOUND_CHANNELS;
      for (gsize sample = 0; sample < count * SHELL_SOUND_CHANNELS; sample++)
        destination[sample] += source[sample] * SAMPLE_SCALE;

      if (!voice->started)
        {
          voice->started = TRUE;
          report_started (output, voice);
        }

      voice->position += count;
      if (voice->position >= voice->clip->frames)
        g_array_remove_index_fast (output->voices, i);
      else
        i++;
    }

  for (gsize sample = 0; sample < frames * SHELL_SOUND_CHANNELS; sample++)
    destination[sample] = CLAMP (destination[sample], -1.0f, 1.0f);
}

static void
on_process (void *data)
{
  ShellSoundOutput *output = data;
  struct pw_buffer *buffer;
  struct spa_data *block;
  gsize stride = SHELL_SOUND_CHANNELS * sizeof (float);
  gsize frames;

  buffer = pw_stream_dequeue_buffer (output->stream);
  if (!buffer)
    return;

  block = &buffer->buffer->datas[0];
  if (!block->data)
    return;

  frames = block->maxsize / stride;
  if (buffer->requested)
    frames = MIN (buffer->requested, frames);

  mix (output, block->data, frames);

  block->chunk->offset = 0;
  block->chunk->stride = stride;
  block->chunk->size = frames * stride;
  pw_stream_queue_buffer (output->stream, buffer);

  if (output->voices->len == 0 && !output->idle_armed)
    {
      struct timespec timeout = { 0, IDLE_TIMEOUT_NS };

      pw_loop_update_timer (pw_thread_loop_get_loop (output->loop),
                            output->idle_timer, &timeout, NULL, false);
      output->idle_armed = TRUE;
    }
}

static void
on_idle (void     *data,
         uint64_t  expirations)
{
  ShellSoundOutput *output = data;

  output->idle_armed = FALSE;
  if (output->voices->len > 0 || !output->stream)
    return;

  pw_stream_set_active (output->stream, false);
  output->active = FALSE;
}

static void
on_stream_state_changed (void                 *data,
                         enum pw_stream_state  old,
                         enum pw_stream_state  state,
                         const char           *error)
{
  ShellSoundOutput *output = data;

  if (state == PW_STREAM_STATE_ERROR || state == PW_STREAM_STATE_UNCONNECTED)
    output->broken = TRUE;
}

static const struct pw_stream_events stream_events = {
  PW_VERSION_STREAM_EVENTS,
  .state_changed = on_stream_state_changed,
  .process = on_process,
};

static void
on_core_error (void       *data,
               uint32_t    id,
               int         seq,
               int         res,
               const char *message)
{
  ShellSoundOutput *output = data;

  if (id == PW_ID_CORE && res == -EPIPE)
    output->broken = TRUE;
}

static const struct pw_core_events core_events = {
  PW_VERSION_CORE_EVENTS,
  .error = on_core_error,
};

static void
disconnect (ShellSoundOutput *output)
{
  if (output->stream)
    {
      spa_hook_remove (&output->stream_listener);
      g_clear_pointer (&output->stream, pw_stream_destroy);
    }
  if (output->core)
    {
      spa_hook_remove (&output->core_listener);
      g_clear_pointer (&output->core, pw_core_disconnect);
    }
  g_array_set_size (output->voices, 0);
  output->active = FALSE;
  output->broken = FALSE;
}

static struct pw_properties *
stream_properties (void)
{
  return pw_properties_new (PW_KEY_MEDIA_TYPE, "Audio",
                            PW_KEY_MEDIA_CATEGORY, "Playback",
                            PW_KEY_MEDIA_ROLE, "Notification",
                            PW_KEY_MEDIA_NAME, "System sounds",
                            PW_KEY_APP_NAME, "Kestrel",
                            PW_KEY_APP_ID, "com.lantharos.Kestrel",
                            PW_KEY_NODE_NAME, "kestrel-sounds",
                            PW_KEY_NODE_DESCRIPTION, "System sounds",
                            PW_KEY_NODE_LATENCY, QUANTUM,
                            NULL);
}

static gboolean
connect_locked (ShellSoundOutput *output)
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

  if (output->broken)
    disconnect (output);
  if (output->stream)
    return TRUE;

  output->core = pw_context_connect (output->context, NULL, 0);
  if (!output->core)
    return FALSE;
  pw_core_add_listener (output->core, &output->core_listener, &core_events, output);

  output->stream = pw_stream_new (output->core, "System sounds", stream_properties ());
  pw_stream_add_listener (output->stream, &output->stream_listener, &stream_events, output);

  params[0] = spa_format_audio_raw_build (&builder, SPA_PARAM_EnumFormat, &format);
  if (pw_stream_connect (output->stream, PW_DIRECTION_OUTPUT, PW_ID_ANY,
                         PW_STREAM_FLAG_AUTOCONNECT |
                         PW_STREAM_FLAG_MAP_BUFFERS |
                         PW_STREAM_FLAG_INACTIVE,
                         params, 1) < 0)
    {
      disconnect (output);
      return FALSE;
    }

  return TRUE;
}

void
_shell_sound_output_connect (ShellSoundOutput *output)
{
  pw_thread_loop_lock (output->loop);
  connect_locked (output);
  pw_thread_loop_unlock (output->loop);
}

static Voice *
voice_for (ShellSoundOutput *output,
           ShellSoundClip   *clip)
{
  for (guint i = 0; i < output->voices->len; i++)
    {
      Voice *voice = &g_array_index (output->voices, Voice, i);

      if (voice->clip == clip)
        return voice;
    }

  g_array_set_size (output->voices, output->voices->len + 1);
  return &g_array_index (output->voices, Voice, output->voices->len - 1);
}

void
_shell_sound_output_play (ShellSoundOutput *output,
                          ShellSoundClip   *clip)
{
  Voice *voice;

  pw_thread_loop_lock (output->loop);

  if (connect_locked (output))
    {
      voice = voice_for (output, clip);
      if (voice->clip != clip)
        voice->clip = _shell_sound_clip_ref (clip);
      voice->position = 0;
      voice->queued_us = g_get_monotonic_time ();
      voice->started = FALSE;

      if (!output->active)
        {
          pw_stream_set_active (output->stream, true);
          output->active = TRUE;
        }
    }

  pw_thread_loop_unlock (output->loop);
}

ShellSoundOutput *
_shell_sound_output_new (ShellSoundStartedFunc started,
                         gpointer              user_data)
{
  ShellSoundOutput *output = g_new0 (ShellSoundOutput, 1);

  pw_init (NULL, NULL);

  output->started = started;
  output->user_data = user_data;
  output->voices = g_array_new (FALSE, TRUE, sizeof (Voice));
  g_array_set_clear_func (output->voices, (GDestroyNotify) voice_clear);

  output->loop = pw_thread_loop_new ("kestrel-sounds", NULL);
  output->context = pw_context_new (pw_thread_loop_get_loop (output->loop), NULL, 0);
  output->idle_timer = pw_loop_add_timer (pw_thread_loop_get_loop (output->loop), on_idle, output);
  pw_thread_loop_start (output->loop);

  return output;
}

void
_shell_sound_output_free (ShellSoundOutput *output)
{
  pw_thread_loop_lock (output->loop);
  disconnect (output);
  pw_loop_destroy_source (pw_thread_loop_get_loop (output->loop), output->idle_timer);
  pw_thread_loop_unlock (output->loop);

  pw_thread_loop_stop (output->loop);
  pw_context_destroy (output->context);
  pw_thread_loop_destroy (output->loop);
  g_array_unref (output->voices);
  g_free (output);
}
