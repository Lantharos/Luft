/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>
#include <gio/gio.h>
#include <systemd/sd-login.h>

#include "shell-app-scope-private.h"

#define CGROUP_ROOT "/sys/fs/cgroup"
#define SCOPE_TIMEOUT_MS 5000
#define SWEEP_INTERVAL_MS 50
#define SWEEP_ATTEMPTS 100

struct _ShellAppScope
{
  grefcount ref;
  char *staging;
  int staging_procs;
};

typedef struct
{
  ShellAppScope *scope;
  char *name;
  gint32 pid;
} PendingStart;

typedef struct
{
  ShellAppScope *scope;
  char *unit_procs;
  guint attempts;
} Sweep;

static char oom_score_adjust[16];
static char *staging_root;
static char *app_slice;

static void
write_string (int         fd,
              const char *value)
{
  size_t length = strlen (value);

  while (write (fd, value, length) < 0 && errno == EINTR)
    ;
}

static void
write_file (const char *path,
            const char *value)
{
  int fd = open (path, O_WRONLY | O_CLOEXEC);

  if (fd < 0)
    return;
  write_string (fd, value);
  close (fd);
}

void
shell_app_scope_reset_oom_score_adjust (void)
{
  if (oom_score_adjust[0])
    write_file ("/proc/self/oom_score_adj", oom_score_adjust);
}

void
shell_app_scope_child_setup (ShellAppScope *scope)
{
  shell_app_scope_reset_oom_score_adjust ();
  if (scope->staging_procs >= 0)
    write_string (scope->staging_procs, "0");
}

static void
reset_oom_score_adjust_of (gint32 pid)
{
  g_autofree char *path = g_strdup_printf ("/proc/%d/oom_score_adj", pid);

  if (oom_score_adjust[0])
    write_file (path, oom_score_adjust);
}

static GArray *
read_pids (const char *cgroup)
{
  g_autofree char *path = g_build_filename (cgroup, "cgroup.procs", NULL);
  g_autofree char *contents = NULL;
  g_auto (GStrv) lines = NULL;
  GArray *pids = g_array_new (FALSE, FALSE, sizeof (guint32));

  if (!g_file_get_contents (path, &contents, NULL, NULL))
    return pids;

  lines = g_strsplit (contents, "\n", -1);
  for (char **line = lines; *line; line++)
    {
      guint64 value;
      guint32 pid;

      if (!g_ascii_string_to_unsigned (*line, 10, 1, G_MAXINT32, &value, NULL))
        continue;
      pid = value;
      g_array_append_val (pids, pid);
    }

  return pids;
}

static gboolean
sweep_staging (gpointer user_data)
{
  Sweep *sweep = user_data;
  g_autoptr (GArray) pids = read_pids (sweep->scope->staging);
  int fd;

  if (pids->len == 0)
    return G_SOURCE_REMOVE;

  fd = open (sweep->unit_procs, O_WRONLY | O_CLOEXEC);
  if (fd >= 0)
    {
      for (guint i = 0; i < pids->len; i++)
        {
          char pid[16];

          g_snprintf (pid, sizeof (pid), "%u", g_array_index (pids, guint32, i));
          write_string (fd, pid);
        }
      close (fd);
    }

  return ++sweep->attempts < SWEEP_ATTEMPTS ? G_SOURCE_CONTINUE : G_SOURCE_REMOVE;
}

static void
sweep_free (gpointer user_data)
{
  Sweep *sweep = user_data;

  shell_app_scope_unref (sweep->scope);
  g_free (sweep->unit_procs);
  g_free (sweep);
}

static void
sweep_into (ShellAppScope *scope,
            const char    *unit)
{
  Sweep *sweep = g_new0 (Sweep, 1);

  sweep->scope = shell_app_scope_ref (scope);
  sweep->unit_procs = g_build_filename (app_slice, unit, "cgroup.procs", NULL);
  g_timeout_add_full (G_PRIORITY_DEFAULT, SWEEP_INTERVAL_MS, sweep_staging, sweep, sweep_free);
}

