/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <cairo.h>

#include "st-fitted-icon.h"
#include "st-icon-theme.h"

G_BEGIN_DECLS

StIconInfo *_st_fitted_icon_lookup (StFittedIcon *icon,
                                    StIconTheme  *theme,
                                    int           pixels);

void _st_fitted_icon_render_async (StFittedIcon        *icon,
                                   gpointer             source_object,
                                   StIconInfo          *info,
                                   int                  pixels,
                                   GCancellable        *cancellable,
                                   GAsyncReadyCallback  callback,
                                   gpointer             user_data);

GdkPixbuf *_st_fitted_icon_render_finish (GAsyncResult  *result,
                                          GError       **error);

float _st_fitted_icon_shape_extent (float coverage);

GdkPixbuf *_st_surface_to_pixbuf (cairo_surface_t *surface);

G_END_DECLS
