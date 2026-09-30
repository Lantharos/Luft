/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <cairo.h>
#include <math.h>

#include "st-styled-icon-private.h"

#define PLATE_RADIUS 0.225
#define DERIVED_FILL 0.86
#define OPAQUE 230
#define VISIBLE 8
#define PLATE_COVERAGE 0.4
#define PLATE_SHARE 0.3
#define PLATE_SAMPLES 20
#define PLATE_AGREEMENT 0.7
#define PLATE_MATCH 0.12
#define PLATE_NEAR 0.1
#define PLATE_FAR 0.24
#define GLYPH_REMAINDER 0.02
#define TONE_BINS 64
#define TONE_RANGE 0.2

typedef struct
{
  const guint8 *pixels;
  int width;
  int height;
  int stride;
  int channels;
} Pixels;

static const guint8 *
pixel_at (const Pixels *pixels,
          int           x,
          int           y)
{
  return pixels->pixels + y * pixels->stride + x * pixels->channels;
}

static int
alpha_at (const Pixels *pixels,
          int           x,
          int           y)
{
  return pixels->channels == 4 ? pixel_at (pixels, x, y)[3] : 255;
}

static float
distance (const guint8 *pixel,
          const float   color[3])
{
  float red = pixel[0] / 255.f - color[0];
  float green = pixel[1] / 255.f - color[1];
  float blue = pixel[2] / 255.f - color[2];

  return sqrtf (red * red + green * green + blue * blue);
}

static float
smoothstep (float edge0,
            float edge1,
            float value)
{
  float t = CLAMP ((value - edge0) / (edge1 - edge0), 0.f, 1.f);

  return t * t * (3.f - 2.f * t);
}

static int
collect_edge_samples (const Pixels *pixels,
                      float         samples[][3])
{
  int inset = MAX (2, pixels->width / 20);
  int count = 0;

  for (int line = 0; line < PLATE_SAMPLES / 4; line++)
    {
      float fraction = 0.3f + line * 0.1f;
      int row = pixels->height * fraction;
      int column = pixels->width * fraction;
      struct { int x, y, dx, dy; } scans[] = {
        { 0, row, 1, 0 },
        { pixels->width - 1, row, -1, 0 },
        { column, 0, 0, 1 },
        { column, pixels->height - 1, 0, -1 },
      };

      for (guint scan = 0; scan < G_N_ELEMENTS (scans); scan++)
        {
          int x = scans[scan].x, y = scans[scan].y;

          while (x >= 0 && y >= 0 && x < pixels->width && y < pixels->height &&
                 alpha_at (pixels, x, y) < OPAQUE)
            {
              x += scans[scan].dx;
              y += scans[scan].dy;
            }
          x += scans[scan].dx * inset;
          y += scans[scan].dy * inset;
          if (x < 0 || y < 0 || x >= pixels->width || y >= pixels->height ||
              alpha_at (pixels, x, y) < OPAQUE)
            continue;

          for (int channel = 0; channel < 3; channel++)
            samples[count][channel] = pixel_at (pixels, x, y)[channel] / 255.f;
          count++;
        }
    }

  return count;
}

