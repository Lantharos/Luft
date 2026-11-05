/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <clutter/clutter.h>
#include <clutter/clutter-pango.h>
#include <linux/input-event-codes.h>

#include "shell-global.h"
#include "shell-key-sounds.h"
#include "shell-sound-private.h"

#define KINDS (SHELL_KEY_SOUND_CLICK + 1)
#define LONGEST_FRAMES SHELL_SOUND_RATE
#define RATE_SPREAD 0.03
#define LEVEL_SPREAD 0.14
#define UNREPEATED (CLUTTER_EVENT_FLAG_REPEATED | CLUTTER_EVENT_FLAG_INPUT_METHOD | \
                    CLUTTER_EVENT_FLAG_SYNTHETIC | CLUTTER_EVENT_FLAG_POINTER_EMULATED)

/**
 * ShellKeySounds:
 *
 * Plays a sound of a #ShellSoundMix for each key press and mouse click,
 * straight from the event as it comes in. Code outside of it hands over
 * sound files and levels and gets nothing back: no press reaches it, so no
 * extension learns what's typed, how much, or when. Here, a press is only
 * ever one of the #ShellKeySound kinds, and nothing plays while it's told to
 * be quiet or the keyboard is in a field whose text is hidden.
 */

typedef struct
{
  GPtrArray *clips[KINDS];
  guint pending;
  char *problem;
} SoundSet;

struct _ShellKeySounds
{
  GObject parent;

  ShellSoundMix *mix;
  ClutterStage *stage;
  GCancellable *cancellable;
  SoundSet *set;
  SoundSet *loading;
  guint last[KINDS];
  float keys;
  float clicks;
  gboolean quiet;
  guint filter;
};

enum
{
  LOADED,
  N_SIGNALS
};

static guint signals[N_SIGNALS];

G_DEFINE_TYPE (ShellKeySounds, shell_key_sounds, G_TYPE_OBJECT)

static SoundSet *
set_new (void)
{
  SoundSet *set = g_new0 (SoundSet, 1);

  for (guint kind = 0; kind < KINDS; kind++)
    set->clips[kind] = g_ptr_array_new ();
  return set;
}

static void
set_clips_free (SoundSet *set)
{
  for (guint kind = 0; kind < KINDS; kind++)
    g_ptr_array_unref (set->clips[kind]);
  g_free (set->problem);
  g_free (set);
}

static void
set_free (SoundSet *set)
{
  for (guint kind = 0; kind < KINDS; kind++)
    g_ptr_array_foreach (set->clips[kind], (GFunc) _shell_sound_clip_unref, NULL);
  set_clips_free (set);
}

static void
retire_set (ShellKeySounds *sounds,
            SoundSet       *set)
{
  ShellSoundStrikes *strikes = _shell_sound_mix_strikes (sounds->mix);

  if (!strikes)
    {
      set_free (set);
      return;
    }

  for (guint kind = 0; kind < KINDS; kind++)
    for (guint i = 0; i < set->clips[kind]->len; i++)
      _shell_sound_strikes_retire (strikes, g_ptr_array_index (set->clips[kind], i));
  set_clips_free (set);
}

static void
strike (ShellKeySounds *sounds,
        ShellKeySound   kind,
        double          level,
        gint64          pressed_us)
{
  ShellSoundStrikes *strikes = _shell_sound_mix_strikes (sounds->mix);
  GPtrArray *clips = sounds->set ? sounds->set->clips[kind] : NULL;
  guint index = 0;

  if (!strikes || !clips || !clips->len)
    return;

  if (clips->len > 1)
    {
      index = g_random_int_range (0, clips->len - 1);
      index += index >= sounds->last[kind];
      sounds->last[kind] = index;
    }

  _shell_sound_strikes_play (strikes, g_ptr_array_index (clips, index),
                             level * (1.0 + g_random_double_range (-LEVEL_SPREAD, LEVEL_SPREAD)),
                             1.0 + g_random_double_range (-RATE_SPREAD, RATE_SPREAD),
                             pressed_us);
}

