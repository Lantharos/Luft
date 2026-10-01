#pragma once

#include <gtk/gtk.h>

typedef struct _WallpaperSurfaces WallpaperSurfaces;

WallpaperSurfaces *wallpaper_surfaces_new (GdkPaintable *paintable);
void wallpaper_surfaces_set_live (WallpaperSurfaces  *surfaces,
                                  const char * const *connectors);
void wallpaper_surfaces_hold_frames (WallpaperSurfaces *surfaces);
