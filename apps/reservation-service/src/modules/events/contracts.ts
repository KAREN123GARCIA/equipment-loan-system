export type EventEnvelope<TType extends string, TPayload> = {
  specVersion: "1.0";
  type: TType;
  version: "v1";
  id: string;
  time: string;
  source: string;
  correlationId?: string;
  data: TPayload;
};

export const Topics = {
  ReservationCreated: "reservation.created.v1",
  ReservationCancelled: "reservation.cancelled.v1",
  ReservationExpired: "reservation.expired.v1",
  ReservationConflictDetected: "reservation.conflict_detected.v1",
  EquipmentStatusUpdated: "inventory.equipment_status_updated.v1",
} as const;

export type ReservationCreatedPayload = { reservationId: string; userId: string; equipmentId: string; startAt: string; endAt: string; };
export type ReservationCancelledPayload = { reservationId: string; userId: string; equipmentId: string; reason?: string; };
export type ReservationExpiredPayload = { reservationId: string; userId: string; equipmentId: string; };
export type ReservationConflictDetectedPayload = { equipmentId: string; userId: string; startAt: string; endAt: string; conflictingReservationIds: string[]; };
export type EquipmentStatusUpdatedPayload = { equipmentId: string; status: "AVAILABLE"|"LOANED"|"MAINTENANCE"|"DAMAGED"; updatedAt: string; };
