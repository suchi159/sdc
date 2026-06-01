/**
 * notificationHelper.ts
 * Shared helper for inserting in-app notifications into the `notifications` table.
 * Used by scheduling, proctoring, and other routers to create real-time alerts.
 */

import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";

type NotificationType =
  | "credential_issued"
  | "exam_scheduled"
  | "exam_result"
  | "expiry_reminder"
  | "proctoring_incident"
  | "system_alert"
  | "billing_alert"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_new";

interface CreateNotificationParams {
  userId: number;
  orgId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

/**
 * Insert a single in-app notification.
 * Failures are swallowed so they never break the calling flow.
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(notifications).values({
      userId: params.userId,
      orgId: params.orgId ?? null,
      type: params.type,
      title: params.title,
      message: params.message,
      read: false,
      actionUrl: params.actionUrl ?? null,
    });
  } catch (err) {
    console.error("[createNotification] Failed (non-fatal):", err);
  }
}

/**
 * Insert notifications for multiple recipients at once.
 */
export async function createNotifications(
  items: CreateNotificationParams[]
): Promise<void> {
  await Promise.allSettled(items.map(createNotification));
}
