#include <gio/gunixinputstream.h>
#include <gst/gst.h>
#include <gtk/gtk.h>
#include <sysexits.h>

#include "player.h"
#include "still.h"
#include "surfaces.h"

#define APPLICATION_ID "com.lantharos.kestrel.Wallpaper"

typedef struct
{
  GMainLoop *loop;
  WallpaperPlayer *player;
  WallpaperSurfaces *surfaces;
  GDataInputStream *commands;
} Wallpaper;

static void read_visible_connectors (Wallpaper *wallpaper);

static void
on_visible_connectors (GObject      *commands,
                       GAsyncResult *result,
                       gpointer      data)
{
  Wallpaper *wallpaper = data;
  g_autofree char *line = g_data_input_stream_read_line_finish_utf8 (G_DATA_INPUT_STREAM (commands),
                                                                     result, NULL, NULL);
  g_auto (GStrv) connectors = NULL;

  if (!line)
    {
      g_main_loop_quit (wallpaper->loop);
      return;
    }

  connectors = g_strsplit (line, " ", -1);
  if (wallpaper_player_set_playing (wallpaper->player, connectors[0] != NULL))
    wallpaper_surfaces_hold_frames (wallpaper->surfaces);
  wallpaper_surfaces_set_live (wallpaper->surfaces, (const char * const *) connectors);
  read_visible_connectors (wallpaper);
}

static void
read_visible_connectors (Wallpaper *wallpaper)
{
  g_data_input_stream_read_line_async (wallpaper->commands, G_PRIORITY_DEFAULT, NULL,
                                       on_visible_connectors, wallpaper);
}

static void
share_decoded_frames_with_gtk (void)
{
  g_setenv ("GSK_RENDERER", "gl", TRUE);
  g_setenv ("GDK_DISABLE", "gles-api", TRUE);
  g_setenv ("GST_GL_API", "opengl3", TRUE);
}

static gboolean
has_video_sink (void)
{
  g_autoptr (GstElementFactory) factory = gst_element_factory_find ("gtk4paintablesink");
  return factory != NULL;
}

static int
play (const char *uri)
{
  g_autoptr (GInputStream) input = g_unix_input_stream_new (STDIN_FILENO, FALSE);
  Wallpaper wallpaper = {
    .loop = g_main_loop_new (NULL, FALSE),
    .player = wallpaper_player_new (uri),
    .commands = g_data_input_stream_new (input),
  };

  wallpaper.surfaces = wallpaper_surfaces_new (wallpaper_player_get_paintable (wallpaper.player));
  read_visible_connectors (&wallpaper);
  g_main_loop_run (wallpaper.loop);
  return EXIT_SUCCESS;
}

int
main (int    argc,
      char **argv)
{
  if (argc == 4 && g_str_equal (argv[1], "--still"))
    {
      gst_init (NULL, NULL);
      return wallpaper_extract_still (argv[2], argv[3]) ? EXIT_SUCCESS : EXIT_FAILURE;
    }

  if (argc != 2)
    {
      g_printerr ("Usage: kestrel-wallpaper URI\n"
                  "       kestrel-wallpaper --still URI PATH\n");
      return EXIT_FAILURE;
    }

  share_decoded_frames_with_gtk ();
  g_set_prgname (APPLICATION_ID);
  gtk_init ();
  gst_init (NULL, NULL);
  if (!has_video_sink ())
    {
      g_printerr ("kestrel-wallpaper: live wallpapers need the GStreamer GTK 4 video sink (gtk4paintablesink)\n");
      return EX_UNAVAILABLE;
    }
  return play (argv[1]);
}
