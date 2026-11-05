/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <math.h>
#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>
#include <spa/utils/ringbuffer.h>
#include <stdatomic.h>

#include "shell-sound-private.h"

#define QUANTUM "128/48000"
#define QUEUE_LENGTH 32
#define QUEUE_MASK (QUEUE_LENGTH - 1)
#define MOST_SOUNDING 6
#define VOICE_SLOTS (MOST_SOUNDING + 2)
#define FADE_FRAMES 96
#define STALE_US (250 * G_TIME_SPAN_MILLISECOND)
#define WATCH_NS (2 * SPA_NSEC_PER_SEC)
#define POSITION_BITS 16
#define POSITION_ONE (1u << POSITION_BITS)
#define POSITION_SCALE (1.0f / POSITION_ONE)
#define SAMPLE_SCALE (1.0f / 32768.0f)
#define KNEE 0.75f

/**
 * ShellSoundStrikes:
 *
 * The lane of a #ShellSoundMix for sounds that have to follow a press at
 * once. Sounds are decoded ahead and only named here: the caller queues them
 * without a lock or a wakeup, and the stream's realtime thread picks them up
 * at the start of its next cycle and mixes them from a fixed set of voices,
 * so nothing allocates and neither side waits for the other. The stream
 * stays running for a moment after the last sound, while people are in the
 * middle of typing, and then stops, so it costs nothing at rest.
 */

typedef struct
{
  const gint16 *samples;
  guint frames;
  float gain;
  guint32 step;
  gint64 pressed_us;
} Strike;

typedef struct
{
  Strike strike;
  guint64 position;
  guint fading;
} Voice;

struct _ShellSoundStrikes
{
  char *name;
  char *icon_name;
  struct pw_thread_loop *loop;
  struct pw_context *context;
  struct pw_core *core;
  struct pw_stream *stream;
  struct spa_hook stream_listener;
  struct spa_source *watch;
  gboolean broken;
  guint seen;
  GPtrArray *retired;

  struct spa_ringbuffer ring;
  Strike queue[QUEUE_LENGTH];
  atomic_uint struck;
  atomic_int running;
  atomic_int latest_us;
  _Atomic float master;

  Voice voices[VOICE_SLOTS];
  guint voice_count;
};

static void
drop_voice (ShellSoundStrikes *strikes,
            guint              index)
{
  strikes->voice_count--;
  memmove (&strikes->voices[index], &strikes->voices[index + 1],
           (strikes->voice_count - index) * sizeof (Voice));
}

static void
fade_oldest_if_crowded (ShellSoundStrikes *strikes)
{
  Voice *oldest = NULL;
  guint sounding = 0;

  for (guint i = strikes->voice_count; i-- > 0;)
    if (!strikes->voices[i].fading)
      {
        oldest = &strikes->voices[i];
        sounding++;
      }

  if (sounding >= MOST_SOUNDING)
    oldest->fading = FADE_FRAMES;
  if (strikes->voice_count == VOICE_SLOTS)
    drop_voice (strikes, 0);
}

static void
start_voice (ShellSoundStrikes *strikes,
             const Strike      *strike)
{
  fade_oldest_if_crowded (strikes);
  strikes->voices[strikes->voice_count++] = (Voice) { .strike = *strike };
}

static gint64
output_delay_us (ShellSoundStrikes *strikes)
{
  struct pw_time time;

  if (pw_stream_get_time_n (strikes->stream, &time, sizeof (time)) < 0 || !time.rate.denom)
    return 0;
  return time.delay * time.rate.num * G_USEC_PER_SEC / time.rate.denom;
}

static void
take_strikes (ShellSoundStrikes *strikes)
{
  uint32_t index;
  int32_t waiting = spa_ringbuffer_get_read_index (&strikes->ring, &index);
  gint64 now;
  gint64 delay;

  if (waiting <= 0)
    return;

  now = g_get_monotonic_time ();
  delay = output_delay_us (strikes);
  for (; waiting > 0; waiting--, index++)
    {
      const Strike *strike = &strikes->queue[index & QUEUE_MASK];
      gint64 age = now - strike->pressed_us;

      if (age >= STALE_US)
        continue;
      start_voice (strikes, strike);
      atomic_store_explicit (&strikes->latest_us, (int) (age + delay), memory_order_relaxed);
    }
  spa_ringbuffer_read_update (&strikes->ring, index);
}

static gboolean
play_voice (Voice *voice,
            float *destination,
            guint  frames)
{
  const Strike *strike = &voice->strike;
  guint last = strike->frames - 1;

  for (guint frame = 0; frame < frames; frame++)
    {
      guint index = voice->position >> POSITION_BITS;
      float fraction = (voice->position & (POSITION_ONE - 1)) * POSITION_SCALE;
      float gain = strike->gain;
      const gint16 *samples;

      if (index >= last)
        return FALSE;
      if (voice->fading)
        {
          gain *= (float) voice->fading / FADE_FRAMES;
          if (--voice->fading == 0)
            return FALSE;
        }

      samples = &strike->samples[index * SHELL_SOUND_CHANNELS];
      for (guint channel = 0; channel < SHELL_SOUND_CHANNELS; channel++)
        {
          float from = samples[channel];
          float to = samples[channel + SHELL_SOUND_CHANNELS];

          destination[frame * SHELL_SOUND_CHANNELS + channel] += (from + (to - from) * fraction) * gain;
        }
      voice->position += strike->step;
    }
  return TRUE;
}

