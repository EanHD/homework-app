export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id?: string | null; // uuid
};

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SubscribeRequest {
  subscription: PushSubscriptionPayload;
  user_id?: string; // Only present when user is authenticated
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  subscription_id?: string;
}
