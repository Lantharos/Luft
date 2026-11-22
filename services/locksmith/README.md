# locksmith

Locks the desktop settings that [Luft's policy files](https://docs.luft.computer/developers/system/policy/) decide, such as the screen lock, so nobody can change them in their account. At startup, and whenever `/etc/luft/policy.d` changes, it compiles them into the dconf database `/run/luft/policy/dconf` with each key locked, and removes it when the policy decides none. Kestrel's session puts that database right after each person's own settings, so its values win and the person's can't be written.

`cargo test` here covers which keys a policy locks and the files `dconf compile` reads.
