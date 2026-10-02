/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

/**
 * ShellGlyphRenderer:
 *
 * Draws single glyphs into standalone images, apart from the text renderer's
 * glyph caches: color emoji from the emoji font, or characters in a text font
 * and its fallbacks, kept on their baseline.
 */

#include "config.h"

#include <math.h>
#include <string.h>
#include <fontconfig/fontconfig.h>
#include <hb.h>
#include <hb-raster.h>

#include "shell-glyph-renderer.h"
#include "shell-global.h"
#include "st.h"

struct _ShellGlyphRenderer
{
  GObject parent_instance;

  FcFontSet *fonts;
  hb_font_t **loaded;
  gboolean text;
  hb_buffer_t *buffer;
  hb_raster_paint_t *paint;
};

G_DEFINE_FINAL_TYPE (ShellGlyphRenderer, shell_glyph_renderer, G_TYPE_OBJECT)

static FcPattern *
substituted (FcPattern *pattern)
{
  FcConfigSubstitute (NULL, pattern, FcMatchPattern);
  FcDefaultSubstitute (pattern);
  return pattern;
}

static FcFontSet *
emoji_fonts (void)
{
  FcFontSet *fonts = FcFontSetCreate ();
  FcPattern *pattern, *match;
  FcResult result;

  pattern = substituted (FcPatternBuild (NULL,
                                         FC_FAMILY, FcTypeString, "emoji",
                                         FC_COLOR, FcTypeBool, FcTrue,
                                         NULL));
  match = FcFontMatch (NULL, pattern, &result);
  FcPatternDestroy (pattern);
  if (match)
    FcFontSetAdd (fonts, match);
  return fonts;
}

static FcFontSet *
text_fonts (const char *family)
{
  FcFontSet *fonts = FcFontSetCreate ();
  FcFontSet *sorted;
  FcPattern *pattern;
  FcResult result;
  FcBool color;
  int i;

  pattern = substituted (FcPatternBuild (NULL, FC_FAMILY, FcTypeString, family, NULL));
  sorted = FcFontSort (NULL, pattern, FcTrue, NULL, &result);
  FcPatternDestroy (pattern);
  if (!sorted)
    return fonts;

  for (i = 0; i < sorted->nfont; i++)
    {
      if (FcPatternGetBool (sorted->fonts[i], FC_COLOR, 0, &color) == FcResultMatch && color)
        continue;
      FcPatternReference (sorted->fonts[i]);
      FcFontSetAdd (fonts, sorted->fonts[i]);
    }
  FcFontSetDestroy (sorted);
  return fonts;
}

static hb_font_t *
load_font (FcPattern *pattern)
{
  FcChar8 *file = NULL;
  int index = 0;
  hb_blob_t *blob;
  hb_face_t *face;
  hb_font_t *font;

  FcPatternGetString (pattern, FC_FILE, 0, &file);
  FcPatternGetInteger (pattern, FC_INDEX, 0, &index);
  blob = hb_blob_create_from_file (file ? (const char *) file : "");
  face = hb_face_create (blob, index & 0xFFFF);
  font = hb_font_create (face);
  if (index >> 16)
    hb_font_set_var_named_instance (font, (index >> 16) - 1);
  hb_face_destroy (face);
  hb_blob_destroy (blob);
  return font;
}

static gboolean
covers (FcPattern *pattern,
        gunichar   character)
{
  FcCharSet *charset;

  return FcPatternGetCharSet (pattern, FC_CHARSET, 0, &charset) == FcResultMatch &&
         FcCharSetHasChar (charset, character);
}

static hb_font_t *
font_for (ShellGlyphRenderer *renderer,
          gunichar            character)
{
  int i;

  for (i = 0; i < renderer->fonts->nfont; i++)
    {
      if (renderer->text && !covers (renderer->fonts->fonts[i], character))
        continue;
      if (!renderer->loaded[i])
        renderer->loaded[i] = load_font (renderer->fonts->fonts[i]);
      return renderer->loaded[i];
    }
  return NULL;
}

static void
keep_baseline (hb_font_t          *font,
               hb_codepoint_t      glyph,
               hb_glyph_extents_t *extents)
{
  hb_font_extents_t line;
  hb_position_t advance = hb_font_get_glyph_h_advance (font, glyph);
  hb_position_t left = MIN (0, extents->x_bearing);
  hb_position_t right = MAX (advance, extents->x_bearing + extents->width);
  hb_position_t top, bottom;

  hb_font_get_h_extents (font, &line);
  top = MAX (line.ascender, extents->y_bearing);
  bottom = MIN (line.descender, extents->y_bearing + extents->height);
  extents->x_bearing = left;
  extents->width = right - left;
  extents->y_bearing = top;
  extents->height = bottom - top;
}

