---
title: On-device models
description: The session services that recognize speech, read handwriting and write notes on the computer, and the rules they share.
sidebar:
  order: 12
---

Dictation, transcription, handwriting and note writing run on the computer, each in a session service of its own, and send nothing anywhere. Apps reach them over D-Bus through the client crates in `packages/system`, such as `luft-handwriting` and `luft-language`.

## What they share

- The session bus starts a service on the first call, and it exits after half a minute with nothing to do. A model loads with the first request and unloads three minutes after the last. Each unit caps the service's memory and gives it no swap.
- Models download only when asked, through the service's `Models` interface, into `~/.local/share/<service>/models`. Each service lists its files with sizes and SHA-256 in `data/models.json`; downloads resume and are checked before use, with the shared code in `packages/system/models`.
- Background work runs at the idle scheduling class and the lowest processor and disk priority, on at most half the cores and four threads. On a battery below 30% that isn't charging, background requests answer `Error.Paused` and the app tries again later.

## Speech

`luft-speech` owns `com.lantharos.Speech1`. Only the owner of Kestrel's bus name may call `Start`, `Stop` and `Cancel`, and the microphone is open only between `Start` and `Stop`, with the audio kept in memory.

| Engine | Runs on | Languages |
| --- | --- | --- |
| Parakeet TDT 0.6B v3, encoder quantized to 4 bits | The processor, through ONNX Runtime | 25 European languages |
| Whisper large-v3-turbo, Q5_0 | The graphics card through whisper.cpp and Vulkan, or the processor | The rest |

whisper.cpp needs AVX2, so languages that need Whisper are refused on processors without it. Silero VAD splits speech into stretches that end at a 0.6-second pause, or at the quietest moment once a stretch reaches 25 seconds. A finished stretch is typed at once; the one still being spoken shows as a preview, recognized again as it grows but for at most half the time.

Whisper is always given a full 30-second window with the silence trimmed, since the turbo model invents words when shown less or shown silence. When Parakeet falls silent well before the end of a stretch, what follows its last word is recognized again on its own. For languages written in Cyrillic and Latin, the keyboard layout in use picks the script, and the system language decides when the layout says nothing.

## Transcribing recordings

`luft-speech --transcription` runs as `luft-transcription.service` and owns `com.lantharos.Transcription1`, kept apart from dictation, which has to answer at once. Heft uses it for recorded classes.

`Transcribe` takes an open Ogg Opus file, where to start, whether the recording has ended and the languages to choose from, such as `sq`, `de`, `sr-Latn` and `en`. It transcribes about two minutes and answers with each piece's start, end, language and text, and where to go on from. It never opens a file by name. Speech running into the end of a recording still being made waits for the next request.

Whisper picks the language of each stretch among those named, counting Croatian and Bosnian as Serbian, which it confuses. A stretch under a second, or one it isn't sure of, keeps the language before it. Albanian comes out badly: Whisper takes most of it for English, and even when told the language it gets most words wrong.

## Handwriting

`luft-handwriting` owns `com.lantharos.Handwriting1`. `Recognize` takes one line as strokes of points in any unit, draws them 64 pixels tall and has Qwen3-VL 2B read the picture through llama.cpp with Vulkan, on a graphics card when there is one. `RecognizeNow` is for a line someone is waiting for: it runs at normal priority, goes ahead of background lines that haven't started, and doesn't wait for the charger.

The service doesn't guess a line's language, since a wrong guess hurts far more than a right one helps. Albanian reads worst, with ë often read as ä, ö or i.

## Writing notes

`luft-language` owns `com.lantharos.Language1` and runs Qwen3 4B Instruct 2507 through llama.cpp with Vulkan.

- `Notes` takes part of a class as lines of transcript with their times, and the language to write in. It answers with key points, definitions, homework and tests with due dates, and questions with their answers, each naming the line it came from.
- `Heading` takes a whole class's key points and answers with a title and a short summary.

Heft sends a class in parts of at most twelve minutes and 120 lines. Answers are held to a llama.cpp grammar for a fixed JSON shape, and what an app sends is read as plain text between the service's own message markers, so a transcript can't speak for the model.