static gboolean
find_plate (const Pixels *pixels,
            float         plate[3])
{
  float samples[PLATE_SAMPLES][3];
  int total = pixels->width * pixels->height;
  int opaque = 0, matching = 0, remainder = 0, best = 0, best_count = 0, count;

  for (int y = 0; y < pixels->height; y++)
    for (int x = 0; x < pixels->width; x++)
      opaque += alpha_at (pixels, x, y) >= OPAQUE;
  if (opaque < total * PLATE_COVERAGE)
    return FALSE;

  count = collect_edge_samples (pixels, samples);
  for (int candidate = 0; candidate < count; candidate++)
    {
      int agreeing = 0;

      for (int other = 0; other < count; other++)
        {
          float red = samples[candidate][0] - samples[other][0];
          float green = samples[candidate][1] - samples[other][1];
          float blue = samples[candidate][2] - samples[other][2];

          agreeing += sqrtf (red * red + green * green + blue * blue) <= PLATE_MATCH;
        }
      if (agreeing > best_count)
        {
          best = candidate;
          best_count = agreeing;
        }
    }
  if (best_count < PLATE_SAMPLES * PLATE_AGREEMENT)
    return FALSE;

  plate[0] = plate[1] = plate[2] = 0.f;
  for (int sample = 0; sample < count; sample++)
    {
      float red = samples[best][0] - samples[sample][0];
      float green = samples[best][1] - samples[sample][1];
      float blue = samples[best][2] - samples[sample][2];

      if (sqrtf (red * red + green * green + blue * blue) > PLATE_MATCH)
        continue;
      for (int channel = 0; channel < 3; channel++)
        plate[channel] += samples[sample][channel] / best_count;
    }

  for (int y = 0; y < pixels->height; y++)
    for (int x = 0; x < pixels->width; x++)
      {
        float away;

        if (alpha_at (pixels, x, y) < OPAQUE)
          continue;
        away = distance (pixel_at (pixels, x, y), plate);
        matching += away <= PLATE_MATCH;
        remainder += away >= PLATE_FAR;
      }

  return matching >= opaque * PLATE_SHARE && remainder >= total * GLYPH_REMAINDER;
}

static float
percentile (const float histogram[TONE_BINS],
            float       total,
            float       fraction)
{
  float seen = 0.f;

  for (int bin = 0; bin < TONE_BINS; bin++)
    {
      seen += histogram[bin];
      if (seen >= total * fraction)
        return (bin + 0.5f) / TONE_BINS;
    }
  return 1.f;
}

static guint32
mask_pixel (float alpha,
            float tone)
{
  guint32 coverage = (guint32) roundf (alpha * 255.f);
  guint32 grey = (guint32) roundf (tone * alpha * 255.f);

  return coverage << 24 | grey << 16 | grey << 8 | grey;
}

static cairo_surface_t *
mask_surface (const Pixels *pixels,
              const float  *alpha,
              const float  *tone,
              float         low,
              float         range)
{
  cairo_surface_t *surface = cairo_image_surface_create (CAIRO_FORMAT_ARGB32, pixels->width, pixels->height);
  guint8 *data = cairo_image_surface_get_data (surface);
  int stride = cairo_image_surface_get_stride (surface);

  for (int y = 0; y < pixels->height; y++)
    {
      guint32 *row = (guint32 *) (data + y * stride);

      for (int x = 0; x < pixels->width; x++)
        {
          int index = y * pixels->width + x;
          float level = range > 0.f ? CLAMP ((tone[index] - low) / range, 0.f, 1.f) : 1.f;

          row[x] = mask_pixel (alpha[index], level);
        }
    }
  cairo_surface_mark_dirty (surface);
  return surface;
}

static cairo_surface_t *
derived_mask (const Pixels          *pixels,
              cairo_rectangle_int_t *bounds)
{
  g_autofree float *alpha = g_new (float, pixels->width * pixels->height);
  g_autofree float *tone = g_new (float, pixels->width * pixels->height);
  float histogram[TONE_BINS] = { 0.f, };
  float plate[3], total = 0.f, low, high;
  gboolean has_plate = find_plate (pixels, plate);
  int left = pixels->width, top = pixels->height, right = -1, bottom = -1;

  for (int y = 0; y < pixels->height; y++)
    for (int x = 0; x < pixels->width; x++)
      {
        const guint8 *pixel = pixel_at (pixels, x, y);
        int index = y * pixels->width + x;
        float coverage = alpha_at (pixels, x, y) / 255.f;

        if (has_plate)
          coverage *= smoothstep (PLATE_NEAR, PLATE_FAR, distance (pixel, plate)) *
                      smoothstep (0.6f, 0.95f, coverage);

        alpha[index] = coverage;
        tone[index] = (0.2126f * pixel[0] + 0.7152f * pixel[1] + 0.0722f * pixel[2]) / 255.f;
        histogram[MIN ((int) (tone[index] * TONE_BINS), TONE_BINS - 1)] += coverage;
        total += coverage;

        if (coverage * 255.f < VISIBLE)
          continue;
        left = MIN (left, x);
        top = MIN (top, y);
        right = MAX (right, x);
        bottom = MAX (bottom, y);
      }

  if (right < 0)
    {
      *bounds = (cairo_rectangle_int_t) { 0, 0, pixels->width, pixels->height };
      return mask_surface (pixels, alpha, tone, 0.f, 0.f);
    }

  *bounds = (cairo_rectangle_int_t) { left, top, right - left + 1, bottom - top + 1 };
  low = percentile (histogram, total, 0.05f);
  high = percentile (histogram, total, 0.95f);
  return mask_surface (pixels, alpha, tone, low, high - low < TONE_RANGE ? 0.f : high - low);
}