static void
pending_start_free (PendingStart *pending)
{
  g_clear_pointer (&pending->scope, shell_app_scope_unref);
  g_free (pending->name);
  g_free (pending);
}

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
unit_name (const char *name,
           gint32      pid)
{
  g_autofree char *base = NULL;
  g_autofree char *escaped = NULL;

  if (name == NULL)
    base = g_strdup ("org.freedesktop.Unknown");
  else if (name[0] == '/')
    base = g_path_get_basename (name);
  else if (g_str_has_suffix (name, ".desktop"))
    base = g_strndup (name, strlen (name) - strlen (".desktop"));
  else
    base = g_strdup (name);

  escaped = escape_unit_name (base);
  return g_strdup_printf ("app-kestrel-%s-%d.scope", escaped, pid);
}

static GArray *
scope_pids (PendingStart *pending)
{
  GArray *pids = g_array_new (FALSE, FALSE, sizeof (guint32));
  g_autoptr (GArray) staged = NULL;
  guint32 pid = pending->pid;

  g_array_append_val (pids, pid);
  if (!pending->scope || !pending->scope->staging)
    return pids;

  staged = read_pids (pending->scope->staging);
  for (guint i = 0; i < staged->len; i++)
    if (g_array_index (staged, guint32, i) != pid)
      g_array_append_val (pids, g_array_index (staged, guint32, i));

  return pids;
}

static void
on_scope_started (GObject      *source,
                  GAsyncResult *result,
                  gpointer      user_data)
{
  PendingStart *pending = user_data;
  g_autoptr (GVariant) reply = NULL;
  g_autoptr (GError) error = NULL;

  reply = g_dbus_connection_call_finish (G_DBUS_CONNECTION (source), result, &error);
  if (error)
    g_warning ("Could not create transient scope for PID %d: %s", pending->pid, error->message);
  else if (pending->scope && pending->scope->staging && app_slice)
    {
      g_autofree char *unit = unit_name (pending->name, pending->pid);
      sweep_into (pending->scope, unit);
    }

  pending_start_free (pending);
}

static void
start_scope (GDBusConnection *bus,
             PendingStart    *pending)
{
  g_autofree char *unit = unit_name (pending->name, pending->pid);
  g_autoptr (GArray) pids = scope_pids (pending);
  const char *launcher = g_get_application_name ();
  GVariantBuilder properties;

  g_variant_builder_init (&properties, G_VARIANT_TYPE ("a(sv)"));
  if (launcher)
    g_variant_builder_add (&properties, "(sv)", "Description",
                           g_variant_new_take_string (g_strdup_printf ("Application launched by %s", launcher)));
  g_variant_builder_add (&properties, "(sv)", "Slice", g_variant_new_string ("app.slice"));
  g_variant_builder_add (&properties, "(sv)", "PIDs",
                         g_variant_new_fixed_array (G_VARIANT_TYPE_UINT32, pids->data, pids->len, sizeof (guint32)));
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
                          pending);
}

static void
on_session_bus (GObject      *source,
                GAsyncResult *result,
                gpointer      user_data)
{
  PendingStart *pending = user_data;
  g_autoptr (GDBusConnection) bus = NULL;
  g_autoptr (GError) error = NULL;

  bus = g_bus_get_finish (result, &error);
  if (!bus)
    {
      g_warning ("Could not get session bus: %s", error->message);
      pending_start_free (pending);
      return;
    }

  start_scope (bus, pending);
}

void
shell_app_scope_start (ShellAppScope *scope,
                       const char    *name,
                       gint32         pid)
{
  g_autofree char *own_unit = NULL;
  PendingStart *pending;

  if (sd_pid_get_user_unit (getpid (), &own_unit) < 0)
    return;

  if (!scope)
    reset_oom_score_adjust_of (pid);

  pending = g_new0 (PendingStart, 1);
  pending->scope = scope ? shell_app_scope_ref (scope) : NULL;
  pending->name = g_strdup (name);
  pending->pid = pid;
  g_bus_get (G_BUS_TYPE_SESSION, NULL, on_session_bus, pending);
}

