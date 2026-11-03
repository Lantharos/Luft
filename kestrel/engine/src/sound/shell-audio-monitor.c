/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <math.h>
#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>

#include "shell-audio-monitor.h"

#define RATE 48000
#define WINDOW 2048
#define WINDOW_BITS 11
#define HISTORY (WINDOW * 2)
#define LEVEL_SAMPLES 1024
#define STALE_US (200 * G_TIME_SPAN_MILLISECOND)
#define MAX_BANDS 64
#define LOWEST_HZ 40.0
#define HIGHEST_HZ 16000.0
#define FLOOR_DB -64.0
#define LEVEL_FLOOR_DB -48.0
#define TILT_DB_PER_OCTAVE 3.0

/**
 * ShellAudioMonitor:
 *
 * Listens to what the default output plays, while asked to, and tells how loud
 * it is overall and in bands of frequencies, for things that move with sound.
 */
struct _ShellAudioMonitor
{
  GObject parent;

  struct pw_thread_loop *loop;
  struct pw_context *context;
  struct pw_core *core;
  struct pw_stream *stream;
  struct spa_hook stream_listener;

  GMutex lock;
  float history[HISTORY];
  gsize written;
  gint64 updated_us;

  float window[WINDOW];
  float real[WINDOW];
  float imaginary[WINDOW];
};

G_DEFINE_TYPE (ShellAudioMonitor, shell_audio_monitor, G_TYPE_OBJECT)

static void
on_process (void *data)
{
  ShellAudioMonitor *monitor = data;
  struct pw_buffer *buffer = pw_stream_dequeue_buffer (monitor->stream);
  struct spa_data *block;
  const float *samples;
  gsize count;

  if (!buffer)
    return;

  block = &buffer->buffer->datas[0];
  if (block->data && block->chunk->size)
    {
      samples = SPA_PTROFF (block->data, block->chunk->offset, const float);
      count = MIN (block->chunk->size / sizeof (float), HISTORY);

      g_mutex_lock (&monitor->lock);
      for (gsize i = 0; i < count; i++)
        monitor->history[(monitor->written + i) % HISTORY] = samples[i];
      monitor->written = (monitor->written + count) % HISTORY;
      monitor->updated_us = g_get_monotonic_time ();
      g_mutex_unlock (&monitor->lock);
    }

  pw_stream_queue_buffer (monitor->stream, buffer);
}

static const struct pw_stream_events stream_events = {
  PW_VERSION_STREAM_EVENTS,
  .process = on_process,
};

static void
stop (ShellAudioMonitor *monitor)
{
  if (!monitor->loop)
    return;

  pw_thread_loop_lock (monitor->loop);
  if (monitor->stream)
    {
      spa_hook_remove (&monitor->stream_listener);
      g_clear_pointer (&monitor->stream, pw_stream_destroy);
    }
  g_clear_pointer (&monitor->core, pw_core_disconnect);
  pw_thread_loop_unlock (monitor->loop);

  pw_thread_loop_stop (monitor->loop);
  g_clear_pointer (&monitor->context, pw_context_destroy);
  g_clear_pointer (&monitor->loop, pw_thread_loop_destroy);

  g_mutex_lock (&monitor->lock);
  memset (monitor->history, 0, sizeof (monitor->history));
  monitor->updated_us = 0;
  g_mutex_unlock (&monitor->lock);
}

static struct pw_properties *
stream_properties (void)
{
  return pw_properties_new (PW_KEY_MEDIA_TYPE, "Audio",
                            PW_KEY_MEDIA_CATEGORY, "Capture",
                            PW_KEY_MEDIA_ROLE, "Music",
                            PW_KEY_MEDIA_NAME, "Sound levels",
                            PW_KEY_APP_NAME, "Kestrel",
                            PW_KEY_APP_ID, "com.lantharos.Kestrel",
                            PW_KEY_NODE_NAME, "kestrel-sound-levels",
                            PW_KEY_STREAM_CAPTURE_SINK, "true",
                            PW_KEY_NODE_PASSIVE, "true",
                            NULL);
}

