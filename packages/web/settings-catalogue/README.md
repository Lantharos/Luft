# @luft/settings-catalogue

The settings `luft settings` can read and change, by the names and pages Settings shows them on, and how each one is kept: a GSettings key, a choice that sets several keys, or a system setting that only changes after review. `luft` builds its catalogue from `catalogue.json`, and Kestrel reads it to describe the changes it asks you to review. `bun run check` makes sure every entry is still on its page in Settings, under the same name.
