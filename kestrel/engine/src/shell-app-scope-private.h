/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib.h>

#define SHELL_APP_SCOPE_KEY "shell-app-scope"

typedef struct _ShellAppScope ShellAppScope;

void shell_app_scope_init (void);

ShellAppScope *shell_app_scope_new (void);
ShellAppScope *shell_app_scope_ref (ShellAppScope *scope);
void shell_app_scope_unref (ShellAppScope *scope);

void shell_app_scope_child_setup (ShellAppScope *scope);
void shell_app_scope_reset_oom_score_adjust (void);

void shell_app_scope_start (ShellAppScope *scope,
                            const char    *name,
                            gint32         pid);

G_DEFINE_AUTOPTR_CLEANUP_FUNC (ShellAppScope, shell_app_scope_unref)