static void
start (ShellAudioMonitor *monitor)
{
  uint8_t pod[512];
  struct spa_pod_builder builder = SPA_POD_BUILDER_INIT (pod, sizeof (pod));
  const struct spa_pod *params[1];
  struct spa_audio_info_raw format = {
    .format = SPA_AUDIO_FORMAT_F32,
    .rate = RATE,
    .channels = 1,
    .position = { SPA_AUDIO_CHANNEL_MONO },
  };

  pw_init (NULL, NULL);
  monitor->loop = pw_thread_loop_new ("kestrel-sound-levels", NULL);
  monitor->context = pw_context_new (pw_thread_loop_get_loop (monitor->loop), NULL, 0);
  if (pw_thread_loop_start (monitor->loop) < 0)
    {
      stop (monitor);
      return;
    }

  pw_thread_loop_lock (monitor->loop);
  monitor->core = pw_context_connect (monitor->context, NULL, 0);
  if (monitor->core)
    {
      monitor->stream = pw_stream_new (monitor->core, "Sound levels", stream_properties ());
      pw_stream_add_listener (monitor->stream, &monitor->stream_listener, &stream_events, monitor);
      params[0] = spa_format_audio_raw_build (&builder, SPA_PARAM_EnumFormat, &format);
      if (pw_stream_connect (monitor->stream, PW_DIRECTION_INPUT, PW_ID_ANY,
                             PW_STREAM_FLAG_AUTOCONNECT | PW_STREAM_FLAG_MAP_BUFFERS,
                             params, 1) < 0)
        g_warning ("Can't listen to the sound output");
    }
  else
    {
      g_warning ("Can't connect to PipeWire to listen to the sound output");
    }
  pw_thread_loop_unlock (monitor->loop);
}

/**
 * shell_audio_monitor_set_listening:
 * @monitor: the monitor
 * @listening: whether to listen
 *
 * Starts or stops listening. Nothing runs while it doesn't listen.
 */
void
shell_audio_monitor_set_listening (ShellAudioMonitor *monitor,
                                   gboolean           listening)
{
  g_return_if_fail (SHELL_IS_AUDIO_MONITOR (monitor));

  if (listening == !!monitor->loop)
    return;
  if (listening)
    start (monitor);
  else
    stop (monitor);
}

gboolean
shell_audio_monitor_get_listening (ShellAudioMonitor *monitor)
{
  g_return_val_if_fail (SHELL_IS_AUDIO_MONITOR (monitor), FALSE);

  return !!monitor->loop;
}

static void
transform (float *real,
           float *imaginary)
{
  for (guint i = 1, j = 0; i < WINDOW; i++)
    {
      guint bit = WINDOW >> 1;

      for (; j & bit; bit >>= 1)
        j ^= bit;
      j ^= bit;
      if (i < j)
        {
          float swap = real[i];
          real[i] = real[j];
          real[j] = swap;
        }
    }

  for (guint size = 2; size <= WINDOW; size <<= 1)
    {
      double angle = -2.0 * G_PI / size;
      float step_real = (float) cos (angle);
      float step_imaginary = (float) sin (angle);

      for (guint start = 0; start < WINDOW; start += size)
        {
          float turn_real = 1.0f, turn_imaginary = 0.0f;

          for (guint k = 0; k < size / 2; k++)
            {
              guint even = start + k, odd = even + size / 2;
              float odd_real = real[odd] * turn_real - imaginary[odd] * turn_imaginary;
              float odd_imaginary = real[odd] * turn_imaginary + imaginary[odd] * turn_real;
              float next = turn_real * step_real - turn_imaginary * step_imaginary;

              real[odd] = real[even] - odd_real;
              imaginary[odd] = imaginary[even] - odd_imaginary;
              real[even] += odd_real;
              imaginary[even] += odd_imaginary;
              turn_imaginary = turn_real * step_imaginary + turn_imaginary * step_real;
              turn_real = next;
            }
        }
    }
}

static float
loudness (double db,
          double floor)
{
  return (float) CLAMP ((db - floor) / -floor, 0.0, 1.0);
}

