/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#pragma once

#include <meta/meta-selection-source.h>

G_BEGIN_DECLS

#define ST_TYPE_CLIPBOARD_FILES (st_clipboard_files_get_type ())
G_DECLARE_FINAL_TYPE (StClipboardFiles, st_clipboard_files,
                      ST, CLIPBOARD_FILES, MetaSelectionSource)

MetaSelectionSource * st_clipboard_files_new (const char * const *paths);

G_END_DECLS
