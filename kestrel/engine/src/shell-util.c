/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <errno.h>
#include <math.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>

#include <cogl/cogl.h>

#include "shell-global.h"
#include "shell-util.h"
#include <glib/gi18n-lib.h>
#include <gdk-pixbuf/gdk-pixbuf.h>
#include <meta/meta-context.h>

#include <locale.h>
#include <unicode/ucal.h>

#include <systemd/sd-daemon.h>
#include <systemd/sd-login.h>

static void
stop_pick (ClutterActor *actor)
{
  g_signal_stop_emission_by_name (actor, "pick");
}

/**
 * shell_util_set_hidden_from_pick:
 * @actor: A #ClutterActor
 * @hidden: Whether @actor should be hidden from pick
 *
 * If @hidden is %TRUE, hide @actor from pick even with a mode of
 * %CLUTTER_PICK_ALL; if @hidden is %FALSE, unhide @actor.
 */
void
shell_util_set_hidden_from_pick (ClutterActor *actor,
                                 gboolean      hidden)
{
  gpointer existing_handler_data;

  existing_handler_data = g_object_get_data (G_OBJECT (actor),
                                             "shell-stop-pick");
  if (hidden)
    {
      if (existing_handler_data != NULL)
        return;
      g_signal_connect (actor, "pick", G_CALLBACK (stop_pick), NULL);
      g_object_set_data (G_OBJECT (actor),
                         "shell-stop-pick", GUINT_TO_POINTER (1));
    }
  else
    {
      if (existing_handler_data == NULL)
        return;
      g_signal_handlers_disconnect_by_func (actor, stop_pick, NULL);
      g_object_set_data (G_OBJECT (actor), "shell-stop-pick", NULL);
    }
}

/**
 * shell_util_paint_offscreen:
 * @actor: A #ClutterActor whose parent is mapped
 *
 * Shows @actor if it is hidden, paints it once into a scratch framebuffer and
 * hides it again, all before the next frame. Its styles, text layouts,
 * glyphs, icons, shaders and effect buffers are then ready the first time it
 * appears on screen.
 */
void
shell_util_paint_offscreen (ClutterActor *actor)
{
  ClutterContext *context = clutter_actor_get_context (actor);
  CoglContext *cogl_context =
    clutter_backend_get_cogl_context (clutter_context_get_backend (context));
  gboolean was_visible = clutter_actor_is_visible (actor);
  float resource_scale;
  ClutterActorBox box;
  graphene_matrix_t transform, inverse;
  g_autoptr (CoglTexture) texture = NULL;
  g_autoptr (CoglOffscreen) offscreen = NULL;
  CoglFramebuffer *framebuffer;
  ClutterColorState *color_state;
  ClutterPaintContext *paint_context;
  int opacity_override;
  int width, height;

  clutter_actor_show (actor);
  if (!clutter_actor_is_mapped (actor))
    goto out;

  clutter_actor_get_allocation_box (actor, &box);
  resource_scale = clutter_actor_get_resource_scale (actor);
  width = ceilf (clutter_actor_box_get_width (&box) * resource_scale);
  height = ceilf (clutter_actor_box_get_height (&box) * resource_scale);
  if (width <= 0 || height <= 0)
    goto out;

  texture = cogl_texture_2d_new_with_size (cogl_context, width, height);
  offscreen = cogl_offscreen_new_with_texture (texture);
  framebuffer = COGL_FRAMEBUFFER (offscreen);
  if (!cogl_framebuffer_allocate (framebuffer, NULL))
    goto out;

  clutter_actor_get_transform (actor, &transform);
  if (!graphene_matrix_inverse (&transform, &inverse))
    goto out;

  cogl_framebuffer_orthographic (framebuffer, 0, 0, width, height, 0, 1.0);
  cogl_framebuffer_scale (framebuffer, resource_scale, resource_scale, 1);
  cogl_framebuffer_transform (framebuffer, &inverse);

  opacity_override = clutter_actor_get_opacity_override (actor);
  clutter_actor_set_opacity_override (actor, 255);
  color_state = clutter_actor_get_color_state (actor);
  paint_context = clutter_paint_context_new_for_framebuffer (framebuffer, NULL,
                                                             CLUTTER_PAINT_FLAG_NONE,
                                                             color_state);
  clutter_paint_context_push_color_state (paint_context, color_state);
  clutter_actor_paint (actor, paint_context);
  clutter_paint_context_pop_color_state (paint_context);
  clutter_paint_context_destroy (paint_context);
  clutter_actor_set_opacity_override (actor, opacity_override);

out:
  if (!was_visible)
    clutter_actor_hide (actor);
}

