/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include "st-icon-theme.h"
#include "st-styled-icon.h"

G_BEGIN_DECLS

typedef struct
{
  CoglColor plate;
  CoglColor ink;
  CoglColor shade;
  float rim;
} StStyledIconPaint;

StIconInfo *_st_styled_icon_lookup (StStyledIcon *icon,
                                    StIconTheme  *theme,
                                    int           size,
                                    int           scale,
                                    gboolean     *glyph);

void _st_styled_icon_render_async (StStyledIcon        *icon,
                                   gpointer             source_object,
                                   StIconInfo          *info,
                                   gboolean             glyph,
                                   int                  size,
                                   int                  scale,
                                   const char          *path,
                                   GCancellable        *cancellable,
                                   GAsyncReadyCallback  callback,
                                   gpointer             user_data);

GdkPixbuf *_st_styled_icon_render_finish (GAsyncResult  *result,
                                          GError       **error);

GdkPixbuf *_st_styled_icon_paint (const StStyledIconPaint *paint,
                                  GdkPixbuf               *source,
                                  gboolean                 glyph,
                                  int                      size,
                                  int                      scale);

int _st_styled_icon_glyph_size (int size);

G_END_DECLS
