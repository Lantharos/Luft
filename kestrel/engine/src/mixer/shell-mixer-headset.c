/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-mixer-private.h"

void
_shell_mixer_track_headset (ShellMixer     *mixer,
                            ShellMixerCard *card)
{
  ShellMixerHeadsetPorts ports;
  gboolean plugged;
  gboolean known;

  _shell_mixer_card_headset_ports (card, &ports);
  if (!ports.headphones || (!ports.headset_mic && !ports.headphone_mic))
    return;

  plugged = ports.headphones->available != PA_PORT_AVAILABLE_NO;
  known = mixer->headset_card == card->index;

  mixer->headset_card = card->index;
  _shell_mixer_headset_clear (&mixer->headset);
  mixer->headset = (ShellMixerHeadsetNames) {
    .headphones = g_strdup (ports.headphones->name),
    .headset_mic = ports.headset_mic ? g_strdup (ports.headset_mic->name) : NULL,
    .headphone_mic = ports.headphone_mic ? g_strdup (ports.headphone_mic->name) : NULL,
    .internal_mic = ports.internal_mic ? g_strdup (ports.internal_mic->name) : NULL,
    .speaker = ports.speaker ? g_strdup (ports.speaker->name) : NULL,
  };

  if (known && plugged != mixer->headset_plugged)
    {
      ShellMixerHeadset choices = 0;

      if (plugged)
        {
          choices = SHELL_MIXER_HEADSET_HEADPHONES;
          if (ports.headset_mic)
            choices |= SHELL_MIXER_HEADSET_HEADSET;
          if (ports.headphone_mic)
            choices |= SHELL_MIXER_HEADSET_MICROPHONE;
        }
      g_signal_emit_by_name (mixer, "headset-changed", choices);
    }

  mixer->headset_plugged = plugged;
}

static void
select_headset_port (ShellMixer *mixer,
                     gboolean    output,
                     const char *port)
{
  ShellMixerStream *stream;

  if (!port)
    return;

  stream = _shell_mixer_stream_with_port (_shell_mixer_streams_for (mixer, output), mixer->headset_card, port);
  if (stream)
    _shell_mixer_select_port (mixer, output, stream, port);
}

void
shell_mixer_choose_headset (ShellMixer        *mixer,
                            ShellMixerHeadset  choice)
{
  g_return_if_fail (SHELL_IS_MIXER (mixer));

  switch (choice)
    {
    case SHELL_MIXER_HEADSET_HEADPHONES:
      select_headset_port (mixer, TRUE, mixer->headset.headphones);
      select_headset_port (mixer, FALSE, mixer->headset.internal_mic);
      break;
    case SHELL_MIXER_HEADSET_HEADSET:
      select_headset_port (mixer, TRUE, mixer->headset.headphones);
      select_headset_port (mixer, FALSE, mixer->headset.headset_mic);
      break;
    case SHELL_MIXER_HEADSET_MICROPHONE:
      select_headset_port (mixer, TRUE, mixer->headset.speaker);
      select_headset_port (mixer, FALSE, mixer->headset.headphone_mic);
      break;
    default:
      g_return_if_reached ();
    }
}
