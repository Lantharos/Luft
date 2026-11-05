#include "config.h"

#include "shell-desktop-filter-picture.h"

ShellDesktopFilterPicture *
shell_desktop_filter_picture_new (ClutterViewFilter *filter)
{
  ShellDesktopFilterPicture *picture = g_new0 (ShellDesktopFilterPicture, 1);

  picture->filter = g_object_ref (filter);
  picture->scene_stale = TRUE;
  picture->result_stale = TRUE;
  return picture;
}

void
shell_desktop_filter_picture_free (ShellDesktopFilterPicture *picture)
{
  g_clear_object (&picture->filter);
  g_clear_object (&picture->scene);
  g_clear_object (&picture->result);
  g_clear_object (&picture->pipeline);
  g_free (picture);
}

static CoglOffscreen *
new_target (CoglContext *context,
            int          width,
            int          height)
{
  g_autoptr (CoglTexture) texture = cogl_texture_2d_new_with_size (context, width, height);
  CoglOffscreen *target = cogl_offscreen_new_with_texture (texture);
  g_autoptr (GError) error = NULL;

  if (!cogl_framebuffer_allocate (COGL_FRAMEBUFFER (target), &error))
    g_warning ("Failed to allocate a desktop filter's picture: %s", error->message);

  return target;
}

static void
fit_targets (ShellDesktopFilterPicture *picture,
             CoglContext               *context,
             int                        width,
             int                        height,
             gboolean                   opaque)
{
  CoglTexture *texture;

  g_set_object (&picture->scene, NULL);
  g_set_object (&picture->result, NULL);
  picture->scene = new_target (context, width, height);
  picture->result = new_target (context, width, height);

  texture = cogl_offscreen_get_texture (picture->result);
  if (!picture->pipeline)
    {
      picture->pipeline = cogl_pipeline_new (context);
      cogl_pipeline_set_layer_wrap_mode (picture->pipeline, 0,
                                         COGL_PIPELINE_WRAP_MODE_CLAMP_TO_EDGE);
      cogl_pipeline_set_layer_filters (picture->pipeline, 0,
                                       COGL_PIPELINE_FILTER_LINEAR,
                                       COGL_PIPELINE_FILTER_LINEAR);
      if (opaque)
        cogl_pipeline_set_blend (picture->pipeline, "RGBA = ADD (SRC_COLOR, 0)", NULL);
    }
  cogl_pipeline_set_layer_texture (picture->pipeline, 0, texture);
}

void
shell_desktop_filter_picture_place (ShellDesktopFilterPicture *picture,
                                    ClutterStageView          *view,
                                    const MtkRectangle        *pixels,
                                    gboolean                   opaque)
{
  CoglFramebuffer *framebuffer = clutter_stage_view_get_framebuffer (view);
  float width = cogl_framebuffer_get_width (framebuffer);
  float height = cogl_framebuffer_get_height (framebuffer);
  float area[4] = { pixels->x / width, pixels->y / height,
                    pixels->width / width, pixels->height / height };

  if (!picture->scene ||
      picture->area.width != pixels->width ||
      picture->area.height != pixels->height)
    fit_targets (picture, cogl_framebuffer_get_context (framebuffer),
                 pixels->width, pixels->height, opaque);

  picture->area = *pixels;
  picture->scene_stale = TRUE;
  picture->result_stale = TRUE;
  clutter_view_filter_set_uniform (picture->filter, "filter_area", 4, area, 4);
}

static void
get_actor_to_stage (ClutterActor      *actor,
                    graphene_matrix_t *actor_to_stage)
{
  ClutterActor *stage = clutter_actor_get_stage (actor);

  graphene_matrix_init_identity (actor_to_stage);
  for (; actor != stage; actor = clutter_actor_get_parent (actor))
    {
      graphene_matrix_t transform;

      clutter_actor_get_transform (actor, &transform);
      graphene_matrix_multiply (actor_to_stage, &transform, actor_to_stage);
    }
}

