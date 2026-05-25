import type { AuditLogEntry, Notification } from "@condition-tracker/shared";
import { state } from "../data.js";

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const pushAudit = (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
  state.auditLog.unshift({ id: newId("audit"), createdAt: now(), ...entry });
};

export const enqueueNotification = (entry: Omit<Notification, "id" | "createdAt" | "attemptCount" | "status" | "sentAt">) => {
  const notification: Notification = {
    id: newId("notif"),
    createdAt: now(),
    attemptCount: 0,
    status: "Pending",
    sentAt: null,
    ...entry,
  };
  state.notifications.unshift(notification);
  return notification;
};

export const processNotificationQueue = () => {
  const pending = state.notifications.filter((item) => item.status === "Pending");
  for (const notification of pending) {
    notification.attemptCount += 1;
    if (notification.attemptCount >= 1) {
      notification.status = "Sent";
      notification.sentAt = now();
      pushAudit({
        loanId: null,
        conditionId: null,
        documentId: null,
        documentVersionId: null,
        actorType: "System",
        actorName: "Notification Processor",
        action: "NotificationSent",
        message: `Sent ${notification.templateKey} notification to ${notification.recipient}`,
        metadataJson: JSON.stringify({ notificationId: notification.id, templateKey: notification.templateKey }),
      });
    }
  }
  return { processed: pending.length };
};

export const expireUploadSessions = () => {
  let expiredCount = 0;
  for (const session of state.uploadSessions) {
    if (session.status !== "Active") continue;
    if (new Date(session.expiresAt).getTime() > Date.now()) continue;
    session.status = "Expired";
    session.revokedAt = now();
    expiredCount += 1;
    pushAudit({
      loanId: session.loanId,
      conditionId: null,
      documentId: null,
      documentVersionId: null,
      actorType: "System",
      actorName: "Upload Session Expirer",
      action: "UploadSessionExpired",
      message: `Expired upload session ${session.id}`,
      metadataJson: JSON.stringify({ sessionId: session.id }),
    });
  }
  return { expiredCount };
};

export const runBackgroundJobs = () => ({
  notifications: processNotificationQueue(),
  uploadSessions: expireUploadSessions(),
});

