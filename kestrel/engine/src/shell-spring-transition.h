#pragma once

#include <clutter/clutter.h>

G_BEGIN_DECLS

#define SHELL_TYPE_SPRING_TRANSITION (shell_spring_transition_get_type ())
G_DECLARE_FINAL_TYPE (ShellSpringTransition, shell_spring_transition,
                      SHELL, SPRING_TRANSITION, ClutterPropertyTransition)

ClutterTransition *shell_spring_transition_new (const char *property_name,
                                                double      target,
                                                double      duration,
                                                double      bounce,
                                                double      velocity);

double shell_spring_transition_get_target   (ShellSpringTransition *self);
double shell_spring_transition_get_velocity (ShellSpringTransition *self);

G_END_DECLS
