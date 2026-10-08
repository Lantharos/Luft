# cldr2json

Converts Unicode CLDR Android keyboard layouts into the JSON layouts Kestrel's on-screen keyboard uses. `../update-osk-layouts.sh` runs it to regenerate `../osk-layouts` and its resource file.

The Android layouts were last published in CLDR 43, in <https://www.unicode.org/Public/cldr/43/keyboards.zip>; later releases use a different keyboard format.

## Usage

```sh
./cldr2json.py <input file or directory> <output directory>
./cldr2json.py keyboards/android/ osk-layouts/
```

## Layout names

CLDR names layouts by language, XKB by its own identifiers. The script matches them by comparing the layout descriptions, whole or word by word, with those in `/usr/share/X11/xkb/rules/evdev.xml`. When that picks the wrong layout, or it warns "failed to find XKB mapping", add an entry to `LOCALE_TO_XKB_OVERRIDES` at the top of the script.

## Testing

From this folder:

```sh
python3 -m unittest test.test_cldr2json
```
