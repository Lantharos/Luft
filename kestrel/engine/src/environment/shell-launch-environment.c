/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <stdlib.h>
#include <string.h>

#include "environment.h"
#include "shell-launch-environment.h"
#include "../shell-development-private.h"

#define LUFT_APP_ID "com.lantharos."
#define INSTALLED_LUFT_APPS "/usr/lib/sabine/" LUFT_APP_ID

static char **user_environment;

static char *
name_of (const char *entry)
{
  return g_strndup (entry, strcspn (entry, "="));
}

static gboolean
in_folder (const char *path,
           const char *folder)
{
  g_autofree char *prefix = g_strconcat (folder, "/", NULL);

  return g_str_has_prefix (path, prefix);
}

static gboolean
runs_luft_program (GAppInfo *app)
{
  const char *executable = g_app_info_get_executable (app);
  const char *built = shell_development_path ("KESTREL_LUFT_APPS");
  g_autofree char *found = NULL;
  g_autofree char *program = NULL;

  if (!executable || !(found = g_find_program_in_path (executable)) || !(program = realpath (found, NULL)))
    return FALSE;

  return g_str_has_prefix (program, INSTALLED_LUFT_APPS) || (built && in_folder (program, built));
}

static gboolean
is_luft_app (GAppInfo *app)
{
  const char *id = g_app_info_get_id (app);

  return (id && g_str_has_prefix (id, LUFT_APP_ID)) || runs_luft_program (app);
}

static void
keep_luft_environment (GAppLaunchContext *context)
{
  g_auto (GStrv) environment = g_app_launch_context_get_environment (context);
  gboolean development = shell_development_build ();

  for (char **entry = environment; *entry; entry++)
    {
      g_autofree char *name = NULL;

      if (luft_environment_keeps (*entry, development))
        continue;
      name = name_of (*entry);
      g_app_launch_context_unsetenv (context, name);
    }

  if (!development)
    g_app_launch_context_setenv (context, "PATH", strchr (LUFT_ENVIRONMENT_PATH, '=') + 1);
}

static void
restore_user_environment (GAppLaunchContext *context)
{
  if (!user_environment)
    return;

  for (char **entry = user_environment; *entry; entry++)
    {
      g_autofree char *name = name_of (*entry);

      g_app_launch_context_setenv (context, name, *entry + strlen (name) + 1);
    }
}

char **
shell_launch_environment_for_luft (void)
{
  g_auto (GStrv) environment = g_get_environ ();
  char **kept = luft_environment_for_luft (environment, shell_development_build ());
  char **copied = g_strdupv (kept);

  free (kept);
  return copied;
}

void
shell_launch_environment_apply (GAppLaunchContext *context,
                                GAppInfo          *app)
{
  if (app && is_luft_app (app))
    keep_luft_environment (context);
  else
    restore_user_environment (context);
}

static void
on_manager_environment (GObject      *source,
                        GAsyncResult *result,
                        gpointer      user_data)
{
  g_autoptr (GVariant) reply = NULL;
  g_autoptr (GVariant) value = NULL;
  g_autoptr (GStrvBuilder) kept_from_kestrel = g_strv_builder_new ();
  g_autofree const char **entries = NULL;

  reply = g_dbus_connection_call_finish (G_DBUS_CONNECTION (source), result, NULL);
  if (!reply)
    return;

  g_variant_get (reply, "(v)", &value);
  entries = g_variant_get_strv (value, NULL);
  for (const char **entry = entries; *entry; entry++)
    {
      g_autofree char *name = name_of (*entry);

      if (strchr (*entry, '=') && luft_environment_is_unsafe (name) && !g_getenv (name))
        g_strv_builder_add (kept_from_kestrel, *entry);
    }

  user_environment = g_strv_builder_end (kept_from_kestrel);
}

static void
on_session_bus (GObject      *source,
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
                          g_variant_new ("(ss)", "org.freedesktop.systemd1.Manager", "Environment"),
                          G_VARIANT_TYPE ("(v)"),
                          G_DBUS_CALL_FLAGS_NO_AUTO_START,
                          -1,
                          NULL,
                          on_manager_environment,
                          NULL);
}

void
shell_launch_environment_init (void)
{
  g_bus_get (G_BUS_TYPE_SESSION, NULL, on_session_bus, NULL);
}
