import { dbAddDoc } from "./db";
import { toast } from "react-toastify";

/**
 * Dispatches system alerts to passengers or employees.
 * Simulates Email, SMS, and Push Notifications.
 */
export function sendSystemNotification({ title, message, type = "info", userId = "all", channel = ["email", "sms", "push"] }) {
  // 1. Log to Database
  const notificationRecord = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    userId,
    channels: channel,
    status: "Sent",
    createdAt: new Date().toISOString()
  };
  dbAddDoc("notifications", notificationRecord);

  // 2. Trigger active UI toast alerts
  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  };

  const formattedMsg = `[${title}] ${message}`;

  if (type === "warning") {
    toast.warn(formattedMsg, toastOptions);
  } else if (type === "error" || type === "danger") {
    toast.error(formattedMsg, toastOptions);
  } else if (type === "success") {
    toast.success(formattedMsg, toastOptions);
  } else {
    toast.info(formattedMsg, toastOptions);
  }

  // 3. Log to console to simulate server sending SMS/Email
  console.log(`%c[SIMULATOR] Outgoing Notification via ${channel.join(" & ")}:`, "color: #aa3bff; font-weight: bold;");
  console.log(`To User: ${userId}\nSubject: ${title}\nBody: ${message}`);
}
