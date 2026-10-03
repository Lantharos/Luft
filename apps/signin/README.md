# Network Sign-In

Network Sign-In opens the page a Wi-Fi network shows before it lets you online, as in hotels, airports and trains. It is built with Sabine and Svelte and lives at `apps/signin`; run the commands below from that directory unless noted otherwise.

Kestrel offers it in a notification when NetworkManager finds such a network, and opens it with a `kestrel-signin:` link that names the network and the page:

```
kestrel-signin:?network=Harbor%20Hotel&url=http%3A%2F%2Ffedoraproject.org%2Fstatic%2Fhotspot.txt
```

The page opens in a window of its own with the network's name, the page's address and whether the connection to it is private. Every sign-in starts from an empty profile, so nothing a network's page stores is kept for the next one, and links that would open new windows stay in the same one. After each page it asks NetworkManager to check the connection, and the window closes by itself once NetworkManager reports full connectivity. Opening another link while it's open moves the window to the new page.

## Development

Network Sign-In shares its controls, styles and window setup with the other Luft apps through `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

`kestrel/tools/session.sh capture` opens it against a stand-in hotel page and a stand-in NetworkManager; list it in `KESTREL_DEV_APPS=signin` to check your own build.

## Install

```bash
sabine install --bundle .
```
