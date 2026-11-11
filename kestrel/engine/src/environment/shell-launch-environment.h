/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <gio/gio.h>

void shell_launch_environment_init (void);

char **shell_launch_environment_for_luft (void);

void shell_launch_environment_apply (GAppLaunchContext *context,
                                     GAppInfo          *app);
