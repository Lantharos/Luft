/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <math.h>

#include "st-fitted-icon-private.h"

#define VISIBLE_ALPHA 32
#define MAX_GROWTH 1.5f
#define ROUND_COVERAGE ((float) G_PI / 4.f)
#define SQUARE_EXTENT 0.95f

struct _StFittedIcon
{
  GObject parent_instance;

  GIcon *source;
  float fill;
};

enum
{
  PROP_0,
  PROP_SOURCE,
  PROP_FILL,
  N_PROPS
};

static GParamSpec *props[N_PROPS] = { NULL, };

typedef struct
{
  int pixels;
  float fill;
  GdkPixbuf *source;
} RenderData;

typedef struct
{
  int x;
  int y;
  int width;
  int height;
  float coverage;
} Artwork;

static void st_fitted_icon_icon_init (GIconIface *iface);

G_DEFINE_FINAL_TYPE_WITH_CODE (StFittedIcon, st_fitted_icon, G_TYPE_OBJECT,
                               G_IMPLEMENT_INTERFACE (G_TYPE_ICON, st_fitted_icon_icon_init))

static guint
st_fitted_icon_hash (GIcon *icon)
{
  StFittedIcon *self = ST_FITTED_ICON (icon);

  return g_icon_hash (self->source) * 31 + (guint) (self->fill * 1000);
}

static gboolean
st_fitted_icon_equal (GIcon *icon,
                      GIcon *other)
{
  StFittedIcon *self = ST_FITTED_ICON (icon);
  StFittedIcon *that = ST_FITTED_ICON (other);

  return g_icon_equal (self->source, that->source) && self->fill == that->fill;
}

static gboolean
st_fitted_icon_to_tokens (GIcon     *icon,
                          GPtrArray *tokens,
                          int       *out_version)
{
  StFittedIcon *self = ST_FITTED_ICON (icon);
  char *source = g_icon_to_string (self->source);

  if (source == NULL)
    return FALSE;

  g_ptr_array_add (tokens, source);
  g_ptr_array_add (tokens, g_strdup_printf ("%d", (int) roundf (self->fill * 1000)));
  *out_version = 0;
  return TRUE;
}

static void
st_fitted_icon_icon_init (GIconIface *iface)
{
  iface->hash = st_fitted_icon_hash;
  iface->equal = st_fitted_icon_equal;
  iface->to_tokens = st_fitted_icon_to_tokens;
}

static void
st_fitted_icon_set_property (GObject      *object,
                             guint         prop_id,
                             const GValue *value,
                             GParamSpec   *pspec)
{
  StFittedIcon *self = ST_FITTED_ICON (object);

  switch (prop_id)
    {
    case PROP_SOURCE:
      self->source = g_value_dup_object (value);
      break;
    case PROP_FILL:
      self->fill = g_value_get_float (value);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
    }
}

static void
st_fitted_icon_get_property (GObject    *object,
                             guint       prop_id,
                             GValue     *value,
                             GParamSpec *pspec)
{
  StFittedIcon *self = ST_FITTED_ICON (object);

  switch (prop_id)
    {
    case PROP_SOURCE:
      g_value_set_object (value, self->source);
      break;
    case PROP_FILL:
      g_value_set_float (value, self->fill);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
    }
}

static void
st_fitted_icon_finalize (GObject *object)
{
  g_clear_object (&ST_FITTED_ICON (object)->source);

  G_OBJECT_CLASS (st_fitted_icon_parent_class)->finalize (object);
}

static void
st_fitted_icon_class_init (StFittedIconClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);
  GParamFlags flags = G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY | G_PARAM_STATIC_STRINGS;

  object_class->set_property = st_fitted_icon_set_property;
  object_class->get_property = st_fitted_icon_get_property;
  object_class->finalize = st_fitted_icon_finalize;

  props[PROP_SOURCE] =
    g_param_spec_object ("source", NULL, NULL, G_TYPE_ICON, flags);

  props[PROP_FILL] =
    g_param_spec_float ("fill", NULL, NULL, 0.1f, 1.f, 1.f, flags);

  g_object_class_install_properties (object_class, N_PROPS, props);
}

static void
st_fitted_icon_init (StFittedIcon *self)
{
  self->fill = 1.f;
}

static int
source_pixels (float fill,
               int   pixels)
{
  return (int) ceilf (pixels * fill * MAX_GROWTH);
}

StIconInfo *
_st_fitted_icon_lookup (StFittedIcon *icon,
                        StIconTheme  *theme,
                        int           pixels)
{
  return st_icon_theme_lookup_by_gicon_for_scale (theme, icon->source,
                                                  source_pixels (icon->fill, pixels), 1,
                                                  ST_ICON_LOOKUP_FORCE_REGULAR |
                                                  ST_ICON_LOOKUP_FORCE_SIZE);
}

static gboolean
find_artwork (GdkPixbuf *pixbuf,
              Artwork   *artwork)
{
  const guint8 *pixels = gdk_pixbuf_read_pixels (pixbuf);
  int width = gdk_pixbuf_get_width (pixbuf);
  int height = gdk_pixbuf_get_height (pixbuf);
  int stride = gdk_pixbuf_get_rowstride (pixbuf);
  int left = width, top = height, right = -1, bottom = -1;
  int visible = 0;

  if (!gdk_pixbuf_get_has_alpha (pixbuf))
    return FALSE;

  for (int y = 0; y < height; y++)
    {
      const guint8 *row = pixels + y * stride;

      for (int x = 0; x < width; x++)
        {
          if (row[x * 4 + 3] < VISIBLE_ALPHA)
            continue;
          visible++;
          left = MIN (left, x);
          right = MAX (right, x);
          top = MIN (top, y);
          bottom = MAX (bottom, y);
        }
    }

  if (visible == 0)
    return FALSE;

  artwork->x = left;
  artwork->y = top;
  artwork->width = right - left + 1;
  artwork->height = bottom - top + 1;
  artwork->coverage = visible / (float) (artwork->width * artwork->height);
  return TRUE;
}

