# Language model

`luft-language` ([services/language](../../services/language)) is a session service that runs a language model on the computer for apps that ask it to write. Heft uses it to make notes of a recorded class from its transcript, through the [luft-language crate](../../packages/system/language).

## The service

It owns `com.lantharos.Language1` (see `packages/dbus/introspection/luft-language-service`). The session bus starts it when it's needed, and it exits after half a minute with nothing to do. The model loads on the first request and unloads three minutes after the last one.

- `Notes` takes part of a class, its lines of transcript each with when it was said, and the language to write in, and answers with the notes of that part: key points, definitions, homework and tests with when they're due, and questions asked with the answers given. Each item names the line it came from, so it carries when it was said. Greetings, attendance, telling students off, jokes, small talk and anything off topic are left out. The answer is held to a JSON grammar while it's written, so it always reads.
- `Heading` takes the key points of a whole class and answers with a title and a two or three sentence summary.

Heft sends a class in parts of about twelve minutes, at most 120 lines, so a request stays small enough for any computer and the work can stop between parts and go on later.

Writing is background work. `luft-language.service` runs the service at the idle scheduling class and lowest priority for processor and disk, with half the processor's cores and at most four threads, and caps it at 5 GB of memory. While the computer runs on a battery below 30% that isn't charging, both methods answer `Error.Paused`, the same rule as handwriting and transcription.

| Model | Download | Licence |
| --- | --- | --- |
| Qwen3 4B Instruct 2507, Q4_K_M | 2.5 GB | Apache 2.0 |

Qwen3 was trained on 119 languages, Serbian, Croatian, Bosnian, Albanian and German among them, and the 2507 Instruct version answers without a thinking step first. It runs through llama.cpp, built into the service by the `llama-cpp-2` crate with Vulkan, on the graphics card when there is one and on the processor otherwise.

Answers are written to match a llama.cpp grammar, JSON in a fixed shape, so whatever the model writes can be read. Each token is sampled first and only that one is checked against the grammar, which is much quicker than checking every token in the vocabulary; only when it doesn't fit is the whole vocabulary narrowed by the grammar. What an app sends is read as plain text: only the marks the service puts between the messages count as the model's own.

## Models

The model lives in `~/.local/share/luft-language/models` and downloads only when asked, through `Install` on `com.lantharos.Language1.Models`; Heft asks when someone chooses to make notes of a recording, and `Remove` deletes it again. `services/language/data/models.json` lists the file with its size and SHA-256, and downloads go through the same code as dictation and handwriting (`packages/system/models`). `.github/workflows/models.yml` mirrors it to `get.luft.computer/models`.
