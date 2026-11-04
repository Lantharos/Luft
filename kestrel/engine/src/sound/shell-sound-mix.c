/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>

#include "shell-sound-mix.h"
#include "shell-sound-private.h"

#define QUANTUM "1024/48000"
#define IDLE_TIMEOUT_NS (500 * SPA_NSEC_PER_MSEC)
#define SAMPLE_SCALE (1.0f / 32768.0f)
#define CACHE_LIMIT_BYTES (96 * 1024 * 1024)

/**
 * ShellSoundMix:
 *
 * The sounds one extension plays, mixed into one playback stream with its
 * name, each with its own volume and fades, looping without a gap if asked.
 */

typedef struct
{
  float value;
  float target;
  float step;
} Ramp;

typedef struct
{
  guint id;
  ShellSoundClip *clip;
  gsize position;
  gboolean loop;
  gboolean stopping;
  Ramp volume;
} Voice;

typedef struct
{
  guint id;
  gboolean loop;
  double volume;
  guint fade_ms;
} Waiting;

struct _ShellSoundMix
{
  GObject parent;

  char *name;
  char *icon_name;
  GCancellable *cancellable;
  GHashTable *clips;
  GHashTable *decoding;
  GHashTable *stopped;
  guint next_id;

  struct pw_thread_loop *loop;
  struct pw_context *context;
  struct pw_core *core;
  struct pw_stream *stream;
  struct spa_hook stream_listener;
  struct spa_source *idle_timer;
  gboolean idle_armed;
  gboolean active;
  gboolean broken;

  GArray *voices;
  Ramp master;
  GArray *ended;
  guint ended_idle;
};

enum
{
  ENDED,
  N_SIGNALS
};

static guint signals[N_SIGNALS];

G_DEFINE_TYPE (ShellSoundMix, shell_sound_mix, G_TYPE_OBJECT)

static void
ramp_to (Ramp   *ramp,
         double  target,
         guint   fade_ms)
{
  gsize frames = (gsize) fade_ms * SHELL_SOUND_RATE / 1000;

  ramp->target = (float) CLAMP (target, 0.0, 1.0);
  if (!frames)
    {
      ramp->value = ramp->target;
      ramp->step = 0.0f;
    }
  else
    {
      ramp->step = (ramp->target - ramp->value) / frames;
    }
}

static inline float
ramp_next (Ramp *ramp)
{
  if (ramp->step != 0.0f)
    {
      ramp->value += ramp->step;
      if ((ramp->step > 0.0f && ramp->value >= ramp->target) || (ramp->step < 0.0f && ramp->value <= ramp->target))
        {
          ramp->value = ramp->target;
          ramp->step = 0.0f;
        }
    }
  return ramp->value * ramp->value * ramp->value;
}

static void
voice_clear (Voice *voice)
{
  g_clear_pointer (&voice->clip, _shell_sound_clip_unref);
}

static gboolean
emit_ended (gpointer data)
{
  ShellSoundMix *mix = data;
  g_autoptr (GArray) ended = NULL;

  pw_thread_loop_lock (mix->loop);
  ended = g_steal_pointer (&mix->ended);
  mix->ended = g_array_new (FALSE, FALSE, sizeof (guint));
  mix->ended_idle = 0;
  pw_thread_loop_unlock (mix->loop);

  for (guint i = 0; i < ended->len; i++)
    g_signal_emit (mix, signals[ENDED], 0, g_array_index (ended, guint, i));
  return G_SOURCE_REMOVE;
}

static void
report_ended_locked (ShellSoundMix *mix,
                     guint          id)
{
  g_array_append_val (mix->ended, id);
  if (!mix->ended_idle)
    mix->ended_idle = g_idle_add_full (G_PRIORITY_DEFAULT, emit_ended, g_object_ref (mix), g_object_unref);
}