float
_st_fitted_icon_shape_extent (float coverage)
{
  float squareness = CLAMP ((coverage - ROUND_COVERAGE) / (1.f - ROUND_COVERAGE), 0.f, 1.f);

  return 1.f - (1.f - SQUARE_EXTENT) * squareness;
}

static cairo_surface_t *
pixbuf_to_surface (GdkPixbuf *pixbuf)
{
  int width = gdk_pixbuf_get_width (pixbuf);
  int height = gdk_pixbuf_get_height (pixbuf);
  int channels = gdk_pixbuf_get_n_channels (pixbuf);
  int rowstride = gdk_pixbuf_get_rowstride (pixbuf);
  const guint8 *pixels = gdk_pixbuf_read_pixels (pixbuf);
  cairo_surface_t *surface = cairo_image_surface_create (CAIRO_FORMAT_ARGB32, width, height);
  guint8 *data = cairo_image_surface_get_data (surface);
  int stride = cairo_image_surface_get_stride (surface);

  for (int y = 0; y < height; y++)
    {
      const guint8 *in = pixels + y * rowstride;
      guint32 *row = (guint32 *) (data + y * stride);

      for (int x = 0; x < width; x++, in += channels)
        {
          guint32 alpha = channels == 4 ? in[3] : 255;

          row[x] = alpha << 24 |
                   (in[0] * alpha + 127) / 255 << 16 |
                   (in[1] * alpha + 127) / 255 << 8 |
                   (in[2] * alpha + 127) / 255;
        }
    }
  cairo_surface_mark_dirty (surface);
  return surface;
}

GdkPixbuf *
_st_surface_to_pixbuf (cairo_surface_t *surface)
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

static GdkPixbuf *
fit (GdkPixbuf *source,
     int        pixels,
     float      fill)
{
  int width = gdk_pixbuf_get_width (source);
  int height = gdk_pixbuf_get_height (source);
  Artwork artwork = { 0, 0, width, height, 1.f };
  cairo_surface_t *artwork_surface = pixbuf_to_surface (source);
  cairo_surface_t *fitted = cairo_image_surface_create (CAIRO_FORMAT_ARGB32, pixels, pixels);
  cairo_t *cr = cairo_create (fitted);
  GdkPixbuf *pixbuf;
  double scale;

  if (!find_artwork (source, &artwork))
    artwork.coverage = 0.f;

  scale = MIN (pixels * fill * _st_fitted_icon_shape_extent (artwork.coverage) / MAX (artwork.width, artwork.height),
               pixels * fill * MAX_GROWTH / MAX (width, height));
  cairo_translate (cr, pixels / 2., pixels / 2.);
  cairo_scale (cr, scale, scale);
  cairo_translate (cr, -(artwork.x + artwork.width / 2.), -(artwork.y + artwork.height / 2.));
  cairo_set_source_surface (cr, artwork_surface, 0, 0);
  cairo_pattern_set_filter (cairo_get_source (cr), CAIRO_FILTER_BEST);
  cairo_paint (cr);
  cairo_destroy (cr);

  pixbuf = _st_surface_to_pixbuf (fitted);
  cairo_surface_destroy (fitted);
  cairo_surface_destroy (artwork_surface);
  return pixbuf;
}

static void
render_data_free (gpointer data)
{
  RenderData *render = data;

  g_clear_object (&render->source);
  g_free (render);
}

static void
render_thread (GTask        *task,
               gpointer      object,
               gpointer      task_data,
               GCancellable *cancellable)
{
  RenderData *data = task_data;

  g_task_return_pointer (task, fit (data->source, data->pixels, data->fill), g_object_unref);
}

static void
on_source_loaded (GObject      *source,
                  GAsyncResult *result,
                  gpointer      user_data)
{
  g_autoptr (GTask) task = user_data;
  RenderData *data = g_task_get_task_data (task);
  GError *error = NULL;

  data->source = st_icon_info_load_icon_finish (ST_ICON_INFO (source), result, &error);
  if (data->source == NULL)
    g_task_return_error (task, error);
  else
    g_task_run_in_thread (task, render_thread);
}

void
_st_fitted_icon_render_async (StFittedIcon        *icon,
                              gpointer             source_object,
                              StIconInfo          *info,
                              int                  pixels,
                              GCancellable        *cancellable,
                              GAsyncReadyCallback  callback,
                              gpointer             user_data)
{
  GTask *task = g_task_new (source_object, cancellable, callback, user_data);
  RenderData *data = g_new0 (RenderData, 1);

  data->pixels = pixels;
  data->fill = icon->fill;
  g_task_set_task_data (task, data, render_data_free);
  st_icon_info_load_icon_async (info, cancellable, on_source_loaded, task);
}

GdkPixbuf *
_st_fitted_icon_render_finish (GAsyncResult  *result,
                               GError       **error)
{
  return g_task_propagate_pointer (G_TASK (result), error);
}
