# Network Sign-In

Network Sign-In opens the page a Wi-Fi network shows before it lets you online, as in hotels, airports and trains. It is built with Sabine and Svelte.

## Features

- Opens from Kestrel's notification when NetworkManager finds a network that needs signing in
- Shows the network's name, the page's address and whether the connection is private
- Starts every sign-in from an empty profile, so nothing a network's page stores is kept
- Keeps links that would open new windows in the same window
- Closes by itself once NetworkManager reports full connectivity
- Opening another link moves the open window to the new page

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

## Install

```sh
sabine install --bundle .
```

Installing registers the `kestrel-signin:` link scheme. It isn't listed with the other apps.

## Testing

`kestrel/tools/session.sh capture` opens it against a stand-in hotel page and NetworkManager; set `KESTREL_DEV_APPS=signin` to use your own build.

## Links

```
kestrel-signin:?network=Harbor%20Hotel&url=http%3A%2F%2Ffedoraproject.org%2Fstatic%2Fhotspot.txt
```

| Parameter | Meaning |
|-----------|---------|
| `network` | The network's name, shown in the window |
| `url` | The sign-in page to open |
