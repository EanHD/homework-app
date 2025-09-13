export type ScheduledNotification = {
  id: string;
  user_id?: string | null;
  assignment_id?: string | null;
  title?: string | null;
  body?: string | null;
  send_at?: string | null; // ISO timestamp
  sent_at?: string | null; // ISO timestamp
};

export interface ScheduleRequest {
  assignment_id: string;
  title: string;
  body: string;
  send_at: string; // ISO timestamp
  user_id?: string; // Only present when user is authenticated
}

export interface ScheduleResponse {
  success: boolean;
  message?: string;
  notification_id?: string;
  scheduled_for?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    assignment_id?: string;
    url?: string;
    [key: string]: any;
  };
}
