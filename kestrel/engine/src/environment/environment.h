/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <stdbool.h>

#define LUFT_ENVIRONMENT_PATH "PATH=/usr/local/bin:/usr/bin"

bool luft_environment_keeps (const char *entry,
                             bool        development);

bool luft_environment_is_unsafe (const char *name);

char **luft_environment_for_luft (char * const *environment,
                                  bool          development);
