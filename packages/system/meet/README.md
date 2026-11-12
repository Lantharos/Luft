# luft-meet

What Meet Luft leaves on the drive for Install Luft, shared by both: the partitions or folder it made, why the computer restarted, the settings to start with and the moving box. How Meet Luft uses them is in [Meet Luft](https://docs.luft.computer/developers/system/meet-luft/).

```toml
luft-meet.workspace = true
```

| Module | Use |
| --- | --- |
| `handoff` | `Handoff`, kept as `meet.json`: whether the restart was to try, install or replace (`Intent`), the start entry, and what Meet Luft `Made`, partitions with the room next to them or a folder on an existing drive |
| `moving_box` | The moving box's `Manifest`: the folders packed, Wi-Fi networks, the account picture, the wallpaper and Bluetooth pairings |
| `sealed` | The seal on the moving box: the `Code` that opens it, `Packing` to fill one and `Opened` to read one, every file encrypted and listed inside the seal |
| `regional` | `Hints` for the language, formats, time zone and keyboard layouts, turned into their Linux names; `regional::windows` reads them from Windows |
| `resize` | The `LuftResize` request to grow or shrink an installed Luft and the `LuftSpace` it reports, both UEFI variables, and Luft's partition types |
| `system` | How the installed system's drive is laid out, and whether Luft can replace it |
| `wifi` | A Windows Wi-Fi profile read into a `Network` |

`cargo test` here covers each format, turning Windows' regional settings into Linux names, refusing notes and boxes that point outside what Meet Luft made, and refusing sealed boxes that were changed.
