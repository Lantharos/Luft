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

static GdkPixbuf *
clear_border (GdkPixbuf *source)
{
  int width = gdk_pixbuf_get_width (source);
  int height = gdk_pixbuf_get_height (source);
  GdkPixbuf *framed = gdk_pixbuf_new (GDK_COLORSPACE_RGB, TRUE, 8, width + 2, height + 2);

  gdk_pixbuf_fill (framed, 0);
  gdk_pixbuf_copy_area (source, 0, 0, width, height, framed, 1, 1);
  return framed;
}

static GdkPixbuf *
fit (GdkPixbuf *source,
     int        pixels,
     float      fill)
{
  int canvas = MAX (gdk_pixbuf_get_width (source), gdk_pixbuf_get_height (source));
  g_autoptr (GdkPixbuf) framed = NULL;
  GdkPixbuf *fitted = gdk_pixbuf_new (GDK_COLORSPACE_RGB, TRUE, 8, pixels, pixels);
  Artwork artwork = { 0, 0, canvas, canvas, 1.f };
  double scale, center_x, center_y;

  gdk_pixbuf_fill (fitted, 0);
  if (!find_artwork (source, &artwork))
    artwork.coverage = 0.f;

  scale = MIN (pixels * fill * _st_fitted_icon_shape_extent (artwork.coverage) / MAX (artwork.width, artwork.height),
               pixels * fill * MAX_GROWTH / canvas);
  center_x = artwork.x + artwork.width / 2. + 1;
  center_y = artwork.y + artwork.height / 2. + 1;
  framed = clear_border (source);
  gdk_pixbuf_composite (framed, fitted, 0, 0, pixels, pixels,
                        pixels / 2. - center_x * scale, pixels / 2. - center_y * scale,
                        scale, scale, GDK_INTERP_HYPER, 255);
  return fitted;
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