static gboolean
kind_of_key (guint          code,
             ShellKeySound *kind)
{
  switch (code)
    {
    case KEY_SPACE:
      *kind = SHELL_KEY_SOUND_SPACE;
      return TRUE;
    case KEY_ENTER:
    case KEY_KPENTER:
      *kind = SHELL_KEY_SOUND_ENTER;
      return TRUE;
    case KEY_BACKSPACE:
      *kind = SHELL_KEY_SOUND_BACKSPACE;
      return TRUE;
    case KEY_MUTE:
    case KEY_VOLUMEDOWN:
    case KEY_VOLUMEUP:
    case KEY_POWER:
      return FALSE;
    default:
      *kind = SHELL_KEY_SOUND_KEY;
      return code <= KEY_COMPOSE;
    }
}

static gboolean
typing_is_hidden (ShellKeySounds *sounds)
{
  ClutterActor *focus = clutter_stage_get_key_focus (sounds->stage);

  return CLUTTER_IS_TEXT (focus) && clutter_text_get_password_char (CLUTTER_TEXT (focus)) != 0;
}

static gboolean
filter_event (const ClutterEvent *event,
              ClutterActor       *event_actor,
              gpointer            data)
{
  ShellKeySounds *sounds = data;
  ShellKeySound kind;
  float level;

  switch (clutter_event_type (event))
    {
    case CLUTTER_KEY_PRESS:
      if (!kind_of_key (clutter_event_get_event_code (event), &kind))
        return CLUTTER_EVENT_PROPAGATE;
      level = sounds->keys;
      break;
    case CLUTTER_BUTTON_PRESS:
      kind = SHELL_KEY_SOUND_CLICK;
      level = sounds->clicks;
      break;
    default:
      return CLUTTER_EVENT_PROPAGATE;
    }

  if (level > 0.0f && !(clutter_event_get_flags (event) & UNREPEATED) &&
      !sounds->quiet && !typing_is_hidden (sounds))
    strike (sounds, kind, level, clutter_event_get_time_us (event));
  return CLUTTER_EVENT_PROPAGATE;
}

static void
sync_filter (ShellKeySounds *sounds)
{
  gboolean wanted = sounds->set && (sounds->keys > 0.0f || sounds->clicks > 0.0f);

  if (wanted && !sounds->filter)
    sounds->filter = clutter_event_prepend_filter (NULL, filter_event, NULL, sounds);
  else if (!wanted)
    g_clear_handle_id (&sounds->filter, clutter_event_remove_filter);
}

static void
finish_set (ShellKeySounds *sounds,
            SoundSet       *set)
{
  g_autofree char *problem = g_steal_pointer (&set->problem);

  if (set != sounds->loading)
    {
      set_free (set);
      return;
    }

  sounds->loading = NULL;
  if (problem)
    {
      set_free (set);
    }
  else
    {
      if (sounds->set)
        retire_set (sounds, sounds->set);
      sounds->set = set;
      sync_filter (sounds);
    }
  g_signal_emit (sounds, signals[LOADED], 0, problem);
}

typedef struct
{
  ShellKeySounds *sounds;
  SoundSet *set;
  ShellKeySound kind;
  char *name;
} Decoding;

static void
on_decoded (GObject      *source,
            GAsyncResult *result,
            gpointer      data)
{
  Decoding *decoding = data;
  SoundSet *set = decoding->set;
  g_autoptr (GError) error = NULL;
  ShellSoundClip *clip = _shell_sound_decode_finish (result, &error);

  if (clip)
    g_ptr_array_add (set->clips[decoding->kind], clip);
  else if (!set->problem)
    set->problem = g_strdup (decoding->name);

  if (--set->pending == 0)
    finish_set (decoding->sounds, set);

  g_object_unref (decoding->sounds);
  g_free (decoding->name);
  g_free (decoding);
}

/**
 * shell_key_sounds_new:
 * @mix: the mix to play through
 *
 * Returns: (transfer full): new key sounds, silent until they're loaded
 */
ShellKeySounds *
shell_key_sounds_new (ShellSoundMix *mix)
{
  ShellKeySounds *sounds = g_object_new (SHELL_TYPE_KEY_SOUNDS, NULL);

  sounds->mix = g_object_ref (mix);
  return sounds;
}

/**
 * shell_key_sounds_load:
 * @sounds: the key sounds
 * @kinds: (array length=n_files): the #ShellKeySound each file is for
 * @files: (array length=n_files): sound files of up to a second
 * @n_files: how many files there are
 *
 * Decodes a whole set ahead and switches to it once it's ready, replacing
 * any set still on its way. A kind with several files plays one at random.
 * #ShellKeySounds::loaded tells how it went.
 */
