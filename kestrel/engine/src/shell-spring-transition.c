#include "config.h"

#include <math.h>

#include "shell-spring-transition.h"

#define LONGEST_SETTLE 10.0
#define SETTLE_STEP (1.0 / 240.0)
#define FRAME (1.0 / 60.0)

typedef struct
{
  double omega;
  double zeta;
  double x0;
  double v0;
} Spring;

struct _ShellSpringTransition
{
  ClutterPropertyTransition parent;

  GParamSpec *pspec;
  double target;
  double response;
  double bounce;
  double velocity;
  double epsilon;
  Spring spring;
};

enum
{
  PROP_0,
  PROP_TARGET,
  PROP_RESPONSE,
  PROP_BOUNCE,
  PROP_VELOCITY,
  PROP_EPSILON,
  N_PROPS
};

static GParamSpec *props[N_PROPS];

G_DEFINE_FINAL_TYPE (ShellSpringTransition, shell_spring_transition, CLUTTER_TYPE_PROPERTY_TRANSITION)

static void
spring_state (const Spring *s,
              double        t,
              double       *x,
              double       *v)
{
  double decay;

  if (s->zeta < 1.0 - 1e-6)
    {
      double damped = s->omega * sqrt (1.0 - s->zeta * s->zeta);
      double a = s->x0;
      double b = (s->v0 + s->zeta * s->omega * a) / damped;
      double c = cos (damped * t);
      double sn = sin (damped * t);

      decay = exp (-s->zeta * s->omega * t);
      *x = decay * (a * c + b * sn);
      *v = decay * ((b * damped - s->zeta * s->omega * a) * c - (a * damped + s->zeta * s->omega * b) * sn);
    }
  else if (s->zeta - 1.0 < 1e-6)
    {
      double a = s->x0;
      double b = s->v0 + s->omega * a;

      decay = exp (-s->omega * t);
      *x = (a + b * t) * decay;
      *v = (b - s->omega * (a + b * t)) * decay;
    }
  else
    {
      double root = s->omega * sqrt (s->zeta * s->zeta - 1.0);
      double r1 = -s->zeta * s->omega + root;
      double r2 = -s->zeta * s->omega - root;
      double c2 = (s->v0 - r1 * s->x0) / (r2 - r1);
      double c1 = s->x0 - c2;

      *x = c1 * exp (r1 * t) + c2 * exp (r2 * t);
      *v = c1 * r1 * exp (r1 * t) + c2 * r2 * exp (r2 * t);
    }
}

static gboolean
spring_rests (const Spring *s,
              double        t,
              double        epsilon)
{
  double x, v;

  spring_state (s, t, &x, &v);
  if (fabs (v) * FRAME > 2.0 * epsilon)
    return FALSE;
  if (s->zeta < 1.0 - 1e-6)
    {
      double damped = s->omega * sqrt (1.0 - s->zeta * s->zeta);
      double b = (s->v0 + s->zeta * s->omega * s->x0) / damped;

      return exp (-s->zeta * s->omega * t) * hypot (s->x0, b) < epsilon;
    }
  return fabs (x) < epsilon;
}

static double
settle_time (const Spring *s,
             double        epsilon)
{
  double t;

  for (t = 0.0; t < LONGEST_SETTLE; t += SETTLE_STEP)
    {
      if (spring_rests (s, t, epsilon))
        return t;
    }
  return LONGEST_SETTLE;
}

static double
damping_ratio (double bounce)
{
  return bounce >= 0.0 ? 1.0 - bounce : 1.0 / (1.0 + bounce);
}

static double
parent_scale (ClutterActor *actor)
{
  ClutterActor *parent;
  double scale = 1.0;

  for (parent = clutter_actor_get_parent (actor); parent; parent = clutter_actor_get_parent (parent))
    {
      double scale_x;

      clutter_actor_get_scale (parent, &scale_x, NULL);
      scale *= fabs (scale_x);
    }
  return scale;
}

static double
automatic_epsilon (ShellSpringTransition *self,
                   ClutterAnimatable     *animatable)
{
  ClutterActor *actor = clutter_animatable_get_actor (animatable);
  const char *name = g_param_spec_get_name (self->pspec);
  double pixel;

  if (g_str_equal (name, "opacity"))
    return 0.5;
  if (g_str_has_prefix (name, "rotation"))
    return 0.05;
  if (!actor)
    return 0.5;

  pixel = 0.5 / (clutter_actor_get_resource_scale (actor) * MAX (parent_scale (actor), 1e-3));
  if (g_str_has_prefix (name, "scale"))
    {
      float width, height;

      clutter_actor_get_size (actor, &width, &height);
      return pixel / MAX (1.0f, MAX (width, height));
    }
  return pixel;
}

static double
value_as_double (const GValue *value)
{
  GValue number = G_VALUE_INIT;

  g_value_init (&number, G_TYPE_DOUBLE);
  if (!g_value_transform (value, &number))
    return 0.0;
  return g_value_get_double (&number);
}

