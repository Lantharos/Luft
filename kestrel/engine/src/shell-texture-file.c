/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

/**
 * ShellTextureFile:
 *
 * Keeps rendered textures on disk as raw pixels, so they come back without
 * decoding or rendering them again.
 */

#include "config.h"

#include <math.h>
#include <string.h>

#include "shell-global.h"
#include "shell-texture-file.h"

#define TEXTURE_FILE_MAGIC 0x3158544bu
#define TEXTURE_FILE_FORMAT COGL_PIXEL_FORMAT_RGBA_8888_PRE
#define TEXTURE_FILE_BYTES_PER_PIXEL 4

typedef struct
{
  uint32_t magic;
  uint32_t width;
  uint32_t height;
  uint32_t components;
  uint32_t metadata_size;
} TextureFileHeader;

static CoglContext *
cogl_context (void)
{
  ClutterActor *stage = CLUTTER_ACTOR (shell_global_get_stage (shell_global_get ()));
  ClutterBackend *backend = clutter_context_get_backend (clutter_actor_get_context (stage));

  return clutter_backend_get_cogl_context (backend);
}

/**
 * shell_texture_file_paint_actor:
 * @actor: a mapped #ClutterActor, which may be fully transparent
 *
 * Paints @actor and its effects at its resource scale, as it appears on
 * screen at full opacity.
 *
 * Returns: (transfer full) (nullable): the painted texture
 */
CoglTexture *
shell_texture_file_paint_actor (ClutterActor *actor)
{
  float resource_scale = clutter_actor_get_resource_scale (actor);
  ClutterColorState *color_state = clutter_actor_get_color_state (actor);
  g_autoptr (CoglTexture) texture = NULL;
  g_autoptr (CoglOffscreen) offscreen = NULL;
  g_autoptr (GError) error = NULL;
  ClutterPaintContext *paint_context;
  CoglFramebuffer *framebuffer;
  float x, y, width, height;

  clutter_actor_get_position (actor, &x, &y);
  clutter_actor_get_size (actor, &width, &height);
  texture = cogl_texture_2d_new_with_size (cogl_context (),
                                           ceilf (width * resource_scale),
                                           ceilf (height * resource_scale));
  offscreen = cogl_offscreen_new_with_texture (texture);
  framebuffer = COGL_FRAMEBUFFER (offscreen);
  if (!cogl_framebuffer_allocate (framebuffer, &error))
    {
      g_warning ("Could not paint an actor offscreen: %s", error->message);
      return NULL;
    }

  cogl_framebuffer_clear4f (framebuffer, COGL_BUFFER_BIT_COLOR, 0, 0, 0, 0);
  cogl_framebuffer_translate (framebuffer, -x * resource_scale, -y * resource_scale, 0);
  cogl_framebuffer_orthographic (framebuffer, 0, 0,
                                 cogl_texture_get_width (texture),
                                 cogl_texture_get_height (texture),
                                 0, 1.0);
  cogl_framebuffer_scale (framebuffer, resource_scale, resource_scale, 1);

  clutter_actor_set_opacity_override (actor, 255);
  paint_context = clutter_paint_context_new_for_framebuffer (framebuffer, NULL,
                                                             CLUTTER_PAINT_FLAG_NONE,
                                                             color_state);
  clutter_paint_context_push_color_state (paint_context, color_state);
  clutter_actor_paint (actor, paint_context);
  clutter_paint_context_pop_color_state (paint_context);
  clutter_paint_context_destroy (paint_context);
  clutter_actor_set_opacity_override (actor, -1);

  return g_steal_pointer (&texture);
}

/**
 * shell_texture_file_encode:
 * @texture: a #CoglTexture
 * @metadata: (nullable): bytes kept next to the pixels
 *
 * Reads @texture back from the GPU into the contents of a texture file.
 *
 * Returns: (transfer full): the file contents
 */
