#include "config.h"

#include <meta/display.h>
#include <meta/window.h>

#include "shell-global.h"
#include "shell-modifier-chord.h"

#define HELD_ELSEWHERE (CLUTTER_SHIFT_MASK | CLUTTER_CONTROL_MASK | CLUTTER_MOD1_MASK | \
                        CLUTTER_SUPER_MASK | CLUTTER_MOD4_MASK)

/**
 * ShellModifierChord:
 *
 * Modifier keys pressed together with nothing else, such as Super and Alt.
 * It's activated once all of them are down, in any order and on either side
 * of the keyboard, and released when one of them comes up. Any other key,
 * button or scroll while they're held spoils it until every one is let go,
 * so shortcuts that start with the same modifiers keep working.
 */
struct _ShellModifierChord
{
  GObject parent;

  ClutterModifierType modifiers;
  unsigned int keys;
  gboolean spoiled;
  gboolean active;
  unsigned int filter;
};

typedef struct
{
  unsigned int keyval;
  int key;
} ModifierKey;

static const ModifierKey modifier_keys[] = {
  { CLUTTER_KEY_Shift_L, 0 },
  { CLUTTER_KEY_Shift_R, 1 },
  { CLUTTER_KEY_Control_L, 2 },
  { CLUTTER_KEY_Control_R, 3 },
  { CLUTTER_KEY_Alt_L, 4 },
  { CLUTTER_KEY_Meta_L, 4 },
  { CLUTTER_KEY_Alt_R, 5 },
  { CLUTTER_KEY_Meta_R, 5 },
  { CLUTTER_KEY_ISO_Level3_Shift, 5 },
  { CLUTTER_KEY_Super_L, 6 },
  { CLUTTER_KEY_Super_R, 7 },
};

static const ClutterModifierType key_modifiers[] = {
  CLUTTER_SHIFT_MASK, CLUTTER_SHIFT_MASK,
  CLUTTER_CONTROL_MASK, CLUTTER_CONTROL_MASK,
  CLUTTER_MOD1_MASK, CLUTTER_MOD1_MASK,
  CLUTTER_SUPER_MASK, CLUTTER_SUPER_MASK,
};

static const ClutterModifierType key_states[] = {
  CLUTTER_SHIFT_MASK, CLUTTER_SHIFT_MASK,
  CLUTTER_CONTROL_MASK, CLUTTER_CONTROL_MASK,
  CLUTTER_MOD1_MASK | CLUTTER_MOD5_MASK, CLUTTER_MOD1_MASK | CLUTTER_MOD5_MASK,
  CLUTTER_SUPER_MASK | CLUTTER_MOD4_MASK, CLUTTER_SUPER_MASK | CLUTTER_MOD4_MASK,
};

enum
{
  PROP_0,
  PROP_MODIFIERS,
  N_PROPS
};

enum
{
  ACTIVATED,
  RELEASED,
  CANCELLED,
  N_SIGNALS
};

static GParamSpec *props[N_PROPS] = { NULL, };
static unsigned int signals[N_SIGNALS] = { 0, };

G_DEFINE_FINAL_TYPE (ShellModifierChord, shell_modifier_chord, G_TYPE_OBJECT)

static int
key_for (unsigned int keyval)
{
  for (size_t i = 0; i < G_N_ELEMENTS (modifier_keys); i++)
    {
      if (modifier_keys[i].keyval == keyval)
        return modifier_keys[i].key;
    }
  return -1;
}

static ClutterModifierType
held (ShellModifierChord *self)
{
  ClutterModifierType modifiers = 0;

  for (size_t key = 0; key < G_N_ELEMENTS (key_modifiers); key++)
    {
      if (self->keys & (1u << key))
        modifiers |= key_modifiers[key];
    }
  return modifiers;
}

static void
forget_released_keys (ShellModifierChord *self,
                      const ClutterEvent *event,
                      int                 current)
{
  ClutterModifierType state = clutter_event_get_state (event);

  for (size_t key = 0; key < G_N_ELEMENTS (key_states); key++)
    {
      if ((int) key != current && !(state & key_states[key]))
        self->keys &= ~(1u << key);
    }
}

static void
spoil (ShellModifierChord *self)
{
  self->spoiled = TRUE;
  if (!self->active)
    return;
  self->active = FALSE;
  g_signal_emit (self, signals[CANCELLED], 0);
}

static gboolean
shortcuts_inhibited (const ClutterEvent *event)
{
  MetaDisplay *display = shell_global_get_display (shell_global_get ());
  MetaWindow *focus = meta_display_get_focus_window (display);

  return focus && meta_window_shortcuts_inhibited (focus, clutter_event_get_source_device (event));
}

static void
pressed (ShellModifierChord *self,
         const ClutterEvent *event,
         int                 key)
{
  if (key < 0)
    {
      if (self->keys)
        spoil (self);
      return;
    }

  if (!self->keys)
    self->spoiled = (clutter_event_get_state (event) & HELD_ELSEWHERE) != 0;
  self->keys |= 1u << key;

  if (held (self) & ~self->modifiers)
    spoil (self);
  else if (held (self) == self->modifiers && !self->spoiled && !self->active)
    {
      if (shortcuts_inhibited (event))
        {
          self->spoiled = TRUE;
          return;
        }
      self->active = TRUE;
      g_signal_emit (self, signals[ACTIVATED], 0);
    }
}