static gboolean
holds_integer (GType type)
{
  switch (G_TYPE_FUNDAMENTAL (type))
    {
    case G_TYPE_CHAR:
    case G_TYPE_UCHAR:
    case G_TYPE_INT:
    case G_TYPE_UINT:
    case G_TYPE_LONG:
    case G_TYPE_ULONG:
    case G_TYPE_INT64:
    case G_TYPE_UINT64:
      return TRUE;
    default:
      return FALSE;
    }
}

static void
set_property_value (ShellSpringTransition *self,
                    ClutterAnimatable     *animatable,
                    double                 value)
{
  GValue number = G_VALUE_INIT;
  GValue result = G_VALUE_INIT;
  GType type = G_PARAM_SPEC_VALUE_TYPE (self->pspec);

  if (holds_integer (type))
    value = round (value);
  g_value_init (&number, G_TYPE_DOUBLE);
  g_value_set_double (&number, value);
  g_value_init (&result, type);
  g_value_transform (&number, &result);
  g_param_value_validate (self->pspec, &result);
  clutter_animatable_set_final_state (animatable, g_param_spec_get_name (self->pspec), &result);
  g_value_unset (&result);
}

static void
shell_spring_transition_attached (ClutterTransition *transition,
                                  ClutterAnimatable *animatable)
{
  ShellSpringTransition *self = SHELL_SPRING_TRANSITION (transition);
  const char *name = clutter_property_transition_get_property_name (CLUTTER_PROPERTY_TRANSITION (self));
  GValue current = G_VALUE_INIT;
  GValue target = G_VALUE_INIT;
  ClutterInterval *interval;
  double epsilon;

  self->pspec = clutter_animatable_find_property (animatable, name);
  g_return_if_fail (self->pspec != NULL);

  g_value_init (&current, G_PARAM_SPEC_VALUE_TYPE (self->pspec));
  clutter_animatable_get_initial_state (animatable, name, &current);
  g_value_init (&target, G_TYPE_DOUBLE);
  g_value_set_double (&target, self->target);

  self->spring = (Spring) {
    .omega = 2.0 * G_PI / (self->response / 1000.0),
    .zeta = damping_ratio (self->bounce),
    .x0 = value_as_double (&current) - self->target,
    .v0 = self->velocity,
  };

  interval = clutter_interval_new_with_values (G_PARAM_SPEC_VALUE_TYPE (self->pspec), &current, NULL);
  clutter_interval_set_final_value (interval, &target);
  clutter_transition_set_interval (transition, interval);
  g_value_unset (&current);

  CLUTTER_TRANSITION_CLASS (shell_spring_transition_parent_class)->attached (transition, animatable);

  epsilon = self->epsilon > 0.0 ? self->epsilon : automatic_epsilon (self, animatable);
  clutter_timeline_set_duration (CLUTTER_TIMELINE (self),
                                 MAX (1, (guint) ceil (settle_time (&self->spring, epsilon) * 1000.0)));
}

static void
shell_spring_transition_detached (ClutterTransition *transition,
                                  ClutterAnimatable *animatable)
{
  ShellSpringTransition *self = SHELL_SPRING_TRANSITION (transition);

  CLUTTER_TRANSITION_CLASS (shell_spring_transition_parent_class)->detached (transition, animatable);
  self->pspec = NULL;
}

static double
elapsed_seconds (ShellSpringTransition *self)
{
  return clutter_timeline_get_elapsed_time (CLUTTER_TIMELINE (self)) / 1000.0;
}

static void
shell_spring_transition_compute_value (ClutterTransition *transition,
                                       ClutterAnimatable *animatable,
                                       ClutterInterval   *interval,
                                       double             progress)
{
  ShellSpringTransition *self = SHELL_SPRING_TRANSITION (transition);
  double x, v;

  if (!self->pspec)
    return;

  if (progress >= 1.0)
    {
      set_property_value (self, animatable, self->target);
      return;
    }
  spring_state (&self->spring, elapsed_seconds (self), &x, &v);
  set_property_value (self, animatable, self->target + x);
}

static void
shell_spring_transition_set_property (GObject      *object,
                                      guint         prop_id,
                                      const GValue *value,
                                      GParamSpec   *pspec)
{
  ShellSpringTransition *self = SHELL_SPRING_TRANSITION (object);

  switch (prop_id)
    {
    case PROP_TARGET:
      self->target = g_value_get_double (value);
      break;
    case PROP_RESPONSE:
      self->response = g_value_get_double (value);
      break;
    case PROP_BOUNCE:
      self->bounce = g_value_get_double (value);
      break;
    case PROP_VELOCITY:
      self->velocity = g_value_get_double (value);
      break;
    case PROP_EPSILON:
      self->epsilon = g_value_get_double (value);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    }
}

