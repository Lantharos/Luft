export const State = {
  HIDDEN: 0,
  SHOWING: 1,
  SHOWN: 2,
  HIDING: 3,
} as const;
export type State = typeof State[keyof typeof State];

export const NotificationDestroyedReason = {
  EXPIRED: 1,
  DISMISSED: 2,
  SOURCE_CLOSED: 3,
  REPLACED: 4,
} as const;
export type NotificationDestroyedReason = typeof NotificationDestroyedReason[keyof typeof NotificationDestroyedReason];

export const Urgency = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3,
} as const;
export type Urgency = typeof Urgency[keyof typeof Urgency];

export const PrivacyScope = {
  USER: 0,
  SYSTEM: 1,
} as const;
export type PrivacyScope = typeof PrivacyScope[keyof typeof PrivacyScope];
