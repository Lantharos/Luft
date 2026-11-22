# locksmith

Applies the parts of [Luft's policy](https://docs.luft.computer/organizations/policy/) that no service of Luft's own owns. At startup, and whenever a policy folder changes, it:

- compiles the desktop settings the policy decides, such as the screen lock, into the dconf system database `/etc/dconf/db/luft_policy` with each key locked, and tells running sessions to read it again,
- writes the polkit rule `/run/polkit-1/rules.d/00-luft-policy.rules` that keeps people from changing accounts when the policy says so,
- publishes the whole policy as JSON in `/run/luft/policy/policy.json` for Kestrel.

`cargo test` here covers which keys a policy locks and the files `dconf compile` reads.