static void
mix_into (ShellSoundMix *mix,
          float         *destination,
          gsize          frames)
{
  memset (destination, 0, frames * SHELL_SOUND_CHANNELS * sizeof (float));

  for (guint i = 0; i < mix->voices->len;)
    {
      Voice *voice = &g_array_index (mix->voices, Voice, i);
      const gint16 *samples = g_bytes_get_data (voice->clip->samples, NULL);
      gboolean done = FALSE;

      for (gsize frame = 0; frame < frames; frame++)
        {
          float gain;

          if (voice->position >= voice->clip->frames)
            {
              if (!voice->loop)
                {
                  done = TRUE;
                  break;
                }
              voice->position = 0;
            }
          gain = ramp_next (&voice->volume) * SAMPLE_SCALE;
          for (guint channel = 0; channel < SHELL_SOUND_CHANNELS; channel++)
            destination[frame * SHELL_SOUND_CHANNELS + channel] += samples[voice->position * SHELL_SOUND_CHANNELS + channel] * gain;
          voice->position++;
        }

      if (voice->stopping && voice->volume.value <= 0.0f)
        done = TRUE;

      if (done)
        {
          report_ended_locked (mix, voice->id);
          g_array_remove_index_fast (mix->voices, i);
        }
      else
        {
          i++;
        }
    }

  for (gsize frame = 0; frame < frames; frame++)
    {
      float gain = ramp_next (&mix->master);

      for (guint channel = 0; channel < SHELL_SOUND_CHANNELS; channel++)
        {
          float *sample = &destination[frame * SHELL_SOUND_CHANNELS + channel];
          *sample = CLAMP (*sample * gain, -1.0f, 1.0f);
        }
    }
}

static void
on_process (void *data)
{
  ShellSoundMix *mix = data;
  struct pw_buffer *buffer = pw_stream_dequeue_buffer (mix->stream);
  struct spa_data *block;
  gsize stride = SHELL_SOUND_CHANNELS * sizeof (float);
  gsize frames;

  if (!buffer)
    return;

  block = &buffer->buffer->datas[0];
  if (!block->data)
    {
      pw_stream_queue_buffer (mix->stream, buffer);
      return;
    }

  frames = block->maxsize / stride;
  if (buffer->requested)
    frames = MIN (buffer->requested, frames);

  mix_into (mix, block->data, frames);
  block->chunk->offset = 0;
  block->chunk->stride = stride;
  block->chunk->size = frames * stride;
  pw_stream_queue_buffer (mix->stream, buffer);

  if (mix->voices->len == 0 && !mix->idle_armed)
    {
      struct timespec timeout = { 0, IDLE_TIMEOUT_NS };

      pw_loop_update_timer (pw_thread_loop_get_loop (mix->loop), mix->idle_timer, &timeout, NULL, false);
      mix->idle_armed = TRUE;
    }
}

static void
on_idle (void     *data,
         uint64_t  expirations)
{
  ShellSoundMix *mix = data;

  mix->idle_armed = FALSE;
  if (mix->voices->len > 0 || !mix->stream)
    return;

  pw_stream_set_active (mix->stream, false);
  mix->active = FALSE;
}

static void
end_all_voices_locked (ShellSoundMix *mix)
{
  for (guint i = 0; i < mix->voices->len; i++)
    report_ended_locked (mix, g_array_index (mix->voices, Voice, i).id);
  g_array_set_size (mix->voices, 0);
}

static void
on_stream_state_changed (void                 *data,
                         enum pw_stream_state  old,
                         enum pw_stream_state  state,
                         const char           *error)
{
  ShellSoundMix *mix = data;

  if (state != PW_STREAM_STATE_ERROR && state != PW_STREAM_STATE_UNCONNECTED)
    return;

  mix->broken = TRUE;
  end_all_voices_locked (mix);
}

static const struct pw_stream_events stream_events = {
  PW_VERSION_STREAM_EVENTS,
  .state_changed = on_stream_state_changed,
  .process = on_process,
};

static void
disconnect_locked (ShellSoundMix *mix)
{
  if (mix->stream)
    {
      spa_hook_remove (&mix->stream_listener);
      g_clear_pointer (&mix->stream, pw_stream_destroy);
    }
  g_clear_pointer (&mix->core, pw_core_disconnect);
  end_all_voices_locked (mix);
  mix->active = FALSE;
  mix->broken = FALSE;
}