GBytes *
shell_texture_file_encode (CoglTexture *texture,
                           GBytes      *metadata)
{
  int width = cogl_texture_get_width (texture);
  int height = cogl_texture_get_height (texture);
  gsize metadata_size = metadata ? g_bytes_get_size (metadata) : 0;
  gsize pixels_size = (gsize) width * height * TEXTURE_FILE_BYTES_PER_PIXEL;
  gsize size = sizeof (TextureFileHeader) + metadata_size + pixels_size;
  guint8 *contents = g_malloc (size);
  TextureFileHeader header = {
    .magic = TEXTURE_FILE_MAGIC,
    .width = width,
    .height = height,
    .components = cogl_texture_get_components (texture),
    .metadata_size = metadata_size,
  };

  memcpy (contents, &header, sizeof header);
  if (metadata_size)
    memcpy (contents + sizeof header, g_bytes_get_data (metadata, NULL), metadata_size);
  cogl_texture_get_data (texture, TEXTURE_FILE_FORMAT,
                         width * TEXTURE_FILE_BYTES_PER_PIXEL,
                         contents + sizeof header + metadata_size);

  return g_bytes_new_take (contents, size);
}

static const TextureFileHeader *
read_header (GBytes  *contents,
             GError **error)
{
  gsize size;
  const TextureFileHeader *header = g_bytes_get_data (contents, &size);

  if (size < sizeof *header ||
      header->magic != TEXTURE_FILE_MAGIC ||
      size != sizeof *header + header->metadata_size +
              (gsize) header->width * header->height * TEXTURE_FILE_BYTES_PER_PIXEL)
    {
      g_set_error_literal (error, G_IO_ERROR, G_IO_ERROR_INVALID_DATA,
                           "Not a texture file");
      return NULL;
    }

  return header;
}

static void
load_in_thread (GTask        *task,
                gpointer      source_object,
                gpointer      task_data,
                GCancellable *cancellable)
{
  GFile *file = task_data;
  g_autoptr (GError) error = NULL;
  g_autoptr (GBytes) contents = NULL;
  char *data;
  gsize size;

  if (!g_file_load_contents (file, cancellable, &data, &size, NULL, &error))
    {
      g_task_return_error (task, g_steal_pointer (&error));
      return;
    }

  contents = g_bytes_new_take (data, size);
  if (!read_header (contents, &error))
    {
      g_task_return_error (task, g_steal_pointer (&error));
      return;
    }

  g_task_return_pointer (task, g_steal_pointer (&contents),
                         (GDestroyNotify) g_bytes_unref);
}

/**
 * shell_texture_file_load_async:
 * @file: a file written from shell_texture_file_encode()
 * @io_priority: the priority of the request
 * @cancellable: (nullable): a #GCancellable
 * @callback: (scope async): called once the file is read
 * @user_data: data for @callback
 *
 * Reads a texture file in a worker thread.
 */
void
shell_texture_file_load_async (GFile               *file,
                               int                  io_priority,
                               GCancellable        *cancellable,
                               GAsyncReadyCallback  callback,
                               gpointer             user_data)
{
  g_autoptr (GTask) task = g_task_new (NULL, cancellable, callback, user_data);

  g_task_set_source_tag (task, shell_texture_file_load_async);
  g_task_set_priority (task, io_priority);
  g_task_set_task_data (task, g_object_ref (file), g_object_unref);
  g_task_run_in_thread (task, load_in_thread);
}

/**
 * shell_texture_file_load_finish:
 * @result: the #GAsyncResult passed to the callback
 * @metadata: (out) (optional) (transfer full): the bytes kept next to the pixels
 * @error: return location for a #GError
 *
 * Uploads the pixels read by shell_texture_file_load_async().
 *
 * Returns: (transfer full): the texture
 */
CoglTexture *
shell_texture_file_load_finish (GAsyncResult  *result,
                                GBytes       **metadata,
                                GError       **error)
{
  g_autoptr (GBytes) contents = g_task_propagate_pointer (G_TASK (result), error);
  g_autoptr (CoglBitmap) bitmap = NULL;
  g_autoptr (CoglTexture) texture = NULL;
  const TextureFileHeader *header;
  const guint8 *pixels;

  if (!contents)
    return NULL;

  header = g_bytes_get_data (contents, NULL);
  pixels = (const guint8 *) (header + 1) + header->metadata_size;
  bitmap = cogl_bitmap_new_for_data (cogl_context (), header->width, header->height,
                                     TEXTURE_FILE_FORMAT,
                                     header->width * TEXTURE_FILE_BYTES_PER_PIXEL,
                                     (guint8 *) pixels);
  texture = cogl_texture_2d_new_from_bitmap (bitmap);
  cogl_texture_set_components (texture, header->components);
  if (!cogl_texture_allocate (texture, error))
    return NULL;

  if (metadata)
    *metadata = g_bytes_new_from_bytes (contents, sizeof *header, header->metadata_size);

  return g_steal_pointer (&texture);
}