/**
 * shell_util_get_week_start:
 * @locale: A locale such as "de_DE" or "en-US"
 *
 * Gets the first day of the week in @locale's region, from its
 * Unicode CLDR data, so it works without the locale being installed.
 *
 * Returns: A number from 0 (Sunday) to 6 (Saturday)
 */
int
shell_util_get_week_start (const char *locale)
{
  UErrorCode status = U_ZERO_ERROR;
  UCalendar *calendar;
  int first_day;

  calendar = ucal_open (NULL, 0, locale, UCAL_GREGORIAN, &status);
  if (U_FAILURE (status))
    return 0;

  first_day = ucal_getAttribute (calendar, UCAL_FIRST_DAY_OF_WEEK);
  ucal_close (calendar);
  return first_day - UCAL_SUNDAY;
}

/**
 * shell_util_translate_time_string:
 * @str: String to translate
 *
 * Translate @str according to the locale defined by LC_TIME; unlike
 * dcgettext(), the translations is still taken from the LC_MESSAGES
 * catalogue and not the LC_TIME one.
 *
 * Returns: the translated string
 */
const char *
shell_util_translate_time_string (const char *str)
{
  const char *locale = g_getenv ("LC_TIME");
  const char *res;
  const char *sep;
  locale_t old_loc;
  locale_t loc = (locale_t) 0;

  if (locale)
    loc = newlocale (LC_MESSAGES_MASK, locale, (locale_t) 0);

  old_loc = uselocale (loc);

  sep = strchr (str, '\004');
  res = g_dpgettext (NULL, str, sep ? sep - str + 1 : 0);

  uselocale (old_loc);

  if (loc != (locale_t) 0)
    freelocale (loc);

  return res;
}

/**
 * shell_util_create_pixbuf_from_data:
 * @data: (array length=len) (element-type guint8) (transfer full):
 * @len:
 * @colorspace:
 * @has_alpha:
 * @bits_per_sample:
 * @width:
 * @height:
 * @rowstride:
 *
 * Workaround for non-introspectability of gdk_pixbuf_from_data().
 *
 * Returns: (transfer full):
 */
GdkPixbuf *
shell_util_create_pixbuf_from_data (const guchar      *data,
                                    gsize              len,
                                    GdkColorspace      colorspace,
                                    gboolean           has_alpha,
                                    int                bits_per_sample,
                                    int                width,
                                    int                height,
                                    int                rowstride)
{
  g_return_val_if_fail (data != NULL, NULL);
  g_return_val_if_fail (colorspace == GDK_COLORSPACE_RGB, NULL);
  g_return_val_if_fail (bits_per_sample == 8, NULL);
  g_return_val_if_fail (width > 0, NULL);
  g_return_val_if_fail (height > 0, NULL);

  unsigned int channels;
  unsigned int row_min;
  size_t required;

  channels = has_alpha ? 4 : 3;

  /* Validate that the data array length is big enough for
   * the provided pixbuf parameters;
   * take into account that the actual rowstride may be bigger
   * than the minimum requirement, and that the last row may
   * not be as wide as the full rowstride.
   * See https://docs.gtk.org/gdk-pixbuf/class.Pixbuf.html#image-data
   */

  row_min = width * ((channels * bits_per_sample + 7) / 8);
  g_return_val_if_fail (rowstride >= row_min, NULL);

  required = (height - 1) * rowstride + row_min;
  g_return_val_if_fail (len >= required, NULL);

  return gdk_pixbuf_new_from_data (data, colorspace, has_alpha,
                                   bits_per_sample, width, height, rowstride,
                                   (GdkPixbufDestroyNotify) g_free, NULL);
}

/**
 * shell_util_get_uid:
 *
 * A wrapper around getuid() so that it can be used from JavaScript. This
 * function will always succeed.
 *
 * Returns: the real user ID of the calling process
 */
gint
shell_util_get_uid (void)
{
  return getuid ();
}

