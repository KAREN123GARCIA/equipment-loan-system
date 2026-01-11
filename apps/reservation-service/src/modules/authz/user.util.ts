import { ForbiddenException } from "@nestjs/common";
export function isPrivileged(roles?: string[]) { const r=roles??[]; return r.includes("ADMIN")||r.includes("TECH"); }
export function assertOwnOrPrivileged(requestUserId: string, resourceUserId: string, roles?: string[]) {
  if (isPrivileged(roles)) return;
  if (requestUserId !== resourceUserId) throw new ForbiddenException("You can only access your own reservations.");
}
