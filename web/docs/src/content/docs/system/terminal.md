---
title: The luft command
description: Change settings, look after updates, read logs and build extensions from a terminal, or let an AI agent do it with your approval.
sidebar:
  order: 9
---

`luft` is Luft's command line. It reads and changes the settings Settings has, by the same names, looks after updates, shows logs, gathers a bug report and helps you build extensions. Run it in [Tern](/apps/tern/) or any terminal; `luft --help` and `luft <command> --help` explain every part.

```sh
luft status
luft settings list --page taskbar
luft set appearance.style=dark taskbar.size=large
```

## Settings

`luft settings list` shows every setting luft knows, with its id, its name in Settings and what it is now. `luft settings describe appearance.style` says what values it takes and where it is in Settings. Name a setting by its id or by the name Settings shows, in quotes when it has spaces:

```sh
luft settings get "Release channel"
luft set "Repeat keys=off" keyboard.repeat-delay=400
```

`luft apply changes.json` takes the same changes from a file, as an object of setting and value, and `luft apply -` reads them from standard input:

```json
{ "appearance.style": "dark", "taskbar.auto-hide": "windows", "power.screen-off": 300 }
```

Every change in one command is checked first. If one setting or value is wrong, nothing changes.

### Changes you approve on the screen

Most settings, like the style or the taskbar, are yours to change, so luft changes them right away. A few belong to the whole computer, the same ones Settings asks an administrator's password for: Developer tools, holding back USB devices while locked, the release channel, how often Luft looks for updates and whether it downloads them, the time zone and setting the time automatically.

When a set of changes includes one of those, Luft shows the whole set on the screen in one window: every setting, what it is now and what it becomes, the warning Settings would show, and the program that asked. Nothing changes until you choose **Change**, and an administrator's password follows. **Don't change** leaves everything as it was. The window only appears while the screen is unlocked, one at a time, and only for the real `luft` that comes with Luft, so no other program can show it, fake it or change what it lists after you've seen it.

Some things stay in Settings, where it can explain them properly: online accounts, the login screen and automatic login, remote login, encryption and the recovery key, Luft Keyring, the firewall and running an extension from its folder. luft says where to find them.

### Putting changes back

`luft undo` puts back the last change made through luft, exactly as it was, including settings that had never been changed before. Putting back a setting that needed your approval asks again. `luft history` shows what was changed through luft, when, and which program asked.

## Updates

| Command | Does |
| --- | --- |
| `luft update` | Looks for an update and says what it brings |
| `luft update download` | Downloads it, ready to install at the next restart |
| `luft update install` | Asks to restart, which installs it once you confirm |
| `luft update rollback` | Starts the previous version at the next restart, after an administrator's password |
| `luft channel` | Shows whether you get stable or nightly versions |
| `luft channel stable` | Moves to stable versions, after you approve it on the screen |

## Developer tools

`luft developer on` and `luft developer off` turn Developer tools on and off, after you approve it on the screen. `luft developer list` shows switches that only matter when you build Luft itself, such as extra logging of how displays show fullscreen windows, and `luft developer set` changes them while Developer tools is on.

## Logs and bug reports

`luft logs kestrel` shows the desktop's log, and `luft logs updater`, `keyring`, `firewall`, `trust`, `crashes` and the other parts `luft logs --help` lists show theirs. `--follow` keeps showing new lines, `--since "10 min ago"` only the recent ones.

`luft report` saves one text file in your home folder with what helps find a problem: the version of Luft, the hardware by kind, recent crashes and the logs of Luft's parts since the computer started. The names of the people with an account here, your computer's name, email addresses and paths in your home folder are taken out. Nothing is sent: look it over, then attach it to your report on [GitHub](https://github.com/Lantharos/Luft/issues).

## Extensions

| Command | Does |
| --- | --- |
| `luft extension new com.example.Weather` | Makes a new extension that runs as it is |
| `luft extension check` | Checks the manifest and files the way Luft reads them |
| `luft extension reload com.example.Weather` | Loads it again after a change |
| `luft extension logs com.example.Weather` | Shows what it and the desktop logged about it |
| `luft extension pack` | Packs it the way Schelf takes it |
| `luft extension run-in-luft` | Opens it in Settings, where you can run it inside the desktop with Developer tools on |

See [Writing an extension](/extensions/getting-started/) for what goes into one.

## Scripts

Every command takes `--json` and prints its answer as JSON. The exit code says how it went:

| Code | Means |
| --- | --- |
| 0 | Done |
| 1 | Something went wrong, such as a service that answered with an error |
| 2 | The command line wasn't understood |
| 3 | A setting, value or file isn't one luft takes; nothing changed |
| 4 | The changes were declined on the screen, or the password wasn't given |
| 5 | Something needed isn't there right now, such as the desktop, or another review is open |
| 6 | Only Settings can do this, and luft said where |

`luft completions bash`, `zsh` and `fish` print completions; Luft already has them installed for all three.

## AI agents

`luft mcp` offers the same commands to AI agents through the Model Context Protocol. Point your agent at it as a local server that runs `luft mcp`. For example, in an agent that reads its servers from a JSON file:

```json
{ "mcpServers": { "luft": { "command": "luft", "args": ["mcp"] } } }
```

Then ask it for what you want, such as "make the taskbar hide when a window touches it and move me to the stable channel". The agent reads what Luft has, sends every change in one request, and anything that needs your approval shows up on your screen as one window listing all of it. The agent can't approve it, skip it or change what it lists, and a declined review stays declined. It can read your settings, Luft's version and its logs, and put back what it changed with `luft undo`, which also asks you again for anything that needed your approval.

With Developer tools on, programs you run can see the screen and use the mouse and keyboard, the review included, so leave it off while an agent works for you unless you're watching.