static cairo_surface_t *
symbolic_mask (const Pixels          *pixels,
               cairo_rectangle_int_t *bounds)
{
  cairo_surface_t *surface = cairo_image_surface_create (CAIRO_FORMAT_ARGB32, pixels->width, pixels->height);
  guint8 *data = cairo_image_surface_get_data (surface);
  int stride = cairo_image_surface_get_stride (surface);

  for (int y = 0; y < pixels->height; y++)
    {
      guint32 *row = (guint32 *) (data + y * stride);

      for (int x = 0; x < pixels->width; x++)
        row[x] = mask_pixel (alpha_at (pixels, x, y) / 255.f, 1.f);
    }
  cairo_surface_mark_dirty (surface);
  *bounds = (cairo_rectangle_int_t) { 0, 0, pixels->width, pixels->height };
  return surface;
}

static void
rounded_rectangle (cairo_t *cr,
                   double   inset,
                   double   size,
                   double   radius)
{
  double far = size - inset;

  radius -= inset;
  cairo_new_sub_path (cr);
  cairo_arc (cr, far - radius, inset + radius, radius, -G_PI / 2, 0);
  cairo_arc (cr, far - radius, far - radius, radius, 0, G_PI / 2);
  cairo_arc (cr, inset + radius, far - radius, radius, G_PI / 2, G_PI);
  cairo_arc (cr, inset + radius, inset + radius, radius, G_PI, 3 * G_PI / 2);
  cairo_close_path (cr);
}

static void
draw_plate (cairo_t                 *cr,
            const StStyledIconPaint *paint,
            int                      size,
            int                      scale)
{
  const CoglColor *plate = &paint->plate;
  double radius = size * PLATE_RADIUS;
  cairo_pattern_t *highlight;

  rounded_rectangle (cr, 0, size, radius);
  cairo_set_source_rgba (cr, plate->red / 255., plate->green / 255., plate->blue / 255., plate->alpha / 255.);
  cairo_fill (cr);

  if (paint->rim <= 0.f)
    return;

  highlight = cairo_pattern_create_linear (0, 0, 0, size);
  cairo_pattern_add_color_stop_rgba (highlight, 0, 1, 1, 1, paint->rim);
  cairo_pattern_add_color_stop_rgba (highlight, 0.5, 1, 1, 1, paint->rim / 4);
  cairo_pattern_add_color_stop_rgba (highlight, 1, 1, 1, 1, 0);
  rounded_rectangle (cr, scale / 2., size, radius);
  cairo_set_source (cr, highlight);
  cairo_set_line_width (cr, scale);
  cairo_stroke (cr);
  cairo_pattern_destroy (highlight);
}

static cairo_surface_t *
place_glyph (cairo_surface_t             *mask,
             const cairo_rectangle_int_t *bounds,
             gboolean                     glyph,
             int                          size)
{
  cairo_surface_t *placed = cairo_image_surface_create (CAIRO_FORMAT_ARGB32, size, size);
  cairo_t *cr = cairo_create (placed);
  double box = _st_styled_icon_glyph_size (size) * (glyph ? 1. : DERIVED_FILL);
  double scale = box / MAX (bounds->width, bounds->height);

  cairo_translate (cr, (size - bounds->width * scale) / 2, (size - bounds->height * scale) / 2);
  cairo_scale (cr, scale, scale);
  cairo_set_source_surface (cr, mask, -bounds->x, -bounds->y);
  cairo_pattern_set_filter (cairo_get_source (cr), CAIRO_FILTER_GOOD);
  cairo_rectangle (cr, 0, 0, bounds->width, bounds->height);
  cairo_fill (cr);
  cairo_destroy (cr);
  return placed;
}

