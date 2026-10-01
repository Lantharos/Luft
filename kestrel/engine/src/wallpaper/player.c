#include "player.h"

#include "cuda.h"

#include <gst/gst.h>

#define RELEASE_AFTER_SECONDS 10

struct _WallpaperPlayer
{
  GstElement *pipeline;
  GdkPaintable *paintable;
  gboolean prerolled;
  gboolean playing;
  gboolean released;
  gint64 position;
  guint release_id;
};

static void
seek (WallpaperPlayer *player,
      gint64           position,
      GstSeekFlags     flags)
{
  gst_element_seek (player->pipeline, 1.0, GST_FORMAT_TIME,
                    flags | GST_SEEK_FLAG_SEGMENT,
                    GST_SEEK_TYPE_SET, position,
                    GST_SEEK_TYPE_NONE, GST_CLOCK_TIME_NONE);
}

static void
apply_state (WallpaperPlayer *player)
{
  gst_element_set_state (player->pipeline,
                         player->playing ? GST_STATE_PLAYING : GST_STATE_PAUSED);
}

static gboolean
on_message (GstBus     *bus,
            GstMessage *message,
            gpointer    data)
{
  WallpaperPlayer *player = data;

  switch (GST_MESSAGE_TYPE (message))
    {
    case GST_MESSAGE_ASYNC_DONE:
      if (!player->prerolled)
        {
          player->prerolled = TRUE;
          seek (player, player->position, GST_SEEK_FLAG_FLUSH);
          apply_state (player);
        }
      break;
    case GST_MESSAGE_SEGMENT_DONE:
      seek (player, 0, GST_SEEK_FLAG_NONE);
      break;
    case GST_MESSAGE_ERROR:
      {
        g_autoptr (GError) error = NULL;

        gst_message_parse_error (message, &error, NULL);
        g_printerr ("Playback failed: %s\n", error->message);
        exit (EXIT_FAILURE);
      }
    default:
      break;
    }

  return G_SOURCE_CONTINUE;
}

static GstBusSyncReply
on_context_request (GstBus     *bus,
                    GstMessage *message,
                    gpointer    data)
{
  if (GST_MESSAGE_TYPE (message) == GST_MESSAGE_NEED_CONTEXT)
    wallpaper_cuda_answer (message);
  return GST_BUS_PASS;
}

static GstElement *
create_video_sink (GdkPaintable **paintable)
{
  GstElement *sink = gst_element_factory_make ("gtk4paintablesink", NULL);
  GstElement *gl_sink = gst_element_factory_make ("glsinkbin", NULL);

  g_object_get (sink, "paintable", paintable, NULL);
  g_object_set (gl_sink, "sink", sink, NULL);
  return gl_sink;
}

WallpaperPlayer *
wallpaper_player_new (const char *uri)
{
  WallpaperPlayer *player = g_new0 (WallpaperPlayer, 1);
  g_autoptr (GstBus) bus = NULL;

  player->pipeline = gst_element_factory_make ("playbin3", NULL);
  g_object_set (player->pipeline,
                "uri", uri,
                "video-sink", create_video_sink (&player->paintable),
                NULL);
  gst_util_set_object_arg (G_OBJECT (player->pipeline), "flags", "video+native-video");

  bus = gst_element_get_bus (player->pipeline);
  gst_bus_set_sync_handler (bus, on_context_request, NULL, NULL);
  gst_bus_add_watch (bus, on_message, player);
  gst_element_set_state (player->pipeline, GST_STATE_PAUSED);
  return player;
}

GdkPaintable *
wallpaper_player_get_paintable (WallpaperPlayer *player)
{
  return player->paintable;
}

static void
release_decoder (gpointer data)
{
  WallpaperPlayer *player = data;

  player->release_id = 0;
  if (!gst_element_query_position (player->pipeline, GST_FORMAT_TIME, &player->position))
    player->position = 0;
  gst_element_set_state (player->pipeline, GST_STATE_NULL);
  player->prerolled = FALSE;
  player->released = TRUE;
}

gboolean
wallpaper_player_set_playing (WallpaperPlayer *player,
                              gboolean         playing)
{
  gboolean restarting = playing && player->released;

  if (player->playing == playing)
    return FALSE;

  player->playing = playing;
  g_clear_handle_id (&player->release_id, g_source_remove);
  if (!playing)
    player->release_id = g_timeout_add_seconds_once (RELEASE_AFTER_SECONDS,
                                                     release_decoder, player);

  if (restarting)
    {
      player->released = FALSE;
      gst_element_set_state (player->pipeline, GST_STATE_PAUSED);
    }
  else if (player->prerolled)
    {
      apply_state (player);
    }

  return restarting;
}
