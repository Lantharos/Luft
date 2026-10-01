#include "surfaces.h"

#define BACKGROUND_SCHEMA "org.gnome.desktop.background"

struct _WallpaperSurfaces
{
  GdkPaintable *paintable;
  GListModel *monitors;
  GSettings *background;
  GPtrArray *windows;
  GStrv live;
  gboolean ready;
  gboolean holding;
};

static GtkContentFit
content_fit (GSettings *background)
{
  g_autofree char *option = g_settings_get_string (background, "picture-options");

  if (g_str_equal (option, "scaled"))
    return GTK_CONTENT_FIT_CONTAIN;
  if (g_str_equal (option, "stretched"))
    return GTK_CONTENT_FIT_FILL;
  if (g_str_equal (option, "centered"))
    return GTK_CONTENT_FIT_SCALE_DOWN;
  return GTK_CONTENT_FIT_COVER;
}

static GtkPicture *
window_picture (GtkWindow *window)
{
  return GTK_PICTURE (gtk_window_get_child (window));
}

static void
sync_playback (WallpaperSurfaces *surfaces,
               GtkWindow         *window)
{
  g_autoptr (GdkPaintable) frame = NULL;

  if (surfaces->holding)
    return;

  if (g_strv_contains ((const char * const *) surfaces->live, gtk_window_get_title (window)))
    {
      gtk_picture_set_paintable (window_picture (window), surfaces->paintable);
      return;
    }

  frame = gdk_paintable_get_current_image (surfaces->paintable);
  gtk_picture_set_paintable (window_picture (window), frame);
}

static void
pass_input_through (GtkWidget *window)
{
  cairo_region_t *nothing = cairo_region_create ();

  gdk_surface_set_input_region (gtk_native_get_surface (GTK_NATIVE (window)), nothing);
  cairo_region_destroy (nothing);
}

static GtkWindow *
create_window (WallpaperSurfaces *surfaces,
               GdkMonitor        *monitor)
{
  GtkWindow *window = GTK_WINDOW (gtk_window_new ());
  GtkWidget *picture = gtk_picture_new ();
  GdkRectangle geometry;

  gdk_monitor_get_geometry (monitor, &geometry);
  gtk_window_set_title (window, gdk_monitor_get_connector (monitor));
  gtk_window_set_decorated (window, FALSE);
  gtk_window_set_default_size (window, geometry.width, geometry.height);
  gtk_picture_set_can_shrink (GTK_PICTURE (picture), TRUE);
  gtk_picture_set_content_fit (GTK_PICTURE (picture), content_fit (surfaces->background));
  gtk_window_set_child (window, picture);
  g_signal_connect_after (window, "realize", G_CALLBACK (pass_input_through), NULL);

  sync_playback (surfaces, window);
  if (surfaces->ready)
    gtk_window_present (window);
  return window;
}

static void
rebuild_windows (WallpaperSurfaces *surfaces)
{
  guint count = g_list_model_get_n_items (surfaces->monitors);

  g_ptr_array_set_size (surfaces->windows, 0);
  for (guint index = 0; index < count; index++)
    {
      g_autoptr (GdkMonitor) monitor = g_list_model_get_item (surfaces->monitors, index);

      g_ptr_array_add (surfaces->windows, create_window (surfaces, monitor));
    }
}

static void
on_monitors_changed (GListModel        *monitors,
                     guint              position,
                     guint              removed,
                     guint              added,
                     WallpaperSurfaces *surfaces)
{
  rebuild_windows (surfaces);
}

static void
on_fit_changed (GSettings         *background,
                const char        *key,
                WallpaperSurfaces *surfaces)
{
  GtkContentFit fit = content_fit (background);

  for (guint index = 0; index < surfaces->windows->len; index++)
    gtk_picture_set_content_fit (window_picture (surfaces->windows->pdata[index]), fit);
}

static void
on_first_frame (GdkPaintable      *paintable,
                WallpaperSurfaces *surfaces)
{
  g_signal_handlers_disconnect_by_func (paintable, on_first_frame, surfaces);
  surfaces->ready = TRUE;
  for (guint index = 0; index < surfaces->windows->len; index++)
    {
      sync_playback (surfaces, surfaces->windows->pdata[index]);
      gtk_window_present (surfaces->windows->pdata[index]);
    }
}

static void
on_frames_again (GdkPaintable      *paintable,
                 WallpaperSurfaces *surfaces)
{
  g_signal_handlers_disconnect_by_func (paintable, on_frames_again, surfaces);
  surfaces->holding = FALSE;
  for (guint index = 0; index < surfaces->windows->len; index++)
    sync_playback (surfaces, surfaces->windows->pdata[index]);
}

void
wallpaper_surfaces_hold_frames (WallpaperSurfaces *surfaces)
{
  if (surfaces->holding)
    return;

  surfaces->holding = TRUE;
  g_signal_connect (surfaces->paintable, "invalidate-contents", G_CALLBACK (on_frames_again), surfaces);
}

WallpaperSurfaces *
wallpaper_surfaces_new (GdkPaintable *paintable)
{
  WallpaperSurfaces *surfaces = g_new0 (WallpaperSurfaces, 1);

  surfaces->paintable = paintable;
  surfaces->monitors = gdk_display_get_monitors (gdk_display_get_default ());
  surfaces->background = g_settings_new (BACKGROUND_SCHEMA);
  surfaces->windows = g_ptr_array_new_with_free_func ((GDestroyNotify) gtk_window_destroy);
  surfaces->live = g_new0 (char *, 1);

  g_signal_connect (surfaces->monitors, "items-changed", G_CALLBACK (on_monitors_changed), surfaces);
  g_signal_connect (surfaces->background, "changed::picture-options", G_CALLBACK (on_fit_changed), surfaces);
  g_signal_connect (paintable, "invalidate-contents", G_CALLBACK (on_first_frame), surfaces);
  rebuild_windows (surfaces);
  return surfaces;
}

void
wallpaper_surfaces_set_live (WallpaperSurfaces  *surfaces,
                             const char * const *connectors)
{
  g_strfreev (surfaces->live);
  surfaces->live = g_strdupv ((char **) connectors);
  for (guint index = 0; index < surfaces->windows->len; index++)
    sync_playback (surfaces, surfaces->windows->pdata[index]);
}