static float
band_loudness (const float *real,
               const float *imaginary,
               double       low_hz,
               double       high_hz)
{
  double hz_per_bin = (double) RATE / WINDOW;
  guint first = MAX (1, (guint) floor (low_hz / hz_per_bin));
  guint last = MAX (first, MIN (WINDOW / 2 - 1, (guint) ceil (high_hz / hz_per_bin)));
  double peak = 0.0;
  double db;

  for (guint bin = first; bin <= last; bin++)
    peak = MAX (peak, (double) real[bin] * real[bin] + (double) imaginary[bin] * imaginary[bin]);

  db = 10.0 * log10 (peak / ((WINDOW / 4.0) * (WINDOW / 4.0)) + 1e-12);
  db += TILT_DB_PER_OCTAVE * log2 (sqrt (low_hz * high_hz) / 1000.0);
  return loudness (db, FLOOR_DB);
}

/**
 * shell_audio_monitor_read:
 * @monitor: the monitor
 * @n_bands: how many bands to split the sound into, 1 to 64
 * @level: (out): how loud it is overall, 0 to 1
 * @n_values: (out): @n_bands again, for the returned array
 *
 * Measures the latest sound, all zero while it doesn't listen or nothing plays.
 *
 * Returns: (array length=n_values) (transfer full): how loud each band is, 0 to 1, from low to high
 */
float *
shell_audio_monitor_read (ShellAudioMonitor *monitor,
                          guint              n_bands,
                          float             *level,
                          guint             *n_values)
{
  float *bands;
  double sum = 0.0;
  gboolean fresh;

  g_return_val_if_fail (SHELL_IS_AUDIO_MONITOR (monitor), NULL);
  g_return_val_if_fail (n_bands >= 1 && n_bands <= MAX_BANDS, NULL);

  bands = g_new0 (float, n_bands);
  *level = 0.0f;
  *n_values = n_bands;

  g_mutex_lock (&monitor->lock);
  fresh = monitor->updated_us && g_get_monotonic_time () - monitor->updated_us < STALE_US;
  if (fresh)
    for (guint i = 0; i < WINDOW; i++)
      monitor->real[i] = monitor->history[(monitor->written + HISTORY - WINDOW + i) % HISTORY];
  g_mutex_unlock (&monitor->lock);

  if (!fresh)
    return bands;

  for (guint i = WINDOW - LEVEL_SAMPLES; i < WINDOW; i++)
    sum += (double) monitor->real[i] * monitor->real[i];
  *level = loudness (10.0 * log10 (sum / LEVEL_SAMPLES + 1e-12), LEVEL_FLOOR_DB);

  for (guint i = 0; i < WINDOW; i++)
    {
      monitor->real[i] *= monitor->window[i];
      monitor->imaginary[i] = 0.0f;
    }
  transform (monitor->real, monitor->imaginary);

  for (guint band = 0; band < n_bands; band++)
    {
      double low = LOWEST_HZ * pow (HIGHEST_HZ / LOWEST_HZ, (double) band / n_bands);
      double high = LOWEST_HZ * pow (HIGHEST_HZ / LOWEST_HZ, (double) (band + 1) / n_bands);

      bands[band] = band_loudness (monitor->real, monitor->imaginary, low, high);
    }

  return bands;
}

static void
shell_audio_monitor_finalize (GObject *object)
{
  ShellAudioMonitor *monitor = SHELL_AUDIO_MONITOR (object);

  stop (monitor);
  g_mutex_clear (&monitor->lock);

  G_OBJECT_CLASS (shell_audio_monitor_parent_class)->finalize (object);
}

static void
shell_audio_monitor_init (ShellAudioMonitor *monitor)
{
  g_mutex_init (&monitor->lock);
  for (guint i = 0; i < WINDOW; i++)
    monitor->window[i] = 0.5f - 0.5f * (float) cos (2.0 * G_PI * i / (WINDOW - 1));
}

static void
shell_audio_monitor_class_init (ShellAudioMonitorClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->finalize = shell_audio_monitor_finalize;
}

/**
 * shell_audio_monitor_get_default:
 *
 * Returns: (transfer none): the shell's audio monitor
 */
ShellAudioMonitor *
shell_audio_monitor_get_default (void)
{
  static ShellAudioMonitor *monitor;

  if (!monitor)
    monitor = g_object_new (SHELL_TYPE_AUDIO_MONITOR, NULL);

  return monitor;
}
