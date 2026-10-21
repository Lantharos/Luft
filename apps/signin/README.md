# Network Sign-In

Network Sign-In opens the page a Wi-Fi network shows before it lets you online, as in hotels, airports and trains. Kestrel opens it from a notification when NetworkManager finds such a network, every sign-in starts from an empty profile, and it closes by itself once the connection is up.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Installing registers the `kestrel-signin:` link scheme. It isn't listed with the other apps.

```
kestrel-signin:?network=Harbor%20Hotel&url=http%3A%2F%2Ffedoraproject.org%2Fstatic%2Fhotspot.txt
```

`network` is the name shown in the window and `url` the page to open, which has to be the web address NetworkManager checks the connection with. Links to any other page are ignored, so only Kestrel's sign-in notification opens a page here.

`kestrel/tools/session.sh capture` opens its build from `bun run desktop:build` against a stand-in hotel page and NetworkManager.
