#pragma once

#include <clutter/clutter.h>

G_BEGIN_DECLS

#define SHELL_TYPE_MODIFIER_CHORD (shell_modifier_chord_get_type ())
G_DECLARE_FINAL_TYPE (ShellModifierChord, shell_modifier_chord,
                      SHELL, MODIFIER_CHORD, GObject)

ClutterModifierType shell_modifier_chord_get_modifiers (ShellModifierChord *self);
void shell_modifier_chord_set_modifiers (ShellModifierChord  *self,
                                         ClutterModifierType  modifiers);

G_END_DECLS
