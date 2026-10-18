/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <systemd/sd-hwdb.h>

#include "shell-app-scope-private.h"
#include "shell-systemd.h"

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
  shell_app_scope_start (NULL, name, pid);
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
