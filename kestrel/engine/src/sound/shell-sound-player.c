/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-sound-player.h"
#include "shell-sound-private.h"

#define WARM_SOUND "audio-volume-change"

enum
{
  PLAYED,
  STARTED,
  N_SIGNALS
};

static guint signals[N_SIGNALS];

struct _ShellSoundPlayer
{
  GObject parent;

  GSettings *settings;
  ShellSoundTheme *theme;
  ShellSoundOutput *output;
  GCancellable *cancellable;
  GHashTable *clips;
  GHashTable *pending;
};

G_DEFINE_TYPE (ShellSoundPlayer, shell_sound_player, G_TYPE_OBJECT)

typedef struct
{
  ShellSoundPlayer *player;
  char *name;
} Decoding;

static void
decoding_free (Decoding *decoding)
{
  g_object_unref (decoding->player);
  g_free (decoding->name);
  g_free (decoding);
}

static void
start (ShellSoundPlayer *player,
       ShellSoundClip   *clip)
{
  _shell_sound_output_play (player->output, clip);
  g_signal_emit (player, signals[PLAYED], 0, clip->name);
}

static void
on_theme_sound_decoded (GObject      *source,
                        GAsyncResult *result,
                        gpointer      data)
{
  Decoding *decoding = data;
  ShellSoundPlayer *player = decoding->player;
  g_autoptr (GError) error = NULL;
  g_autoptr (ShellSoundClip) clip = _shell_sound_decode_finish (result, &error);
  gboolean wanted;

  if (g_error_matches (error, G_IO_ERROR, G_IO_ERROR_CANCELLED))
    {
      decoding_free (decoding);
      return;
    }

  wanted = GPOINTER_TO_INT (g_hash_table_lookup (player->pending, decoding->name));
  g_hash_table_remove (player->pending, decoding->name);

  if (!clip)
    g_warning ("Can't play the sound %s: %s", decoding->name, error->message);
  else
    {
      g_hash_table_insert (player->clips, g_strdup (decoding->name), _shell_sound_clip_ref (clip));
      if (wanted)
        start (player, clip);
    }

  decoding_free (decoding);
}

static void
load (ShellSoundPlayer *player,
      const char       *name,
      gboolean          play)
{
  g_autoptr (GFile) file = NULL;
  Decoding *decoding;
  gboolean disabled;

  if (g_hash_table_contains (player->pending, name))
    {
      if (play)
        g_hash_table_insert (player->pending, g_strdup (name), GINT_TO_POINTER (TRUE));
      return;
    }

  file = _shell_sound_theme_lookup (player->theme, name, &disabled);
  if (!file)
    return;

  decoding = g_new0 (Decoding, 1);
  decoding->player = g_object_ref (player);
  decoding->name = g_strdup (name);
  g_hash_table_insert (player->pending, g_strdup (name), GINT_TO_POINTER (play));
  _shell_sound_decode (name, file, player->cancellable, on_theme_sound_decoded, decoding);
}

void
shell_sound_player_play (ShellSoundPlayer *player,
                         const char       *name)
{
  ShellSoundClip *clip = g_hash_table_lookup (player->clips, name);

  if (clip)
    start (player, clip);
  else
    load (player, name, TRUE);
}

static void
on_file_decoded (GObject      *source,
                 GAsyncResult *result,
                 gpointer      data)
{
  ShellSoundPlayer *player = data;
  g_autoptr (GError) error = NULL;
  g_autoptr (ShellSoundClip) clip = _shell_sound_decode_finish (result, &error);

  if (clip)
    start (player, clip);
  else if (!g_error_matches (error, G_IO_ERROR, G_IO_ERROR_CANCELLED))
    g_warning ("Can't play the sound file: %s", error->message);

  g_object_unref (player);
}

void
shell_sound_player_play_file (ShellSoundPlayer *player,
                              GFile            *file)
{
  g_autofree char *name = g_file_get_basename (file);

  _shell_sound_decode (name, file, player->cancellable, on_file_decoded, g_object_ref (player));
}

void
shell_sound_player_play_fd (ShellSoundPlayer *player,
                            int               fd)
{
  _shell_sound_decode_fd ("sound", fd, player->cancellable, on_file_decoded, g_object_ref (player));
}

void
shell_sound_player_prepare (ShellSoundPlayer *player)
{
  _shell_sound_output_connect (player->output);
  load (player, WARM_SOUND, FALSE);
}

guint64
shell_sound_player_get_cached_bytes (ShellSoundPlayer *player)
{
  GHashTableIter iter;
  ShellSoundClip *clip;
  guint64 bytes = 0;

  g_hash_table_iter_init (&iter, player->clips);
  while (g_hash_table_iter_next (&iter, NULL, (gpointer *) &clip))
    bytes += g_bytes_get_size (clip->samples);

  return bytes;
}

static void
on_started (const char *name,
            gint64      latency_us,
            gpointer    user_data)
{
  g_signal_emit (user_data, signals[STARTED], 0, name, latency_us);
}

static void
load_theme (ShellSoundPlayer *player)
{
  g_autofree char *name = g_settings_get_string (player->settings, "theme-name");

  g_cancellable_cancel (player->cancellable);
  g_set_object (&player->cancellable, g_cancellable_new ());
  g_hash_table_remove_all (player->clips);
  g_hash_table_remove_all (player->pending);
  g_clear_pointer (&player->theme, _shell_sound_theme_free);
  player->theme = _shell_sound_theme_new (name);
}

static void
shell_sound_player_init (ShellSoundPlayer *player)
{
  player->clips = g_hash_table_new_full (g_str_hash, g_str_equal, g_free,
                                         (GDestroyNotify) _shell_sound_clip_unref);
  player->pending = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, NULL);
  player->output = _shell_sound_output_new (on_started, player);
  player->settings = g_settings_new ("org.gnome.desktop.sound");
  g_signal_connect_swapped (player->settings, "changed::theme-name", G_CALLBACK (load_theme), player);
  load_theme (player);
}

static void
shell_sound_player_finalize (GObject *object)
{
  ShellSoundPlayer *player = SHELL_SOUND_PLAYER (object);

  g_cancellable_cancel (player->cancellable);
  g_clear_object (&player->cancellable);
  g_clear_object (&player->settings);
  g_clear_pointer (&player->theme, _shell_sound_theme_free);
  g_clear_pointer (&player->clips, g_hash_table_unref);
  g_clear_pointer (&player->pending, g_hash_table_unref);
  g_clear_pointer (&player->output, _shell_sound_output_free);

  G_OBJECT_CLASS (shell_sound_player_parent_class)->finalize (object);
}

static void
shell_sound_player_class_init (ShellSoundPlayerClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->finalize = shell_sound_player_finalize;

  signals[PLAYED] = g_signal_new ("played", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                                  0, NULL, NULL, NULL, G_TYPE_NONE, 1, G_TYPE_STRING);
  signals[STARTED] = g_signal_new ("started", G_TYPE_FROM_CLASS (klass), G_SIGNAL_RUN_LAST,
                                   0, NULL, NULL, NULL, G_TYPE_NONE, 2, G_TYPE_STRING, G_TYPE_INT64);
}

/**
 * shell_sound_player_get_default:
 *
 * Returns: (transfer none): the shell's sound player
 */
ShellSoundPlayer *
shell_sound_player_get_default (void)
{
  static ShellSoundPlayer *player;

  if (!player)
    player = g_object_new (SHELL_TYPE_SOUND_PLAYER, NULL);

  return player;
}
