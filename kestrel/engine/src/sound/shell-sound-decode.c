/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <gst/gst.h>

#include "decoder/pipeline.h"
#include "shell-sound-private.h"

#define PIPELINE SHELL_SOUND_DECODE_PIPELINE ("filesrc name=source", "appsink name=sink sync=false")
#define PULL_TIMEOUT (2 * GST_SECOND)
#define FRAME_SIZE (SHELL_SOUND_CHANNELS * sizeof (gint16))

ShellSoundClip *
_shell_sound_clip_new (const char *name,
                       const char *path,
                       GBytes     *samples)
{
  ShellSoundClip *clip = g_atomic_rc_box_new0 (ShellSoundClip);

  clip->name = g_strdup (name);
  clip->path = g_strdup (path);
  clip->samples = g_bytes_ref (samples);
  clip->frames = g_bytes_get_size (samples) / FRAME_SIZE;
  return clip;
}

ShellSoundClip *
_shell_sound_clip_ref (ShellSoundClip *clip)
{
  return g_atomic_rc_box_acquire (clip);
}

static void
clip_clear (ShellSoundClip *clip)
{
  g_free (clip->name);
  g_free (clip->path);
  g_bytes_unref (clip->samples);
}

void
_shell_sound_clip_unref (ShellSoundClip *clip)
{
  g_atomic_rc_box_release_full (clip, (GDestroyNotify) clip_clear);
}

static gboolean
check_bus (GstElement  *pipeline,
           GError     **error)
{
  g_autoptr (GstBus) bus = gst_element_get_bus (pipeline);
  g_autoptr (GstMessage) message = gst_bus_pop_filtered (bus, GST_MESSAGE_ERROR);

  if (!message)
    return TRUE;

  gst_message_parse_error (message, error, NULL);
  return FALSE;
}

typedef struct
{
  char *name;
  GFile *file;
  gsize max_frames;
} Request;

static void
request_free (Request *request)
{
  g_free (request->name);
  g_object_unref (request->file);
  g_free (request);
}

static GstElement *
pipeline_for (Request  *request,
              GError  **error)
{
  g_autoptr (GstElement) pipeline = gst_parse_launch (PIPELINE, error);
  g_autoptr (GstElement) source = NULL;
  g_autofree char *path = NULL;

  if (!pipeline)
    return NULL;

  source = gst_bin_get_by_name (GST_BIN (pipeline), "source");
  path = g_file_get_path (request->file);
  g_object_set (source, "location", path, NULL);
  return g_steal_pointer (&pipeline);
}

static GBytes *
decode (Request  *request,
        GError  **error)
{
  g_autoptr (GstElement) pipeline = NULL;
  g_autoptr (GstElement) sink = NULL;
  g_autoptr (GByteArray) samples = g_byte_array_new ();
  GstSample *sample;

  pipeline = pipeline_for (request, error);
  if (!pipeline)
    return NULL;

  sink = gst_bin_get_by_name (GST_BIN (pipeline), "sink");
  if (gst_element_set_state (pipeline, GST_STATE_PLAYING) == GST_STATE_CHANGE_FAILURE)
    {
      check_bus (pipeline, error);
      gst_element_set_state (pipeline, GST_STATE_NULL);
      if (error && !*error)
        g_set_error (error, G_IO_ERROR, G_IO_ERROR_FAILED, "Can't decode %s", request->name);
      return NULL;
    }

  while (TRUE)
    {
      GstMapInfo map;

      g_signal_emit_by_name (sink, "try-pull-sample", PULL_TIMEOUT, &sample);
      if (!sample)
        break;

      if (gst_buffer_map (gst_sample_get_buffer (sample), &map, GST_MAP_READ))
        {
          g_byte_array_append (samples, map.data, map.size);
          gst_buffer_unmap (gst_sample_get_buffer (sample), &map);
        }
      gst_sample_unref (sample);

      if (samples->len / FRAME_SIZE <= request->max_frames)
        continue;

      gst_element_set_state (pipeline, GST_STATE_NULL);
      g_set_error (error, G_IO_ERROR, G_IO_ERROR_MESSAGE_TOO_LARGE, "%s is too long", request->name);
      return NULL;
    }

  if (!check_bus (pipeline, error))
    {
      gst_element_set_state (pipeline, GST_STATE_NULL);
      return NULL;
    }

  gst_element_set_state (pipeline, GST_STATE_NULL);
  return g_byte_array_free_to_bytes (g_steal_pointer (&samples));
}

static void
decode_in_thread (GTask        *task,
                  gpointer      source_object,
                  gpointer      task_data,
                  GCancellable *cancellable)
{
  Request *request = task_data;
  GError *error = NULL;
  g_autoptr (GBytes) samples = NULL;
  g_autofree char *path = NULL;

  gst_init (NULL, NULL);
  samples = decode (request, &error);
  if (!samples)
    {
      g_task_return_error (task, error);
      return;
    }

  if (g_bytes_get_size (samples) < FRAME_SIZE)
    {
      g_task_return_new_error (task, G_IO_ERROR, G_IO_ERROR_INVALID_DATA, "The sound is empty");
      return;
    }

  path = g_file_get_path (request->file);
  g_task_return_pointer (task, _shell_sound_clip_new (request->name, path, samples),
                         (GDestroyNotify) _shell_sound_clip_unref);
}

void
_shell_sound_decode (const char          *name,
                     GFile               *file,
                     gsize                max_frames,
                     GCancellable        *cancellable,
                     GAsyncReadyCallback  callback,
                     gpointer             user_data)
{
  g_autoptr (GTask) task = g_task_new (NULL, cancellable, callback, user_data);
  Request *request = g_new0 (Request, 1);

  request->name = g_strdup (name);
  request->file = g_object_ref (file);
  request->max_frames = max_frames;
  g_task_set_task_data (task, request, (GDestroyNotify) request_free);
  g_task_run_in_thread (task, decode_in_thread);
}

ShellSoundClip *
_shell_sound_decode_finish (GAsyncResult  *result,
                            GError       **error)
{
  return g_task_propagate_pointer (G_TASK (result), error);
}