ShellAppScope *
shell_app_scope_new (void)
{
  static guint serial;
  ShellAppScope *scope = g_new0 (ShellAppScope, 1);
  g_autofree char *staging = NULL;
  g_autofree char *procs = NULL;

  g_ref_count_init (&scope->ref);
  scope->staging_procs = -1;
  if (!staging_root)
    return scope;

  staging = g_strdup_printf ("%s/launch-%u", staging_root, ++serial);
  if (mkdir (staging, 0755) < 0)
    return scope;

  procs = g_build_filename (staging, "cgroup.procs", NULL);
  scope->staging_procs = open (procs, O_WRONLY | O_CLOEXEC);
  scope->staging = g_steal_pointer (&staging);
  return scope;
}

ShellAppScope *
shell_app_scope_ref (ShellAppScope *scope)
{
  g_ref_count_inc (&scope->ref);
  return scope;
}

void
shell_app_scope_unref (ShellAppScope *scope)
{
  if (!g_ref_count_dec (&scope->ref))
    return;

  if (scope->staging_procs >= 0)
    close (scope->staging_procs);
  if (scope->staging)
    rmdir (scope->staging);
  g_free (scope->staging);
  g_free (scope);
}

static void
on_default_oom_score_adjust (GObject      *source,
                             GAsyncResult *result,
                             gpointer      user_data)
{
  g_autoptr (GVariant) reply = NULL;
  g_autoptr (GVariant) value = NULL;

  reply = g_dbus_connection_call_finish (G_DBUS_CONNECTION (source), result, NULL);
  if (!reply)
    return;

  g_variant_get (reply, "(v)", &value);
  g_snprintf (oom_score_adjust, sizeof (oom_score_adjust), "%d", g_variant_get_int32 (value));
}

static void
on_manager_bus (GObject      *source,
                GAsyncResult *result,
                gpointer      user_data)
{
  g_autoptr (GDBusConnection) bus = g_bus_get_finish (result, NULL);

  if (!bus)
    return;

  g_dbus_connection_call (bus,
                          "org.freedesktop.systemd1",
                          "/org/freedesktop/systemd1",
                          "org.freedesktop.DBus.Properties",
                          "Get",
                          g_variant_new ("(ss)", "org.freedesktop.systemd1.Manager", "DefaultOOMScoreAdjust"),
                          G_VARIANT_TYPE ("(v)"),
                          G_DBUS_CALL_FLAGS_NO_AUTO_START,
                          -1,
                          NULL,
                          on_default_oom_score_adjust,
                          NULL);
}

static char *
own_cgroup (void)
{
  g_autofree char *contents = NULL;

  if (!g_file_get_contents ("/proc/self/cgroup", &contents, NULL, NULL) ||
      !g_str_has_prefix (contents, "0::/"))
    return NULL;

  return g_strconcat (CGROUP_ROOT, g_strchomp (contents + 3), NULL);
}

void
shell_app_scope_init (void)
{
  g_autofree char *own_unit = NULL;
  g_autofree char *cgroup = NULL;
  const char *manager, *manager_end;

  if (sd_pid_get_user_unit (getpid (), &own_unit) < 0 || !(cgroup = own_cgroup ()))
    return;

  manager = strstr (cgroup, "/user@");
  manager_end = manager ? strchr (manager + 1, '/') : NULL;
  if (!manager_end)
    return;

  app_slice = g_strdup_printf ("%.*s/app.slice", (int) (manager_end - cgroup), cgroup);
  if (g_str_has_suffix (cgroup, "/shell"))
    staging_root = g_path_get_dirname (cgroup);

  g_bus_get (G_BUS_TYPE_SESSION, NULL, on_manager_bus, NULL);
}
