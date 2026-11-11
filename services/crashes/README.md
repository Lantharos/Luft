# Crash reports

Reports of crashes of Luft's own programs, sent to Luft's inbox on Pult when the person agrees. What is collected, when people are asked and how it works is in [docs/crash-reports.md](../../docs/crash-reports.md).

| Crate | Use |
| --- | --- |
| `report` | `luft-crash-report`: what a report says, scrubbing and the signature that groups the same crash |
| `collector` | `luft-crash-collector`, the system service that reads crashes from the journal (`com.lantharos.CrashCollector1`) |
| `sender` | `luft-crash-reports`, the user service that asks and sends (`com.lantharos.CrashReports1`) |

`cargo test` covers scrubbing, signatures, reading core dump traces and script errors, and the choices and queue. `vm/run.sh` checks the collector with `systemd-coredump` in a VM made from `localhost/luft:45`, and `kestrel/tools/session.sh capture --only system:crashReports` runs the whole path in a headless session.
