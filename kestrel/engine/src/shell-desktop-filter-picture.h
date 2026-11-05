#pragma once

#include <clutter/clutter.h>

typedef struct
{
  ClutterViewFilter *filter;
  CoglOffscreen *scene;
  CoglOffscreen *result;
  CoglPipeline *pipeline;
  MtkRectangle area;
  gboolean scene_stale;
  gboolean result_stale;
  gboolean clip_grown;
} ShellDesktopFilterPicture;

ShellDesktopFilterPicture *shell_desktop_filter_picture_new (ClutterViewFilter *filter);
void shell_desktop_filter_picture_free (ShellDesktopFilterPicture *picture);

void shell_desktop_filter_picture_place (ShellDesktopFilterPicture *picture,
                                         ClutterStageView          *view,
                                         const MtkRectangle        *pixels,
                                         gboolean                   opaque);

void shell_desktop_filter_picture_paint_scene (ShellDesktopFilterPicture *picture,
                                               ClutterActor              *actor,
                                               ClutterPaintContext       *paint_context);

void shell_desktop_filter_picture_run_filter (ShellDesktopFilterPicture *picture);

ClutterActorBox shell_desktop_filter_picture_stage_box (ShellDesktopFilterPicture *picture,
                                                        ClutterStageView          *view);

void shell_desktop_filter_picture_add (ShellDesktopFilterPicture *picture,
                                       ClutterStageView          *view,
                                       float                      opacity,
                                       ClutterPaintNode          *node);

ClutterPaintNode *shell_desktop_filter_stage_coordinates_node (ClutterActor *actor);