static gboolean
connect_locked (ShellSoundMix *mix)
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

  if (mix->broken)
    disconnect_locked (mix);
  if (mix->stream)
    return TRUE;

  mix->core = pw_context_connect (mix->context, NULL, 0);
  if (!mix->core)
    return FALSE;

  mix->stream = pw_stream_new (mix->core, mix->name,
                               pw_properties_new (PW_KEY_MEDIA_TYPE, "Audio",
                                                  PW_KEY_MEDIA_CATEGORY, "Playback",
                                                  PW_KEY_MEDIA_ROLE, "Music",
                                                  PW_KEY_MEDIA_NAME, mix->name,
                                                  PW_KEY_APP_NAME, mix->name,
                                                  PW_KEY_APP_ID, "com.lantharos.Kestrel",
                                                  PW_KEY_APP_ICON_NAME, mix->icon_name,
                                                  PW_KEY_NODE_DESCRIPTION, mix->name,
                                                  PW_KEY_NODE_LATENCY, QUANTUM,
                                                  NULL));
  pw_stream_add_listener (mix->stream, &mix->stream_listener, &stream_events, mix);
  params[0] = spa_format_audio_raw_build (&builder, SPA_PARAM_EnumFormat, &format);
  if (pw_stream_connect (mix->stream, PW_DIRECTION_OUTPUT, PW_ID_ANY,
                         PW_STREAM_FLAG_AUTOCONNECT | PW_STREAM_FLAG_MAP_BUFFERS | PW_STREAM_FLAG_INACTIVE,
                         params, 1) < 0)
    {
      disconnect_locked (mix);
      return FALSE;
    }
  return TRUE;
}

static Voice *
voice_with (ShellSoundMix *mix,
            guint          id)
{
  for (guint i = 0; i < mix->voices->len; i++)
    if (g_array_index (mix->voices, Voice, i).id == id)
      return &g_array_index (mix->voices, Voice, i);
  return NULL;
}

static void
start_voice (ShellSoundMix  *mix,
             ShellSoundClip *clip,
             const Waiting  *waiting)
{
  Voice voice = { .id = waiting->id, .clip = _shell_sound_clip_ref (clip), .loop = waiting->loop };

  ramp_to (&voice.volume, waiting->fade_ms ? 0.0 : waiting->volume, 0);
  ramp_to (&voice.volume, waiting->volume, waiting->fade_ms);

  pw_thread_loop_lock (mix->loop);
  if (connect_locked (mix))
    {
      g_array_append_val (mix->voices, voice);
      if (!mix->active)
        {
          pw_stream_set_active (mix->stream, true);
          mix->active = TRUE;
        }
    }
  else
    {
      voice_clear (&voice);
      report_ended_locked (mix, waiting->id);
    }
  pw_thread_loop_unlock (mix->loop);
}

static gboolean
playing_clip (ShellSoundMix  *mix,
              ShellSoundClip *clip)
{
  for (guint i = 0; i < mix->voices->len; i++)
    if (g_array_index (mix->voices, Voice, i).clip == clip)
      return TRUE;
  return FALSE;
}

static void
trim_cache (ShellSoundMix *mix)
{
  GHashTableIter iter;
  ShellSoundClip *clip;
  gsize bytes = 0;

  g_hash_table_iter_init (&iter, mix->clips);
  while (g_hash_table_iter_next (&iter, NULL, (gpointer *) &clip))
    bytes += g_bytes_get_size (clip->samples);
  if (bytes <= CACHE_LIMIT_BYTES)
    return;

  pw_thread_loop_lock (mix->loop);
  g_hash_table_iter_init (&iter, mix->clips);
  while (bytes > CACHE_LIMIT_BYTES && g_hash_table_iter_next (&iter, NULL, (gpointer *) &clip))
    if (!playing_clip (mix, clip))
      {
        bytes -= g_bytes_get_size (clip->samples);
        g_hash_table_iter_remove (&iter);
      }
  pw_thread_loop_unlock (mix->loop);
}

typedef struct
{
  ShellSoundMix *mix;
  char *path;
} Decoding;

static void
on_decoded (GObject      *source,
            GAsyncResult *result,
            gpointer      data)
{
  Decoding *decoding = data;
  ShellSoundMix *mix = decoding->mix;
  g_autoptr (GError) error = NULL;
  g_autoptr (ShellSoundClip) clip = _shell_sound_decode_finish (result, &error);
  g_autoptr (GArray) waiting = NULL;

  if (!g_error_matches (error, G_IO_ERROR, G_IO_ERROR_CANCELLED))
    {
      g_hash_table_steal_extended (mix->decoding, decoding->path, NULL, (gpointer *) &waiting);
      if (!clip)
        g_warning ("%s can't play %s: %s", mix->name, decoding->path, error->message);
      else
        g_hash_table_insert (mix->clips, g_strdup (decoding->path), _shell_sound_clip_ref (clip));

      for (guint i = 0; waiting && i < waiting->len; i++)
        {
          Waiting *sound = &g_array_index (waiting, Waiting, i);

          if (g_hash_table_remove (mix->stopped, GUINT_TO_POINTER (sound->id)) || !clip)
            {
              pw_thread_loop_lock (mix->loop);
              report_ended_locked (mix, sound->id);
              pw_thread_loop_unlock (mix->loop);
            }
          else
            {
              start_voice (mix, clip, sound);
            }
        }
      trim_cache (mix);
    }

  g_object_unref (decoding->mix);
  g_free (decoding->path);
  g_free (decoding);
}