static ShellGlyphRenderer *
renderer_new (FcFontSet *fonts,
              gboolean   text)
{
  ShellGlyphRenderer *renderer = g_object_new (SHELL_TYPE_GLYPH_RENDERER, NULL);

  renderer->fonts = fonts;
  renderer->loaded = g_new0 (hb_font_t *, MAX (fonts->nfont, 1));
  renderer->text = text;
  return renderer;
}

static void
shell_glyph_renderer_finalize (GObject *object)
{
  ShellGlyphRenderer *self = SHELL_GLYPH_RENDERER (object);
  int i;

  for (i = 0; i < self->fonts->nfont; i++)
    g_clear_pointer (&self->loaded[i], hb_font_destroy);
  g_free (self->loaded);
  FcFontSetDestroy (self->fonts);
  hb_raster_paint_destroy (self->paint);
  hb_buffer_destroy (self->buffer);

  G_OBJECT_CLASS (shell_glyph_renderer_parent_class)->finalize (object);
}

static void
shell_glyph_renderer_class_init (ShellGlyphRendererClass *klass)
{
  G_OBJECT_CLASS (klass)->finalize = shell_glyph_renderer_finalize;
}

static void
shell_glyph_renderer_init (ShellGlyphRenderer *self)
{
  self->buffer = hb_buffer_create ();
  self->paint = hb_raster_paint_create_or_fail ();
}

/**
 * shell_glyph_renderer_new_for_emoji:
 *
 * Returns: (transfer full): a renderer that draws color emoji
 */
ShellGlyphRenderer *
shell_glyph_renderer_new_for_emoji (void)
{
  return renderer_new (emoji_fonts (), FALSE);
}

/**
 * shell_glyph_renderer_new_for_text:
 * @family: the preferred font family
 * @color: the color to draw glyphs in
 *
 * Returns: (transfer full): a renderer that draws characters in @family,
 *   or in the first fallback font that has them
 */
ShellGlyphRenderer *
shell_glyph_renderer_new_for_text (const char      *family,
                                   const CoglColor *color)
{
  ShellGlyphRenderer *renderer = renderer_new (text_fonts (family), TRUE);

  hb_raster_paint_set_foreground (renderer->paint,
                                  HB_COLOR (color->blue, color->green, color->red, color->alpha));
  return renderer;
}

/**
 * shell_glyph_renderer_render:
 * @renderer: a #ShellGlyphRenderer
 * @text: one character, or an emoji with its modifiers and joiners
 * @size: the em size in logical pixels
 * @scale: the number of device pixels per logical pixel
 *
 * Returns: (transfer full) (nullable): the glyph as an image, or %NULL
 *   when no font draws it as a single glyph
 */
ClutterContent *
shell_glyph_renderer_render (ShellGlyphRenderer *renderer,
                             const char         *text,
                             int                 size,
                             float               scale)
{
  int pixels = (int) ceilf (size * scale);
  ClutterActor *stage = CLUTTER_ACTOR (shell_global_get_stage (shell_global_get ()));
  ClutterBackend *backend = clutter_context_get_backend (clutter_actor_get_context (stage));
  hb_font_t *font;
  hb_glyph_info_t *glyphs;
  hb_glyph_extents_t glyph_extents;
  hb_raster_image_t *image;
  hb_raster_extents_t extents;
  ClutterContent *content;
  const uint8_t *pixels_up;
  g_autofree uint8_t *pixels_down = NULL;
  unsigned int n_glyphs, row;

  g_return_val_if_fail (SHELL_IS_GLYPH_RENDERER (renderer), NULL);

  font = font_for (renderer, g_utf8_get_char (text));
  if (!font)
    return NULL;

  hb_font_set_scale (font, pixels, pixels);
  hb_buffer_clear_contents (renderer->buffer);
  hb_buffer_add_utf8 (renderer->buffer, text, -1, 0, -1);
  hb_buffer_guess_segment_properties (renderer->buffer);
  hb_shape (font, renderer->buffer, NULL, 0);

  glyphs = hb_buffer_get_glyph_infos (renderer->buffer, &n_glyphs);
  if (n_glyphs != 1 || glyphs[0].codepoint == 0)
    return NULL;

  hb_font_get_glyph_extents (font, glyphs[0].codepoint, &glyph_extents);
  if (renderer->text)
    keep_baseline (font, glyphs[0].codepoint, &glyph_extents);
  hb_raster_paint_set_glyph_extents (renderer->paint, &glyph_extents);
  hb_raster_paint_glyph (renderer->paint, font, glyphs[0].codepoint);
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
