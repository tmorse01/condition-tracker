import { randomUUID } from "node:crypto";
import type { DbExecutor } from "@condition-tracker/db";
import { db } from "./db.js";

const now = () => new Date().toISOString();

export const enqueueNotification = async (entry: { recipient: string; templateKey: string; payloadJson: string }) => {
  await db.insertInto("Notification").values({
    id: randomUUID(),
    recipient: entry.recipient,
    templateKey: entry.templateKey,
    status: "Pending",
    payloadJson: entry.payloadJson,
    attemptCount: 0,
    createdAt: now(),
    sentAt: null,
  }).execute();
};

export const processNotificationQueue = async () => {
  const pending = await db.selectFrom("Notification").selectAll().where("status", "=", "Pending").execute();
  for (const notification of pending) {
    await db.transaction().execute(async (trx: DbExecutor) => {
      await trx.updateTable("Notification").set({ attemptCount: notification.attemptCount + 1, status: "Sent", sentAt: now() }).where("id", "=", notification.id).execute();
      await trx.insertInto("AuditLog").values({
        id: randomUUID(),
        loanId: null,
        conditionId: null,
        documentId: null,
        documentVersionId: null,
        actorType: "System",
        actorName: "Notification Processor",
        action: "NotificationSent",
        message: `Sent ${notification.templateKey} notification to ${notification.recipient}`,
        metadataJson: JSON.stringify({ notificationId: notification.id, templateKey: notification.templateKey }),
        createdAt: now(),
      }).execute();
    });
  }
  return { processed: pending.length };
};

export const expireUploadSessions = async () => {
  const active = await db.selectFrom("UploadSession").selectAll().where("status", "=", "Active").execute();
  let expiredCount = 0;
  for (const session of active) {
    if (new Date(session.expiresAt).getTime() > Date.now()) continue;
    expiredCount += 1;
    await db.transaction().execute(async (trx: DbExecutor) => {
      await trx.updateTable("UploadSession").set({ status: "Expired", revokedAt: now() }).where("id", "=", session.id).execute();
      await trx.insertInto("AuditLog").values({
        id: randomUUID(),
        loanId: session.loanId,
        conditionId: null,
        documentId: null,
        documentVersionId: null,
        actorType: "System",
        actorName: "Upload Session Expirer",
        action: "UploadSessionExpired",
        message: `Expired upload session ${session.id}`,
        metadataJson: JSON.stringify({ sessionId: session.id }),
        createdAt: now(),
      }).execute();
    });
  }
  return { expiredCount };
};

export const runBackgroundJobs = async () => ({
  notifications: await processNotificationQueue(),
  uploadSessions: await expireUploadSessions(),
});