/**
 * shell_sound_mix_new:
 * @name: what the stream is called in the sound settings
 * @icon_name: its icon
 *
 * Returns: (transfer full): a new mix, quiet until it plays something
 */
ShellSoundMix *
shell_sound_mix_new (const char *name,
                     const char *icon_name)
{
  ShellSoundMix *mix = g_object_new (SHELL_TYPE_SOUND_MIX, NULL);

  mix->name = g_strdup (name);
  mix->icon_name = g_strdup (icon_name);
  return mix;
}

/**
 * shell_sound_mix_play:
 * @mix: the mix
 * @file: a sound file
 * @loop: whether it plays again from the start when it ends
 * @volume: 0 to 1
 * @fade_ms: how long it fades in
 *
 * Plays a sound once it's decoded. Each file is decoded once while the mix
 * keeps it.
 *
 * Returns: the sound's id, which #ShellSoundMix::ended names when it ends
 */
guint
shell_sound_mix_play (ShellSoundMix *mix,
                      GFile         *file,
                      gboolean       loop,
                      double         volume,
                      guint          fade_ms)
{
  g_autofree char *path = g_file_get_path (file);
  Waiting waiting = { .id = ++mix->next_id, .loop = loop, .volume = volume, .fade_ms = fade_ms };
  ShellSoundClip *clip;
  GArray *queue;
  Decoding *decoding;

  g_return_val_if_fail (SHELL_IS_SOUND_MIX (mix), 0);
  g_return_val_if_fail (mix->loop, 0);

  clip = g_hash_table_lookup (mix->clips, path);
  if (clip)
    {
      start_voice (mix, clip, &waiting);
      return waiting.id;
    }

  queue = g_hash_table_lookup (mix->decoding, path);
  if (queue)
    {
      g_array_append_val (queue, waiting);
      return waiting.id;
    }

  queue = g_array_new (FALSE, FALSE, sizeof (Waiting));
  g_array_append_val (queue, waiting);
  g_hash_table_insert (mix->decoding, g_strdup (path), queue);
  decoding = g_new0 (Decoding, 1);
  decoding->mix = g_object_ref (mix);
  decoding->path = g_strdup (path);
  _shell_sound_decode (path, file, SHELL_SOUND_ANY_LENGTH, mix->cancellable, on_decoded, decoding);
  return waiting.id;
}

static gboolean
waiting_for_decoding (ShellSoundMix *mix,
                      guint          sound)
{
  GHashTableIter iter;
  GArray *queue;

  g_hash_table_iter_init (&iter, mix->decoding);
  while (g_hash_table_iter_next (&iter, NULL, (gpointer *) &queue))
    for (guint i = 0; i < queue->len; i++)
      if (g_array_index (queue, Waiting, i).id == sound)
        return TRUE;
  return FALSE;
}

/**
 * shell_sound_mix_set_volume:
 * @mix: the mix
 * @sound: a sound's id
 * @volume: 0 to 1
 * @fade_ms: how long the change takes
 */
void
shell_sound_mix_set_volume (ShellSoundMix *mix,
                            guint          sound,
                            double         volume,
                            guint          fade_ms)
{
  Voice *voice;

  g_return_if_fail (SHELL_IS_SOUND_MIX (mix));
  if (!mix->loop)
    return;

  pw_thread_loop_lock (mix->loop);
  voice = voice_with (mix, sound);
  if (voice && !voice->stopping)
    ramp_to (&voice->volume, volume, fade_ms);
  pw_thread_loop_unlock (mix->loop);
}

/**
 * shell_sound_mix_stop:
 * @mix: the mix
 * @sound: a sound's id
 * @fade_ms: how long it fades out first
 */
