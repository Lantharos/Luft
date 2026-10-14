#include "picture.h"

#include <math.h>

struct _WallpaperPicture
{
  GtkWidget parent_instance;
  GdkPaintable *paintable;
  GtkContentFit fit;
  double focus_x;
  double focus_y;
};

G_DEFINE_FINAL_TYPE (WallpaperPicture, wallpaper_picture, GTK_TYPE_WIDGET)

static void
content_size (WallpaperPicture *picture,
              double            width,
              double            height,
              double           *content_width,
              double           *content_height)
{
  double ratio = gdk_paintable_get_intrinsic_aspect_ratio (picture->paintable);
  gboolean wider = width / height > ratio;

  *content_width = width;
  *content_height = height;
  if (ratio <= 0 || picture->fit == GTK_CONTENT_FIT_FILL)
    return;

  if (wider == (picture->fit == GTK_CONTENT_FIT_COVER))
    *content_height = width / ratio;
  else
    *content_width = height * ratio;

  if (picture->fit == GTK_CONTENT_FIT_SCALE_DOWN)
    {
      double intrinsic_width = gdk_paintable_get_intrinsic_width (picture->paintable);

      if (intrinsic_width > 0 && intrinsic_width < *content_width)
        {
          *content_width = intrinsic_width;
          *content_height = intrinsic_width / ratio;
        }
    }
}

static void
wallpaper_picture_snapshot (GtkWidget   *widget,
                            GtkSnapshot *snapshot)
{
  WallpaperPicture *picture = WALLPAPER_PICTURE (widget);
  double width = gtk_widget_get_width (widget);
  double height = gtk_widget_get_height (widget);
  gboolean cover = picture->fit == GTK_CONTENT_FIT_COVER;
  double content_width, content_height;

  if (!picture->paintable || width <= 0 || height <= 0)
    return;

  content_size (picture, width, height, &content_width, &content_height);
  gtk_snapshot_push_clip (snapshot, &GRAPHENE_RECT_INIT (0, 0, width, height));
  gtk_snapshot_save (snapshot);
  gtk_snapshot_translate (snapshot, &GRAPHENE_POINT_INIT (
    (float) round ((width - content_width) * (cover ? picture->focus_x : 0.5)),
    (float) round ((height - content_height) * (cover ? picture->focus_y : 0.5))));
  gdk_paintable_snapshot (picture->paintable, snapshot, content_width, content_height);
  gtk_snapshot_restore (snapshot);
  gtk_snapshot_pop (snapshot);
}

static void
wallpaper_picture_dispose (GObject *object)
{
  wallpaper_picture_set_paintable (WALLPAPER_PICTURE (object), NULL);
  G_OBJECT_CLASS (wallpaper_picture_parent_class)->dispose (object);
}

static void
wallpaper_picture_class_init (WallpaperPictureClass *klass)
{
  G_OBJECT_CLASS (klass)->dispose = wallpaper_picture_dispose;
  GTK_WIDGET_CLASS (klass)->snapshot = wallpaper_picture_snapshot;
}

static void
wallpaper_picture_init (WallpaperPicture *picture)
{
  picture->fit = GTK_CONTENT_FIT_COVER;
  picture->focus_x = 0.5;
  picture->focus_y = 0.5;
}

GtkWidget *
wallpaper_picture_new (void)
{
  return g_object_new (WALLPAPER_TYPE_PICTURE, NULL);
}

void
wallpaper_picture_set_paintable (WallpaperPicture *picture,
                                 GdkPaintable     *paintable)
{
  if (picture->paintable == paintable)
    return;

  if (picture->paintable)
    g_signal_handlers_disconnect_by_data (picture->paintable, picture);
  g_set_object (&picture->paintable, paintable);
  if (paintable)
    {
      g_signal_connect_swapped (paintable, "invalidate-contents", G_CALLBACK (gtk_widget_queue_draw), picture);
      g_signal_connect_swapped (paintable, "invalidate-size", G_CALLBACK (gtk_widget_queue_draw), picture);
    }
  gtk_widget_queue_draw (GTK_WIDGET (picture));
}

void
wallpaper_picture_set_content_fit (WallpaperPicture *picture,
                                   GtkContentFit     fit)
{
  picture->fit = fit;
  gtk_widget_queue_draw (GTK_WIDGET (picture));
}

void
wallpaper_picture_set_focus (WallpaperPicture *picture,
                             double            x,
                             double            y)
{
  picture->focus_x = CLAMP (x, 0.0, 1.0);
  picture->focus_y = CLAMP (y, 0.0, 1.0);
  gtk_widget_queue_draw (GTK_WIDGET (picture));
}