static void
shell_spring_transition_get_property (GObject    *object,
                                      guint       prop_id,
                                      GValue     *value,
                                      GParamSpec *pspec)
{
  ShellSpringTransition *self = SHELL_SPRING_TRANSITION (object);

  switch (prop_id)
    {
    case PROP_TARGET:
      g_value_set_double (value, self->target);
      break;
    case PROP_RESPONSE:
      g_value_set_double (value, self->response);
      break;
    case PROP_BOUNCE:
      g_value_set_double (value, self->bounce);
      break;
    case PROP_VELOCITY:
      g_value_set_double (value, self->velocity);
      break;
    case PROP_EPSILON:
      g_value_set_double (value, self->epsilon);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    }
}

static void
shell_spring_transition_class_init (ShellSpringTransitionClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);
  ClutterTransitionClass *transition_class = CLUTTER_TRANSITION_CLASS (klass);

  object_class->set_property = shell_spring_transition_set_property;
  object_class->get_property = shell_spring_transition_get_property;
  transition_class->attached = shell_spring_transition_attached;
  transition_class->detached = shell_spring_transition_detached;
  transition_class->compute_value = shell_spring_transition_compute_value;

  /**
   * ShellSpringTransition:target:
   *
   * The value the spring comes to rest at.
   */
  props[PROP_TARGET] =
    g_param_spec_double ("target", NULL, NULL,
                         -G_MAXDOUBLE, G_MAXDOUBLE, 0.0,
                         G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY | G_PARAM_STATIC_STRINGS);

  /**
   * ShellSpringTransition:response:
   *
   * The perceptual duration of the spring in milliseconds: how long it
   * takes to come visually close to its target from rest.
   */
  props[PROP_RESPONSE] =
    g_param_spec_double ("response", NULL, NULL,
                         1.0, G_MAXDOUBLE, 250.0,
                         G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY | G_PARAM_STATIC_STRINGS);

  /**
   * ShellSpringTransition:bounce:
   *
   * 0 is critically damped, positive values overshoot, negative values
   * approach the target more slowly than a critically damped spring.
   */
  props[PROP_BOUNCE] =
    g_param_spec_double ("bounce", NULL, NULL,
                         -0.99, 0.99, 0.0,
                         G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY | G_PARAM_STATIC_STRINGS);

  /**
   * ShellSpringTransition:velocity:
   *
   * The velocity the property starts with, in its units per second.
   */
  props[PROP_VELOCITY] =
    g_param_spec_double ("velocity", NULL, NULL,
                         -G_MAXDOUBLE, G_MAXDOUBLE, 0.0,
                         G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY | G_PARAM_STATIC_STRINGS);

  /**
   * ShellSpringTransition:epsilon:
   *
   * The distance from the target, in the property's units, at which the
   * spring counts as resting. 0 picks half a device pixel for positions,
   * sizes and scales, and half a step for opacity.
   */
  props[PROP_EPSILON] =
    g_param_spec_double ("epsilon", NULL, NULL,
                         0.0, G_MAXDOUBLE, 0.0,
                         G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS);

  g_object_class_install_properties (object_class, N_PROPS, props);
}

static void
shell_spring_transition_init (ShellSpringTransition *self)
{
  self->response = 250.0;
}

/**
 * shell_spring_transition_new:
 * @property_name: the property to animate
 * @target: the value to come to rest at
 * @duration: the perceptual duration in milliseconds
 * @bounce: 0 for no overshoot, up to 1 for more
 * @velocity: the starting velocity in the property's units per second
 *
 * Creates a transition that moves @property_name from its current value
 * to @target on a damped spring. The position comes from the closed-form
 * solution at each frame's time, and the transition ends once the
 * property is within half a device pixel of @target and moving less than
 * a pixel per frame.
 *
 * Returns: (transfer full): the new transition
 */
ClutterTransition *
shell_spring_transition_new (const char *property_name,
                             double      target,
                             double      duration,
                             double      bounce,
                             double      velocity)
{
  return g_object_new (SHELL_TYPE_SPRING_TRANSITION,
                       "property-name", property_name,
                       "target", target,
                       "response", duration,
                       "bounce", bounce,
                       "velocity", velocity,
                       "remove-on-complete", TRUE,
                       NULL);
}

/**
 * shell_spring_transition_get_target:
 * @self: a #ShellSpringTransition
 *
 * Returns: the value the spring comes to rest at
 */
double
shell_spring_transition_get_target (ShellSpringTransition *self)
{
  g_return_val_if_fail (SHELL_IS_SPRING_TRANSITION (self), 0.0);

  return self->target;
}

/**
 * shell_spring_transition_get_velocity:
 * @self: a #ShellSpringTransition
 *
 * Returns the property's velocity at the transition's current time, so
 * that an animation replacing this one can carry on at the same speed.
 *
 * Returns: the velocity in the property's units per second
 */
double
shell_spring_transition_get_velocity (ShellSpringTransition *self)
{
  double x, v;

  g_return_val_if_fail (SHELL_IS_SPRING_TRANSITION (self), 0.0);

  if (!self->pspec || clutter_timeline_get_progress (CLUTTER_TIMELINE (self)) >= 1.0)
    return self->pspec ? 0.0 : self->velocity;
  spring_state (&self->spring, elapsed_seconds (self), &x, &v);
  return v;
}