void
shell_sound_mix_stop (ShellSoundMix *mix,
                      guint          sound,
                      guint          fade_ms)
{
  Voice *voice;

  g_return_if_fail (SHELL_IS_SOUND_MIX (mix));
  if (!mix->loop)
    return;

  if (waiting_for_decoding (mix, sound))
    {
      g_hash_table_add (mix->stopped, GUINT_TO_POINTER (sound));
      return;
    }

  pw_thread_loop_lock (mix->loop);
  voice = voice_with (mix, sound);
  if (voice)
    {
      voice->stopping = TRUE;
      ramp_to (&voice->volume, 0.0, fade_ms);
    }
  pw_thread_loop_unlock (mix->loop);
}

/**
 * shell_sound_mix_set_master:
 * @mix: the mix
 * @volume: 0 to 1, for everything it plays
 * @fade_ms: how long the change takes
 */
void
shell_sound_mix_set_master (ShellSoundMix *mix,
                            double         volume,
                            guint          fade_ms)
{
  g_return_if_fail (SHELL_IS_SOUND_MIX (mix));
  if (!mix->loop)
    return;

  pw_thread_loop_lock (mix->loop);
  ramp_to (&mix->master, volume, fade_ms);
  pw_thread_loop_unlock (mix->loop);
}

/**
 * shell_sound_mix_close:
 * @mix: the mix
 *
 * Stops everything at once and lets go of the stream and the decoded sounds.
 */
void
shell_sound_mix_close (ShellSoundMix *mix)
{
  g_return_if_fail (SHELL_IS_SOUND_MIX (mix));
  if (!mix->loop)
    return;

  g_cancellable_cancel (mix->cancellable);
  pw_thread_loop_lock (mix->loop);
  disconnect_locked (mix);
  g_array_set_size (mix->ended, 0);
  pw_loop_destroy_source (pw_thread_loop_get_loop (mix->loop), mix->idle_timer);
  pw_thread_loop_unlock (mix->loop);

  pw_thread_loop_stop (mix->loop);
  g_clear_pointer (&mix->context, pw_context_destroy);
  g_clear_pointer (&mix->loop, pw_thread_loop_destroy);
  g_clear_handle_id (&mix->ended_idle, g_source_remove);
  g_hash_table_remove_all (mix->clips);
  g_hash_table_remove_all (mix->decoding);
}

static void
shell_sound_mix_finalize (GObject *object)
{
  ShellSoundMix *mix = SHELL_SOUND_MIX (object);

  shell_sound_mix_close (mix);
  g_clear_object (&mix->cancellable);
  g_hash_table_unref (mix->clips);
  g_hash_table_unref (mix->decoding);
  g_hash_table_unref (mix->stopped);
  g_array_unref (mix->voices);
  g_array_unref (mix->ended);
  g_free (mix->name);
  g_free (mix->icon_name);

  G_OBJECT_CLASS (shell_sound_mix_parent_class)->finalize (object);
}

static void
shell_sound_mix_init (ShellSoundMix *mix)
{
  pw_init (NULL, NULL);

  mix->cancellable = g_cancellable_new ();
  mix->clips = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, (GDestroyNotify) _shell_sound_clip_unref);
  mix->decoding = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, (GDestroyNotify) g_array_unref);
  mix->stopped = g_hash_table_new (NULL, NULL);
  mix->voices = g_array_new (FALSE, TRUE, sizeof (Voice));
  g_array_set_clear_func (mix->voices, (GDestroyNotify) voice_clear);
  mix->ended = g_array_new (FALSE, FALSE, sizeof (guint));
  mix->master.value = mix->master.target = 1.0f;

  mix->loop = pw_thread_loop_new ("kestrel-extension-sounds", NULL);
  mix->context = pw_context_new (pw_thread_loop_get_loop (mix->loop), NULL, 0);
  mix->idle_timer = pw_loop_add_timer (pw_thread_loop_get_loop (mix->loop), on_idle, mix);
  pw_thread_loop_start (mix->loop);
}

static void
shell_sound_mix_class_init (ShellSoundMixClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->finalize = shell_sound_mix_finalize;

  /**
   * ShellSoundMix::ended:
   * @mix: the mix
   * @sound: the sound's id
   *
   * A sound stopped: it played to its end, faded out after a stop, couldn't
   * be played, or lost its stream.
   */
  signals[ENDED] = g_signal_new ("ended", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                                 0, NULL, NULL, NULL, G_TYPE_NONE, 1, G_TYPE_UINT);
}