static inline float
soften (float sample)
{
  float size = fabsf (sample);
  float over;

  if (size <= KNEE)
    return sample;
  over = (size - KNEE) / (1.0f - KNEE);
  return copysignf (KNEE + (1.0f - KNEE) * over / (1.0f + over), sample);
}

static void
mix_into (ShellSoundStrikes *strikes,
          float             *destination,
          guint              frames)
{
  float master = atomic_load_explicit (&strikes->master, memory_order_relaxed);
  gsize samples = frames * SHELL_SOUND_CHANNELS;

  memset (destination, 0, samples * sizeof (float));
  if (!strikes->voice_count)
    return;

  for (guint i = 0; i < strikes->voice_count;)
    {
      if (play_voice (&strikes->voices[i], destination, frames))
        i++;
      else
        drop_voice (strikes, i);
    }

  for (gsize sample = 0; sample < samples; sample++)
    destination[sample] = soften (destination[sample] * master);
}

static void
on_process (void *data)
{
  ShellSoundStrikes *strikes = data;
  struct pw_buffer *buffer = pw_stream_dequeue_buffer (strikes->stream);
  struct spa_data *block;
  gsize stride = SHELL_SOUND_CHANNELS * sizeof (float);
  gsize frames;

  if (!buffer)
    return;

  block = &buffer->buffer->datas[0];
  if (!block->data)
    {
      pw_stream_queue_buffer (strikes->stream, buffer);
      return;
    }

  frames = block->maxsize / stride;
  if (buffer->requested)
    frames = MIN (buffer->requested, frames);

  take_strikes (strikes);
  mix_into (strikes, block->data, frames);
  block->chunk->offset = 0;
  block->chunk->stride = stride;
  block->chunk->size = frames * stride;
  pw_stream_queue_buffer (strikes->stream, buffer);
}

static void
on_stream_state_changed (void                 *data,
                         enum pw_stream_state  old,
                         enum pw_stream_state  state,
                         const char           *error)
{
  ShellSoundStrikes *strikes = data;

  if (state == PW_STREAM_STATE_ERROR || state == PW_STREAM_STATE_UNCONNECTED)
    strikes->broken = TRUE;
}

static const struct pw_stream_events stream_events = {
  PW_VERSION_STREAM_EVENTS,
  .state_changed = on_stream_state_changed,
  .process = on_process,
};

static void
stop_watching (ShellSoundStrikes *strikes)
{
  struct timespec never = { 0, 0 };

  pw_loop_update_timer (pw_thread_loop_get_loop (strikes->loop), strikes->watch, &never, NULL, false);
}

static void
disconnect_locked (ShellSoundStrikes *strikes)
{
  if (strikes->stream)
    {
      spa_hook_remove (&strikes->stream_listener);
      g_clear_pointer (&strikes->stream, pw_stream_destroy);
    }
  g_clear_pointer (&strikes->core, pw_core_disconnect);
  stop_watching (strikes);
  strikes->voice_count = 0;
  strikes->broken = FALSE;
  atomic_store (&strikes->running, FALSE);
  g_ptr_array_set_size (strikes->retired, 0);
}

static gboolean
connect_locked (ShellSoundStrikes *strikes)
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

  if (strikes->broken)
    disconnect_locked (strikes);
  if (strikes->stream)
    return TRUE;

  strikes->core = pw_context_connect (strikes->context, NULL, 0);
  if (!strikes->core)
    return FALSE;

  strikes->stream = pw_stream_new (strikes->core, strikes->name,
                                   pw_properties_new (PW_KEY_MEDIA_TYPE, "Audio",
                                                      PW_KEY_MEDIA_CATEGORY, "Playback",
                                                      PW_KEY_MEDIA_ROLE, "Music",
                                                      PW_KEY_MEDIA_NAME, strikes->name,
                                                      PW_KEY_APP_NAME, strikes->name,
                                                      PW_KEY_APP_ID, "com.lantharos.Kestrel",
                                                      PW_KEY_APP_ICON_NAME, strikes->icon_name,
                                                      PW_KEY_NODE_DESCRIPTION, strikes->name,
                                                      PW_KEY_NODE_LATENCY, QUANTUM,
                                                      NULL));
  pw_stream_add_listener (strikes->stream, &strikes->stream_listener, &stream_events, strikes);
  params[0] = spa_format_audio_raw_build (&builder, SPA_PARAM_EnumFormat, &format);
  if (pw_stream_connect (strikes->stream, PW_DIRECTION_OUTPUT, PW_ID_ANY,
                         PW_STREAM_FLAG_AUTOCONNECT | PW_STREAM_FLAG_MAP_BUFFERS |
                         PW_STREAM_FLAG_INACTIVE | PW_STREAM_FLAG_RT_PROCESS,
                         params, 1) < 0)
    {
      disconnect_locked (strikes);
      return FALSE;
    }
  return TRUE;
}

