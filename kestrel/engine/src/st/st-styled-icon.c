/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <glib/gstdio.h>
#include <math.h>

#include "st-icon-colors.h"
#include "st-styled-icon-private.h"

#define GLYPH_BOX 0.64f

struct _StStyledIcon
{
  GObject parent_instance;

  GIcon *source;
  char **glyph_names;
  StStyledIconPaint paint;
};

enum
{
  PROP_0,
  PROP_SOURCE,
  PROP_GLYPH_NAMES,
  PROP_PLATE,
  PROP_INK,
  PROP_SHADE,
  PROP_RIM,
  N_PROPS
};

static GParamSpec *props[N_PROPS] = { NULL, };

typedef struct
{
  StStyledIconPaint paint;
  gboolean glyph;
  int size;
  int scale;
  char *path;
  GdkPixbuf *source;
} RenderData;

static void st_styled_icon_icon_init (GIconIface *iface);

G_DEFINE_FINAL_TYPE_WITH_CODE (StStyledIcon, st_styled_icon, G_TYPE_OBJECT,
                               G_IMPLEMENT_INTERFACE (G_TYPE_ICON, st_styled_icon_icon_init))

static guint
color_hash (const CoglColor *color)
{
  return color->red << 24 | color->green << 16 | color->blue << 8 | color->alpha;
}

static guint
st_styled_icon_hash (GIcon *icon)
{
  StStyledIcon *self = ST_STYLED_ICON (icon);
  guint hash = g_icon_hash (self->source);

  for (char **name = self->glyph_names; name && *name; name++)
    hash = hash * 31 + g_str_hash (*name);

  hash ^= color_hash (&self->paint.plate);
  hash = hash * 31 + color_hash (&self->paint.ink);
  hash = hash * 31 + color_hash (&self->paint.shade);
  return hash * 31 + (guint) (self->paint.rim * 1000);
}

static gboolean
st_styled_icon_equal (GIcon *icon,
                      GIcon *other)
{
  StStyledIcon *self = ST_STYLED_ICON (icon);
  StStyledIcon *that = ST_STYLED_ICON (other);

  return g_icon_equal (self->source, that->source) &&
         g_strv_equal ((const char * const *) self->glyph_names,
                       (const char * const *) that->glyph_names) &&
         cogl_color_equal (&self->paint.plate, &that->paint.plate) &&
         cogl_color_equal (&self->paint.ink, &that->paint.ink) &&
         cogl_color_equal (&self->paint.shade, &that->paint.shade) &&
         self->paint.rim == that->paint.rim;
}

static char *
color_token (const CoglColor *color)
{
  return g_strdup_printf ("%02x%02x%02x%02x",
                          color->red, color->green, color->blue, color->alpha);
}

static gboolean
st_styled_icon_to_tokens (GIcon     *icon,
                          GPtrArray *tokens,
                          int       *out_version)
{
  StStyledIcon *self = ST_STYLED_ICON (icon);
  char *source = g_icon_to_string (self->source);

  if (source == NULL)
    return FALSE;

  g_ptr_array_add (tokens, source);
  g_ptr_array_add (tokens, g_strjoinv (",", self->glyph_names));
  g_ptr_array_add (tokens, color_token (&self->paint.plate));
  g_ptr_array_add (tokens, color_token (&self->paint.ink));
  g_ptr_array_add (tokens, color_token (&self->paint.shade));
  g_ptr_array_add (tokens, g_strdup_printf ("%d", (int) roundf (self->paint.rim * 1000)));
  *out_version = 0;
  return TRUE;
}

static void
st_styled_icon_icon_init (GIconIface *iface)
{
  iface->hash = st_styled_icon_hash;
  iface->equal = st_styled_icon_equal;
  iface->to_tokens = st_styled_icon_to_tokens;
}

static void
set_color (CoglColor    *color,
           const GValue *value)
{
  const CoglColor *given = g_value_get_boxed (value);

  if (given)
    *color = *given;
}

static void
st_styled_icon_set_property (GObject      *object,
                             guint         prop_id,
                             const GValue *value,
                             GParamSpec   *pspec)
{
  StStyledIcon *self = ST_STYLED_ICON (object);

  switch (prop_id)
    {
    case PROP_SOURCE:
      self->source = g_value_dup_object (value);
      break;
    case PROP_GLYPH_NAMES:
      self->glyph_names = g_value_dup_boxed (value);
      break;
    case PROP_PLATE:
      set_color (&self->paint.plate, value);
      break;
    case PROP_INK:
      set_color (&self->paint.ink, value);
      break;
    case PROP_SHADE:
      set_color (&self->paint.shade, value);
      break;
    case PROP_RIM:
      self->paint.rim = g_value_get_float (value);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
    }
}

static void
st_styled_icon_get_property (GObject    *object,
                             guint       prop_id,
                             GValue     *value,
                             GParamSpec *pspec)
{
  StStyledIcon *self = ST_STYLED_ICON (object);

  switch (prop_id)
    {
    case PROP_SOURCE:
      g_value_set_object (value, self->source);
      break;
    case PROP_GLYPH_NAMES:
      g_value_set_boxed (value, self->glyph_names);
      break;
    case PROP_PLATE:
      g_value_set_boxed (value, &self->paint.plate);
      break;
    case PROP_INK:
      g_value_set_boxed (value, &self->paint.ink);
      break;
    case PROP_SHADE:
      g_value_set_boxed (value, &self->paint.shade);
      break;
    case PROP_RIM:
      g_value_set_float (value, self->paint.rim);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
    }
}

static void
st_styled_icon_finalize (GObject *object)
{
  StStyledIcon *self = ST_STYLED_ICON (object);

  g_clear_object (&self->source);
  g_clear_pointer (&self->glyph_names, g_strfreev);

  G_OBJECT_CLASS (st_styled_icon_parent_class)->finalize (object);
}

