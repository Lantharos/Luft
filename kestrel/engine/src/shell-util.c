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
#include <meta/display.h>
#ifdef HAVE_XWAYLAND
#include <meta/meta-x11-display.h>
#endif

#include <locale.h>
#ifdef HAVE__NL_TIME_FIRST_WEEKDAY
#include <langinfo.h>
#endif

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
 * shell_util_get_week_start:
 *
 * Gets the first week day for the current locale, expressed as a
 * number in the range 0..6, representing week days from Sunday to
 * Saturday.
 *
 * Returns: A number representing the first week day for the current
 *          locale
 */
/* Copied from gtkcalendar.c */
int
shell_util_get_week_start (void)
{
  int week_start;
#ifdef HAVE__NL_TIME_FIRST_WEEKDAY
  union { unsigned int word; char *string; } langinfo;
  int week_1stday = 0;
  int first_weekday = 1;
  guint week_origin;
#else
  char *gtk_week_start;
#endif

#ifdef HAVE__NL_TIME_FIRST_WEEKDAY
  langinfo.string = nl_langinfo (_NL_TIME_FIRST_WEEKDAY);
  first_weekday = langinfo.string[0];
  langinfo.string = nl_langinfo (_NL_TIME_WEEK_1STDAY);
  week_origin = langinfo.word;
  if (week_origin == 19971130) /* Sunday */
    week_1stday = 0;
  else if (week_origin == 19971201) /* Monday */
    week_1stday = 1;
  else
    g_warning ("Unknown value of _NL_TIME_WEEK_1STDAY.\n");

  week_start = (week_1stday + first_weekday - 1) % 7;
#else
  /* Use a define to hide the string from xgettext */
# define GTK_WEEK_START "calendar:week_start:0"
  gtk_week_start = dgettext ("gtk40", GTK_WEEK_START);

  if (strncmp (gtk_week_start, "calendar:week_start:", 20) == 0)
    week_start = *(gtk_week_start + 20) - '0';
  else
    week_start = -1;

  if (week_start < 0 || week_start > 6)
    {
      g_warning ("Whoever translated calendar:week_start:0 for GTK+ "
                 "did so wrongly.\n");
      return 0;
    }
#endif

  return week_start;
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

/**
 * shell_util_has_x11_display_extension:
 * @display: A #MetaDisplay
 * @extension: An X11 extension
 *
 * If the corresponding X11 display provides the passed extension, return %TRUE,
 * otherwise %FALSE. If there is no X11 display, %FALSE is passed.
 */
gboolean
shell_util_has_x11_display_extension (MetaDisplay *display,
                                      const char  *extension)
{
#ifdef HAVE_XWAYLAND
  MetaX11Display *x11_display;
  Display *xdisplay;
  int op, event, error;

  x11_display = meta_display_get_x11_display (display);
  if (!x11_display)
    return FALSE;

  xdisplay = meta_x11_display_get_xdisplay (x11_display);
  return XQueryExtension (xdisplay, extension, &op, &event, &error);
#else
  return FALSE;
#endif
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