static void
wake_locked (ShellSoundStrikes *strikes)
{
  struct timespec period = { WATCH_NS / SPA_NSEC_PER_SEC, 0 };

  if (!connect_locked (strikes) || atomic_load (&strikes->running))
    return;

  atomic_store (&strikes->running, TRUE);
  pw_stream_set_active (strikes->stream, true);
  pw_loop_update_timer (pw_thread_loop_get_loop (strikes->loop), strikes->watch, &period, &period, false);
}

static void
on_watch (void     *data,
          uint64_t  expirations)
{
  ShellSoundStrikes *strikes = data;
  guint struck = atomic_load (&strikes->struck);

  if (struck != strikes->seen && !strikes->broken)
    {
      strikes->seen = struck;
      return;
    }

  atomic_store (&strikes->running, FALSE);
  stop_watching (strikes);
  pw_stream_set_active (strikes->stream, false);
  g_ptr_array_set_size (strikes->retired, 0);

  if (atomic_load (&strikes->struck) != strikes->seen)
    wake_locked (strikes);
}

ShellSoundStrikes *
_shell_sound_strikes_new (const char            *name,
                          const char            *icon_name,
                          struct pw_thread_loop *loop,
                          struct pw_context     *context)
{
  ShellSoundStrikes *strikes = g_new0 (ShellSoundStrikes, 1);

  strikes->name = g_strdup (name);
  strikes->icon_name = g_strdup (icon_name);
  strikes->loop = loop;
  strikes->context = context;
  strikes->retired = g_ptr_array_new_with_free_func ((GDestroyNotify) _shell_sound_clip_unref);
  strikes->master = 1.0f;
  spa_ringbuffer_init (&strikes->ring);

  pw_thread_loop_lock (loop);
  strikes->watch = pw_loop_add_timer (pw_thread_loop_get_loop (loop), on_watch, strikes);
  pw_thread_loop_unlock (loop);
  return strikes;
}

void
_shell_sound_strikes_free (ShellSoundStrikes *strikes)
{
  pw_thread_loop_lock (strikes->loop);
  disconnect_locked (strikes);
  pw_loop_destroy_source (pw_thread_loop_get_loop (strikes->loop), strikes->watch);
  pw_thread_loop_unlock (strikes->loop);

  g_ptr_array_unref (strikes->retired);
  g_free (strikes->name);
  g_free (strikes->icon_name);
  g_free (strikes);
}

void
_shell_sound_strikes_connect (ShellSoundStrikes *strikes)
{
  pw_thread_loop_lock (strikes->loop);
  connect_locked (strikes);
  pw_thread_loop_unlock (strikes->loop);
}

/* The clip has to stay alive until it's retired: voices play from its memory. */
void
_shell_sound_strikes_play (ShellSoundStrikes    *strikes,
                           const ShellSoundClip *clip,
                           float                 gain,
                           float                 rate,
                           gint64                pressed_us)
{
  uint32_t index;
  int32_t filled = spa_ringbuffer_get_write_index (&strikes->ring, &index);

  if (filled >= QUEUE_LENGTH)
    return;

  strikes->queue[index & QUEUE_MASK] = (Strike) {
    .samples = g_bytes_get_data (clip->samples, NULL),
    .frames = clip->frames,
    .gain = gain * SAMPLE_SCALE,
    .step = (guint32) (rate * POSITION_ONE),
    .pressed_us = pressed_us,
  };
  spa_ringbuffer_write_update (&strikes->ring, index + 1);

  atomic_fetch_add (&strikes->struck, 1);
  if (atomic_load (&strikes->running))
    return;

  pw_thread_loop_lock (strikes->loop);
  wake_locked (strikes);
  pw_thread_loop_unlock (strikes->loop);
}

/* Takes the clip, and lets go of it once no voice can be playing it. */
void
_shell_sound_strikes_retire (ShellSoundStrikes *strikes,
                             ShellSoundClip    *clip)
{
  pw_thread_loop_lock (strikes->loop);
  g_ptr_array_add (strikes->retired, clip);
  if (!atomic_load (&strikes->running))
    g_ptr_array_set_size (strikes->retired, 0);
  pw_thread_loop_unlock (strikes->loop);
}

void
_shell_sound_strikes_set_master (ShellSoundStrikes *strikes,
                                 double             volume)
{
  atomic_store (&strikes->master, (float) (volume * volume * volume));
}

gint64
_shell_sound_strikes_latest_us (ShellSoundStrikes *strikes)
{
  return atomic_load (&strikes->latest_us);
}
