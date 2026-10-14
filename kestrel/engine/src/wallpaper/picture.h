#pragma once

#include <gtk/gtk.h>

#define WALLPAPER_TYPE_PICTURE (wallpaper_picture_get_type ())
G_DECLARE_FINAL_TYPE (WallpaperPicture, wallpaper_picture, WALLPAPER, PICTURE, GtkWidget)

GtkWidget *wallpaper_picture_new (void);
void wallpaper_picture_set_paintable (WallpaperPicture *picture,
                                      GdkPaintable     *paintable);
void wallpaper_picture_set_content_fit (WallpaperPicture *picture,
                                        GtkContentFit     fit);
void wallpaper_picture_set_focus (WallpaperPicture *picture,
                                  double            x,
                                  double            y);
