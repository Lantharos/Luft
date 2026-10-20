---
title: Translating Luft
description: How to translate Luft's desktop and apps into your language.
sidebar:
  order: 5
---

Luft speaks English, German, Albanian, Croatian, Serbian in Cyrillic and in Latin script, and Bosnian. Translating it into one of these, or into a new language, needs no programming: everything goes through [Weblate](https://hosted.weblate.org/projects/luft/) in the browser.

## Getting started

1. Sign in to Hosted Weblate and open the Luft project.
2. Pick a component, such as **kestrel-surfaces** for Start and quick settings or **settings-devices** for those pages of Settings, and your language. If your language isn't listed yet, **Start new translation** adds it.
3. Translate string by string. Weblate shows each string's context, the agreed term for every word in the glossary, and checks for things like a missing variable.

Weblate turns the work into pull requests on GitHub, and translations reach the nightly builds once they're merged.

## Before you translate

- Read your language's style guide in [`docs/translations`](https://github.com/Lantharos/Luft/tree/main/docs/translations). It says how Luft addresses people in your language, how buttons are phrased and which words were chosen for Luft's own features.
- Use the glossary. Start, Board, Quick Settings and the other names of Luft's features should read the same everywhere.
- Keep the tone friendly but calm: short, plain sentences, no exclamation marks.
- App names such as Rover, Mailman and Magpie stay as they are.
- Serbian is translated in Cyrillic only; the Latin version is made from it automatically.

## The format

Luft's strings are [Fluent](https://projectfluent.org/fluent/guide/) messages. Most are plain text. A few have parts to keep as they are:

- **Variables** like `{ $name }` or `{ $count }` are filled in by Luft. Keep them, and move them wherever your sentence needs them.
- **Plurals** choose a form by number. Your language may need more forms than English: Croatian, Serbian and Bosnian use `one`, `few` and `other`.

  ```ftl
  notifications-count = { $count ->
      [one] { $count } obavijest
      [few] { $count } obavijesti
     *[other] { $count } obavijesti
  }
  ```

- **Dates, times, numbers and units** come from the system already formatted for the reader, so they're variables too.

Comments above a string say where it appears and what it means when the English alone could mean two things.

## Seeing your translation

Anyone building Luft can try a translation before it's merged: start Kestrel with `LUFT_LOCALE` set to the language, such as `LUFT_LOCALE=sq kestrel/tools/session.sh nested`, and the desktop and every app opened from it use that language. [Building Luft](/developers/building/) covers setting that up.

Problems with the English text itself, such as an unclear string, are best reported in [the issues](https://github.com/Lantharos/Luft/issues).