static void
released (ShellModifierChord *self,
          int                 key)
{
  if (key < 0)
    return;

  self->keys &= ~(1u << key);
  if (!self->keys)
    self->spoiled = FALSE;
  if (!self->active)
    return;
  self->active = FALSE;
  g_signal_emit (self, signals[RELEASED], 0);
}

static gboolean
filter_event (const ClutterEvent *event,
              ClutterActor       *event_actor,
              gpointer            user_data)
{
  ShellModifierChord *self = user_data;
  ClutterEventType type = clutter_event_type (event);
  int key;

  switch (type)
    {
    case CLUTTER_KEY_PRESS:
    case CLUTTER_KEY_RELEASE:
      if (clutter_event_get_flags (event) & CLUTTER_EVENT_FLAG_REPEATED)
        break;
      key = key_for (clutter_event_get_key_symbol (event));
      forget_released_keys (self, event, key);
      if (type == CLUTTER_KEY_PRESS)
        pressed (self, event, key);
      else
        released (self, key);
      break;
    case CLUTTER_BUTTON_PRESS:
    case CLUTTER_SCROLL:
    case CLUTTER_TOUCH_BEGIN:
      if (self->keys)
        spoil (self);
      break;
    default:
      break;
    }

  return CLUTTER_EVENT_PROPAGATE;
}

static void
stop_listening (ShellModifierChord *self)
{
  if (self->active)
    {
      self->active = FALSE;
      g_signal_emit (self, signals[CANCELLED], 0);
    }
  g_clear_handle_id (&self->filter, clutter_event_remove_filter);
  self->keys = 0;
  self->spoiled = FALSE;
}

ClutterModifierType
shell_modifier_chord_get_modifiers (ShellModifierChord *self)
{
  g_return_val_if_fail (SHELL_IS_MODIFIER_CHORD (self), 0);

  return self->modifiers;
}

void
shell_modifier_chord_set_modifiers (ShellModifierChord  *self,
                                    ClutterModifierType  modifiers)
{
  g_return_if_fail (SHELL_IS_MODIFIER_CHORD (self));

  modifiers &= CLUTTER_SHIFT_MASK | CLUTTER_CONTROL_MASK | CLUTTER_MOD1_MASK | CLUTTER_SUPER_MASK;
  if (self->modifiers == modifiers)
    return;

  stop_listening (self);
  self->modifiers = modifiers;
  if (modifiers)
    self->filter = clutter_event_prepend_filter (NULL, filter_event, NULL, self);
  g_object_notify_by_pspec (G_OBJECT (self), props[PROP_MODIFIERS]);
}

static void
shell_modifier_chord_dispose (GObject *object)
{
  stop_listening (SHELL_MODIFIER_CHORD (object));

  G_OBJECT_CLASS (shell_modifier_chord_parent_class)->dispose (object);
}

static void
shell_modifier_chord_set_property (GObject      *object,
                                   guint         prop_id,
                                   const GValue *value,
                                   GParamSpec   *pspec)
{
  ShellModifierChord *self = SHELL_MODIFIER_CHORD (object);

  switch (prop_id)
    {
    case PROP_MODIFIERS:
      shell_modifier_chord_set_modifiers (self, g_value_get_flags (value));
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
    }
}

static void
shell_modifier_chord_get_property (GObject    *object,
                                   guint       prop_id,
                                   GValue     *value,
                                   GParamSpec *pspec)
{
  ShellModifierChord *self = SHELL_MODIFIER_CHORD (object);

  switch (prop_id)
    {
    case PROP_MODIFIERS:
      g_value_set_flags (value, self->modifiers);
      break;
    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
      break;
    }
}

static void
shell_modifier_chord_class_init (ShellModifierChordClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->dispose = shell_modifier_chord_dispose;
  object_class->set_property = shell_modifier_chord_set_property;
  object_class->get_property = shell_modifier_chord_get_property;

  props[PROP_MODIFIERS] =
    g_param_spec_flags ("modifiers", NULL, NULL,
                        CLUTTER_TYPE_MODIFIER_TYPE,
                        0,
                        G_PARAM_READWRITE | G_PARAM_EXPLICIT_NOTIFY | G_PARAM_STATIC_STRINGS);
  g_object_class_install_properties (object_class, N_PROPS, props);

  signals[ACTIVATED] = g_signal_new ("activated", G_TYPE_FROM_CLASS (klass),
                                     G_SIGNAL_RUN_LAST, 0, NULL, NULL, NULL,
                                     G_TYPE_NONE, 0);
  signals[RELEASED] = g_signal_new ("released", G_TYPE_FROM_CLASS (klass),
                                    G_SIGNAL_RUN_LAST, 0, NULL, NULL, NULL,
                                    G_TYPE_NONE, 0);
  signals[CANCELLED] = g_signal_new ("cancelled", G_TYPE_FROM_CLASS (klass),
                                     G_SIGNAL_RUN_LAST, 0, NULL, NULL, NULL,
                                     G_TYPE_NONE, 0);
}

static void
shell_modifier_chord_init (ShellModifierChord *self)
{
}
