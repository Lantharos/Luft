/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#define SHELL_SOUND_DECODE_PIPELINE(source, sink) \
  source " ! decodebin ! audioconvert ! audioresample ! " \
  "audio/x-raw,format=S16LE,layout=interleaved,rate=48000,channels=2 ! " sink