void
shell_key_sounds_load (ShellKeySounds *sounds,
                       const int      *kinds,
                       GFile         **files,
                       guint           n_files)
{
  ShellSoundStrikes *strikes = _shell_sound_mix_strikes (sounds->mix);
  SoundSet *set = set_new ();

  g_return_if_fail (n_files > 0);

  if (strikes)
    _shell_sound_strikes_connect (strikes);

  g_cancellable_cancel (sounds->cancellable);
  g_clear_object (&sounds->cancellable);
  sounds->cancellable = g_cancellable_new ();
  sounds->loading = set;
  set->pending = n_files;

  for (guint i = 0; i < n_files; i++)
    {
      Decoding *decoding = g_new0 (Decoding, 1);

      decoding->sounds = g_object_ref (sounds);
      decoding->set = set;
      decoding->kind = kinds[i];
      decoding->name = g_file_get_basename (files[i]);
      _shell_sound_decode (decoding->name, files[i], LONGEST_FRAMES, sounds->cancellable, on_decoded, decoding);
    }
}

/**
 * shell_key_sounds_set_levels:
 * @sounds: the key sounds
 * @keys: 0 to 1 for key presses, where 0 leaves them alone entirely
 * @clicks: 0 to 1 for mouse clicks, likewise
 */
void
shell_key_sounds_set_levels (ShellKeySounds *sounds,
                             double          keys,
                             double          clicks)
{
  sounds->keys = keys * keys * keys;
  sounds->clicks = clicks * clicks * clicks;
  sync_filter (sounds);
}

/**
 * shell_key_sounds_set_quiet:
 * @sounds: the key sounds
 * @quiet: whether nothing may play, whatever is pressed
 */
void
shell_key_sounds_set_quiet (ShellKeySounds *sounds,
                            gboolean        quiet)
{
  sounds->quiet = quiet;
}

/**
 * shell_key_sounds_preview:
 * @sounds: the key sounds
 * @kind: which sound
 * @level: 0 to 1
 *
 * Plays one sound of a kind as a press would, unless it has to be quiet.
 */
void
shell_key_sounds_preview (ShellKeySounds *sounds,
                          ShellKeySound   kind,
                          double          level)
{
  if (!sounds->quiet)
    strike (sounds, kind, level * level * level, g_get_monotonic_time ());
}

/**
 * shell_key_sounds_get_latest_latency:
 * @sounds: the key sounds
 *
 * Returns: microseconds from the latest press to its sound leaving the
 *   computer, as far as the sound server can tell
 */
gint64
shell_key_sounds_get_latest_latency (ShellKeySounds *sounds)
{
  ShellSoundStrikes *strikes = _shell_sound_mix_strikes (sounds->mix);

  return strikes ? _shell_sound_strikes_latest_us (strikes) : 0;
}

/**
 * shell_key_sounds_close:
 * @sounds: the key sounds
 *
 * Stops listening and lets go of the sounds.
 */
void
shell_key_sounds_close (ShellKeySounds *sounds)
{
  g_clear_handle_id (&sounds->filter, clutter_event_remove_filter);
  g_cancellable_cancel (sounds->cancellable);
  sounds->loading = NULL;
  if (sounds->set)
    retire_set (sounds, g_steal_pointer (&sounds->set));
}

static void
shell_key_sounds_finalize (GObject *object)
{
  ShellKeySounds *sounds = SHELL_KEY_SOUNDS (object);

  shell_key_sounds_close (sounds);
  g_clear_object (&sounds->cancellable);
  g_clear_object (&sounds->mix);

  G_OBJECT_CLASS (shell_key_sounds_parent_class)->finalize (object);
}

static void
shell_key_sounds_init (ShellKeySounds *sounds)
{
  sounds->cancellable = g_cancellable_new ();
  sounds->stage = shell_global_get_stage (shell_global_get ());
}

static void
shell_key_sounds_class_init (ShellKeySoundsClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->finalize = shell_key_sounds_finalize;

  /**
   * ShellKeySounds::loaded:
   * @sounds: the key sounds
   * @problem: (nullable): the name of a file that can't be played
   *
   * A set finished loading. Without a problem, it's what plays now;
   * otherwise the set before it stays.
   */
  signals[LOADED] = g_signal_new ("loaded", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                                  0, NULL, NULL, NULL, G_TYPE_NONE, 1, G_TYPE_STRING);
}
