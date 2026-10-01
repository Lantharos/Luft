/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <clutter/clutter.h>
#include <gio/gio.h>

CoglTexture *shell_texture_file_paint_actor (ClutterActor *actor);

GBytes *shell_texture_file_encode (CoglTexture *texture,
                                   GBytes      *metadata);

void shell_texture_file_load_async (GFile               *file,
                                    int                  io_priority,
                                    GCancellable        *cancellable,
                                    GAsyncReadyCallback  callback,
                                    gpointer             user_data);

CoglTexture *shell_texture_file_load_finish (GAsyncResult  *result,
                                             GBytes       **metadata,
                                             GError       **error);
