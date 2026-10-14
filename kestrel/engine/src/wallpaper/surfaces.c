#include "surfaces.h"

#include "picture.h"

#define BACKGROUND_SCHEMA "org.gnome.desktop.background"
#define INTERFACE_SCHEMA "org.gnome.desktop.interface"
#define KESTREL_SCHEMA "com.lantharos.kestrel"

struct _WallpaperSurfaces
{
  GdkPaintable *paintable;
  GListModel *monitors;
  GSettings *background;
  GSettings *interface;
  GSettings *kestrel;
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

static WallpaperPicture *
window_picture (GtkWindow *window)
{
  return WALLPAPER_PICTURE (gtk_window_get_child (window));
}

static void
apply_focus (WallpaperSurfaces *surfaces,
             WallpaperPicture  *picture)
{
  g_autofree char *scheme = g_settings_get_string (surfaces->interface, "color-scheme");
  const char *key = g_str_equal (scheme, "prefer-dark") ? "wallpaper-focus-dark" : "wallpaper-focus";
  double x, y;

  g_settings_get (surfaces->kestrel, key, "(dd)", &x, &y);
  wallpaper_picture_set_focus (picture, x, y);
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
      wallpaper_picture_set_paintable (window_picture (window), surfaces->paintable);
      return;
    }

  frame = gdk_paintable_get_current_image (surfaces->paintable);
  wallpaper_picture_set_paintable (window_picture (window), frame);
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
  GtkWidget *picture = wallpaper_picture_new ();
  GdkRectangle geometry;

  gdk_monitor_get_geometry (monitor, &geometry);
  gtk_window_set_title (window, gdk_monitor_get_connector (monitor));
  gtk_window_set_decorated (window, FALSE);
  gtk_window_set_default_size (window, geometry.width, geometry.height);
  wallpaper_picture_set_content_fit (WALLPAPER_PICTURE (picture), content_fit (surfaces->background));
  apply_focus (surfaces, WALLPAPER_PICTURE (picture));
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
    wallpaper_picture_set_content_fit (window_picture (surfaces->windows->pdata[index]), fit);
}

static void
on_focus_changed (GSettings         *settings,
                  const char        *key,
                  WallpaperSurfaces *surfaces)
{
  for (guint index = 0; index < surfaces->windows->len; index++)
    apply_focus (surfaces, window_picture (surfaces->windows->pdata[index]));
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
  surfaces->interface = g_settings_new (INTERFACE_SCHEMA);
  surfaces->kestrel = g_settings_new (KESTREL_SCHEMA);
  surfaces->windows = g_ptr_array_new_with_free_func ((GDestroyNotify) gtk_window_destroy);
  surfaces->live = g_new0 (char *, 1);

  g_signal_connect (surfaces->monitors, "items-changed", G_CALLBACK (on_monitors_changed), surfaces);
  g_signal_connect (surfaces->background, "changed::picture-options", G_CALLBACK (on_fit_changed), surfaces);
  g_signal_connect (surfaces->interface, "changed::color-scheme", G_CALLBACK (on_focus_changed), surfaces);
  g_signal_connect (surfaces->kestrel, "changed::wallpaper-focus", G_CALLBACK (on_focus_changed), surfaces);
  g_signal_connect (surfaces->kestrel, "changed::wallpaper-focus-dark", G_CALLBACK (on_focus_changed), surfaces);
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
