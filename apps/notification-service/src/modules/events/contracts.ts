export type BaseEvent<T = any> = {
  eventId: string;
  type: string;
  version: number;
  correlationId?: string;
  occurredAt: string;
  data: T;
};

export type LoanEventData = {
  userId: string;
  userEmail?: string;
  userName?: string;
  equipmentName?: string;
  dueDate?: string;
};

export type ReservationEventData = {
  userId: string;
  userEmail?: string;
  userName?: string;
  equipmentName?: string;
  startAt?: string;
  endAt?: string;
};

export type IncomingEvents = BaseEvent<LoanEventData> | BaseEvent<ReservationEventData>;

export const OutgoingEventTypes = {
  NotificationSent: 'NotificationSent',
  NotificationFailed: 'NotificationFailed',
} as const;

export const Topics = {
  Incoming: 'equipment-loan.events.v1',
  Notifications: 'equipment-loan.notifications.v1',
} as const;
