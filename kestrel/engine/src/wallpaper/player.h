#pragma once

#include <gtk/gtk.h>

typedef struct _WallpaperPlayer WallpaperPlayer;

WallpaperPlayer *wallpaper_player_new (const char *uri);
GdkPaintable *wallpaper_player_get_paintable (WallpaperPlayer *player);
void wallpaper_player_set_playing (WallpaperPlayer *player,
                                   gboolean         playing);