static void
colorize (cairo_surface_t         *surface,
          const StStyledIconPaint *paint)
{
  const CoglColor *ink = &paint->ink, *shade = &paint->shade;
  guint8 *data = cairo_image_surface_get_data (surface);
  int stride = cairo_image_surface_get_stride (surface);
  int size = cairo_image_surface_get_width (surface);

  cairo_surface_flush (surface);
  for (int y = 0; y < size; y++)
    {
      guint32 *row = (guint32 *) (data + y * stride);

      for (int x = 0; x < size; x++)
        {
          guint32 coverage = row[x] >> 24;
          float level, alpha;

          if (coverage == 0)
            continue;
          level = MIN (1.f, (row[x] & 0xff) / (float) coverage);
          alpha = coverage / 255.f * (shade->alpha + (ink->alpha - shade->alpha) * level) / 255.f;
          row[x] = (guint32) roundf (alpha * 255.f) << 24 |
                   (guint32) roundf ((shade->red + (ink->red - shade->red) * level) * alpha) << 16 |
                   (guint32) roundf ((shade->green + (ink->green - shade->green) * level) * alpha) << 8 |
                   (guint32) roundf ((shade->blue + (ink->blue - shade->blue) * level) * alpha);
        }
    }
  cairo_surface_mark_dirty (surface);
}

static GdkPixbuf *
surface_to_pixbuf (cairo_surface_t *surface)
{
  int size = cairo_image_surface_get_width (surface);
  int stride = cairo_image_surface_get_stride (surface);
  const guint8 *data = cairo_image_surface_get_data (surface);
  GdkPixbuf *pixbuf = gdk_pixbuf_new (GDK_COLORSPACE_RGB, TRUE, 8, size, size);
  guint8 *pixels = gdk_pixbuf_get_pixels (pixbuf);
  int rowstride = gdk_pixbuf_get_rowstride (pixbuf);

  cairo_surface_flush (surface);
  for (int y = 0; y < size; y++)
    {
      const guint32 *row = (const guint32 *) (data + y * stride);
      guint8 *out = pixels + y * rowstride;

      for (int x = 0; x < size; x++, out += 4)
        {
          guint32 alpha = row[x] >> 24;

          out[3] = alpha;
          if (alpha == 0)
            {
              out[0] = out[1] = out[2] = 0;
              continue;
            }
          out[0] = MIN (255, ((row[x] >> 16 & 0xff) * 255 + alpha / 2) / alpha);
          out[1] = MIN (255, ((row[x] >> 8 & 0xff) * 255 + alpha / 2) / alpha);
          out[2] = MIN (255, ((row[x] & 0xff) * 255 + alpha / 2) / alpha);
        }
    }
  return pixbuf;
}

GdkPixbuf *
_st_styled_icon_paint (const StStyledIconPaint *paint,
                       GdkPixbuf               *source,
                       gboolean                 glyph,
                       int                      size,
                       int                      scale)
{
  Pixels pixels = {
    gdk_pixbuf_read_pixels (source),
    gdk_pixbuf_get_width (source),
    gdk_pixbuf_get_height (source),
    gdk_pixbuf_get_rowstride (source),
    gdk_pixbuf_get_n_channels (source),
  };
  cairo_rectangle_int_t bounds;
  cairo_surface_t *canvas = cairo_image_surface_create (CAIRO_FORMAT_ARGB32, size, size);
  cairo_surface_t *mask = glyph ? symbolic_mask (&pixels, &bounds) : derived_mask (&pixels, &bounds);
  cairo_surface_t *placed = place_glyph (mask, &bounds, glyph, size);
  cairo_t *cr = cairo_create (canvas);
  GdkPixbuf *pixbuf;

  colorize (placed, paint);
  draw_plate (cr, paint, size, scale);
  cairo_set_source_surface (cr, placed, 0, 0);
  cairo_paint (cr);
  cairo_destroy (cr);

  pixbuf = surface_to_pixbuf (canvas);
  cairo_surface_destroy (placed);
  cairo_surface_destroy (mask);
  cairo_surface_destroy (canvas);
  return pixbuf;
}
