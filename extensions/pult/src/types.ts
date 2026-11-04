/** What Pult answers, as its console API describes it. */
export interface Place {
  organization: { slug: string; name: string };
  project: { slug: string; name: string };
  environment: { id: string; name: string };
  url: string;
}

export interface InboxWaiting {
  name: string;
  label: string;
  open: number;
  unread: number;
  urgent: number;
  url: string;
}

export interface ItemHit {
  id: string;
  title: string;
  inbox: string;
  inboxLabel: string;
  state: string;
  urgent: boolean;
  updatedAt: number;
  url: string;
}

export interface WaitingIn extends Place {
  inboxes: InboxWaiting[];
  urgent: ItemHit[];
}

export interface DeviceCode {
  deviceCode: string;
  userCode: string;
  verificationUriComplete: string;
  expiresIn: number;
  interval: number;
}

export type Account = {
  name: string;
  email: string;
};
