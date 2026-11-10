/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <sys/stat.h>

#include "shell-development-private.h"

static gboolean
started_from_build (void)
{
  const char *build = g_getenv ("KESTREL_BUILDDIR");
  g_autofree char *built = NULL;
  struct stat own, candidate;

  if (!build)
    return FALSE;

  built = g_build_filename (build, "kestrel", NULL);
  return stat ("/proc/self/exe", &own) == 0 && stat (built, &candidate) == 0 &&
         own.st_dev == candidate.st_dev && own.st_ino == candidate.st_ino;
}

const char *
shell_development_path (const char *variable)
{
  static gsize checked = 0;
  static gboolean from_build = FALSE;

  if (g_once_init_enter (&checked))
    {
      from_build = started_from_build ();
      g_once_init_leave (&checked, 1);
    }

  return from_build ? g_getenv (variable) : NULL;
}
