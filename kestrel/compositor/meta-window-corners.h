/* SPDX-License-Identifier: GPL-2.0-or-later */
#pragma once

#include "clutter/clutter.h"
#include "mtk/mtk.h"

typedef struct
{
  graphene_rect_t bounds;
  float radius;
} MetaWindowCorners;

MetaWindowCorners meta_window_corners_for_actor (ClutterActor *actor);
void meta_window_corners_apply (const MetaWindowCorners *corners,
                                CoglPipeline            *pipeline,
                           int                      width,
                           int                      height);
void meta_window_corners_subtract_opaque (const MetaWindowCorners *corners,
                                          MtkRegion               *region);
void meta_window_corners_clip_input (const MetaWindowCorners *corners,
                                     MtkRegion               *region);
