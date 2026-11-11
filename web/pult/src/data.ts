import { z } from "zod"

const frame = z.object({
  module: z.string().max(200),
  build: z.string().regex(/^[0-9a-f]{16,64}$/).optional(),
  offset: z.string().regex(/^0x[0-9a-f]{1,16}$/),
  function: z.string().max(300).optional(),
})

export const crash = z.strictObject({
  signature: z.string().regex(/^[0-9a-f]{32}$/),
  program: z.string().max(100),
  build: z.string().regex(/^[0-9a-f]{16,64}$/).optional(),
  summary: z.string().max(120),
  kind: z.enum(["signal", "panic", "script"]),
  signal: z.string().regex(/^SIG[A-Z0-9]+$/).optional(),
  message: z.string().max(1000).optional(),
  location: z.string().max(300).optional(),
  frames: z.array(frame).max(32),
  script: z.array(z.string().max(300)).max(20).optional(),
  image: z.string().max(40),
  channel: z.enum(["stable", "nightly", "development"]),
  graphics: z.array(z.enum(["intel", "amd", "nvidia", "other"])).max(4),
  nvidiaDriver: z.boolean(),
  install: z.uuid(),
})

export type Crash = z.infer<typeof crash>
