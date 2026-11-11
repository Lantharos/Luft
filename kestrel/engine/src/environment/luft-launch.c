/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "environment.h"

extern char **environ;

int
main (int    argc,
      char **argv)
{
  char **environment;

  if (argc < 2 || argv[1][0] != '/')
    {
      fprintf (stderr, "Usage: luft-launch /PATH/TO/PROGRAM [ARGUMENT…]\n"
                       "Starts one of Luft's own programs with only the environment it needs.\n");
      return 2;
    }

  environment = luft_environment_for_luft (environ, false);
  if (!environment)
    return 127;

  execve (argv[1], argv + 1, environment);
  fprintf (stderr, "luft-launch: %s: %s\n", argv[1], strerror (errno));
  return 127;
}
