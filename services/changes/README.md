# luft-changes

The system service that makes the system changes someone reviewed in Kestrel: turning developer tools or USB protection on and off, the release channel, how often updates are looked for and downloaded, and the time zone and automatic time. It only takes changes from Kestrel, asks for an administrator's password once for all of them and makes each through the service that owns it. How it fits with `luft` and Kestrel's review is in [the luft command](../../docs/components/luft.md).
