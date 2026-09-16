export type NotifType = "success" | "info" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}

export const DEMO_NOTIFICATIONS: Notification[] = [];
