/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

/**
 * ShellEmojiRenderer:
 *
 * Draws color emoji into standalone images, apart from the text renderer's
 * glyph caches.
 */

#include "config.h"

#include <math.h>
#include <string.h>
#include <fontconfig/fontconfig.h>
#include <hb.h>
#include <hb-raster.h>

#include "shell-emoji-renderer.h"
#include "shell-global.h"
#include "st.h"

struct _ShellEmojiRenderer
{
  GObject parent_instance;

  hb_font_t *font;
  hb_buffer_t *buffer;
  hb_raster_paint_t *paint;
};

G_DEFINE_FINAL_TYPE (ShellEmojiRenderer, shell_emoji_renderer, G_TYPE_OBJECT)

static hb_face_t *
load_emoji_face (void)
{
  FcPattern *pattern, *match;
  FcResult result;
  FcChar8 *file = NULL;
  int index = 0;
  hb_blob_t *blob;
  hb_face_t *face;

  pattern = FcPatternBuild (NULL,
                            FC_FAMILY, FcTypeString, "emoji",
                            FC_COLOR, FcTypeBool, FcTrue,
                            NULL);
  FcConfigSubstitute (NULL, pattern, FcMatchPattern);
  FcDefaultSubstitute (pattern);
  match = FcFontMatch (NULL, pattern, &result);
  FcPatternDestroy (pattern);

  if (match)
    {
      FcPatternGetString (match, FC_FILE, 0, &file);
      FcPatternGetInteger (match, FC_INDEX, 0, &index);
    }

  blob = hb_blob_create_from_file (file ? (const char *) file : "");
  face = hb_face_create (blob, index);
  hb_blob_destroy (blob);
  g_clear_pointer (&match, FcPatternDestroy);
  return face;
}

static void
shell_emoji_renderer_finalize (GObject *object)
{
  ShellEmojiRenderer *self = SHELL_EMOJI_RENDERER (object);

  hb_raster_paint_destroy (self->paint);
  hb_buffer_destroy (self->buffer);
  hb_font_destroy (self->font);

  G_OBJECT_CLASS (shell_emoji_renderer_parent_class)->finalize (object);
}

static void
shell_emoji_renderer_class_init (ShellEmojiRendererClass *klass)
{
  G_OBJECT_CLASS (klass)->finalize = shell_emoji_renderer_finalize;
}

static void
shell_emoji_renderer_init (ShellEmojiRenderer *self)
{
  hb_face_t *face = load_emoji_face ();

  self->font = hb_font_create (face);
  hb_face_destroy (face);
  self->buffer = hb_buffer_create ();
  self->paint = hb_raster_paint_create_or_fail ();
}

ShellEmojiRenderer *
shell_emoji_renderer_new (void)
{
  return g_object_new (SHELL_TYPE_EMOJI_RENDERER, NULL);
}

/**
 * shell_emoji_renderer_render:
 * @renderer: a #ShellEmojiRenderer
 * @text: an emoji, including any modifiers and joiners
 * @size: the em size in logical pixels
 * @scale: the number of device pixels per logical pixel
 *
 * Returns: (transfer full) (nullable): the emoji as an image, or %NULL
 *   when the emoji font does not draw it as a single glyph
 */
ClutterContent *
shell_emoji_renderer_render (ShellEmojiRenderer *renderer,
                             const char         *text,
                             int                 size,
                             float               scale)
{
  int pixels = (int) ceilf (size * scale);
  ClutterActor *stage = CLUTTER_ACTOR (shell_global_get_stage (shell_global_get ()));
  ClutterBackend *backend = clutter_context_get_backend (clutter_actor_get_context (stage));
  hb_glyph_info_t *glyphs;
  hb_glyph_extents_t glyph_extents;
  hb_raster_image_t *image;
  hb_raster_extents_t extents;
  ClutterContent *content;
  const uint8_t *pixels_up;
  g_autofree uint8_t *pixels_down = NULL;
  unsigned int n_glyphs, row;

  g_return_val_if_fail (SHELL_IS_EMOJI_RENDERER (renderer), NULL);

  hb_font_set_scale (renderer->font, pixels, pixels);
  hb_buffer_clear_contents (renderer->buffer);
  hb_buffer_add_utf8 (renderer->buffer, text, -1, 0, -1);
  hb_buffer_guess_segment_properties (renderer->buffer);
  hb_shape (renderer->font, renderer->buffer, NULL, 0);

  glyphs = hb_buffer_get_glyph_infos (renderer->buffer, &n_glyphs);
  if (n_glyphs != 1 || glyphs[0].codepoint == 0)
    return NULL;

  hb_font_get_glyph_extents (renderer->font, glyphs[0].codepoint, &glyph_extents);
  hb_raster_paint_set_glyph_extents (renderer->paint, &glyph_extents);
  hb_raster_paint_glyph (renderer->paint, renderer->font, glyphs[0].codepoint);
  image = hb_raster_paint_render (renderer->paint);
  hb_raster_image_get_extents (image, &extents);

  pixels_up = hb_raster_image_get_buffer (image);
  pixels_down = g_malloc (extents.stride * extents.height);
  for (row = 0; row < extents.height; row++)
    memcpy (pixels_down + row * extents.stride,
            pixels_up + (extents.height - 1 - row) * extents.stride,
            extents.stride);

  content = st_image_content_new_with_preferred_size (ceilf (extents.width / scale),
                                                      ceilf (extents.height / scale));
  st_image_content_set_data (ST_IMAGE_CONTENT (content),
                             clutter_backend_get_cogl_context (backend),
                             pixels_down,
                             COGL_PIXEL_FORMAT_BGRA_8888_PRE,
                             extents.width, extents.height, extents.stride,
                             NULL);
  hb_raster_paint_recycle_image (renderer->paint, image);
  return content;
}
