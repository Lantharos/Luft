# luft-speech

Dictation for Luft: hold Super and Alt, or the Copilot key, talk, and what you say is typed. [`services/speech`](../../../services/speech) is `luft-speech`, the session service that listens and recognizes speech on the computer; this crate holds the shared types and an async client that Settings uses for the models. How the service records, recognizes and downloads models is in [Speech](../../../docs/components/speech.md).

| Item | Use |
| --- | --- |
| `types` | Models, downloads, languages and the overview Settings shows |
| `client` | `overview`, `install`, `cancel_install`, `remove` and `changes`, over the session bus |
