import { inbox } from "@lantharos/pult"
import { crash } from "./data.ts"

export const crashes = inbox("crashes", {
  icon: "bug",
  states: ["open", "fixed", "ignored"],
  reopenOn: "new-occurrence",
  reopenFrom: ["fixed"],
  data: crash,
  columns: ["title", "occurrences", "users", "data.image", "lastSeen"],
  clients: {
    fingerprint: ["signature"],
    title: "{program}: {summary}",
    user: "install",
    perDay: 5_000,
    tags: ["crash"],
  },
})