static void
st_styled_icon_class_init (StStyledIconClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);
  GParamFlags flags = G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY | G_PARAM_STATIC_STRINGS;

  object_class->set_property = st_styled_icon_set_property;
  object_class->get_property = st_styled_icon_get_property;
  object_class->finalize = st_styled_icon_finalize;

  props[PROP_SOURCE] =
    g_param_spec_object ("source", NULL, NULL, G_TYPE_ICON, flags);

  props[PROP_GLYPH_NAMES] =
    g_param_spec_boxed ("glyph-names", NULL, NULL, G_TYPE_STRV, flags);

  props[PROP_PLATE] =
    g_param_spec_boxed ("plate", NULL, NULL, COGL_TYPE_COLOR, flags);

  props[PROP_INK] =
    g_param_spec_boxed ("ink", NULL, NULL, COGL_TYPE_COLOR, flags);

  props[PROP_SHADE] =
    g_param_spec_boxed ("shade", NULL, NULL, COGL_TYPE_COLOR, flags);

  props[PROP_RIM] =
    g_param_spec_float ("rim", NULL, NULL, 0.f, 1.f, 0.f, flags);

  g_object_class_install_properties (object_class, N_PROPS, props);
}

static void
st_styled_icon_init (StStyledIcon *self)
{
}

int
_st_styled_icon_glyph_size (int size)
{
  return (int) roundf (size * GLYPH_BOX);
}

StIconInfo *
_st_styled_icon_lookup (StStyledIcon *icon,
                        StIconTheme  *theme,
                        int           size,
                        int           scale,
                        gboolean     *glyph)
{
  StIconInfo *info = NULL;

  if (icon->glyph_names && icon->glyph_names[0])
    info = st_icon_theme_choose_icon_for_scale (theme,
                                                (const char **) icon->glyph_names,
                                                _st_styled_icon_glyph_size (size),
                                                scale, 0);
  if (info && st_icon_info_is_symbolic (info))
    {
      *glyph = TRUE;
      return info;
    }

  g_clear_object (&info);
  info = st_icon_theme_lookup_by_gicon_for_scale (theme, icon->source, size, scale,
                                                  ST_ICON_LOOKUP_FORCE_REGULAR |
                                                  ST_ICON_LOOKUP_FORCE_SIZE);
  *glyph = info && st_icon_info_is_symbolic (info);
  return info;
}

static void
render_data_free (gpointer data)
{
  RenderData *render = data;

  g_clear_object (&render->source);
  g_free (render->path);
  g_free (render);
}

static gboolean
save_png (GdkPixbuf   *pixbuf,
          const char  *path,
          GError     **error)
{
  g_autofree char *partial = g_strconcat (path, ".partial", NULL);

  return gdk_pixbuf_save (pixbuf, partial, "png", error, NULL) &&
         g_rename (partial, path) == 0;
}

static void
render_thread (GTask        *task,
               gpointer      object,
               gpointer      task_data,
               GCancellable *cancellable)
{
  RenderData *data = task_data;
  g_autoptr (GdkPixbuf) pixbuf = NULL;
  GError *error = NULL;

  pixbuf = _st_styled_icon_paint (&data->paint, data->source, data->glyph,
                                  data->size * data->scale, data->scale);
  if (data->path && !save_png (pixbuf, data->path, &error))
    g_task_return_error (task, error);
  else
    g_task_return_pointer (task, g_steal_pointer (&pixbuf), g_object_unref);
}

static void
on_source_loaded (GObject      *source,
                  GAsyncResult *result,
                  gpointer      user_data)
{
  g_autoptr (GTask) task = user_data;
  RenderData *data = g_task_get_task_data (task);
  GError *error = NULL;

  if (data->glyph)
    data->source = st_icon_info_load_symbolic_finish (ST_ICON_INFO (source), result, NULL, &error);
  else
    data->source = st_icon_info_load_icon_finish (ST_ICON_INFO (source), result, &error);

  if (data->source == NULL)
    g_task_return_error (task, error);
  else
    g_task_run_in_thread (task, render_thread);
}

static StIconColors *
white_colors (void)
{
  StIconColors *colors = st_icon_colors_new ();
  CoglColor white;

  cogl_color_init_from_4f (&white, 1.f, 1.f, 1.f, 1.f);
  colors->foreground = white;
  colors->warning = white;
  colors->error = white;
  colors->success = white;
  return colors;
}

void
_st_styled_icon_render_async (StStyledIcon        *icon,
                              gpointer             source_object,
                              StIconInfo          *info,
                              gboolean             glyph,
                              int                  size,
                              int                  scale,
                              const char          *path,
                              GCancellable        *cancellable,
                              GAsyncReadyCallback  callback,
                              gpointer             user_data)
{
  GTask *task = g_task_new (source_object, cancellable, callback, user_data);
  RenderData *data = g_new0 (RenderData, 1);

  data->paint = icon->paint;
  data->glyph = glyph;
  data->size = size;
  data->scale = scale;
  data->path = g_strdup (path);
  g_task_set_task_data (task, data, render_data_free);

  if (glyph)
    {
      StIconColors *colors = white_colors ();

      st_icon_info_load_symbolic_async (info, colors, cancellable, on_source_loaded, task);
      st_icon_colors_unref (colors);
    }
  else
    {
      st_icon_info_load_icon_async (info, cancellable, on_source_loaded, task);
    }
}

GdkPixbuf *
_st_styled_icon_render_finish (GAsyncResult  *result,
                               GError       **error)
{
  return g_task_propagate_pointer (G_TASK (result), error);
}