static void
on_get_unit_cb (GObject      *source,
                GAsyncResult *res,
                gpointer      user_data)
{
  g_autoptr (GTask) task = G_TASK (user_data);
  g_autoptr (GVariant) reply = NULL;
  GError *error = NULL;

  reply = g_dbus_connection_call_finish (G_DBUS_CONNECTION (source),
                                         res, &error);
  if (reply == NULL)
    {
      g_task_return_error (task, error);
      return;
    }

  g_task_return_boolean (task, TRUE);
}

void
shell_util_systemd_unit_exists (const gchar         *unit,
                                GCancellable        *cancellable,
                                GAsyncReadyCallback  callback,
                                gpointer             user_data)
{
  g_autoptr (GTask) task = g_task_new (NULL, cancellable, callback, user_data);
  g_autoptr (GDBusConnection) connection = NULL;
  g_autofree char *self_unit = NULL;
  GError *error = NULL;
  int res;

  g_task_set_source_tag (task, shell_util_systemd_unit_exists);

  connection = g_bus_get_sync (G_BUS_TYPE_SESSION, NULL, &error);
  if (connection == NULL)
    {
      g_task_return_error (task, error);
      return;
    }

  /* We look up the systemd unit that our own process is running in here.
   * This way we determine whether the session is managed using systemd.
   */
  res = sd_pid_get_user_unit (getpid (), &self_unit);

  if (res == -ENODATA ||
      (res >= 0 && g_strcmp0 (self_unit, "kestrel.service") != 0))
    {
      g_task_return_new_error (task,
                               G_IO_ERROR,
                               G_IO_ERROR_NOT_SUPPORTED,
                               "Not systemd managed");
      return;
    }
  else if (res < 0)
    {
      g_task_return_new_error (task,
                               G_IO_ERROR,
                               g_io_error_from_errno (-res),
                               "Error fetching own systemd unit: %s",
                               g_strerror (-res));
      return;
    }

  g_dbus_connection_call (connection,
                          "org.freedesktop.systemd1",
                          "/org/freedesktop/systemd1",
                          "org.freedesktop.systemd1.Manager",
                          "GetUnit",
                          g_variant_new ("(s)", unit),
                          G_VARIANT_TYPE ("(o)"),
                          G_DBUS_CALL_FLAGS_NONE,
                          -1, cancellable,
                          on_get_unit_cb,
                          g_steal_pointer (&task));
}

gboolean
shell_util_systemd_unit_exists_finish (GAsyncResult  *res,
                                       GError       **error)
{
  return g_task_propagate_boolean (G_TASK (res), error);
}

void
shell_util_sd_notify (void)
{
  /* We only use NOTIFY_SOCKET exactly once; unset it so it doesn't remain in
   * our environment. */
  sd_notify (1, "READY=1");
}

static void
spawn_child_setup (gpointer user_data)
{
  MetaContext *meta_context = user_data;

  /* No async-signal-unsafe code should be called here, so we don't either
   * pass the GError to the function, as it may lead to dynamic allocations.
   */
  meta_context_restore_rlimit_nofile (meta_context, NULL);
}

/**
 * shell_util_spawn_async:
 * @working_directory: (type filename) (nullable): child's current working
 *     directory, or %NULL to inherit parent's
 * @argv: (array zero-terminated=1):
 *     child's argument vector
 * @envp: (array zero-terminated=1) (nullable):
 *     child's environment, or %NULL to inherit parent's
 * @flags: flags from #GSpawnFlags
 * @error: return location for error
 *
 * A wrapper around g_spawn_async() with async-signal-safe implementation of
 * #GSpawnChildSetupFunc to launch a child program asynchronously resetting the
 * rlimit nofile on child setup.
 *
 * Returns: the PID of the child on success, 0 if error is set
 **/
GPid
shell_util_spawn_async (const char          *working_directory,
                        const char * const  *argv,
                        const char * const  *envp,
                        GSpawnFlags          flags,
                        GError             **error)
{
  GPid child_pid = 0;

  if (!g_spawn_async (working_directory, (char **) argv, (char **) envp, flags,
                      spawn_child_setup,
                      shell_global_get_context (shell_global_get ()),
                      &child_pid,
                      error))
    return 0;

  return child_pid;
}