void
shell_desktop_filter_picture_paint_scene (ShellDesktopFilterPicture *picture,
                                          ClutterActor              *actor,
                                          ClutterPaintContext       *paint_context)
{
  CoglFramebuffer *source = clutter_paint_context_get_framebuffer (paint_context);
  CoglFramebuffer *scene = COGL_FRAMEBUFFER (picture->scene);
  ClutterActor *stage = clutter_actor_get_stage (actor);
  g_autoptr (ClutterPaintNode) actor_node = clutter_actor_node_new (actor, 255);
  ClutterPaintContext *whole_scene;
  graphene_matrix_t projection, actor_to_stage, stage_to_eye, modelview;
  float viewport[4];

  cogl_framebuffer_clear4f (scene, COGL_BUFFER_BIT_COLOR, 0.f, 0.f, 0.f, 0.f);

  cogl_framebuffer_get_viewport4fv (source, viewport);
  cogl_framebuffer_set_viewport (scene,
                                 viewport[0] - picture->area.x,
                                 viewport[1] - picture->area.y,
                                 viewport[2], viewport[3]);
  cogl_framebuffer_get_projection_matrix (source, &projection);
  cogl_framebuffer_set_projection_matrix (scene, &projection);

  get_actor_to_stage (actor, &actor_to_stage);
  clutter_actor_get_transform (stage, &stage_to_eye);
  graphene_matrix_multiply (&actor_to_stage, &stage_to_eye, &modelview);
  cogl_framebuffer_set_modelview_matrix (scene, &modelview);

  whole_scene = clutter_paint_context_new_for_framebuffer (scene, NULL,
                                                           clutter_paint_context_get_paint_flags (paint_context),
                                                           clutter_paint_context_get_color_state (paint_context));
  clutter_paint_node_paint (actor_node, whole_scene);
  clutter_paint_context_destroy (whole_scene);

  picture->scene_stale = FALSE;
  picture->result_stale = TRUE;
}

void
shell_desktop_filter_picture_run_filter (ShellDesktopFilterPicture *picture)
{
  CoglPipeline *pipeline =
    clutter_view_filter_run (picture->filter, cogl_offscreen_get_texture (picture->scene));

  cogl_framebuffer_draw_textured_rectangle (COGL_FRAMEBUFFER (picture->result), pipeline,
                                            -1, 1, 1, -1,
                                            0, 0, 1, 1);
  picture->result_stale = FALSE;
}

ClutterActorBox
shell_desktop_filter_picture_stage_box (ShellDesktopFilterPicture *picture,
                                        ClutterStageView          *view)
{
  float scale = clutter_stage_view_get_scale (view);
  MtkRectangle layout;

  clutter_stage_view_get_layout (view, &layout);
  return (ClutterActorBox) {
    layout.x + picture->area.x / scale,
    layout.y + picture->area.y / scale,
    layout.x + (picture->area.x + picture->area.width) / scale,
    layout.y + (picture->area.y + picture->area.height) / scale,
  };
}

void
shell_desktop_filter_picture_add (ShellDesktopFilterPicture *picture,
                                  ClutterStageView          *view,
                                  float                      opacity,
                                  ClutterPaintNode          *node)
{
  ClutterActorBox box = shell_desktop_filter_picture_stage_box (picture, view);
  g_autoptr (ClutterPaintNode) pipeline_node = NULL;
  CoglColor color;

  cogl_color_init_from_4f (&color, opacity, opacity, opacity, opacity);
  cogl_pipeline_set_color (picture->pipeline, &color);

  pipeline_node = clutter_pipeline_node_new (picture->pipeline);
  clutter_paint_node_set_static_name (pipeline_node, "ShellDesktopFilterEffect");
  clutter_paint_node_add_child (node, pipeline_node);
  clutter_paint_node_add_texture_rectangle (pipeline_node, &box, 0, 0, 1, 1);
}

ClutterPaintNode *
shell_desktop_filter_stage_coordinates_node (ClutterActor *actor)
{
  graphene_matrix_t actor_to_stage, stage_to_actor;

  get_actor_to_stage (actor, &actor_to_stage);
  if (!graphene_matrix_inverse (&actor_to_stage, &stage_to_actor))
    return NULL;

  return clutter_transform_node_new (&stage_to_actor);
}
