/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <errno.h>
#include <unistd.h>
#include <gio/gio.h>
#include <systemd/sd-hwdb.h>
#include <systemd/sd-login.h>

#include "shell-systemd.h"

#define SCOPE_TIMEOUT_MS 1000

static char *
escape_unit_name (const char *name)
{
  GString *escaped = g_string_sized_new (strlen (name));

  for (; *name; name++)
    {
      if (g_ascii_isalnum (*name) || *name == ':' || *name == '_' || *name == '.')
        g_string_append_c (escaped, *name);
      else
        g_string_append_printf (escaped, "\\x%02x", (guchar) *name);
    }

  return g_string_free (escaped, FALSE);
}

static char *
app_name (const char *name)
{
  if (name == NULL)
    return g_strdup ("org.freedesktop.Unknown");
  if (name[0] == '/')
    return g_path_get_basename (name);
  if (g_str_has_suffix (name, ".desktop"))
    return g_strndup (name, strlen (name) - strlen (".desktop"));
  return g_strdup (name);
}

static void
on_scope_started (GObject      *source,
                  GAsyncResult *result,
                  gpointer      user_data)
{
  g_autoptr (GVariant) reply = NULL;
  g_autoptr (GError) error = NULL;
  gint32 pid = GPOINTER_TO_INT (user_data);

  reply = g_dbus_connection_call_finish (G_DBUS_CONNECTION (source), result, &error);
  if (error)
    g_warning ("Could not create transient scope for PID %d: %s", pid, error->message);
}

static void
start_scope (GDBusConnection *bus,
             const char      *name,
             gint32           pid)
{
  g_autofree char *base = app_name (name);
  g_autofree char *escaped = escape_unit_name (base);
  g_autofree char *unit = g_strdup_printf ("app-gnome-%s-%d.scope", escaped, pid);
  const char *launcher = g_get_application_name ();
  GVariantBuilder properties;

  g_variant_builder_init (&properties, G_VARIANT_TYPE ("a(sv)"));
  if (launcher)
    g_variant_builder_add (&properties, "(sv)", "Description",
                           g_variant_new_take_string (g_strdup_printf ("Application launched by %s", launcher)));
  g_variant_builder_add (&properties, "(sv)", "PIDs",
                         g_variant_new_fixed_array (G_VARIANT_TYPE_UINT32, &pid, 1, sizeof (guint32)));
  g_variant_builder_add (&properties, "(sv)", "CollectMode", g_variant_new_string ("inactive-or-failed"));

  g_dbus_connection_call (bus,
                          "org.freedesktop.systemd1",
                          "/org/freedesktop/systemd1",
                          "org.freedesktop.systemd1.Manager",
                          "StartTransientUnit",
                          g_variant_new ("(ssa(sv)@a(sa(sv)))", unit, "fail", &properties,
                                         g_variant_new_array (G_VARIANT_TYPE ("(sa(sv))"), NULL, 0)),
                          G_VARIANT_TYPE ("(o)"),
                          G_DBUS_CALL_FLAGS_NO_AUTO_START,
                          SCOPE_TIMEOUT_MS,
                          NULL,
                          on_scope_started,
                          GINT_TO_POINTER (pid));
}

typedef struct
{
  char *name;
  gint32 pid;
} PendingScope;

static void
on_session_bus (GObject      *source,
                GAsyncResult *result,
                gpointer      user_data)
{
  PendingScope *pending = user_data;
  g_autoptr (GDBusConnection) bus = NULL;
  g_autoptr (GError) error = NULL;

  bus = g_bus_get_finish (result, &error);
  if (bus)
    start_scope (bus, pending->name, pending->pid);
  else
    g_warning ("Could not get session bus: %s", error->message);

  g_free (pending->name);
  g_free (pending);
}

/**
 * shell_systemd_start_app_scope:
 * @name: (nullable): the app ID, desktop file ID or executable of the app
 * @pid: the process ID of the app
 *
 * Moves @pid into a transient systemd scope of its own when the shell itself
 * runs under the systemd user instance, so the app is separate from the shell.
 */
void
shell_systemd_start_app_scope (const char *name,
                               gint32      pid)
{
  g_autofree char *own_unit = NULL;
  PendingScope *pending;

  if (sd_pid_get_user_unit (getpid (), &own_unit) < 0)
    return;

  pending = g_new (PendingScope, 1);
  pending->name = g_strdup (name);
  pending->pid = pid;
  g_bus_get (G_BUS_TYPE_SESSION, NULL, on_session_bus, pending);
}

/**
 * shell_systemd_get_oui_vendor:
 * @address: a hardware address such as `00:1A:7D:DA:71:13`
 *
 * Returns: (transfer full) (nullable): the vendor the hardware database
 *   lists for the address' organizationally unique identifier
 */
char *
shell_systemd_get_oui_vendor (const char *address)
{
  sd_hwdb *hwdb = NULL;
  const char *vendor = NULL;
  char *result = NULL;
  char modalias[11];

  if (strlen (address) < 8)
    return NULL;

  g_snprintf (modalias, sizeof (modalias), "OUI:%c%c%c%c%c%c",
              g_ascii_toupper (address[0]), g_ascii_toupper (address[1]),
              g_ascii_toupper (address[3]), g_ascii_toupper (address[4]),
              g_ascii_toupper (address[6]), g_ascii_toupper (address[7]));

  if (sd_hwdb_new (&hwdb) < 0)
    return NULL;

  if (sd_hwdb_get (hwdb, modalias, "ID_OUI_FROM_DATABASE", &vendor) >= 0)
    result = g_strdup (vendor);

  sd_hwdb_unref (hwdb);
  return result;
}
